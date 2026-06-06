import prisma from '../../config/prisma';
import { Roles } from '../../constants';
import { UserPayload } from '../../types';
import { requireFields } from '../../utils/validation';

export class VendorsService {
  async create(data: any) {
    requireFields(data, ['companyName', 'contactPerson', 'email', 'phone']);
    const vendor = await prisma.vendor.create({ data });
    await prisma.activity.create({
      data: {
        type: 'VENDOR',
        action: 'CREATED',
        description: `Vendor ${vendor.companyName} created`,
        userId: data.userId,
        relatedId: vendor.id
      }
    });
    return vendor;
  }

  async findAll(query: { search?: string; category?: string; status?: string }, user?: UserPayload) {
    const where: any = {};
    if (user?.role === Roles.VENDOR) where.userId = user.id;
    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    return prisma.vendor.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string, user?: UserPayload) {
    const where: any = { id };
    if (user?.role === Roles.VENDOR) where.userId = user.id;
    const vendor = await prisma.vendor.findFirst({ where });
    if (!vendor) throw { statusCode: 404, message: 'Vendor not found' };
    return vendor;
  }

  async update(id: string, data: any) {
    if (data.email === '') throw { statusCode: 400, message: 'email cannot be empty' };
    const vendor = await prisma.vendor.update({ where: { id }, data });

    // If vendor status is updated, automatically update the user account activation status
    if (data.status && vendor.userId) {
      const isStatusActive = String(data.status).toLowerCase() === 'active';
      await prisma.user.update({
        where: { id: vendor.userId },
        data: { isActive: isStatusActive }
      });
    }

    await prisma.activity.create({
      data: {
        type: 'VENDOR',
        action: 'UPDATED',
        description: `Vendor ${vendor.companyName} updated`,
        relatedId: vendor.id
      }
    });
    return vendor;
  }

  async delete(id: string) {
    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw { statusCode: 404, message: 'Vendor not found' };
    await prisma.vendor.delete({ where: { id } });
    await prisma.activity.create({
      data: {
        type: 'VENDOR',
        action: 'DELETED',
        description: `Vendor ${vendor.companyName} deleted`,
        relatedId: id
      }
    });
  }
}

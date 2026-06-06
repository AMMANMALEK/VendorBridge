import prisma from '../../config/prisma';
import { normalizeStatus, RfqStatus, Roles } from '../../constants';
import { UserPayload } from '../../types';
import { requireArray, requireFields, requirePositiveNumber, requireValidDate } from '../../utils/validation';

export class RFQsService {
  private async notifyAssignedVendors(rfqId: string, rfqTitle: string, vendorIds: string[], userId?: string) {
    if (vendorIds.length === 0) return;

    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds }, userId: { not: null } },
      select: { id: true, companyName: true, userId: true }
    });

    const notifications = vendors
      .filter(vendor => vendor.userId)
      .map(vendor => ({
        userId: vendor.userId!,
        type: 'RFQ',
        title: 'New RFQ Assigned',
        message: `You have been invited to submit a quotation for RFQ "${rfqTitle}".`,
        relatedId: rfqId
      }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    await prisma.activity.create({
      data: {
        type: 'RFQ',
        action: 'VENDORS_ASSIGNED',
        description: `${vendors.length} vendor(s) assigned to RFQ "${rfqTitle}"`,
        userId,
        relatedId: rfqId
      }
    });
  }

  async create(data: any, userId: string) {
    const { items, assignedVendors, isDraft, ...rfqData } = data;
    requireFields(data, ['title', 'deadline']);
    if (!isDraft) {
      requireArray(items, 'items');
      requireArray(assignedVendors, 'assignedVendors');
    }

    const normalizedItems = Array.isArray(items)
      ? items.map((item: any) => ({
          productName: item.productName || item.name || 'Item',
          description: item.description ?? item.spec ?? null,
          quantity: requirePositiveNumber(item.quantity ?? 1, 'item.quantity'),
          unit: item.unit || 'NOS',
          estimatedPrice: item.estimatedPrice ?? item.total ?? item.unitPrice ?? undefined
        }))
      : [];

    const assignedVendorCreates = Array.isArray(assignedVendors)
      ? assignedVendors
          .map((vendor: any) => {
            if (typeof vendor === 'string') return { vendorId: vendor };
            const vendorId = vendor?.id || vendor?.vendorId;
            return vendorId ? { vendorId } : null;
          })
          .filter(Boolean)
      : [];

    const rfq = await prisma.rfq.create({
      data: {
        ...rfqData,
        status: isDraft ? RfqStatus.DRAFT : RfqStatus.OPEN,
        deadline: requireValidDate(data.deadline, 'deadline'),
        createdById: userId,
        items: normalizedItems.length > 0 ? { create: normalizedItems } : undefined,
        assignedVendors: assignedVendorCreates.length > 0 ? { create: assignedVendorCreates } : undefined
      },
      include: { items: true, assignedVendors: true }
    });
    await prisma.activity.create({
      data: {
        type: 'RFQ', action: 'CREATED',
        description: `RFQ "${rfq.title}" created`,
        userId, relatedId: rfq.id
      }
    });
    await this.notifyAssignedVendors(
      rfq.id,
      rfq.title,
      assignedVendorCreates.map((vendor: any) => vendor.vendorId),
      userId
    );
    return rfq;
  }

  async findAll(query: { status?: string; search?: string }, user?: UserPayload) {
    const where: any = {};
    if (query.status) where.status = normalizeStatus(query.status);
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
    if (user?.role === Roles.VENDOR) {
      where.assignedVendors = { some: { vendor: { userId: user.id } } };
    }
    return prisma.rfq.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedVendors: { include: { vendor: { select: { id: true, companyName: true, email: true } } } },
        items: true,
        _count: { select: { quotations: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string, user?: UserPayload) {
    const where: any = { id };
    if (user?.role === Roles.VENDOR) {
      where.assignedVendors = { some: { vendor: { userId: user.id } } };
    }
    const rfq = await prisma.rfq.findFirst({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedVendors: { include: { vendor: true } },
        items: true,
        attachments: true,
        quotations: { include: { vendor: { select: { id: true, companyName: true } } } }
      }
    });
    if (!rfq) throw { statusCode: 404, message: 'RFQ not found' };
    return rfq;
  }

  async update(id: string, data: any) {
    const payload = { ...data };
    if (payload.status) payload.status = normalizeStatus(payload.status);
    const rfq = await prisma.rfq.update({ where: { id }, data: payload });
    await prisma.activity.create({
      data: {
        type: 'RFQ',
        action: 'UPDATED',
        description: `RFQ "${rfq.title}" updated`,
        relatedId: id
      }
    });
    return rfq;
  }

  async assignVendors(id: string, vendorIds: string[], userId: string) {
    requireArray(vendorIds, 'vendorIds');

    const rfq = await prisma.rfq.findUnique({
      where: { id },
      include: { assignedVendors: true }
    });
    if (!rfq) throw { statusCode: 404, message: 'RFQ not found' };

    const existingIds = rfq.assignedVendors.map(vendor => vendor.vendorId);
    const newIds = vendorIds.filter(vendorId => !existingIds.includes(vendorId));

    if (newIds.length > 0) {
      await prisma.rfqVendor.createMany({
        data: newIds.map(vendorId => ({ rfqId: id, vendorId })),
        skipDuplicates: true
      });
      await this.notifyAssignedVendors(id, rfq.title, newIds, userId);
    }

    return prisma.rfq.findUnique({
      where: { id },
      include: { assignedVendors: { include: { vendor: true } } }
    });
  }
}

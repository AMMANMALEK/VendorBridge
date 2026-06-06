import prisma from '../../config/prisma';

export class RFQsService {
  async create(data: any, userId: string) {
    const { items, assignedVendors, isDraft, ...rfqData } = data;

    const normalizedItems = Array.isArray(items)
      ? items.map((item: any) => ({
          productName: item.productName || item.name || 'Item',
          description: item.description ?? item.spec ?? null,
          quantity: Number(item.quantity) || 1,
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
        status: isDraft ? 'Draft' : 'Open',
        deadline: new Date(data.deadline),
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
    return rfq;
  }

  async findAll(query: { status?: string; search?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
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

  async findById(id: string) {
    const rfq = await prisma.rfq.findUnique({
      where: { id },
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
    const rfq = await prisma.rfq.update({ where: { id }, data });
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
}

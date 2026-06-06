import prisma from '../../config/prisma';
import { normalizeStatus, QuotationStatus, Roles, ApprovalStatus } from '../../constants';
import { UserPayload } from '../../types';
import { requireArray, requireFields, requirePositiveNumber } from '../../utils/validation';

export class QuotationsService {
  private async getVendorForUser(userId: string) {
    const vendor = await prisma.vendor.findFirst({ where: { userId } });
    if (!vendor) throw { statusCode: 403, message: 'No vendor profile is linked to this user' };
    return vendor;
  }

  async submit(data: any, user: UserPayload) {
    requireFields(data, ['rfqId']);
    if (user.role !== Roles.VENDOR) requireFields(data, ['vendorId']);

    const vendor = user.role === Roles.VENDOR
      ? await this.getVendorForUser(user.id)
      : await prisma.vendor.findUnique({ where: { id: data.vendorId } });

    if (!vendor) throw { statusCode: 404, message: 'Vendor not found' };

    if (user.role === Roles.VENDOR) {
      const assignment = await prisma.rfqVendor.findUnique({
        where: { rfqId_vendorId: { rfqId: data.rfqId, vendorId: vendor.id } }
      });
      if (!assignment) throw { statusCode: 403, message: 'Vendor is not assigned to this RFQ' };
    }

    const subtotal = requirePositiveNumber(data.amount ?? data.subtotal, 'subtotal');
    const gstRate = Number(data.gstRate ?? 0);
    const taxAmount = Number(data.gstAmount ?? data.taxAmount ?? Math.round(subtotal * gstRate / 100));
    const grandTotal = Number(data.grandTotal ?? subtotal + taxAmount);
    const deliveryTimeline = data.deliveryDays ? String(data.deliveryDays) : String(data.deliveryTimeline ?? '');
    const status = data.isDraft ? QuotationStatus.DRAFT : QuotationStatus.PENDING;

    const lineItems = Array.isArray(data.lineItems)
      ? data.lineItems
      : Array.isArray(data.items)
      ? data.items
      : [];

    if (!data.isDraft) requireArray(lineItems, 'items');

    const itemsToCreate = lineItems.map((item: any) => ({
      productName: item.productName || item.name || 'Line Item',
      quantity: requirePositiveNumber(item.quantity ?? 1, 'item.quantity'),
      unitPrice: requirePositiveNumber(item.unitPrice ?? item.unit_price ?? item.price, 'item.unitPrice'),
      totalPrice: Number(item.total ?? item.totalPrice ?? ((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)))
    }));

    const quotation = await prisma.quotation.create({
      data: {
        rfqId: data.rfqId,
        vendorId: vendor.id,
        subtotal,
        taxAmount,
        grandTotal,
        deliveryTimeline,
        notes: data.notes,
        status,
        submittedById: user.id,
        items: itemsToCreate.length > 0 ? { create: itemsToCreate } : undefined
      },
      include: { items: true, vendor: true }
    });
    await prisma.activity.create({
      data: {
        type: 'QUOTATION', action: 'SUBMITTED',
        description: `Quotation submitted for RFQ`,
        userId: user.id, relatedId: quotation.id
      }
    });

    if (!data.isDraft) {
      await prisma.approval.create({
        data: {
          quotationId: quotation.id,
          rfqId: quotation.rfqId,
          vendorId: quotation.vendorId,
          status: ApprovalStatus.PENDING,
          remarks: 'Awaiting approval'
        }
      });
    }

    if (quotation.submittedById) {
      await prisma.notification.create({
        data: {
          userId: quotation.submittedById,
          type: 'QUOTATION',
          title: 'Quotation Submitted',
          message: `Your quotation for RFQ ${quotation.rfqId} has been submitted successfully.`,
          relatedId: quotation.id
        }
      });
    }
    return quotation;
  }

  async update(id: string, data: any, user: UserPayload) {
    const existing = await prisma.quotation.findUnique({ where: { id }, include: { vendor: true } });
    if (!existing) throw { statusCode: 404, message: 'Quotation not found' };
    if (user.role === Roles.VENDOR && existing.vendor.userId !== user.id) {
      throw { statusCode: 403, message: 'Not authorized to update this quotation' };
    }
    if (user.role === Roles.VENDOR && [QuotationStatus.APPROVED, QuotationStatus.REJECTED].includes(existing.status as any)) {
      throw { statusCode: 400, message: 'Approved or rejected quotations cannot be edited by vendor' };
    }

    const status = normalizeStatus(data.status) || QuotationStatus.REVISED;
    const quotation = await prisma.quotation.update({
      where: { id },
      data: { ...data, vendorId: existing.vendorId, submittedById: existing.submittedById, status }
    });

    if (status === QuotationStatus.PENDING) {
      const existingApproval = await prisma.approval.findFirst({ where: { quotationId: id } });
      if (existingApproval) {
        await prisma.approval.update({
          where: { id: existingApproval.id },
          data: { status: ApprovalStatus.PENDING, remarks: 'Resubmitted for approval' }
        });
      } else {
        await prisma.approval.create({
          data: {
            quotationId: id,
            rfqId: quotation.rfqId,
            vendorId: quotation.vendorId,
            status: ApprovalStatus.PENDING,
            remarks: 'Resubmitted for approval'
          }
        });
      }
    }
    return quotation;
  }

  async findByRFQ(rfqId: string, user?: UserPayload) {
    const where: any = { rfqId };
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    return prisma.quotation.findMany({
      where,
      include: {
        vendor: { select: { id: true, companyName: true, email: true, rating: true } },
        items: true,
        submittedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByVendor(vendorId: string, user?: UserPayload) {
    const where: any = { vendorId };
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    return prisma.quotation.findMany({
      where,
      include: {
        rfq: { select: { id: true, title: true, deadline: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll(query: { status?: string; vendorId?: string; rfqId?: string }, user?: UserPayload) {
    const where: any = {};
    if (query.status) where.status = normalizeStatus(query.status);
    if (query.vendorId) where.vendorId = query.vendorId;
    if (query.rfqId) where.rfqId = query.rfqId;
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    return prisma.quotation.findMany({
      where,
      include: {
        rfq: { select: { id: true, title: true, deadline: true } },
        vendor: { select: { id: true, companyName: true, email: true, rating: true } },
        items: true,
        submittedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async compare(rfqId: string) {
    const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } });
    if (!rfq) throw { statusCode: 404, message: 'RFQ not found' };

    const quotations = await prisma.quotation.findMany({
      where: { rfqId },
      include: { vendor: true, items: true },
      orderBy: { grandTotal: 'asc' }
    });

    if (quotations.length === 0) {
      return { rfq, quotations: [], lowestPrice: null, summary: null };
    }

    const lowestPrice = Math.min(...quotations.map(q => q.grandTotal));
    const fastestDelivery = quotations.reduce((min, q) => {
      if (!q.deliveryTimeline) return min;
      const days = parseInt(q.deliveryTimeline);
      return days < min ? days : min;
    }, Infinity);

    const result = quotations.map(q => ({
      ...q,
      isLowestPrice: q.grandTotal === lowestPrice,
      isFastestDelivery: q.deliveryTimeline && parseInt(q.deliveryTimeline) === fastestDelivery
    }));

    return {
      rfq,
      quotations: result,
      lowestPrice,
      fastestDelivery: fastestDelivery === Infinity ? null : fastestDelivery,
      summary: {
        totalQuotations: quotations.length,
        averagePrice: quotations.reduce((s, q) => s + q.grandTotal, 0) / quotations.length,
        lowestPrice,
        priceRange: { min: lowestPrice, max: Math.max(...quotations.map(q => q.grandTotal)) }
      }
    };
  }
}

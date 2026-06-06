import prisma from '../../config/prisma';

export class QuotationsService {
  async submit(data: any, userId: string) {
    const subtotal = Number(data.amount ?? data.subtotal ?? 0);
    const gstRate = Number(data.gstRate ?? 0);
    const taxAmount = Number(data.gstAmount ?? data.taxAmount ?? Math.round(subtotal * gstRate / 100));
    const grandTotal = Number(data.grandTotal ?? subtotal + taxAmount);
    const deliveryTimeline = data.deliveryDays ? String(data.deliveryDays) : String(data.deliveryTimeline ?? '');
    const status = data.isDraft ? 'Draft' : 'Pending';

    const lineItems = Array.isArray(data.lineItems)
      ? data.lineItems
      : Array.isArray(data.items)
      ? data.items
      : [];

    const itemsToCreate = lineItems.map((item: any) => ({
      productName: item.productName || item.name || 'Line Item',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0),
      totalPrice: Number(item.total ?? item.totalPrice ?? ((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)))
    }));

    const quotation = await prisma.quotation.create({
      data: {
        rfqId: data.rfqId,
        vendorId: data.vendorId,
        subtotal,
        taxAmount,
        grandTotal,
        deliveryTimeline,
        notes: data.notes,
        status,
        submittedById: userId,
        items: itemsToCreate.length > 0 ? { create: itemsToCreate } : undefined
      },
      include: { items: true, vendor: true }
    });
    await prisma.activity.create({
      data: {
        type: 'QUOTATION', action: 'SUBMITTED',
        description: `Quotation submitted for RFQ`,
        userId, relatedId: quotation.id
      }
    });

    if (!data.isDraft) {
      await prisma.approval.create({
        data: {
          quotationId: quotation.id,
          rfqId: quotation.rfqId,
          vendorId: quotation.vendorId,
          status: 'pending',
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

  async update(id: string, data: any) {
    const status = data.status || 'revised';
    const quotation = await prisma.quotation.update({
      where: { id },
      data: { ...data, status }
    });

    if (status === 'Pending') {
      const existingApproval = await prisma.approval.findFirst({ where: { quotationId: id } });
      if (existingApproval) {
        await prisma.approval.update({
          where: { id: existingApproval.id },
          data: { status: 'pending', remarks: 'Resubmitted for approval' }
        });
      } else {
        await prisma.approval.create({
          data: {
            quotationId: id,
            rfqId: quotation.rfqId,
            vendorId: quotation.vendorId,
            status: 'pending',
            remarks: 'Resubmitted for approval'
          }
        });
      }
    }
    return quotation;
  }

  async findByRFQ(rfqId: string) {
    return prisma.quotation.findMany({
      where: { rfqId },
      include: {
        vendor: { select: { id: true, companyName: true, email: true, rating: true } },
        items: true,
        submittedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByVendor(vendorId: string) {
    return prisma.quotation.findMany({
      where: { vendorId },
      include: {
        rfq: { select: { id: true, title: true, deadline: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll(query: { status?: string; vendorId?: string; rfqId?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.vendorId) where.vendorId = query.vendorId;
    if (query.rfqId) where.rfqId = query.rfqId;
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

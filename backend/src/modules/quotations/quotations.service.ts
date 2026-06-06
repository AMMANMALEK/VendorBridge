import prisma from '../../config/prisma';

export class QuotationsService {
  async submit(data: any, userId: string) {
    const { rfqId, vendorId, items, subtotal, taxAmount, grandTotal, deliveryTimeline, notes } = data;
    const quotation = await prisma.quotation.create({
      data: {
        rfqId, vendorId, subtotal, taxAmount, grandTotal, deliveryTimeline, notes,
        submittedById: userId,
        items: { create: items }
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
    return quotation;
  }

  async update(id: string, data: any) {
    const quotation = await prisma.quotation.update({
      where: { id },
      data: { ...data, status: 'revised' }
    });
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

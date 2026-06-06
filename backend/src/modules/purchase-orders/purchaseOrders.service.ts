import prisma from '../../config/prisma';
import { ApprovalStatus, normalizeStatus, Roles } from '../../constants';
import { UserPayload } from '../../types';

export class PurchaseOrdersService {
  private generatePoNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PO-${timestamp}-${random}`;
  }

  async generate(quotationId: string, userId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true, rfq: true }
    });
    if (!quotation) throw { statusCode: 404, message: 'Quotation not found' };

    const approval = await prisma.approval.findFirst({
      where: { quotationId, status: ApprovalStatus.APPROVED }
    });
    if (!approval) throw { statusCode: 400, message: 'Quotation must be approved before generating PO' };

    const existingPO = await prisma.purchaseOrder.findFirst({
      where: { quotationId },
      include: { items: true, vendor: true }
    });
    if (existingPO) return existingPO;

    let poNumber = this.generatePoNumber();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const exists = await prisma.purchaseOrder.findUnique({ where: { poNumber } });
      if (!exists) break;
      poNumber = this.generatePoNumber();
    }

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        quotationId: quotation.id,
        rfqId: quotation.rfqId,
        vendorId: quotation.vendorId,
        subtotal: quotation.subtotal,
        taxAmount: quotation.taxAmount,
        grandTotal: quotation.grandTotal,
        generatedById: userId,
        items: {
          create: quotation.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },
      include: { items: true, vendor: true }
    });

    await prisma.vendor.update({
      where: { id: quotation.vendorId },
      data: { totalOrders: { increment: 1 }, totalSpent: { increment: quotation.grandTotal } }
    });

    await prisma.activity.create({
      data: {
        type: 'PURCHASE_ORDER', action: 'GENERATED',
        description: `PO ${poNumber} generated`,
        userId, relatedId: po.id
      }
    });
    if (po.vendor?.userId) {
      await prisma.notification.create({
        data: {
          userId: po.vendor.userId,
          type: 'PURCHASE_ORDER',
          title: 'Purchase Order Generated',
          message: `Purchase order ${po.poNumber} has been generated for your quotation.`,
          relatedId: po.id
        }
      });
    }

    return po;
  }

  async findAll(status?: string, user?: UserPayload) {
    const where: any = {};
    if (status) where.status = normalizeStatus(status);
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    return prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: { select: { id: true, companyName: true, email: true } },
        rfq: { select: { id: true, title: true } },
        generatedBy: { select: { id: true, name: true, email: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string, user?: UserPayload) {
    const where: any = { id };
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    const po = await prisma.purchaseOrder.findFirst({
      where,
      include: {
        vendor: true,
        rfq: { select: { id: true, title: true, deadline: true } },
        quotation: { include: { items: true } },
        generatedBy: { select: { id: true, name: true, email: true } },
        items: true
      }
    });
    if (!po) throw { statusCode: 404, message: 'Purchase order not found' };
    return po;
  }
}

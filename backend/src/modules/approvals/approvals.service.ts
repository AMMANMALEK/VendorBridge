import prisma from '../../config/prisma';
import { PurchaseOrdersService } from '../purchase-orders/purchaseOrders.service';

export class ApprovalsService {
  async getPending() {
    return prisma.approval.findMany({
      where: { status: 'pending' },
      include: {
        quotation: { include: { items: true } },
        rfq: { select: { id: true, title: true } },
        vendor: { select: { id: true, companyName: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll(query: { status?: string; vendorId?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.vendorId) where.vendorId = query.vendorId;
    return prisma.approval.findMany({
      where,
      include: {
        quotation: { include: { items: true } },
        rfq: { select: { id: true, title: true } },
        vendor: { select: { id: true, companyName: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approve(id: string, userId: string, remarks?: string) {
    let approval = await prisma.approval.findUnique({ where: { id } });
    let quotation;

    if (approval) {
      quotation = await prisma.quotation.findUnique({ where: { id: approval.quotationId } });
    } else {
      quotation = await prisma.quotation.findUnique({ where: { id } });
      if (!quotation) throw { statusCode: 404, message: 'Approval or quotation not found' };
      approval = await prisma.approval.findFirst({ where: { quotationId: quotation.id } });
    }

    if (!quotation) throw { statusCode: 404, message: 'Quotation not found' };

    if (approval) {
      approval = await prisma.approval.update({
        where: { id: approval.id },
        data: { status: 'approved', approvedById: userId, remarks: remarks || 'Approved', reviewedAt: new Date() }
      });
    } else {
      approval = await prisma.approval.create({
        data: {
          quotationId: quotation.id,
          rfqId: quotation.rfqId,
          vendorId: quotation.vendorId,
          status: 'approved',
          approvedById: userId,
          remarks: remarks || 'Approved',
          reviewedAt: new Date()
        }
      });
    }

    await prisma.quotation.update({ where: { id: quotation.id }, data: { status: 'Approved' } });

    // Generate PO automatically when Quotation is Approved
    try {
      const poService = new PurchaseOrdersService();
      await poService.generate(quotation.id, userId);
    } catch (poError) {
      console.error('Failed to auto-generate PO upon quotation approval:', poError);
    }

    await prisma.activity.create({
      data: {
        type: 'APPROVAL', action: 'APPROVED',
        description: `Quotation approved`,
        userId, relatedId: approval.id
      }
    });
    if (quotation.submittedById) {
      await prisma.notification.create({
        data: {
          userId: quotation.submittedById,
          type: 'APPROVAL',
          title: 'Quotation Approved',
          message: `Your quotation for RFQ ${quotation.rfqId} was approved.`,
          relatedId: approval.id
        }
      });
    }

    return approval;
  }

  async reject(id: string, userId: string, remarks?: string) {
    let approval = await prisma.approval.findUnique({ where: { id } });
    let quotation;

    if (approval) {
      quotation = await prisma.quotation.findUnique({ where: { id: approval.quotationId } });
    } else {
      quotation = await prisma.quotation.findUnique({ where: { id } });
      if (!quotation) throw { statusCode: 404, message: 'Approval or quotation not found' };
      approval = await prisma.approval.findFirst({ where: { quotationId: quotation.id } });
    }

    if (!quotation) throw { statusCode: 404, message: 'Quotation not found' };

    if (approval) {
      approval = await prisma.approval.update({
        where: { id: approval.id },
        data: { status: 'rejected', approvedById: userId, remarks: remarks || 'Rejected', reviewedAt: new Date() }
      });
    } else {
      approval = await prisma.approval.create({
        data: {
          quotationId: quotation.id,
          rfqId: quotation.rfqId,
          vendorId: quotation.vendorId,
          status: 'rejected',
          approvedById: userId,
          remarks: remarks || 'Rejected',
          reviewedAt: new Date()
        }
      });
    }

    await prisma.quotation.update({ where: { id: quotation.id }, data: { status: 'Rejected' } });

    await prisma.activity.create({
      data: {
        type: 'APPROVAL', action: 'REJECTED',
        description: `Quotation rejected`,
        userId, relatedId: approval.id
      }
    });
    if (quotation.submittedById) {
      await prisma.notification.create({
        data: {
          userId: quotation.submittedById,
          type: 'APPROVAL',
          title: 'Quotation Rejected',
          message: `Your quotation for RFQ ${quotation.rfqId} was rejected.`,
          relatedId: approval.id
        }
      });
    }

    return approval;
  }
}

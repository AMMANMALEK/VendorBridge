import prisma from '../../config/prisma';
import { PurchaseOrdersService } from '../purchase-orders/purchaseOrders.service';
import { ApprovalStatus, normalizeStatus, QuotationStatus } from '../../constants';

export class ApprovalsService {
  async getPending() {
    return prisma.approval.findMany({
      where: { status: ApprovalStatus.PENDING },
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
    if (query.status) where.status = normalizeStatus(query.status);
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
    if (approval && approval.status !== ApprovalStatus.PENDING) {
      throw { statusCode: 400, message: `Approval is already ${approval.status}` };
    }
    if (![QuotationStatus.PENDING, QuotationStatus.REVISED].includes(quotation.status as any)) {
      throw { statusCode: 400, message: `Quotation cannot be approved from status ${quotation.status}` };
    }

    if (approval) {
      approval = await prisma.approval.update({
        where: { id: approval.id },
        data: { status: ApprovalStatus.APPROVED, approvedById: userId, remarks: remarks || 'Approved', reviewedAt: new Date() }
      });
    } else {
      approval = await prisma.approval.create({
        data: {
          quotationId: quotation.id,
          rfqId: quotation.rfqId,
          vendorId: quotation.vendorId,
          status: ApprovalStatus.APPROVED,
          approvedById: userId,
          remarks: remarks || 'Approved',
          reviewedAt: new Date()
        }
      });
    }

    await prisma.quotation.update({ where: { id: quotation.id }, data: { status: QuotationStatus.APPROVED } });
    await prisma.quotation.updateMany({
      where: {
        rfqId: quotation.rfqId,
        id: { not: quotation.id },
        status: { in: [QuotationStatus.PENDING, QuotationStatus.REVISED] }
      },
      data: { status: QuotationStatus.REJECTED }
    });
    await prisma.approval.updateMany({
      where: {
        rfqId: quotation.rfqId,
        quotationId: { not: quotation.id },
        status: ApprovalStatus.PENDING
      },
      data: {
        status: ApprovalStatus.REJECTED,
        remarks: 'Another quotation was approved for this RFQ',
        reviewedAt: new Date(),
        approvedById: userId
      }
    });

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
    if (approval && approval.status !== ApprovalStatus.PENDING) {
      throw { statusCode: 400, message: `Approval is already ${approval.status}` };
    }
    if (![QuotationStatus.PENDING, QuotationStatus.REVISED].includes(quotation.status as any)) {
      throw { statusCode: 400, message: `Quotation cannot be rejected from status ${quotation.status}` };
    }

    if (approval) {
      approval = await prisma.approval.update({
        where: { id: approval.id },
        data: { status: ApprovalStatus.REJECTED, approvedById: userId, remarks: remarks || 'Rejected', reviewedAt: new Date() }
      });
    } else {
      approval = await prisma.approval.create({
        data: {
          quotationId: quotation.id,
          rfqId: quotation.rfqId,
          vendorId: quotation.vendorId,
          status: ApprovalStatus.REJECTED,
          approvedById: userId,
          remarks: remarks || 'Rejected',
          reviewedAt: new Date()
        }
      });
    }

    await prisma.quotation.update({ where: { id: quotation.id }, data: { status: QuotationStatus.REJECTED } });

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

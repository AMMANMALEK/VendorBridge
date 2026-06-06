import prisma from '../../config/prisma';

export class ApprovalsService {
  async getPending() {
    return prisma.approval.findMany({
      where: { status: 'pending' },
      include: {
        quotation: { include: { items: true } },
        rfq: { select: { id: true, title: true } },
        vendor: { select: { id: true, companyName: true } },
        approvedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approve(quotationId: string, userId: string, remarks?: string) {
    const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
    if (!quotation) throw { statusCode: 404, message: 'Quotation not found' };

    const existingApproval = await prisma.approval.findFirst({ where: { quotationId } });

    let approval;
    if (existingApproval) {
      approval = await prisma.approval.update({
        where: { id: existingApproval.id },
        data: { status: 'approved', approvedById: userId, remarks: remarks || 'Approved', reviewedAt: new Date() }
      });
    } else {
      approval = await prisma.approval.create({
        data: {
          quotationId, rfqId: quotation.rfqId, vendorId: quotation.vendorId,
          status: 'approved', approvedById: userId, remarks: remarks || 'Approved', reviewedAt: new Date()
        }
      });
    }

    await prisma.quotation.update({ where: { id: quotationId }, data: { status: 'accepted' } });

    await prisma.activity.create({
      data: {
        type: 'APPROVAL', action: 'APPROVED',
        description: `Quotation approved`,
        userId, relatedId: approval.id
      }
    });

    return approval;
  }

  async reject(quotationId: string, userId: string, remarks?: string) {
    const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
    if (!quotation) throw { statusCode: 404, message: 'Quotation not found' };

    const existingApproval = await prisma.approval.findFirst({ where: { quotationId } });

    let approval;
    if (existingApproval) {
      approval = await prisma.approval.update({
        where: { id: existingApproval.id },
        data: { status: 'rejected', approvedById: userId, remarks: remarks || 'Rejected', reviewedAt: new Date() }
      });
    } else {
      approval = await prisma.approval.create({
        data: {
          quotationId, rfqId: quotation.rfqId, vendorId: quotation.vendorId,
          status: 'rejected', approvedById: userId, remarks: remarks || 'Rejected', reviewedAt: new Date()
        }
      });
    }

    await prisma.quotation.update({ where: { id: quotationId }, data: { status: 'rejected' } });

    await prisma.activity.create({
      data: {
        type: 'APPROVAL', action: 'REJECTED',
        description: `Quotation rejected`,
        userId, relatedId: approval.id
      }
    });

    return approval;
  }
}

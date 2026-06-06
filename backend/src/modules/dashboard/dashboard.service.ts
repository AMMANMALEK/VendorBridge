import prisma from '../../config/prisma';
import { ApprovalStatus, Roles, RfqStatus } from '../../constants';
import { UserPayload } from '../../types';

export class DashboardService {
  async getSummary(user?: UserPayload) {
    if (user?.role === Roles.VENDOR) {
      const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
      if (!vendor) return { pendingApprovals: 0, activeRfqs: 0, vendorCount: 0, quotationCount: 0, recentPurchaseOrders: [], recentInvoices: [] };

      const [activeRfqs, recentPOs, recentInvoices, quotationCount] = await Promise.all([
        prisma.rfq.count({
          where: {
            status: { in: [RfqStatus.DRAFT, RfqStatus.OPEN] },
            assignedVendors: { some: { vendorId: vendor.id } }
          }
        }),
        prisma.purchaseOrder.findMany({
          where: { vendorId: vendor.id },
          include: { vendor: { select: { companyName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        prisma.invoice.findMany({
          where: { vendorId: vendor.id },
          include: { vendor: { select: { companyName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        prisma.quotation.count({ where: { vendorId: vendor.id } })
      ]);

      return { pendingApprovals: 0, activeRfqs, vendorCount: 1, quotationCount, recentPurchaseOrders: recentPOs, recentInvoices };
    }

    const [pendingApprovals, activeRfqs, recentPOs, recentInvoices, vendorCount, quotationCount] = await Promise.all([
      prisma.approval.count({ where: { status: ApprovalStatus.PENDING } }),
      prisma.rfq.count({ where: { status: { in: [RfqStatus.DRAFT, RfqStatus.OPEN] } } }),
      prisma.purchaseOrder.findMany({
        include: { vendor: { select: { companyName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.invoice.findMany({
        include: { vendor: { select: { companyName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.vendor.count({ where: { status: 'active' } }),
      prisma.quotation.count()
    ]);

    return { pendingApprovals, activeRfqs, vendorCount, quotationCount, recentPurchaseOrders: recentPOs, recentInvoices };
  }

  async getAnalytics() {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPOs, totalInvoices, totalSpent, monthlyPOs, monthlyInvoices, monthlySpend, quotations, approvals, approved, rejected] = await Promise.all([
      prisma.purchaseOrder.count(),
      prisma.invoice.count(),
      prisma.purchaseOrder.aggregate({ _sum: { grandTotal: true } }),
      prisma.purchaseOrder.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.invoice.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.purchaseOrder.aggregate({
        where: { createdAt: { gte: thisMonthStart } },
        _sum: { grandTotal: true }
      }),
      prisma.quotation.count(),
      prisma.approval.count(),
      prisma.approval.count({ where: { status: ApprovalStatus.APPROVED } }),
      prisma.approval.count({ where: { status: ApprovalStatus.REJECTED } })
    ]);

    return {
      totalPurchaseOrders: totalPOs,
      totalInvoices,
      totalSpent: totalSpent._sum.grandTotal || 0,
      monthlyPurchaseOrders: monthlyPOs,
      monthlyInvoices,
      monthlySpend: monthlySpend._sum.grandTotal || 0,
      totalQuotations: quotations,
      totalApprovals: approvals,
      approvedQuotations: approved,
      rejectedQuotations: rejected
    };
  }
}

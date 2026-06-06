import prisma from '../../config/prisma';

export class DashboardService {
  async getSummary() {
    const [pendingApprovals, activeRfqs, recentPOs, recentInvoices, vendorCount, quotationCount] = await Promise.all([
      prisma.approval.count({ where: { status: 'pending' } }),
      prisma.rfq.count({ where: { status: { in: ['Draft', 'Open'] } } }),
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
      prisma.approval.count({ where: { status: 'approved' } }),
      prisma.approval.count({ where: { status: 'rejected' } })
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

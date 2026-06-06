import prisma from '../../config/prisma';
import PDFDocument from 'pdfkit';

export class ReportsService {
  async procurementSummary() {
    const [totalPOs, totalInvoices, totalSpent, activeVendors] = await Promise.all([
      prisma.purchaseOrder.count(),
      prisma.invoice.count(),
      prisma.purchaseOrder.aggregate({ _sum: { grandTotal: true } }),
      prisma.vendor.count({ where: { status: 'active' } })
    ]);
    return {
      totalPurchaseOrders: totalPOs,
      totalInvoices,
      totalSpent: totalSpent._sum.grandTotal || 0,
      activeVendors,
      averagePOValue: totalPOs > 0 ? (totalSpent._sum.grandTotal || 0) / totalPOs : 0
    };
  }

  async vendorPerformance() {
    const vendors = await prisma.vendor.findMany({ where: { status: 'active' } });
    const performance = await Promise.all(vendors.map(async (vendor) => {
      const [poAgg, quotationCount] = await Promise.all([
        prisma.purchaseOrder.aggregate({
          where: { vendorId: vendor.id },
          _sum: { grandTotal: true },
          _count: true
        }),
        prisma.quotation.count({ where: { vendorId: vendor.id } })
      ]);
      return {
        vendorId: vendor.id,
        companyName: vendor.companyName,
        rating: vendor.rating,
        totalOrders: poAgg._count,
        totalSpent: poAgg._sum.grandTotal || 0,
        totalQuotations: quotationCount
      };
    }));
    return performance;
  }

  async monthlyTrends() {
    const pos = await prisma.purchaseOrder.findMany({
      select: { createdAt: true, grandTotal: true },
      orderBy: { createdAt: 'desc' }
    });

    const monthlyMap = new Map<string, { count: number; total: number }>();
    pos.forEach(po => {
      const key = `${po.createdAt.getFullYear()}-${po.createdAt.getMonth() + 1}`;
      const existing = monthlyMap.get(key) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += po.grandTotal;
      monthlyMap.set(key, existing);
    });

    return Array.from(monthlyMap.entries())
      .map(([key, value]) => {
        const [year, month] = key.split('-').map(Number);
        return { year, month, count: value.count, total: value.total };
      })
      .sort((a, b) => b.year - a.year || b.month - a.month)
      .slice(0, 12);
  }

  async exportReport(format: string) {
    if (!['pdf', 'excel'].includes(format)) {
      throw { statusCode: 400, message: 'Format must be pdf or excel' };
    }

    const recentPOs = await prisma.purchaseOrder.findMany({
      include: { vendor: { select: { companyName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    if (format === 'pdf') {
      return this.exportPDF(recentPOs);
    }
    return this.exportCSV(recentPOs);
  }

  private exportPDF(pos: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', (b: Buffer) => buffers.push(b));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(20).text('Procurement Report', { align: 'center' });
        doc.moveDown(2);
        doc.fontSize(12).text(`Total Orders: ${pos.length}`);
        doc.text(`Total Spent: $${pos.reduce((s, p) => s + p.grandTotal, 0).toFixed(2)}`);
        doc.moveDown();
        doc.fontSize(14).text('Recent Purchase Orders', { underline: true });
        doc.moveDown();
        pos.forEach(po => {
          doc.fontSize(10).text(`${po.poNumber} - ${po.vendor?.companyName || 'N/A'} - $${po.grandTotal.toFixed(2)}`);
        });
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private exportCSV(pos: any[]): string {
    const headers = 'poNumber,vendor,grandTotal,status,createdAt\n';
    const rows = pos.map(po =>
      `${po.poNumber},"${po.vendor?.companyName || 'N/A'}",${po.grandTotal},${po.status},${po.createdAt.toISOString()}`
    ).join('\n');
    return headers + rows;
  }
}

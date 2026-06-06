import prisma from '../../config/prisma';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { sendInvoiceEmail } from '../../services/emailService';
import { InvoiceStatus, normalizeStatus, PurchaseOrderStatus, Roles } from '../../constants';
import { UserPayload } from '../../types';

export class InvoicesService {
  private generateInvoiceNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  async generate(poId: string, userId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true, vendor: true }
    });
    if (!po) throw { statusCode: 404, message: 'Purchase order not found' };
    if ([PurchaseOrderStatus.CANCELLED, PurchaseOrderStatus.PAID].includes(po.status as any)) {
      throw { statusCode: 400, message: `Invoice cannot be generated from PO status ${po.status}` };
    }

    const existingInvoice = await prisma.invoice.findFirst({
      where: { purchaseOrderId: poId },
      include: { items: true, vendor: true, purchaseOrder: true }
    });
    if (existingInvoice) return existingInvoice;

    let invoiceNumber = this.generateInvoiceNumber();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const exists = await prisma.invoice.findUnique({ where: { invoiceNumber } });
      if (!exists) break;
      invoiceNumber = this.generateInvoiceNumber();
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        purchaseOrderId: po.id,
        vendorId: po.vendorId,
        subtotal: po.subtotal,
        taxAmount: po.taxAmount,
        grandTotal: po.grandTotal,
        generatedById: userId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: {
          create: po.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },
      include: { items: true, vendor: true, purchaseOrder: true }
    });

    await prisma.purchaseOrder.update({ where: { id: poId }, data: { status: PurchaseOrderStatus.COMPLETED } });

    await prisma.activity.create({
      data: {
        type: 'INVOICE', action: 'GENERATED',
        description: `Invoice ${invoiceNumber} generated`,
        userId, relatedId: invoice.id
      }
    });
    if (invoice.vendor?.userId) {
      await prisma.notification.create({
        data: {
          userId: invoice.vendor.userId,
          type: 'INVOICE',
          title: 'Invoice Generated',
          message: `Invoice ${invoice.invoiceNumber} was generated for PO ${po.poNumber}.`,
          relatedId: invoice.id
        }
      });
    }

    return invoice;
  }

  async findById(id: string, user?: UserPayload) {
    const where: any = { id };
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    const invoice = await prisma.invoice.findFirst({
      where,
      include: { vendor: true, purchaseOrder: true, items: true, generatedBy: { select: { id: true, name: true, email: true } } }
    });
    if (!invoice) throw { statusCode: 404, message: 'Invoice not found' };
    if ([InvoiceStatus.PAID, InvoiceStatus.CANCELLED].includes(invoice.status as any)) {
      throw { statusCode: 400, message: `Invoice is already ${invoice.status}` };
    }
    return invoice;
  }

  async findAll(query: { status?: string; vendorId?: string }, user?: UserPayload) {
    const where: any = {};
    if (query.status) where.status = normalizeStatus(query.status);
    if (query.vendorId) where.vendorId = query.vendorId;
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    return prisma.invoice.findMany({
      where,
      include: { vendor: true, purchaseOrder: true, items: true, generatedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async pay(id: string, userId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { purchaseOrder: true }
    });
    if (!invoice) throw { statusCode: 404, message: 'Invoice not found' };
    if ([InvoiceStatus.PAID, InvoiceStatus.CANCELLED].includes(invoice.status as any)) {
      throw { statusCode: 400, message: `Invoice cannot be emailed from status ${invoice.status}` };
    }

    const paidInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.PAID, paidAt: new Date() }
    });

    await prisma.purchaseOrder.update({
      where: { id: invoice.purchaseOrderId },
      data: { status: PurchaseOrderStatus.PAID }
    });

    await prisma.activity.create({
      data: {
        type: 'INVOICE', action: 'PAID',
        description: `Invoice ${invoice.invoiceNumber} marked as paid`,
        userId, relatedId: invoice.id
      }
    });

    if (invoice.purchaseOrder.vendorId) {
      const vendor = await prisma.vendor.findUnique({ where: { id: invoice.vendorId } });
      if (vendor?.userId) {
        await prisma.notification.create({
          data: {
            userId: vendor.userId,
            type: 'INVOICE',
            title: 'Invoice Paid',
            message: `Invoice ${invoice.invoiceNumber} has been paid.`,
            relatedId: invoice.id
          }
        });
      }
    }

    return paidInvoice;
  }

  async getPDF(id: string, user?: UserPayload) {
    const where: any = { id };
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    const invoice = await prisma.invoice.findFirst({
      where,
      include: { vendor: true, purchaseOrder: true, items: true }
    });
    if (!invoice) throw { statusCode: 404, message: 'Invoice not found' };
    return generateInvoicePDF(invoice, invoice.purchaseOrder, invoice.vendor);
  }

  async email(id: string, userId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { vendor: true, purchaseOrder: true, items: true }
    });
    if (!invoice) throw { statusCode: 404, message: 'Invoice not found' };

    const pdf = await generateInvoicePDF(invoice, invoice.purchaseOrder, invoice.vendor);
    await sendInvoiceEmail(invoice.vendor.email, invoice, pdf);

    await prisma.invoice.update({ where: { id }, data: { status: InvoiceStatus.SENT } });

    await prisma.activity.create({
      data: {
        type: 'INVOICE', action: 'EMAILED',
        description: `Invoice ${invoice.invoiceNumber} emailed to ${invoice.vendor.email}`,
        userId, relatedId: invoice.id
      }
    });
    if (invoice.vendor?.userId) {
      await prisma.notification.create({
        data: {
          userId: invoice.vendor.userId,
          type: 'INVOICE',
          title: 'Invoice Sent',
          message: `Invoice ${invoice.invoiceNumber} has been emailed to ${invoice.vendor.email}.`,
          relatedId: invoice.id
        }
      });
    }

    return { message: 'Invoice emailed successfully' };
  }

  async print(id: string, user?: UserPayload) {
    const where: any = { id };
    if (user?.role === Roles.VENDOR) {
      where.vendor = { userId: user.id };
    }
    const invoice = await prisma.invoice.findFirst({
      where,
      include: { vendor: true, purchaseOrder: true, items: true }
    });
    if (!invoice) throw { statusCode: 404, message: 'Invoice not found' };
    return generateInvoicePDF(invoice, invoice.purchaseOrder, invoice.vendor);
  }
}

import prisma from '../../config/prisma';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { sendInvoiceEmail } from '../../services/emailService';

export class InvoicesService {
  async generate(poId: string, userId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true, vendor: true }
    });
    if (!po) throw { statusCode: 404, message: 'Purchase order not found' };

    const invCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invCount + 1).padStart(6, '0')}`;

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

    await prisma.purchaseOrder.update({ where: { id: poId }, data: { status: 'completed' } });

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

  async findById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { vendor: true, purchaseOrder: true, items: true, generatedBy: { select: { id: true, name: true, email: true } } }
    });
    if (!invoice) throw { statusCode: 404, message: 'Invoice not found' };
    return invoice;
  }

  async findAll(query: { status?: string; vendorId?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.vendorId) where.vendorId = query.vendorId;
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

    const paidInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() }
    });

    await prisma.purchaseOrder.update({
      where: { id: invoice.purchaseOrderId },
      data: { status: 'paid' }
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

  async getPDF(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
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

    await prisma.invoice.update({ where: { id }, data: { status: 'sent' } });

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

  async print(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { vendor: true, purchaseOrder: true, items: true }
    });
    if (!invoice) throw { statusCode: 404, message: 'Invoice not found' };
    return generateInvoicePDF(invoice, invoice.purchaseOrder, invoice.vendor);
  }
}

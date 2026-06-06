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
          create: po.items.map(item => ({
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

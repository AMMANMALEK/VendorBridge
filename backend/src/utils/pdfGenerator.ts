import PDFDocument from 'pdfkit';

interface InvoiceData {
  invoiceNumber: string;
  createdAt: Date;
  dueDate: Date | null;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface PONumber {
  poNumber: string;
}

interface VendorInfo {
  companyName: string;
  address: string | null;
  gstNumber: string | null;
}

export const generateInvoicePDF = (
  invoice: InvoiceData,
  purchaseOrder: PONumber,
  vendor: VendorInfo
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (buffer: Buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(22).text('INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
      doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`);
      doc.moveDown(2);

      doc.fontSize(14).text('Bill To:');
      doc.fontSize(11).text(vendor.companyName);
      doc.text(vendor.address || '');
      doc.text(`GST: ${vendor.gstNumber || 'N/A'}`);
      doc.moveDown(2);

      doc.fontSize(10).text(`PO Number: ${purchaseOrder.poNumber}`);
      doc.moveDown();

      const tableTop = doc.y;
      doc.fontSize(11);
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, tableTop, { width: 200 });
      doc.text('Qty', 270, tableTop, { width: 50, align: 'center' });
      doc.text('Unit Price', 320, tableTop, { width: 80, align: 'right' });
      doc.text('Total', 420, tableTop, { width: 80, align: 'right' });
      doc.moveDown();

      doc.font('Helvetica').fontSize(10);
      let y = doc.y;
      invoice.items.forEach((item) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.text(item.productName, 50, y, { width: 200 });
        doc.text(String(item.quantity), 270, y, { width: 50, align: 'center' });
        doc.text(`$${item.unitPrice.toFixed(2)}`, 320, y, { width: 80, align: 'right' });
        doc.text(`$${item.totalPrice.toFixed(2)}`, 420, y, { width: 80, align: 'right' });
        y += 20;
      });

      doc.moveDown(2);
      const summaryY = doc.y;
      doc.font('Helvetica-Bold').fontSize(11);
      doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 350, summaryY, { align: 'right' });
      doc.text(`Tax (18%): $${invoice.taxAmount.toFixed(2)}`, 350, doc.y + 15, { align: 'right' });
      doc.fontSize(14).text(`Grand Total: $${invoice.grandTotal.toFixed(2)}`, 330, doc.y + 20, { align: 'right' });

      doc.moveDown(4);
      doc.fontSize(9).font('Helvetica').fillColor('gray');
      doc.text('Thank you for your business!', { align: 'center' });
      doc.text('VendorBridge ERP', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

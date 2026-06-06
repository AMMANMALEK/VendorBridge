import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

export const sendEmail = async ({ to, subject, text, html, attachments }: SendEmailParams) => {
  if (!config.email.user || !config.email.pass) {
    console.log(`[Email Service - Mock Mode] Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    if (text) console.log(`Text Body: ${text}`);
    if (html) console.log(`HTML Body: ${html}`);
    if (attachments && attachments.length > 0) {
      console.log(`Attachments: ${attachments.map(a => a.filename).join(', ')}`);
    }
    return { messageId: 'mock-message-id-12345' };
  }
  try {
    const info = await transporter.sendMail({
      from: config.email.user,
      to,
      subject,
      text,
      html,
      attachments
    });
    return info;
  } catch (error: any) {
    console.error('Email send error:', error.message);
    throw error;
  }
};

export const sendInvoiceEmail = async (
  to: string,
  invoice: { invoiceNumber: string; grandTotal: number; dueDate: Date | null },
  pdfBuffer: Buffer
) => {
  return sendEmail({
    to,
    subject: `Invoice #${invoice.invoiceNumber} from VendorBridge`,
    html: `<h3>Invoice #${invoice.invoiceNumber}</h3><p>Please find attached your invoice for $${invoice.grandTotal.toFixed(2)}.</p><p>Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>`,
    attachments: [{ filename: `invoice_${invoice.invoiceNumber}.pdf`, content: pdfBuffer }]
  });
};

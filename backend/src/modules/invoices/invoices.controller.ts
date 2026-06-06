import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { InvoicesService } from './invoices.service';

const invoicesService = new InvoicesService();

export const generateInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoicesService.generate(req.params.poId as string, req.user!.id);
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoicesService.findById(req.params.id as string);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const getInvoicePDF = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pdf = await invoicesService.getPDF(req.params.id as string);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

export const emailInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await invoicesService.email(req.params.id as string, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const printInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pdf = await invoicesService.print(req.params.id as string);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

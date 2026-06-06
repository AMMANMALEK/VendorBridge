import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { QuotationsService } from './quotations.service';

const quotationsService = new QuotationsService();

export const submitQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotation = await quotationsService.submit(req.body, req.user!);
    res.status(201).json(quotation);
  } catch (error) {
    next(error);
  }
};

export const updateQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotation = await quotationsService.update(req.params.id as string, req.body, req.user!);
    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

export const getAllQuotations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotations = await quotationsService.findAll(req.query as any, req.user);
    res.json(quotations);
  } catch (error) {
    next(error);
  }
};

export const getQuotationsByRFQ = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotations = await quotationsService.findByRFQ(req.params.id as string, req.user);
    res.json(quotations);
  } catch (error) {
    next(error);
  }
};

export const getQuotationsByVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotations = await quotationsService.findByVendor(req.params.id as string, req.user);
    res.json(quotations);
  } catch (error) {
    next(error);
  }
};

export const compareQuotations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await quotationsService.compare(req.params.id as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { PurchaseOrdersService } from './purchaseOrders.service';

const purchaseOrdersService = new PurchaseOrdersService();

export const generatePO = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const po = await purchaseOrdersService.generate(req.params.quotationId as string, req.user!.id);
    res.status(201).json(po);
  } catch (error) {
    next(error);
  }
};

export const getPOs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pos = await purchaseOrdersService.findAll(req.query.status as string, req.user);
    res.json(pos);
  } catch (error) {
    next(error);
  }
};

export const getPOById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const po = await purchaseOrdersService.findById(req.params.id as string, req.user);
    res.json(po);
  } catch (error) {
    next(error);
  }
};

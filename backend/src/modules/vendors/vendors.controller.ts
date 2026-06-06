import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { VendorsService } from './vendors.service';

const vendorsService = new VendorsService();

export const createVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorsService.create({ ...req.body, userId: req.user?.id });
    res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendors = await vendorsService.findAll(req.query as any);
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorsService.findById(req.params.id as string);
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorsService.update(req.params.id as string, req.body);
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await vendorsService.delete(req.params.id as string);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

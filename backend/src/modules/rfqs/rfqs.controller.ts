import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { RFQsService } from './rfqs.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../../config/prisma';

const rfqsService = new RFQsService();

const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

export const upload = multer({ storage });

export const createRFQ = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rfq = await rfqsService.create(req.body, req.user!.id);
    res.status(201).json(rfq);
  } catch (error) {
    next(error);
  }
};

export const getRFQs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rfqs = await rfqsService.findAll(req.query as any);
    res.json(rfqs);
  } catch (error) {
    next(error);
  }
};

export const getRFQById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rfq = await rfqsService.findById(req.params.id as string);
    res.json(rfq);
  } catch (error) {
    next(error);
  }
};

export const updateRFQ = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rfq = await rfqsService.update(req.params.id as string, req.body);
    res.json(rfq);
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const attachment = await prisma.attachment.create({
      data: {
        rfqId: req.params.id as string,
        filename: req.file.originalname,
        path: req.file.path
      }
    });
    res.json(attachment);
  } catch (error) {
    next(error);
  }
};

export const assignVendors = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendorIds: string[] = req.body.vendorIds;
    const rfq = await prisma.rfq.findUnique({
      where: { id: req.params.id as string },
      include: { assignedVendors: true }
    });
    if (!rfq) { res.status(404).json({ message: 'RFQ not found' }); return; }

    const existingIds = rfq.assignedVendors.map(v => v.vendorId);
    const newIds = vendorIds.filter(v => !existingIds.includes(v));

    for (const vendorId of newIds) {
      await prisma.rfqVendor.create({ data: { rfqId: req.params.id as string, vendorId } });
    }

    const updated = await prisma.rfq.findUnique({
      where: { id: req.params.id as string },
      include: { assignedVendors: { include: { vendor: true } } }
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

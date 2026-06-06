import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { ApprovalsService } from './approvals.service';

const approvalsService = new ApprovalsService();

export const getPendingApprovals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const approvals = await approvalsService.getPending();
    res.json(approvals);
  } catch (error) {
    next(error);
  }
};

export const getAllApprovals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const approvals = await approvalsService.findAll(req.query as any);
    res.json(approvals);
  } catch (error) {
    next(error);
  }
};

export const approveQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const approval = await approvalsService.approve(req.params.id as string, req.user!.id, req.body.remarks);
    res.json(approval);
  } catch (error) {
    next(error);
  }
};

export const rejectQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const approval = await approvalsService.reject(req.params.id as string, req.user!.id, req.body.remarks);
    res.json(approval);
  } catch (error) {
    next(error);
  }
};

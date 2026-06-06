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

export const approveQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const approval = await approvalsService.approve(req.params.quotationId as string, req.user!.id, req.body.remarks);
    res.json(approval);
  } catch (error) {
    next(error);
  }
};

export const rejectQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const approval = await approvalsService.reject(req.params.quotationId as string, req.user!.id, req.body.remarks);
    res.json(approval);
  } catch (error) {
    next(error);
  }
};

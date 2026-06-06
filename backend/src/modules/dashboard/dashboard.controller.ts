import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await dashboardService.getSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await dashboardService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { ReportsService } from './reports.service';

const reportsService = new ReportsService();

export const getProcurementSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await reportsService.procurementSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const getVendorPerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const performance = await reportsService.vendorPerformance();
    res.json(performance);
  } catch (error) {
    next(error);
  }
};

export const getMonthlyTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trends = await reportsService.monthlyTrends();
    res.json(trends);
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await reportsService.exportReport(req.query.format as string);
    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=procurement_report.pdf');
      res.send(result);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=procurement_report.csv');
      res.send(result);
    }
  } catch (error) {
    next(error);
  }
};

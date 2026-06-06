import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { ActivityLogsService } from './activityLogs.service';

const activityLogsService = new ActivityLogsService();

export const getActivities = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activities = await activityLogsService.findAll(req.query.type as string, req.user);
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

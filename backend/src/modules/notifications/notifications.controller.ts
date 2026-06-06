import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { NotificationsService } from './notifications.service';

const notificationsService = new NotificationsService();

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationsService.findByUser(req.user!.id);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationsService.markAsRead(req.params.id as string, req.user!.id);
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

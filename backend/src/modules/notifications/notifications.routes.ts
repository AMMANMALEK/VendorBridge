import { Router } from 'express';
import { getNotifications, markAsRead } from './notifications.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markAsRead);

export default router;

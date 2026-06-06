import { Router } from 'express';
import { getSummary, getAnalytics } from './dashboard.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.get('/summary', protect, getSummary);
router.get('/analytics', protect, authorize('admin', 'manager'), getAnalytics);

export default router;

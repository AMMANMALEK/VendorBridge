import { Router } from 'express';
import { getActivities } from './activityLogs.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.get('/', protect, getActivities);

export default router;

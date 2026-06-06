import { Router } from 'express';
import { getPendingApprovals, getAllApprovals, approveQuotation, rejectQuotation } from './approvals.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', protect, authorize('admin', 'manager'), getAllApprovals);
router.get('/pending', protect, authorize('admin', 'manager'), getPendingApprovals);
router.post('/:id/approve', protect, authorize('admin', 'manager'), approveQuotation);
router.post('/:id/reject', protect, authorize('admin', 'manager'), rejectQuotation);

export default router;

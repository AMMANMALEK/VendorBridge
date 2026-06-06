import { Router } from 'express';
import { getPendingApprovals, approveQuotation, rejectQuotation } from './approvals.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.get('/pending', protect, authorize('admin', 'manager'), getPendingApprovals);
router.post('/:quotationId/approve', protect, authorize('admin', 'manager'), approveQuotation);
router.post('/:quotationId/reject', protect, authorize('admin', 'manager'), rejectQuotation);

export default router;

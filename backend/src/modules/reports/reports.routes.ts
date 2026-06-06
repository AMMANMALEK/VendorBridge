import { Router } from 'express';
import { getProcurementSummary, getVendorPerformance, getMonthlyTrends, exportReport } from './reports.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.get('/procurement-summary', protect, authorize('admin', 'manager'), getProcurementSummary);
router.get('/vendor-performance', protect, authorize('admin', 'manager'), getVendorPerformance);
router.get('/monthly-trends', protect, authorize('admin', 'manager'), getMonthlyTrends);
router.get('/export', protect, authorize('admin', 'manager'), exportReport);

export default router;

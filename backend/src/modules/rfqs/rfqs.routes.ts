import { Router } from 'express';
import { createRFQ, getRFQs, getRFQById, updateRFQ, uploadAttachment, assignVendors, upload } from './rfqs.controller';
import { protect, authorize } from '../../middleware/auth';
import { getQuotationsByRFQ } from '../quotations/quotations.controller';
import { compareQuotations } from '../quotations/quotations.controller';

const router = Router();

router.route('/')
  .post(protect, authorize('admin', 'procurement_officer'), createRFQ)
  .get(protect, getRFQs);

router.route('/:id')
  .get(protect, getRFQById)
  .put(protect, authorize('admin', 'procurement_officer'), updateRFQ);

router.get('/:id/quotations', protect, getQuotationsByRFQ);
router.get('/:id/compare', protect, authorize('admin', 'procurement_officer', 'manager'), compareQuotations);
router.post('/:id/attachments', protect, authorize('admin', 'procurement_officer'), upload.single('file'), uploadAttachment);
router.post('/:id/vendors', protect, authorize('admin', 'procurement_officer'), assignVendors);

export default router;

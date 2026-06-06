import { Router } from 'express';
import { createVendor, getVendors, getVendorById, updateVendor, deleteVendor } from './vendors.controller';
import { protect, authorize } from '../../middleware/auth';
import { getQuotationsByVendor } from '../quotations/quotations.controller';

const router = Router();

router.route('/')
  .post(protect, authorize('admin', 'officer'), createVendor)
  .get(protect, getVendors);

router.route('/:id')
  .get(protect, getVendorById)
  .put(protect, authorize('admin', 'officer'), updateVendor)
  .delete(protect, authorize('admin'), deleteVendor);

router.get('/:id/quotations', protect, getQuotationsByVendor);

export default router;

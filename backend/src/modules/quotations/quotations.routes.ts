import { Router } from 'express';
import { submitQuotation, updateQuotation, getAllQuotations } from './quotations.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', protect, getAllQuotations);
router.post('/', protect, authorize('admin', 'officer', 'vendor'), submitQuotation);
router.put('/:id', protect, authorize('admin', 'officer', 'vendor'), updateQuotation);

export default router;

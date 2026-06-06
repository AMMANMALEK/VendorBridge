import { Router } from 'express';
import { submitQuotation, updateQuotation, getAllQuotations } from './quotations.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.get('/', protect, getAllQuotations);
router.post('/', protect, submitQuotation);
router.put('/:id', protect, updateQuotation);

export default router;

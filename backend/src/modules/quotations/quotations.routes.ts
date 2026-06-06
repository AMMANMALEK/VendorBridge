import { Router } from 'express';
import { submitQuotation, updateQuotation } from './quotations.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.post('/', protect, submitQuotation);
router.put('/:id', protect, updateQuotation);

export default router;

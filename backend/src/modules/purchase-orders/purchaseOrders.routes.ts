import { Router } from 'express';
import { generatePO, getPOs, getPOById } from './purchaseOrders.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', protect, getPOs);
router.get('/:id', protect, getPOById);
router.post('/generate/:quotationId', protect, authorize('admin', 'procurement_officer'), generatePO);

export default router;

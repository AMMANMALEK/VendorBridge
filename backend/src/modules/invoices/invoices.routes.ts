import { Router } from 'express';
import { generateInvoice, getInvoiceById, getInvoicePDF, emailInvoice, printInvoice } from './invoices.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.post('/generate/:poId', protect, authorize('admin', 'procurement_officer'), generateInvoice);
router.get('/:id', protect, getInvoiceById);
router.get('/:id/pdf', protect, getInvoicePDF);
router.post('/:id/email', protect, authorize('admin', 'procurement_officer'), emailInvoice);
router.get('/:id/print', protect, printInvoice);

export default router;

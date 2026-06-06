import { Router } from 'express';
import { generateInvoice, getInvoices, getInvoiceById, getInvoicePDF, payInvoice, emailInvoice, printInvoice } from './invoices.controller';
import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', protect, getInvoices);
router.post('/generate/:poId', protect, authorize('admin', 'officer'), generateInvoice);
router.post('/:id/pay', protect, authorize('admin', 'officer'), payInvoice);
router.get('/:id', protect, getInvoiceById);
router.get('/:id/pdf', protect, getInvoicePDF);
router.post('/:id/email', protect, authorize('admin', 'officer'), emailInvoice);
router.get('/:id/print', protect, printInvoice);

export default router;

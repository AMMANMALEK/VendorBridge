export const Roles = {
  ADMIN: 'admin',
  OFFICER: 'officer',
  MANAGER: 'manager',
  VENDOR: 'vendor'
} as const;

export const RfqStatus = {
  DRAFT: 'draft',
  OPEN: 'open',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
} as const;

export const QuotationStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  REVISED: 'revised',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const PurchaseOrderStatus = {
  GENERATED: 'generated',
  COMPLETED: 'completed',
  PAID: 'paid',
  CANCELLED: 'cancelled'
} as const;

export const InvoiceStatus = {
  GENERATED: 'generated',
  SENT: 'sent',
  PAID: 'paid',
  CANCELLED: 'cancelled'
} as const;

export const normalizeStatus = (status?: string) => {
  if (!status) return status;
  return status.trim().toLowerCase().replace(/\s+/g, '_');
};

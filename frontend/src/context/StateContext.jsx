import React, { createContext, useContext, useState, useEffect } from 'react';

const StateContext = createContext();

<<<<<<< HEAD
// ─── Hardcoded Users ───────────────────────────────────────────────────────────
// 4 internal staff + 3 vendor accounts (one per existing company with a login)
const SEED_USERS = [
  {
    id: 'USR-001',
    name: 'Arjun Kapoor',
    email: 'admin@vendorbridge.com',
    password: 'Admin@123',
    role: 'admin',
    roleLabel: 'Administrator',
    symbol: '👑',
    company: 'VendorBridge Corp'
  },
  {
    id: 'USR-002',
    name: 'Rahul Sharma',
    email: 'officer@vendorbridge.com',
    password: 'Officer@123',
    role: 'officer',
    roleLabel: 'Procurement Officer',
    symbol: '📋',
    company: 'VendorBridge Corp'
  },
  {
    id: 'USR-003',
    name: 'Priya Mehta',
    email: 'manager@vendorbridge.com',
    password: 'Manager@123',
    role: 'manager',
    roleLabel: 'Manager / Approver',
    symbol: '✅',
    company: 'VendorBridge Corp'
  },
  {
    id: 'USR-004',
    name: 'Infra Supplies Pvt Ltd',
    email: 'vendor@infrasupp.com',
    password: 'Vendor@123',
    role: 'vendor',
    roleLabel: 'Vendor',
    symbol: '🏭',
    company: 'Infra Supplies Pvt Ltd'
  },
  {
    id: 'USR-005',
    name: 'Global Tech Solutions',
    email: 'vendor@globaltech.com',
    password: 'Global@123',
    role: 'vendor',
    roleLabel: 'Vendor',
    symbol: '🏭',
    company: 'Global Tech Solutions'
  },
  {
    id: 'USR-006',
    name: 'Aura Logistics',
    email: 'vendor@auralogistics.in',
    password: 'Aura@1234',
    role: 'vendor',
    roleLabel: 'Vendor',
    symbol: '🏭',
    company: 'Aura Logistics'
=======
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';

const defaultVendors = [];
const defaultRFQs = [];
const defaultQuotations = [];
const defaultPOs = [];
const defaultInvoices = [];
const defaultApprovals = [];
const defaultLogs = [];

function buildHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function apiFetch(path, token, options = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    credentials: 'include',
    headers: buildHeaders(token),
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || res.statusText || 'API request failed');
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
  }
  return res.status === 204 ? null : res.json();
}

<<<<<<< HEAD
// ─── Default Data ──────────────────────────────────────────────────────────────
const defaultVendors = [
  { id: "VND-001", name: "Global Tech Solutions",  contact: "vendor@globaltech.com",    category: "IT Hardware",      status: "Active", rating: "4.8", address: "Mumbai, MH",    totalOrders: 0, totalSpent: 0 },
  { id: "VND-002", name: "Aura Logistics",          contact: "vendor@auralogistics.in",  category: "Logistics",        status: "Active", rating: "4.5", address: "Pune, MH",      totalOrders: 0, totalSpent: 0 },
  { id: "VND-003", name: "Swift Supplies Ltd",      contact: "sales@swiftsupplies.com",  category: "Office Supplies",  status: "Active", rating: "4.2", address: "Delhi, NCR",    totalOrders: 0, totalSpent: 0 },
  { id: "VND-004", name: "Deepak Industries",       contact: "deepak@deepakind.com",     category: "Industrial Parts", status: "Active", rating: "4.9", address: "Ahmedabad, GJ", totalOrders: 0, totalSpent: 0 },
  { id: "VND-005", name: "Infra Supplies Pvt Ltd",  contact: "vendor@infrasupp.com",     category: "Industrial Parts", status: "Active", rating: "4.6", address: "Chennai, TN",   totalOrders: 0, totalSpent: 0 }
];

const defaultRFQs = [
  { id: "RFQ-2026-001", title: "Enterprise Laptops (20 units)",   category: "IT Hardware",    createdDate: "2026-05-15", deadline: "2026-06-30", status: "Open", description: "Requirement of high performance Core i7, 16GB RAM laptops with 3 years warranty." },
  { id: "RFQ-2026-002", title: "West Zone Freight Distribution",  category: "Logistics",      createdDate: "2026-06-01", deadline: "2026-06-30", status: "Open", description: "Monthly logistics and freight distribution services for West zone warehouses." },
  { id: "RFQ-2026-003", title: "Bulk Stationary Supplies",        category: "Office Supplies", createdDate: "2026-06-04", deadline: "2026-06-30", status: "Open", description: "Annual stationary supply contract for corporate offices." }
];

const defaultQuotations = [];

const defaultPOs = [];

const defaultInvoices = [];

const defaultApprovals = [];

const defaultLogs = [
  { id: "LOG-001", user: "Rahul Sharma", action: "Created RFQ-2026-001 Enterprise Laptops (20 units)", category: "RFQ", timestamp: "2026-05-15T09:00:00Z" },
  { id: "LOG-002", user: "Rahul Sharma", action: "Created RFQ-2026-002 West Zone Freight Distribution", category: "RFQ", timestamp: "2026-06-01T10:00:00Z" },
  { id: "LOG-003", user: "Rahul Sharma", action: "Created RFQ-2026-003 Bulk Stationary Supplies",       category: "RFQ", timestamp: "2026-06-04T10:15:30Z" }
];

const SEED_VERSION = 'v5';
// Run migration at module load time — before any useState initializer fires
if (localStorage.getItem('vb_seed_version') !== SEED_VERSION) {
  localStorage.removeItem('vb_registered_users');
  localStorage.removeItem('vb_vendors');
  localStorage.removeItem('vb_rfqs');
  localStorage.removeItem('vb_quotations');
  localStorage.removeItem('vb_pos');
  localStorage.removeItem('vb_invoices');
  localStorage.removeItem('vb_approvals');
  localStorage.removeItem('vb_logs');
  localStorage.removeItem('vb_user');
  localStorage.setItem('vb_seed_version', SEED_VERSION);
}

// ─── Provider ──────────────────────────────────────────────────────────────────
=======
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function normalizeVendor(vendor) {
  if (!vendor) return null;
  const normalized = {
    ...vendor,
    id: vendor.id,
    companyName: vendor.companyName || vendor.name || '',
    name: vendor.companyName || vendor.name || `${vendor.contactPerson || ''}`.trim() || 'Vendor',
    contact: vendor.email || vendor.contact || vendor.phone || vendor.contactPerson || '',
    rating: typeof vendor.rating === 'number' ? vendor.rating : Number(vendor.rating) || 0,
    category: vendor.category || 'General',
    status: vendor.status ? String(vendor.status).charAt(0).toUpperCase() + String(vendor.status).slice(1) : 'Active'
  };
  return normalized;
}

function normalizeRFQ(rfq) {
  if (!rfq) return null;
  const assignedVendors = Array.isArray(rfq.assignedVendors)
    ? rfq.assignedVendors.map(av => normalizeVendor(av.vendor || av))
    : [];
  return {
    ...rfq,
    assignedVendors,
    items: Array.isArray(rfq.items)
      ? rfq.items.map(item => ({ ...item, name: item.productName || item.name || 'Item' }))
      : [],
    createdDate: formatDate(rfq.createdAt),
    deadline: rfq.deadline ? formatDate(rfq.deadline) : '',
    quotationCount: rfq._count?.quotations ?? (Array.isArray(rfq.quotations) ? rfq.quotations.length : 0)
  };
}

function normalizeQuotation(quotation) {
  if (!quotation) return null;
  const vendor = normalizeVendor(quotation.vendor || quotation.vendorId ? quotation.vendor : null);
  return {
    ...quotation,
    vendor,
    vendorName: quotation.vendor?.companyName || quotation.vendorName || vendor?.companyName || vendor?.name || '',
    rfqTitle: quotation.rfq?.title || quotation.rfqTitle || '',
    submittedDate: formatDate(quotation.createdAt),
    amount: quotation.grandTotal ?? quotation.amount ?? quotation.subtotal ?? 0,
    grandTotal: quotation.grandTotal ?? quotation.amount ?? quotation.subtotal ?? 0,
    deliveryDays: quotation.deliveryDays || quotation.deliveryTimeline || '',
    items: Array.isArray(quotation.items)
      ? quotation.items.map(item => ({ ...item, name: item.productName || item.name || 'Item' }))
      : [],
    status: quotation.status ? String(quotation.status).charAt(0).toUpperCase() + String(quotation.status).slice(1) : 'Draft',
    requester: quotation.submittedBy?.name || vendor?.companyName || ''
  };
}

function normalizeApproval(approval) {
  if (!approval) return null;
  const vendor = normalizeVendor(approval.vendor);
  const quotation = approval.quotation || {};
  return {
    ...approval,
    vendor,
    vendorName: vendor?.companyName || '',
    title: approval.rfq?.title || quotation?.rfq?.title || `Quotation ${approval.quotationId || ''}`,
    requester: quotation?.submittedBy?.name || vendor?.companyName || 'Vendor',
    amount: quotation?.grandTotal ?? quotation?.subtotal ?? 0,
    submittedDate: formatDate(approval.createdAt),
    decisionDate: formatDate(approval.reviewedAt || approval.updatedAt),
    decidedBy: approval.approvedBy?.name || '',
    remark: approval.remarks || approval.remark || '',
    status: approval.status ? String(approval.status).charAt(0).toUpperCase() + String(approval.status).slice(1) : 'Pending',
    type: approval.type || (quotation ? 'Quotation Approval' : 'Purchase Order'),
    sourceId: approval.quotationId || approval.rfqId || ''
  };
}

function normalizePurchaseOrder(po) {
  if (!po) return null;
  const vendor = normalizeVendor(po.vendor);
  const itemsList = Array.isArray(po.items)
    ? po.items.map(item => ({ ...item, name: item.productName || item.name || 'Item' }))
    : [];
  const itemsDisplay = itemsList.map(item => item.name).filter(Boolean).join(', ');
  const normalizedStatus = String(po.status || '').toLowerCase();
  const status = normalizedStatus === 'generated'
    ? 'Approved'
    : normalizedStatus === 'completed'
      ? 'Completed'
      : normalizedStatus === 'paid'
        ? 'Paid'
        : normalizedStatus ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1) : 'Pending';
  return {
    ...po,
    vendor,
    vendorName: vendor?.companyName || '',
    amount: po.grandTotal ?? po.amount ?? po.subtotal ?? 0,
    items: itemsDisplay,
    itemsList,
    date: formatDate(po.createdAt),
    status,
    poId: po.id,
    poNumber: po.poNumber || `PO-${String(po.id || '').slice(0, 6).toUpperCase()}`,
    rfqTitle: po.rfq?.title || ''
  };
}

function normalizeInvoice(invoice) {
  if (!invoice) return null;
  const vendor = normalizeVendor(invoice.vendor);
  const itemsList = Array.isArray(invoice.items)
    ? invoice.items.map(item => ({ ...item, name: item.productName || item.name || 'Item' }))
    : [];
  const rawStatus = String(invoice.status || '').toLowerCase();
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
  const status = rawStatus === 'paid'
    ? 'Paid'
    : rawStatus === 'sent'
      ? 'Sent'
      : dueDate && dueDate < new Date()
        ? 'Overdue'
        : 'Pending';
  return {
    ...invoice,
    vendor,
    vendorName: vendor?.companyName || '',
    amount: invoice.grandTotal ?? invoice.amount ?? invoice.subtotal ?? 0,
    date: formatDate(invoice.createdAt),
    dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : '',
    status,
    poId: invoice.purchaseOrderId || invoice.poId,
    items: itemsList,
    itemsList
  };
}

function normalizeResponse(data, normalizer) {
  return Array.isArray(data) ? data.map(normalizer).filter(Boolean) : [];
}

>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
export const StateProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vb_user') || sessionStorage.getItem('vb_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('vb_token') || sessionStorage.getItem('vb_token'));
  const [persistAuth, setPersistAuth] = useState(() => Boolean(localStorage.getItem('vb_token')));
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState(defaultVendors);
  const [rfqs, setRfqs] = useState(defaultRFQs);
  const [quotations, setQuotations] = useState(defaultQuotations);
  const [pos, setPos] = useState(defaultPOs);
  const [invoices, setInvoices] = useState(defaultInvoices);
  const [approvals, setApprovals] = useState(defaultApprovals);
  const [logs, setLogs] = useState(defaultLogs);
  // isLoading prevents route guards from firing before auth state is settled
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedNotifIds, setDismissedNotifIds] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('vb_user', user ? JSON.stringify(user) : '');
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    const storage = persistAuth ? localStorage : sessionStorage;
    if (token) {
      storage.setItem('vb_token', token);
      storage.setItem('vb_user', JSON.stringify(user || {}));
      if (!persistAuth) {
        localStorage.removeItem('vb_token');
        localStorage.removeItem('vb_user');
      }
    } else {
      localStorage.removeItem('vb_token');
      localStorage.removeItem('vb_user');
      sessionStorage.removeItem('vb_token');
      sessionStorage.removeItem('vb_user');
    }
  }, [token, user, persistAuth]);

  const addLog = (action, category = 'System', actorName) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      user: actorName || (user ? user.name : 'System'),
      action,
      category,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const refreshData = async (authToken) => {
    if (!authToken) return;
    try {
      const [usersData, vendorsData, rfqsData, quotationsData, approvalsData, posData, invoicesData] = await Promise.all([
        apiFetch('/users', authToken).catch(() => []),
        apiFetch('/vendors', authToken).catch(() => []),
        apiFetch('/rfqs', authToken).catch(() => []),
        apiFetch('/quotations', authToken).catch(() => []),
        apiFetch('/approvals', authToken).catch(() => []),
        apiFetch('/purchase-orders', authToken).catch(() => []),
        apiFetch('/invoices', authToken).catch(() => [])
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setVendors(normalizeResponse(vendorsData, normalizeVendor));
      setRfqs(normalizeResponse(rfqsData, normalizeRFQ));
      setQuotations(normalizeResponse(quotationsData, normalizeQuotation));
      setApprovals(normalizeResponse(approvalsData, normalizeApproval));
      setPos(normalizeResponse(posData, normalizePurchaseOrder));
      setInvoices(normalizeResponse(invoicesData, normalizeInvoice));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // On mount: if we already have a token+user from storage, just mark ready.
  // refreshData is called lazily; don't block route rendering.
  useEffect(() => {
    if (token && user) {
      // Data is stale; kick off a background refresh but don't block navigation
      refreshData(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  const login = async (email, password, remember = false) => {
    const response = await apiFetch('/auth/login', null, { method: 'POST', body: { email, password } });
    setPersistAuth(Boolean(remember));
    setToken(response.token);
    setUser(response.user);
    // Refresh data in background after login — don't block navigation
    refreshData(response.token);
    return response.user;
  };

  const logout = () => {
    addLog(`User logged out: ${user ? user.name : 'Unknown'}`, 'Authentication');
    setUser(null);
    setToken(null);
    setPersistAuth(false);
    localStorage.removeItem('vb_user');
    localStorage.removeItem('vb_token');
    sessionStorage.removeItem('vb_user');
    sessionStorage.removeItem('vb_token');
  };

  const registerVendor = async (formData) => {
    const body = {
      name: formData.fullName || formData.companyName,
      email: formData.email,
      password: formData.password,
      role: 'vendor',
      company: formData.companyName || formData.fullName,
      phone: formData.phone,
      category: formData.category,
      country: formData.country,
      additionalInfo: formData.additionalInfo
    };
    const response = await apiFetch('/auth/register', null, { method: 'POST', body });
    if (response.user.status === 'Active') {
      setToken(response.token);
      setUser(response.user);
      await refreshData(response.token);
    }
    addLog(`Vendor registration submitted for: ${response.user.name}`, 'Authentication', response.user.name);
    return response;
  };

  const registerCompany = (formData) => registerVendor(formData);

  const addVendor = async (vendor) => {
    const newVendor = await apiFetch('/vendors', token, {
      method: 'POST',
      body: {
        companyName: vendor.name,
        contactPerson: vendor.contact,
        email: vendor.contact,
        category: vendor.category,
        address: vendor.address,
        phone: vendor.phone || vendor.contact
      }
    });
    const normalized = normalizeVendor(newVendor);
    setVendors(prev => [normalized, ...prev]);
    addLog(`Onboarded new vendor: ${normalized.companyName}`, 'Vendor');
    return normalized;
  };

  const updateVendorStatus = async (vendorId, newStatus) => {
    const updated = await apiFetch(`/vendors/${vendorId}`, token, { method: 'PUT', body: { status: newStatus } });
    const normalized = normalizeVendor(updated);
    setVendors(prev => prev.map(v => (v.id === vendorId ? normalized : v)));
    addLog(`Vendor ${normalized.companyName || normalized.name} status changed to ${newStatus}`, 'Vendor');
    return normalized;
  };

  const addRFQ = async (rfq) => {
    const newRFQ = await apiFetch('/rfqs', token, { method: 'POST', body: rfq });
    const normalized = normalizeRFQ(newRFQ);
    setRfqs(prev => [normalized, ...prev]);
    addLog(`Published RFQ: ${normalized.title}`, 'RFQ');
    return normalized;
  };

<<<<<<< HEAD
  const rejectApproval = (approvalId, remark = '') => {
    // Capture current snapshot for lookups (state updates are async)
    let targetApproval;
    setApprovals(prev => prev.map(a => {
      if (a.id === approvalId) {
        targetApproval = a;
        return { ...a, status: 'Rejected', remark, decidedBy: user?.name, decidedAt: new Date().toISOString() };
      }
      return a;
    }));
    if (!targetApproval) return;
    addLog(`Rejected ${targetApproval.type}: ${targetApproval.title}${remark ? ` — Reason: "${remark}"` : ''}`, 'Approvals');

    if (targetApproval.type === 'Quotation Approval') {
      // sourceId is the quotation id
      const quoteId = targetApproval.sourceId;
      // Reset the rejected quote back to Pending so officer can re-select
      setQuotations(prev => prev.map(q =>
        q.id === quoteId ? { ...q, status: 'Pending' } : q
      ));
      // Find rfqId from current quotations state
      const quote = quotations.find(q => q.id === quoteId);
      if (quote) {
        const rejectionNotice = {
          reason: remark,
          rejectedBy: user?.name,
          rejectedAt: new Date().toISOString(),
          approvalId,
          rfqId: quote.rfqId
        };
        setRfqs(prev => prev.map(r =>
          r.id === quote.rfqId ? { ...r, rejectionNotice } : r
        ));
        addLog(`RFQ ${quote.rfqId} returned to Officer for vendor re-selection`, 'RFQ');
      }
    } else if (targetApproval.type === 'Purchase Order') {
      // sourceId is the PO id
      const poId = targetApproval.sourceId;
      setPos(prev => prev.map(p => p.id === poId ? { ...p, status: 'Rejected' } : p));

      // Find the PO to get its associated quotation
      const po = pos.find(p => p.id === poId);
      if (po) {
        // Find the approved quotation that generated this PO — match by vendorName + rfqTitle heuristic
        // or check any quote that is 'Approved' and belongs to the same vendor
        const relatedQuote = quotations.find(q =>
          q.vendorName === po.vendorName && (q.status === 'Approved' || q.status === 'Pending')
        );
        if (relatedQuote) {
          // Reset quote so officer can re-select from comparison
          setQuotations(prev => prev.map(q =>
            q.id === relatedQuote.id ? { ...q, status: 'Pending' } : q
          ));
          const rejectionNotice = {
            reason: remark,
            rejectedBy: user?.name,
            rejectedAt: new Date().toISOString(),
            approvalId,
            rfqId: relatedQuote.rfqId,
            poRejection: true
          };
          setRfqs(prev => prev.map(r =>
            r.id === relatedQuote.rfqId ? { ...r, rejectionNotice } : r
          ));
          addLog(`RFQ ${relatedQuote.rfqId} returned to Officer after PO rejection`, 'RFQ');
        }
      }
    }
  };

  const clearRejectionNotice = (rfqId) => {
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, rejectionNotice: null } : r));
  };

  const payInvoice = (invoiceId) => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'Paid' } : i));
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) addLog(`Paid Invoice ${invoiceId} of amount ₹${inv.amount}`, 'Invoice');
=======
  const generateInvoice = async (poId) => {
    const newInvoice = await apiFetch(`/invoices/generate/${poId}`, token, { method: 'POST' });
    const normalized = normalizeInvoice(newInvoice);
    setInvoices(prev => [normalized, ...prev]);
    addLog(`Generated Invoice ${normalized.invoiceNumber} for PO ${poId}`, 'Invoice');
    return normalized;
  };

  const addQuotation = async (quote) => {
    const newQuote = await apiFetch('/quotations', token, { method: 'POST', body: quote });
    const normalized = normalizeQuotation(newQuote);
    setQuotations(prev => [normalized, ...prev]);
    addLog(`Submitted quotation for RFQ: ${normalized.rfqId}`, 'Quotation');
    return normalized;
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
  };

  const approveQuotation = async (approvalId) => {
    const updated = await apiFetch(`/approvals/${approvalId}/approve`, token, { method: 'POST' });
    await refreshData(token);
    addLog(`Approved quotation approval ${approvalId}`, 'Approvals');
    return updated;
  };

  const approveApproval = async (approvalId, remark = '') => {
    const updated = await apiFetch(`/approvals/${approvalId}/approve`, token, { method: 'POST', body: { remarks: remark } });
    await refreshData(token);
    addLog(`Approved approval ${approvalId}`, 'Approvals');
    return updated;
  };

  const rejectApproval = async (approvalId, remark = '') => {
    const updated = await apiFetch(`/approvals/${approvalId}/reject`, token, { method: 'POST', body: { remarks: remark } });
    await refreshData(token);
    addLog(`Rejected approval ${approvalId}`, 'Approvals');
    return updated;
  };

  const payInvoice = async (invoiceId) => {
    const paidInvoice = await apiFetch(`/invoices/${invoiceId}/pay`, token, { method: 'POST' });
    const normalized = normalizeInvoice(paidInvoice);
    setInvoices(prev => prev.map(i => (i.id === invoiceId ? normalized : i)));
    addLog(`Paid Invoice ${invoiceId}`, 'Invoice');
    return normalized;
  };

  const updateUserRole = async (userId, newRole, newRoleLabel, newSymbol) => {
    const updated = await apiFetch(`/users/${userId}`, token, { method: 'PUT', body: { role: newRole } });
    setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
    addLog(`Admin changed role of ${updated.name} to ${newRoleLabel}`, 'System');
    return updated;
  };

  const deactivateUser = async (userId) => {
    const existing = users.find(u => u.id === userId);
    if (!existing) return null;
    const newStatus = existing.status === 'Inactive' ? 'Active' : 'Inactive';
    const updated = await apiFetch(`/users/${userId}`, token, { method: 'PUT', body: { status: newStatus } });
    setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
    addLog(`Admin ${newStatus === 'Inactive' ? 'deactivated' : 'reactivated'} user ${updated.name}`, 'System');
    return updated;
  };

  const resetUserPassword = async (userId, newPassword) => {
    const updated = await apiFetch(`/users/${userId}`, token, { method: 'PUT', body: { password: newPassword } });
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, password: newPassword } : u)));
    const target = users.find(u => u.id === userId);
    if (target) addLog(`Admin reset password for ${target.name}`, 'System');
    return updated;
  };

<<<<<<< HEAD
  // Derived: RFQs that need officer re-action after a rejection
  const rejectedRFQs = rfqs.filter(r => r.rejectionNotice);

  return (
    <StateContext.Provider value={{
      user, registeredUsers, vendors, rfqs, quotations, pos, invoices, approvals, logs,
      rejectedRFQs,
      login, logout, registerVendor, registerCompany,
      addVendor, updateVendorStatus, addRFQ, generateInvoice, addQuotation,
      approveQuotation, approveApproval, rejectApproval, clearRejectionNotice, payInvoice,
      updateUserRole, deactivateUser, resetUserPassword
=======
  const dismissReturnNotif = (notifId) => {
    setDismissedNotifIds(prev => [...prev, notifId]);
  };

  const resubmitForApproval = async (quoteId) => {
    const updated = await apiFetch(`/quotations/${quoteId}`, token, {
      method: 'PUT',
      body: { status: 'Pending' }
    });
    // Dismiss any active "Returned" notification for this quote
    setDismissedNotifIds(prev => [...prev, `RET-${quoteId}`]);
    await refreshData(token);
    addLog(`Officer resubmitted quotation ${quoteId} for manager approval`, 'Approvals');
    return updated;
  };

  // Derive virtual "Returned to Officer" notifications from rejected approvals
  const computedApprovals = React.useMemo(() => {
    const list = [...approvals];
    
    // For every quotation approval that is rejected, inject a virtual "Returned to Officer" notification
    approvals.forEach(a => {
      if (a.status === 'Rejected' && a.type === 'Quotation Approval') {
        const retId = `RET-${a.id}`;
        // Only inject if not dismissed
        if (!dismissedNotifIds.includes(retId)) {
          list.push({
            id: retId,
            type: 'Returned to Officer',
            sourceId: a.sourceId,
            rfqId: a.rfqId || (quotations.find(q => q.id === a.sourceId)?.rfqId || ''),
            rfqTitle: a.rfq?.title || (quotations.find(q => q.id === a.sourceId)?.rfqTitle || ''),
            title: `${a.title || 'Quotation'} — Returned`,
            requester: a.requester,
            amount: a.amount,
            status: 'Action Required',
            rejectionRemark: a.remark || '',
            rejectedBy: a.decidedBy || '',
            date: a.decisionDate || new Date().toISOString().split('T')[0],
          });
        }
      }
    });

    // Also scan for any quotations with status === 'Rejected' which might not have an explicit Approval record
    quotations.forEach(q => {
      if (q.status === 'Rejected') {
        const retId = `RET-${q.id}`;
        const alreadyExists = list.some(item => item.id === retId || item.sourceId === q.id && item.status === 'Action Required');
        if (!alreadyExists && !dismissedNotifIds.includes(retId)) {
          list.push({
            id: retId,
            type: 'Returned to Officer',
            sourceId: q.id,
            rfqId: q.rfqId,
            rfqTitle: q.rfqTitle,
            title: `${q.vendorName || 'Vendor'} - ${q.rfqTitle || 'RFQ'} Quote — Returned`,
            requester: q.requester || q.vendorName || 'Vendor',
            amount: q.amount,
            status: 'Action Required',
            rejectionRemark: q.rejectionRemark || 'Rejected',
            rejectedBy: q.rejectedBy || 'Manager',
            date: q.rejectedAt || q.submittedDate || new Date().toISOString().split('T')[0],
          });
        }
      }
    });

    // Filter out any dismissed approvals
    return list.filter(a => !dismissedNotifIds.includes(a.id));
  }, [approvals, quotations, dismissedNotifIds]);

  return (
    <StateContext.Provider value={{
      user,
      users,
      registeredUsers: users,
      vendors,
      rfqs,
      quotations,
      pos,
      invoices,
      approvals: computedApprovals,
      logs,
      isLoading,
      refreshData,
      login,
      logout,
      registerVendor,
      registerCompany,
      addVendor,
      updateVendorStatus,
      addRFQ,
      generateInvoice,
      addQuotation,
      approveQuotation,
      approveApproval,
      rejectApproval,
      payInvoice,
      dismissReturnNotif,
      resubmitForApproval,
      updateUserRole,
      deactivateUser,
      resetUserPassword
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);

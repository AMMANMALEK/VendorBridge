import React, { createContext, useContext, useState, useEffect } from 'react';

const StateContext = createContext();

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
  }
];

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
export const StateProvider = ({ children }) => {
  // Registered accounts (seed + any vendor self-registrations)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const data = localStorage.getItem('vb_registered_users');
    return data ? JSON.parse(data) : SEED_USERS;
  });

  const [user, setUser] = useState(() => {
    const data = localStorage.getItem('vb_user');
    return data ? JSON.parse(data) : null;
  });

  const [vendors, setVendors] = useState(() => {
    const data = localStorage.getItem('vb_vendors');
    return data ? JSON.parse(data) : defaultVendors;
  });

  const [rfqs, setRfqs] = useState(() => {
    const data = localStorage.getItem('vb_rfqs');
    return data ? JSON.parse(data) : defaultRFQs;
  });

  const [quotations, setQuotations] = useState(() => {
    const data = localStorage.getItem('vb_quotations');
    return data ? JSON.parse(data) : defaultQuotations;
  });

  const [pos, setPos] = useState(() => {
    const data = localStorage.getItem('vb_pos');
    return data ? JSON.parse(data) : defaultPOs;
  });

  const [invoices, setInvoices] = useState(() => {
    const data = localStorage.getItem('vb_invoices');
    return data ? JSON.parse(data) : defaultInvoices;
  });

  const [approvals, setApprovals] = useState(() => {
    const data = localStorage.getItem('vb_approvals');
    return data ? JSON.parse(data) : defaultApprovals;
  });

  const [logs, setLogs] = useState(() => {
    const data = localStorage.getItem('vb_logs');
    return data ? JSON.parse(data) : defaultLogs;
  });

  // Persist everything
  useEffect(() => { localStorage.setItem('vb_registered_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
  useEffect(() => { localStorage.setItem('vb_user', user ? JSON.stringify(user) : ''); }, [user]);
  useEffect(() => { localStorage.setItem('vb_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('vb_rfqs', JSON.stringify(rfqs)); }, [rfqs]);
  useEffect(() => { localStorage.setItem('vb_quotations', JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem('vb_pos', JSON.stringify(pos)); }, [pos]);
  useEffect(() => { localStorage.setItem('vb_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('vb_approvals', JSON.stringify(approvals)); }, [approvals]);
  useEffect(() => { localStorage.setItem('vb_logs', JSON.stringify(logs)); }, [logs]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
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

  // ─── Auth ────────────────────────────────────────────────────────────────────
  const login = (email, password) => {
    const found = registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return null;

    const loggedUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      roleLabel: found.roleLabel,
      symbol: found.symbol,
      company: found.company
    };
    setUser(loggedUser);
    addLog(`User logged in: ${loggedUser.name}`, 'Authentication', loggedUser.name);
    return loggedUser;
  };

  const logout = () => {
    addLog(`User logged out: ${user ? user.name : 'Unknown'}`, 'Authentication');
    setUser(null);
  };

  // Vendor self-registration — always creates a new account (multiple allowed)
  const registerVendor = (formData) => {
    const newUser = {
      id: `USR-${Date.now()}`,
      name: formData.companyName || formData.fullName,
      email: formData.email,
      password: formData.password || 'Vendor@123',
      role: 'vendor',
      roleLabel: 'Vendor',
      symbol: '🏭',
      company: formData.companyName || formData.fullName
    };
    setRegisteredUsers(prev => [...prev, newUser]);

    // Also add to vendor list as Pending
    const vendorEntry = {
      id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      name: formData.companyName || formData.fullName,
      contact: formData.email,
      category: formData.category || 'General',
      status: 'Pending',
      rating: '0.0',
      address: formData.country || ''
    };
    setVendors(prev => [...prev, vendorEntry]);
    addLog(`New vendor registered: ${newUser.name}`, 'Authentication', newUser.name);
    return newUser;
  };

  // Legacy registerCompany (kept for compatibility)
  const registerCompany = (formData) => registerVendor(formData);

  // ─── Data Mutations ──────────────────────────────────────────────────────────
  const addVendor = (vendor) => {
    const newVendor = { ...vendor, id: `VND-${String(vendors.length + 1).padStart(3, '0')}`, status: 'Active', rating: '5.0' };
    setVendors(prev => [...prev, newVendor]);
    addLog(`Onboarded new vendor: ${newVendor.name}`, 'Vendor');
    return newVendor;
  };

  const updateVendorStatus = (vendorId, newStatus) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: newStatus } : v));
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) addLog(`Vendor ${vendor.name} status changed to ${newStatus}`, 'Vendor');
  };

  const addRFQ = (rfq) => {
    const newRFQ = {
      ...rfq,
      id: `RFQ-2026-${String(rfqs.length + 1).padStart(3, '0')}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: rfq.isDraft ? 'Draft' : 'Open'
    };
    setRfqs(prev => [...prev, newRFQ]);
    if (!rfq.isDraft) addLog(`Published RFQ: ${newRFQ.title} — sent to ${(rfq.assignedVendors || []).length} vendor(s)`, 'RFQ');
    else addLog(`Saved RFQ as draft: ${newRFQ.title}`, 'RFQ');
    return newRFQ;
  };

  const generateInvoice = (poId) => {
    const po = pos.find(p => p.id === poId);
    if (!po) return null;
    // Check not already invoiced
    const existing = invoices.find(i => i.poId === poId);
    if (existing) return existing;
    const invId = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const gstRate = 0.18;
    const subtotal = po.amount;
    const gstAmount = Math.round(subtotal * gstRate);
    const newInvoice = {
      id: invId, poId: po.id, vendorName: po.vendorName,
      amount: po.amount, subtotal, gstAmount,
      grandTotal: subtotal + gstAmount,
      status: 'Unpaid',
      date: new Date().toISOString().split('T')[0]
    };
    setInvoices(prev => [...prev, newInvoice]);
    addLog(`Generated Invoice ${invId} for PO ${poId} — ${po.vendorName}`, 'Invoice');
    return newInvoice;
  };

  const addQuotation = (quote) => {
    const isDraft = quote.isDraft || false;
    // Check if a draft already exists for this RFQ+vendor — update it
    const existingDraftIdx = quotations.findIndex(
      q => q.rfqId === quote.rfqId && q.vendorName === quote.vendorName && q.status === 'Draft'
    );
    if (existingDraftIdx !== -1) {
      const updatedId = quotations[existingDraftIdx].id;
      const updatedQuote = { ...quotations[existingDraftIdx], ...quote, id: updatedId, status: isDraft ? 'Draft' : 'Pending', submittedDate: new Date().toISOString().split('T')[0] };
      setQuotations(prev => prev.map(q => q.id === updatedId ? updatedQuote : q));
      if (!isDraft) {
        addLog(`Submitted quotation for RFQ: ${quote.rfqTitle} by ${quote.vendorName}`, 'Quotation');
        const newApproval = {
          id: `APP-${Date.now()}`,
          type: 'Quotation Approval',
          sourceId: updatedId,
          title: `${quote.vendorName} - ${quote.rfqTitle} Quote`,
          requester: user ? user.name : 'System',
          amount: quote.amount,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0]
        };
        setApprovals(prev => [newApproval, ...prev]);
      } else {
        addLog(`Saved draft quotation for RFQ: ${quote.rfqTitle}`, 'Quotation');
      }
      return updatedQuote;
    }

    const newQuote = {
      ...quote,
      id: `QTN-${900 + quotations.length + 1}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: isDraft ? 'Draft' : 'Pending'
    };
    setQuotations(prev => [...prev, newQuote]);

    if (!isDraft) {
      addLog(`Submitted quotation for RFQ: ${quote.rfqTitle} by ${quote.vendorName}`, 'Quotation');
      const newApproval = {
        id: `APP-${String(approvals.length + 1).padStart(3, '0')}`,
        type: 'Quotation Approval',
        sourceId: newQuote.id,
        title: `${newQuote.vendorName} - ${newQuote.rfqTitle} Quote`,
        requester: user ? user.name : 'System',
        amount: newQuote.amount,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };
      setApprovals(prev => [newApproval, ...prev]);
    } else {
      addLog(`Saved draft quotation for RFQ: ${quote.rfqTitle}`, 'Quotation');
    }
    return newQuote;
  };

  const approveQuotation = (quoteId) => {
    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Approved' } : q));
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;

    addLog(`Approved quotation ${quoteId} from ${quote.vendorName}`, 'Quotation');

    const poId = `PO-2026-${String(pos.length + 1).padStart(3, '0')}`;
    const newPO = {
      id: poId,
      vendorName: quote.vendorName,
      amount: quote.amount,
      status: 'Pending Approval',
      date: new Date().toISOString().split('T')[0],
      items: `${quote.rfqTitle} - Agreed deliverables`
    };
    setPos(prev => [...prev, newPO]);
    addLog(`Generated Purchase Order: ${poId}`, 'Purchase Order');

    setApprovals(prev => prev.map(a => a.sourceId === quoteId ? { ...a, status: 'Approved' } : a));

    const newPOApproval = {
      id: `APP-${String(approvals.length + 2).padStart(3, '0')}`,
      type: 'Purchase Order',
      sourceId: poId,
      title: `${quote.vendorName} PO Approval`,
      requester: user ? user.name : 'System',
      amount: quote.amount,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setApprovals(prev => [newPOApproval, ...prev]);
  };

  const approveApproval = (approvalId, remark = '') => {
    let targetApproval;
    setApprovals(prev => prev.map(a => {
      if (a.id === approvalId) {
        targetApproval = a;
        return { ...a, status: 'Approved', remark, decidedBy: user?.name, decidedAt: new Date().toISOString() };
      }
      return a;
    }));
    if (!targetApproval) return;
    addLog(`Approved ${targetApproval.type}: ${targetApproval.title}${remark ? ` — "${remark}"` : ''}`, 'Approvals');
    if (targetApproval.type === 'Quotation Approval') {
      approveQuotation(targetApproval.sourceId);
    } else if (targetApproval.type === 'Purchase Order') {
      const poId = targetApproval.sourceId;
      setPos(prev => prev.map(p => p.id === poId ? { ...p, status: 'Approved' } : p));
      const po = pos.find(p => p.id === poId);
      if (po) {
        const invId = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
        const subtotal = po.amount;
        const gstAmount = Math.round(subtotal * 0.18);
        const newInvoice = {
          id: invId, poId: po.id, vendorName: po.vendorName,
          amount: po.amount, subtotal, gstAmount,
          grandTotal: subtotal + gstAmount,
          status: 'Unpaid',
          date: new Date().toISOString().split('T')[0]
        };
        setInvoices(prev => [...prev, newInvoice]);
        addLog(`Auto-generated Invoice ${invId} after PO approval`, 'Invoice');
      }
    }
  };

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
  };

  // ─── User Management (Admin only) ───────────────────────────────────────────
  const updateUserRole = (userId, newRole, newRoleLabel, newSymbol) => {
    setRegisteredUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, role: newRole, roleLabel: newRoleLabel, symbol: newSymbol } : u
    ));
    const target = registeredUsers.find(u => u.id === userId);
    if (target) addLog(`Admin changed role of ${target.name} to ${newRoleLabel}`, 'System');
  };

  const deactivateUser = (userId) => {
    setRegisteredUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: u.status === 'Inactive' ? 'Active' : 'Inactive' } : u
    ));
    const target = registeredUsers.find(u => u.id === userId);
    if (target) {
      const newStatus = target.status === 'Inactive' ? 'Active' : 'Inactive';
      addLog(`Admin ${newStatus === 'Inactive' ? 'deactivated' : 'reactivated'} user ${target.name}`, 'System');
    }
  };

  const resetUserPassword = (userId, newPassword) => {
    setRegisteredUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, password: newPassword } : u
    ));
    const target = registeredUsers.find(u => u.id === userId);
    if (target) addLog(`Admin reset password for ${target.name}`, 'System');
  };

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
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);

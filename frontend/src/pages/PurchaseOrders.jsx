import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import Layout from '../components/Layout';

const poBadge = (status) => {
  const map = {
    'Approved':        'bg-emerald-100 text-emerald-700',
    'Pending Approval':'bg-amber-100 text-amber-700',
    'Draft':           'bg-surface-variant text-on-surface-variant',
    'Rejected':        'bg-error-container text-on-error-container',
  };
  return <span className={`px-sm py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-outline-variant text-on-surface-variant'}`}>{status}</span>;
};

const invBadge = (status) => {
  const map = {
    'Paid':    'bg-emerald-100 text-emerald-700',
    'Overdue': 'bg-error-container text-on-error-container',
    'Unpaid':  'bg-amber-100 text-amber-700',
  };
  return <span className={`px-sm py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-outline-variant text-on-surface-variant'}`}>{status}</span>;
};

const PurchaseOrders = () => {
  const { pos, invoices, payInvoice, generateInvoice, user } = useAppState();
  const role = user?.role || 'officer';
  const isVendor = role === 'vendor';
  const isOfficer = role === 'officer';
  const canPay = role === 'officer' || role === 'admin';

  const visiblePOs = isVendor
    ? pos.filter(p => p.vendorName === user?.name || p.vendorName === user?.company)
    : pos;
  const visibleInvoices = isVendor
    ? invoices.filter(i => i.vendorName === user?.name || i.vendorName === user?.company)
    : invoices;

  const [activeTab, setActiveTab] = useState('POs');
  const [selectedPO, setSelectedPO] = useState(visiblePOs[0] || null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const invoiceForPO = (poId) => invoices.find(i => i.poId === poId);

  const handleGenerateInvoice = (po) => {
    const inv = generateInvoice(po.id);
    if (inv) {
      setSelectedInvoice(inv);
      setActiveTab('Invoices');
      showToast(`Invoice ${inv.id} generated for ${po.id}`);
    }
  };

  const handlePay = (invoiceId) => {
    if (!canPay) return;
    payInvoice(invoiceId);
    setSelectedInvoice(prev => prev ? { ...prev, status: 'Paid' } : prev);
    showToast('Invoice marked as Paid');
  };

  const handlePrint = () => {
    showToast('Opening print dialog…');
    setTimeout(() => window.print(), 500);
  };

  const handleDownloadPDF = () => {
    showToast('PDF download initiated');
  };

  const handleSendEmail = () => {
    setEmailSent(false);
    setEmailModal(true);
  };

  const confirmEmail = () => {
    setEmailSent(true);
    setTimeout(() => { setEmailModal(false); showToast('Invoice emailed to vendor'); }, 1000);
  };

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <div className="flex-1 ml-[240px] pt-14 min-h-screen flex flex-col">
        <Header title={activeTab === 'POs' ? 'Purchase Orders' : 'Invoices'} />

        <main className="p-xl max-w-7xl w-full mx-auto flex-1 flex flex-col gap-lg animate-fade-in">
=======
    <Layout title={activeTab === 'POs' ? 'Purchase Orders' : 'Invoices'}>
      <div className="max-w-[1400px] mx-auto space-y-5">
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1

          {/* Tabs */}
          <div className="flex border-b border-outline-variant gap-lg">
            {['POs', 'Invoices'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-sm font-semibold text-[14px] relative transition-colors ${
                  activeTab === tab ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}>
                {tab === 'POs' ? 'Purchase Orders' : 'Invoices'}
                {tab === 'Invoices' && visibleInvoices.filter(i => i.status === 'Overdue').length > 0 && (
                  <span className="ml-sm bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {visibleInvoices.filter(i => i.status === 'Overdue').length} Overdue
                  </span>
                )}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-lg flex-1">

            {/* ── POs Tab ── */}
            {activeTab === 'POs' && (
              <>
                <section className="flex-1 bg-white rounded-xl border border-outline-variant custom-shadow overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">PO ID</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Vendor</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold hidden md:table-cell">Scope</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Amount</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {visiblePOs.length === 0
                        ? <tr><td colSpan="5" className="text-center py-xl text-on-surface-variant">No purchase orders found.</td></tr>
                        : visiblePOs.map(po => (
                          <tr key={po.id} onClick={() => setSelectedPO(po)}
                            className={`hover:bg-surface-container-low cursor-pointer transition-colors ${
                              selectedPO?.id === po.id ? 'bg-primary-container/10 border-l-4 border-primary' : ''
                            }`}>
                            <td className="px-lg py-md font-label-md text-[13px]">{po.id}</td>
                            <td className="px-lg py-md font-semibold text-[14px]">{po.vendorName}</td>
                            <td className="px-lg py-md text-[14px] truncate max-w-xs hidden md:table-cell">{po.items}</td>
                            <td className="px-lg py-md text-[14px] font-semibold text-primary">₹{po.amount?.toLocaleString()}</td>
                            <td className="px-lg py-md">{poBadge(po.status)}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </section>

                {/* PO Detail panel */}
                {selectedPO && (
                  <aside className="w-full lg:w-[340px] bg-white rounded-xl border border-outline-variant custom-shadow p-lg flex flex-col gap-md self-start animate-fade-in">
                    <div className="border-b pb-md flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[18px]">{selectedPO.id}</h3>
                        <p className="text-[12px] text-on-surface-variant mt-0.5">Date: {selectedPO.date}</p>
                      </div>
                      {poBadge(selectedPO.status)}
                    </div>

                    <div className="space-y-md">
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase font-semibold">Vendor</p>
                        <p className="font-semibold text-[14px] mt-0.5">{selectedPO.vendorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase font-semibold">Scope / Items</p>
                        <p className="text-[14px] mt-0.5">{selectedPO.items}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase font-semibold">Total Amount</p>
                        <p className="font-bold text-[22px] text-primary">₹{selectedPO.amount?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t pt-md space-y-sm mt-auto">
                      {/* Generate Invoice — officer only, PO must be Approved, not already invoiced */}
                      {isOfficer && selectedPO.status === 'Approved' && !invoiceForPO(selectedPO.id) && (
                        <button onClick={() => handleGenerateInvoice(selectedPO)}
                          className="w-full bg-primary text-white py-sm rounded-lg font-semibold text-[13px] hover:opacity-90 transition-all flex items-center justify-center gap-xs">
                          <span className="material-symbols-outlined text-[16px]">receipt</span>
                          Generate Invoice
                        </button>
                      )}
                      {selectedPO.status === 'Approved' && invoiceForPO(selectedPO.id) && (
                        <button onClick={() => { setSelectedInvoice(invoiceForPO(selectedPO.id)); setActiveTab('Invoices'); }}
                          className="w-full border border-primary text-primary py-sm rounded-lg font-semibold text-[13px] hover:bg-primary-container/10 transition-all flex items-center justify-center gap-xs">
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          View Invoice
                        </button>
                      )}
                      {selectedPO.status === 'Pending Approval' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-md py-sm text-[12px] text-amber-800 text-center">
                          ⏳ Awaiting Manager approval before invoice can be generated
                        </div>
                      )}
                      <button onClick={handlePrint}
                        className="w-full border border-outline-variant hover:bg-surface-container-low text-on-surface py-sm rounded-lg font-semibold text-[13px] transition-colors flex items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        Print PO
                      </button>
                    </div>
                  </aside>
                )}
              </>
            )}

            {/* ── Invoices Tab ── */}
            {activeTab === 'Invoices' && (
              <>
                <section className="flex-1 bg-white rounded-xl border border-outline-variant custom-shadow overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Invoice ID</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">PO Ref</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Vendor</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Amount</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Date</th>
                        <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {visibleInvoices.length === 0
                        ? <tr><td colSpan="6" className="text-center py-xl text-on-surface-variant">No invoices found.</td></tr>
                        : visibleInvoices.map(inv => (
                          <tr key={inv.id} onClick={() => setSelectedInvoice(inv)}
                            className={`hover:bg-surface-container-low cursor-pointer transition-colors ${
                              selectedInvoice?.id === inv.id ? 'bg-primary-container/10 border-l-4 border-primary' : ''
                            }`}>
                            <td className="px-lg py-md font-label-md text-[13px]">{inv.id}</td>
                            <td className="px-lg py-md text-[12px] text-on-surface-variant">{inv.poId}</td>
                            <td className="px-lg py-md font-semibold text-[14px]">{inv.vendorName}</td>
                            <td className="px-lg py-md text-[14px] font-semibold text-primary">₹{(inv.grandTotal || inv.amount)?.toLocaleString()}</td>
                            <td className="px-lg py-md text-[14px]">{inv.date}</td>
                            <td className="px-lg py-md">{invBadge(inv.status)}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </section>

                {/* Invoice detail / document panel */}
                {selectedInvoice && (
                  <aside className="w-full lg:w-[360px] bg-white rounded-xl border border-outline-variant custom-shadow self-start animate-fade-in overflow-hidden">
                    {/* Action bar */}
                    <div className="p-md border-b border-outline-variant flex items-center justify-between gap-xs bg-surface-container-lowest flex-wrap">
                      <button onClick={handleSendEmail}
                        className="flex items-center gap-xs px-sm py-1.5 border border-outline-variant rounded-lg text-[12px] font-semibold hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-[16px]">mail</span>Email
                      </button>
                      <button onClick={handleDownloadPDF}
                        className="flex items-center gap-xs px-sm py-1.5 border border-outline-variant rounded-lg text-[12px] font-semibold hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-[16px]">download</span>PDF
                      </button>
                      <button onClick={handlePrint}
                        className="flex items-center gap-xs px-sm py-1.5 border border-outline-variant rounded-lg text-[12px] font-semibold hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-[16px]">print</span>Print
                      </button>
                      {selectedInvoice.status !== 'Paid' && canPay && (
                        <button onClick={() => handlePay(selectedInvoice.id)}
                          className="flex items-center gap-xs px-sm py-1.5 bg-emerald-600 text-white rounded-lg text-[12px] font-semibold hover:opacity-90 transition-all">
                          <span className="material-symbols-outlined text-[16px]">payments</span>Mark Paid
                        </button>
                      )}
                    </div>

                    {/* Invoice document */}
                    <div className="p-lg space-y-md">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[18px]">TAX INVOICE</p>
                          <p className="text-[12px] text-on-surface-variant">Auto-generated by VendorBridge</p>
                        </div>
                        {invBadge(selectedInvoice.status)}
                      </div>

                      <div className="border-t border-b border-outline-variant py-md space-y-xs text-[13px]">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Invoice No.</span>
                          <span className="font-semibold">{selectedInvoice.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">PO Reference</span>
                          <span className="font-semibold">{selectedInvoice.poId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Invoice Date</span>
                          <span className="font-semibold">{selectedInvoice.date}</span>
                        </div>
                      </div>

                      {/* Bill to / From */}
                      <div className="grid grid-cols-2 gap-md text-[12px]">
                        <div>
                          <p className="text-on-surface-variant font-semibold uppercase mb-xs">Bill To</p>
                          <p className="font-semibold">VendorBridge Corp</p>
                          <p className="text-on-surface-variant">Mumbai, MH — India</p>
                          <p className="text-on-surface-variant">GSTIN: 27AABCV1234M1Z5</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant font-semibold uppercase mb-xs">Vendor</p>
                          <p className="font-semibold">{selectedInvoice.vendorName}</p>
                          <p className="text-on-surface-variant">India</p>
                        </div>
                      </div>

                      {/* Amount breakdown */}
                      <div className="bg-surface-container-lowest rounded-lg p-md space-y-xs text-[13px]">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Subtotal</span>
                          <span>₹{(selectedInvoice.subtotal || selectedInvoice.amount)?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">CGST (9%)</span>
                          <span>₹{Math.round((selectedInvoice.gstAmount || selectedInvoice.amount * 0.18) / 2)?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">SGST (9%)</span>
                          <span>₹{Math.round((selectedInvoice.gstAmount || selectedInvoice.amount * 0.18) / 2)?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-outline-variant pt-xs mt-xs">
                          <span className="font-bold text-[15px]">Grand Total</span>
                          <span className="font-bold text-[18px] text-primary">₹{(selectedInvoice.grandTotal || Math.round(selectedInvoice.amount * 1.18))?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </aside>
                )}
              </>
            )}
          </div>
      </div>

      {/* Email modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md animate-fade-in">
          <div className="bg-white rounded-xl border border-outline-variant shadow-2xl w-full max-w-sm p-lg space-y-md">
            <h3 className="font-semibold text-[18px]">Email Invoice</h3>
            <div className="space-y-sm">
              <div className="space-y-xs">
                <label className="text-xs text-on-surface-variant uppercase font-semibold">To</label>
                <input className="w-full h-9 px-md border border-outline-variant rounded-lg text-[13px] bg-surface-container-low outline-none"
                  readOnly value={selectedInvoice?.vendorName ? `billing@${selectedInvoice.vendorName.toLowerCase().replace(/\s/g,'')}.com` : ''} />
              </div>
              <div className="space-y-xs">
                <label className="text-xs text-on-surface-variant uppercase font-semibold">Subject</label>
                <input className="w-full h-9 px-md border border-outline-variant rounded-lg text-[13px] bg-surface-container-low outline-none"
                  readOnly value={`Invoice ${selectedInvoice?.id} from VendorBridge Corp`} />
              </div>
              <div className="space-y-xs">
                <label className="text-xs text-on-surface-variant uppercase font-semibold">Message</label>
                <textarea className="w-full h-20 p-md border border-outline-variant rounded-lg text-[13px] resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  defaultValue={`Dear ${selectedInvoice?.vendorName},\n\nPlease find attached invoice ${selectedInvoice?.id} for your reference.\n\nRegards,\nVendorBridge Procurement`} />
              </div>
            </div>
            {emailSent && <p className="text-emerald-600 text-[13px] font-semibold text-center">✅ Email sent successfully!</p>}
            <div className="flex gap-sm">
              <button onClick={() => setEmailModal(false)}
                className="flex-1 border border-outline-variant hover:bg-surface-container-low py-sm rounded-lg font-semibold text-[13px] transition-colors">
                Cancel
              </button>
              <button onClick={confirmEmail} disabled={emailSent}
                className="flex-1 bg-primary text-white py-sm rounded-lg font-semibold text-[13px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">send</span>Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full text-[13px] font-semibold shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </Layout>
  );
};

export default PurchaseOrders;

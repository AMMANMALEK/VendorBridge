import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const GST_RATES = [0, 5, 12, 18, 28];
const PAYMENT_TERMS = ['Net 30', 'Net 15', 'Due on Receipt', '50% Advance, 50% on Delivery', 'Net 45', 'Net 60'];

// ── Deadline countdown helper ──────────────────────────────────────────────
const DeadlineCountdown = ({ deadline }) => {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return <span className="text-error text-[12px] font-semibold">⛔ Deadline passed</span>;
  if (diff === 0) return <span className="text-error text-[12px] font-semibold">⚠️ Due today</span>;
  const color = diff <= 3 ? 'text-error' : diff <= 7 ? 'text-amber-600' : 'text-emerald-600';
  return <span className={`text-[12px] font-semibold ${color}`}>⏰ {diff} day{diff !== 1 ? 's' : ''} remaining</span>;
};

// ── Non-vendor read-only view ─────────────────────────────────────────────
const ReadOnlyView = ({ quotations }) => (
  <div className="flex min-h-screen bg-[#F7F9FC]">
    <Sidebar />
    <div className="flex-1 ml-[240px] pt-14 min-h-screen flex flex-col">
      <Header title="Submitted Quotations" />
      <main className="p-xl max-w-7xl w-full mx-auto flex-1 animate-fade-in">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-lg py-sm rounded-lg text-[13px] font-medium mb-lg flex items-center gap-sm">
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          View-only — quotation submission is exclusive to vendors.
        </div>
        <div className="bg-white rounded-xl border border-outline-variant custom-shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                {['Quote ID','RFQ','Vendor','Amount','GST','Grand Total','Delivery','Status'].map(h => (
                  <th key={h} className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {quotations.length === 0
                ? <tr><td colSpan="8" className="text-center py-xl text-on-surface-variant">No quotations submitted yet.</td></tr>
                : quotations.map(q => {
                    const gstAmt = Math.round((q.amount || 0) * ((q.gstRate || 0) / 100));
                    const grandTotal = (q.amount || 0) + gstAmt;
                    const badgeColor =
                      q.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      q.status === 'Rejected' ? 'bg-error-container text-on-error-container' :
                      q.status === 'Draft'    ? 'bg-surface-variant text-on-surface-variant' :
                                                'bg-amber-100 text-amber-700';
                    return (
                      <tr key={q.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-lg py-md text-[13px] font-mono">{q.id}</td>
                        <td className="px-lg py-md text-[14px]">{q.rfqTitle}</td>
                        <td className="px-lg py-md text-[14px] font-semibold">{q.vendorName}</td>
                        <td className="px-lg py-md text-[14px]">₹{q.amount?.toLocaleString()}</td>
                        <td className="px-lg py-md text-[14px]">{q.gstRate || 0}%</td>
                        <td className="px-lg py-md text-[14px] font-bold text-primary">₹{grandTotal.toLocaleString()}</td>
                        <td className="px-lg py-md text-[14px]">{q.deliveryDays} days</td>
                        <td className="px-lg py-md">
                          <span className={`px-sm py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>{q.status}</span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
);

// ── Main vendor page ──────────────────────────────────────────────────────
const SubmitQuotation = () => {
  const { rfqs, vendors, quotations, addQuotation, user } = useAppState();
  const role = user?.role || 'vendor';

  if (role !== 'vendor') return <ReadOnlyView quotations={quotations} />;

  const vendorName = user?.name || user?.company || 'Unknown Vendor';
  const vendorProfile = vendors.find(v => v.contact === user?.email);
  const vendorId = vendorProfile?.id || 'VND-EXT';

  // RFQs this vendor is explicitly assigned to by the Procurement Officer
  const myRFQs = rfqs.filter(r =>
    r.status === 'Open' &&
    Array.isArray(r.assignedVendors) &&
    r.assignedVendors.some(av => av.id === vendorId || av.name === vendorName)
  );

  // My submitted/draft quotations
  const myQuotes = quotations.filter(q => q.vendorName === vendorName || q.vendorId === vendorId);

  const [selectedRFQ, setSelectedRFQ] = useState(myRFQs[0] || null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!selectedRFQ && myRFQs.length > 0) {
      setSelectedRFQ(myRFQs[0]);
    }
  }, [myRFQs.length, selectedRFQ]);

  // Per-line-item pricing state
  const buildInitialLineItems = (rfq) => {
    if (!rfq?.items || !Array.isArray(rfq.items)) return [];
    return rfq.items.map(item => ({ ...item, unitPrice: '', total: 0 }));
  };

  const [lineItems, setLineItems] = useState(() => buildInitialLineItems(myRFQs[0]));
  const [gstRate, setGstRate] = useState(18);
  const [deliveryDays, setDeliveryDays] = useState('');
  const [terms, setTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');

  // Reset form when RFQ changes
  useEffect(() => {
    if (!selectedRFQ) return;
    // Pre-fill from draft if exists
    const draft = myQuotes.find(q => q.rfqId === selectedRFQ.id && q.status === 'Draft');
    if (draft) {
      setLineItems(draft.lineItems || buildInitialLineItems(selectedRFQ));
      setGstRate(draft.gstRate ?? 18);
      setDeliveryDays(String(draft.deliveryDays || ''));
      setTerms(draft.terms || 'Net 30');
      setNotes(draft.notes || '');
    } else {
      setLineItems(buildInitialLineItems(selectedRFQ));
      setGstRate(18);
      setDeliveryDays('');
      setTerms('Net 30');
      setNotes('');
    }
  }, [selectedRFQ?.id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateLineItem = (idx, field, val) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: val };
      if (field === 'unitPrice') updated.total = (parseFloat(val) || 0) * (item.quantity || 1);
      return updated;
    }));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const gstAmount = Math.round(subtotal * (gstRate / 100));
  const grandTotal = subtotal + gstAmount;

  // Check if already submitted (locked)
  const existingQuote = selectedRFQ
    ? myQuotes.find(q => q.rfqId === selectedRFQ.id && q.status !== 'Draft')
    : null;
  const draftQuote = selectedRFQ
    ? myQuotes.find(q => q.rfqId === selectedRFQ.id && q.status === 'Draft')
    : null;

  const isDeadlinePassed = selectedRFQ
    ? new Date(selectedRFQ.deadline) < new Date()
    : false;

  const buildQuotePayload = (isDraft) => ({
    rfqId: selectedRFQ.id,
    rfqTitle: selectedRFQ.title,
    vendorId,
    vendorName,
    lineItems,
    amount: subtotal,
    gstRate,
    gstAmount,
    grandTotal,
    deliveryDays: parseInt(deliveryDays) || 0,
    terms,
    notes,
    isDraft
  });

  const handleSaveDraft = () => {
    if (!selectedRFQ) return;
    addQuotation(buildQuotePayload(true));
    showToast('Draft saved — not visible to the officer yet');
  };

  const handleSubmit = () => {
    if (!selectedRFQ) return;
    if (!deliveryDays || parseInt(deliveryDays) < 1) { showToast('Please enter a valid delivery timeline.'); return; }
    if (subtotal === 0) { showToast('Please enter unit prices for the line items.'); return; }
    addQuotation(buildQuotePayload(false));
    showToast('✅ Quotation submitted! Sent to Procurement Officer for comparison.');
  };

  const statusBadge = (status) => {
    const map = {
      Draft:    'bg-surface-variant text-on-surface-variant',
      Pending:  'bg-amber-100 text-amber-700',
      Approved: 'bg-emerald-100 text-emerald-700',
      Rejected: 'bg-error-container text-on-error-container',
    };
    return <span className={`px-sm py-0.5 rounded-full text-[11px] font-semibold ${map[status] || 'bg-surface-variant text-on-surface-variant'}`}>{status}</span>;
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <div className="flex-1 ml-[240px] pt-14 min-h-screen flex flex-col">
        <Header title="Submit Quotation" />

        <main className="p-xl max-w-7xl w-full mx-auto flex-1 flex flex-col lg:flex-row gap-lg animate-fade-in">

          {/* ── Left: RFQ invitation list ── */}
          <div className="w-full lg:w-[300px] flex flex-col gap-sm flex-shrink-0">

            {/* Vendor identity card */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-md flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-xl">🏭</div>
              <div>
                <p className="font-semibold text-[14px] text-on-surface">{vendorName}</p>
                <p className="text-[11px] text-on-surface-variant">{vendorProfile?.category || 'Vendor'} · {user?.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-xs">
              <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                RFQ Invitations
              </p>
            </div>

            {myRFQs.length === 0 ? (
              <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg text-center space-y-sm">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant">inbox</span>
                <p className="text-[13px] text-on-surface-variant font-medium">No active RFQ invitations</p>
                <p className="text-[12px] text-on-surface-variant">You'll be notified when the Procurement Officer sends you an RFQ.</p>
              </div>
            ) : (
              myRFQs.map(rfq => {
                const myQuote = myQuotes.find(q => q.rfqId === rfq.id);
                const isSelected = selectedRFQ?.id === rfq.id;
                return (
                  <button key={rfq.id} onClick={() => setSelectedRFQ(rfq)}
                    className={`text-left bg-white rounded-xl border-2 custom-shadow p-md transition-all hover:border-primary/40 ${
                      isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-outline-variant'
                    }`}>
                    <div className="flex items-start justify-between gap-sm mb-sm">
                      <p className="font-semibold text-[13px] leading-snug">{rfq.title}</p>
                      {myQuote && statusBadge(myQuote.status)}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mb-xs">{rfq.category}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-on-surface-variant">Due: {rfq.deadline}</p>
                      <DeadlineCountdown deadline={rfq.deadline} />
                    </div>
                    {!myQuote && (
                      <div className="mt-sm bg-orange-50 border border-orange-200 rounded px-sm py-xs text-[11px] text-orange-700 font-semibold">
                        📬 Awaiting your quotation
                      </div>
                    )}
                    {myQuote?.status === 'Draft' && (
                      <div className="mt-sm bg-surface-container-low border border-outline-variant rounded px-sm py-xs text-[11px] text-on-surface-variant font-semibold">
                        ✏️ Draft saved — not submitted yet
                      </div>
                    )}
                  </button>
                );
              })
            )}

            {/* My submitted quotes summary */}
            {myQuotes.filter(q => q.status !== 'Draft').length > 0 && (
              <div className="mt-sm">
                <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider px-xs mb-sm">
                  My Submissions ({myQuotes.filter(q => q.status !== 'Draft').length})
                </p>
                {myQuotes.filter(q => q.status !== 'Draft').map(q => (
                  <div key={q.id} className="bg-white rounded-xl border border-outline-variant custom-shadow p-md mb-sm">
                    <div className="flex justify-between items-start mb-xs">
                      <p className="font-semibold text-[13px]">{q.rfqTitle}</p>
                      {statusBadge(q.status)}
                    </div>
                    <p className="text-[12px] text-on-surface-variant">₹{(q.grandTotal || q.amount)?.toLocaleString()} · {q.deliveryDays} days</p>
                    <p className="text-[11px] text-on-surface-variant mt-xs">Submitted: {q.submittedDate}</p>
                    {q.status === 'Approved' && (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-xs">🎉 Selected by procurement team!</p>
                    )}
                    {q.status === 'Rejected' && (
                      <p className="text-[11px] text-error font-semibold mt-xs">❌ Not selected this time</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: RFQ details + quotation form ── */}
          <div className="flex-1 flex flex-col gap-lg">
            {!selectedRFQ ? (
              <div className="flex-1 bg-white rounded-xl border border-outline-variant custom-shadow flex flex-col items-center justify-center p-xl text-center">
                <span className="material-symbols-outlined text-[56px] text-on-surface-variant mb-md">description</span>
                <p className="font-semibold text-[16px]">Select an RFQ invitation</p>
                <p className="text-[13px] text-on-surface-variant mt-xs">Choose an RFQ from the left to view details and prepare your quotation.</p>
              </div>
            ) : (
              <>
                {/* RFQ Info card */}
                <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg space-y-md">
                  <div className="flex items-start justify-between gap-md border-b pb-md">
                    <div>
                      <div className="flex items-center gap-sm mb-xs">
                        <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-low px-sm py-0.5 rounded">{selectedRFQ.id}</span>
                        <span className="text-[11px] bg-primary-container/20 text-primary px-sm py-0.5 rounded font-semibold">{selectedRFQ.category}</span>
                      </div>
                      <h2 className="font-bold text-[18px] text-on-surface">{selectedRFQ.title}</h2>
                    </div>
                    <DeadlineCountdown deadline={selectedRFQ.deadline} />
                  </div>

                  {selectedRFQ.description && (
                    <div>
                      <p className="text-[11px] text-on-surface-variant uppercase font-semibold mb-xs">Description & Scope</p>
                      <p className="text-[13px] text-on-surface leading-relaxed">{selectedRFQ.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-md text-[13px]">
                    <div className="bg-surface-container-lowest rounded-lg p-sm">
                      <p className="text-[11px] text-on-surface-variant uppercase font-semibold mb-xs">Deadline</p>
                      <p className="font-semibold">{selectedRFQ.deadline}</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-lg p-sm">
                      <p className="text-[11px] text-on-surface-variant uppercase font-semibold mb-xs">Created</p>
                      <p className="font-semibold">{selectedRFQ.createdDate}</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-lg p-sm">
                      <p className="text-[11px] text-on-surface-variant uppercase font-semibold mb-xs">Attachments</p>
                      <p className="font-semibold">{(selectedRFQ.attachments || []).length} file(s)</p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedRFQ.attachments && selectedRFQ.attachments.length > 0 && (
                    <div>
                      <p className="text-[11px] text-on-surface-variant uppercase font-semibold mb-sm">Attached Documents</p>
                      <div className="flex flex-wrap gap-sm">
                        {selectedRFQ.attachments.map(name => (
                          <button key={name}
                            className="flex items-center gap-xs bg-primary-container/10 border border-primary/20 text-primary px-sm py-xs rounded-lg text-[12px] font-semibold hover:bg-primary-container/20 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Line items from RFQ */}
                  {Array.isArray(selectedRFQ.items) && selectedRFQ.items.length > 0 && (
                    <div>
                      <p className="text-[11px] text-on-surface-variant uppercase font-semibold mb-sm">Line Items Required</p>
                      <div className="border border-outline-variant rounded-lg overflow-hidden text-[13px]">
                        <table className="w-full text-left">
                          <thead className="bg-surface-container-low">
                            <tr>
                              <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">#</th>
                              <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">Item</th>
                              <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">Qty</th>
                              <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">Unit</th>
                              <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">Specs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant">
                            {selectedRFQ.items.map((item, i) => (
                              <tr key={i}>
                                <td className="px-md py-sm text-on-surface-variant">#{i+1}</td>
                                <td className="px-md py-sm font-medium">{item.name}</td>
                                <td className="px-md py-sm">{item.quantity}</td>
                                <td className="px-md py-sm">{item.unit}</td>
                                <td className="px-md py-sm text-on-surface-variant">{item.spec || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quotation form */}
                {existingQuote ? (
                  /* Locked — already submitted */
                  <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg">
                    <div className={`rounded-xl p-lg text-center space-y-sm border-2 ${
                      existingQuote.status === 'Approved' ? 'border-emerald-300 bg-emerald-50' :
                      existingQuote.status === 'Rejected' ? 'border-error/30 bg-error-container/20' :
                      'border-outline-variant bg-surface-container-low'
                    }`}>
                      <p className="text-[32px]">
                        {existingQuote.status === 'Approved' ? '🎉' : existingQuote.status === 'Rejected' ? '❌' : '🔒'}
                      </p>
                      <p className="font-bold text-[16px]">
                        {existingQuote.status === 'Approved' ? 'Your quotation was selected!' :
                         existingQuote.status === 'Rejected' ? 'Not selected this cycle' :
                         'Quotation submitted & locked'}
                      </p>
                      <p className="text-[13px] text-on-surface-variant">
                        {existingQuote.status === 'Pending'
                          ? 'Your quotation has been sent to the Procurement Officer for comparison. Edits are not allowed after submission.'
                          : existingQuote.status === 'Approved'
                          ? 'A Purchase Order is being processed. You will receive it shortly.'
                          : 'Thank you for participating. Better luck on the next RFQ.'}
                      </p>
                      <div className="flex justify-center gap-lg text-[13px] pt-sm">
                        <div><p className="text-on-surface-variant text-[11px] uppercase font-semibold">Grand Total</p>
                          <p className="font-bold text-primary text-[18px]">₹{(existingQuote.grandTotal || existingQuote.amount)?.toLocaleString()}</p></div>
                        <div><p className="text-on-surface-variant text-[11px] uppercase font-semibold">Delivery</p>
                          <p className="font-bold text-[18px]">{existingQuote.deliveryDays} days</p></div>
                        <div><p className="text-on-surface-variant text-[11px] uppercase font-semibold">Terms</p>
                          <p className="font-bold text-[18px]">{existingQuote.terms}</p></div>
                      </div>
                    </div>
                  </div>
                ) : isDeadlinePassed ? (
                  <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg text-center space-y-sm">
                    <span className="material-symbols-outlined text-[48px] text-error">timer_off</span>
                    <p className="font-semibold text-[16px]">Deadline has passed</p>
                    <p className="text-[13px] text-on-surface-variant">The submission window for this RFQ is closed.</p>
                  </div>
                ) : (
                  /* Active quotation form */
                  <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg space-y-lg">
                    <div className="flex items-center justify-between border-b pb-md">
                      <h3 className="font-semibold text-[16px] flex items-center gap-sm">
                        <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-[12px] font-bold">Q</span>
                        Your Quotation
                      </h3>
                      {draftQuote && (
                        <span className="text-[11px] bg-surface-variant text-on-surface-variant px-sm py-0.5 rounded-full font-semibold">
                          ✏️ Draft saved
                        </span>
                      )}
                    </div>

                    {/* Per-line-item pricing */}
                    {lineItems.length > 0 && (
                      <div className="space-y-sm">
                        <p className="text-[11px] text-on-surface-variant uppercase font-semibold">Price Each Line Item</p>
                        <div className="border border-outline-variant rounded-lg overflow-hidden">
                          <table className="w-full text-left text-[13px]">
                            <thead className="bg-surface-container-low">
                              <tr>
                                <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">Item</th>
                                <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">Qty</th>
                                <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">Unit Price (₹)</th>
                                <th className="px-md py-sm text-on-surface-variant text-[11px] uppercase font-semibold">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                              {lineItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-md py-sm font-medium">{item.name || `Item ${idx+1}`}</td>
                                  <td className="px-md py-sm text-on-surface-variant">{item.quantity} {item.unit}</td>
                                  <td className="px-md py-sm">
                                    <div className="relative w-32">
                                      <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[12px]">₹</span>
                                      <input
                                        className="w-full h-8 pl-5 pr-sm bg-white border border-outline-variant rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        type="number" min="0" placeholder="0"
                                        value={item.unitPrice}
                                        onChange={e => updateLineItem(idx, 'unitPrice', e.target.value)}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-md py-sm font-semibold text-primary">
                                    ₹{(item.total || 0).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* If no line items, show simple amount field */}
                    {lineItems.length === 0 && (
                      <div className="space-y-xs">
                        <label className="text-[11px] text-on-surface-variant uppercase font-semibold">Total Bid Amount (₹)</label>
                        <div className="relative">
                          <span className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                          <input
                            className="w-full h-10 pl-7 pr-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            type="number" min="1" placeholder="e.g. 15000"
                            value={lineItems[0]?.unitPrice || ''}
                            onChange={e => setLineItems([{ unitPrice: e.target.value, total: parseFloat(e.target.value) || 0, quantity: 1 }])}
                          />
                        </div>
                      </div>
                    )}

                    {/* GST + Delivery + Terms */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                      <div className="space-y-xs">
                        <label className="text-[11px] text-on-surface-variant uppercase font-semibold">GST Rate</label>
                        <select
                          className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          value={gstRate} onChange={e => setGstRate(Number(e.target.value))}>
                          {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </div>
                      <div className="space-y-xs">
                        <label className="text-[11px] text-on-surface-variant uppercase font-semibold">Delivery (days) *</label>
                        <input
                          className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          type="number" min="1" placeholder="e.g. 7"
                          value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} />
                      </div>
                      <div className="space-y-xs">
                        <label className="text-[11px] text-on-surface-variant uppercase font-semibold">Payment Terms</label>
                        <select
                          className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          value={terms} onChange={e => setTerms(e.target.value)}>
                          {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-xs">
                      <label className="text-[11px] text-on-surface-variant uppercase font-semibold">Notes & Special Conditions</label>
                      <textarea
                        className="w-full h-20 p-md bg-white border border-outline-variant rounded-lg text-[13px] resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="Warranties, installation support, post-delivery service, special terms…"
                        value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    {/* Price summary */}
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md space-y-xs text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Subtotal</span>
                        <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">GST ({gstRate}%)</span>
                        <span className="font-semibold">₹{gstAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-outline-variant pt-xs mt-xs">
                        <span className="font-bold text-[15px]">Grand Total</span>
                        <span className="font-bold text-[20px] text-primary">₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-sm pt-sm border-t border-outline-variant">
                      <button onClick={handleSaveDraft}
                        className="flex-1 border-2 border-outline-variant hover:border-primary hover:bg-primary-container/5 text-on-surface py-sm rounded-lg font-semibold text-[13px] transition-all flex items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        Save Draft
                      </button>
                      <button onClick={handleSubmit}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-sm rounded-lg font-semibold text-[14px] transition-all active:scale-[0.98] flex items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Submit Quotation
                      </button>
                    </div>
                    <p className="text-[11px] text-on-surface-variant text-center">
                      Once submitted, your quotation is locked and visible to the Procurement Officer. Save as draft to edit later.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-xl left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-lg py-sm rounded-full text-[13px] font-semibold shadow-lg z-50 animate-fade-in whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
};

export default SubmitQuotation;

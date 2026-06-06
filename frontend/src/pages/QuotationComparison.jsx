import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Layout from '../components/Layout';

const QuotationComparison = () => {
  const { rfqs, quotations, vendors, approvals, approveQuotation, resubmitForApproval, dismissReturnNotif, user } = useAppState();
  const navigate = useNavigate();
  const role   = user?.role || 'officer';
  const canAct = role === 'officer';

  const rfqsWithQuotes = rfqs.filter(r =>
    quotations.some(q => q.rfqId === r.id) || r.status === 'Open'
  );

  const [selectedRFQId,  setSelectedRFQId]  = useState(rfqsWithQuotes[0]?.id || '');
  const [confirmVendor,  setConfirmVendor]  = useState(null);  // select & approve modal
  const [rejectionPopup, setRejectionPopup] = useState(null);  // rejection detail popup
  const [toast,          setToast]          = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const activeRFQ    = rfqs.find(r => r.id === selectedRFQId);
  const activeQuotes = quotations.filter(q => q.rfqId === selectedRFQId);
  const minAmount    = activeQuotes.length ? Math.min(...activeQuotes.map(q => q.amount)) : null;
  const minDelivery  = activeQuotes.length ? Math.min(...activeQuotes.map(q => q.deliveryDays)) : null;

  const getVendorRating = (name) => {
    const v = vendors.find(v => v.name === name);
    return v ? v.rating : '—';
  };

  // Find return notification for the currently selected RFQ
  const returnNotif = approvals.find(a =>
    a.type === 'Returned to Officer' &&
    a.status === 'Action Required' &&
    a.rfqId === selectedRFQId
  );

  // When RFQ changes and there's a return notification, auto-open the rejection popup
  useEffect(() => {
    if (canAct && returnNotif) {
      const rejectedQuote = quotations.find(q => q.id === returnNotif.sourceId);
      setRejectionPopup({ notif: returnNotif, quote: rejectedQuote });
    } else {
      setRejectionPopup(null);
    }
  }, [selectedRFQId, returnNotif?.id]);

  // ── Confirm select & approve ─────────────────────────────────────────────
  const handleConfirmSelect = () => {
    if (!confirmVendor) return;
    approveQuotation(confirmVendor.id);
    setConfirmVendor(null);
    showToast(`${confirmVendor.vendorName} selected — Manager notified for approval.`);
    setTimeout(() => navigate('/approvals'), 1400);
  };

  // ── Resubmit same quotation ──────────────────────────────────────────────
  const handleResubmitSame = () => {
    if (!rejectionPopup?.quote) return;
    resubmitForApproval(rejectionPopup.quote.id);
    setRejectionPopup(null);
    showToast('Same quotation resubmitted — Manager notified for review.');
    setTimeout(() => navigate('/approvals'), 1400);
  };

  // ── Pick different vendor (close popup, stay on page) ────────────────────
  const handlePickDifferent = () => {
    // Dismiss the return notification so the orange badges clear
    if (rejectionPopup?.notif?.id) dismissReturnNotif(rejectionPopup.notif.id);
    setRejectionPopup(null);
    showToast('Select a different vendor from the comparison table below.');
  };

  const ROWS = [
    { key: 'amount',        label: 'Grand Total',   fmt: v => `₹${v?.toLocaleString()}`,              hi: q => q.amount === minAmount },
    { key: 'deliveryDays',  label: 'Delivery Time', fmt: v => `${v} days`,                           hi: q => q.deliveryDays === minDelivery },
    { key: 'terms',         label: 'Payment Terms', fmt: v => v,                                     hi: () => false },
    { key: 'submittedDate', label: 'Submitted On',  fmt: v => v,                                     hi: () => false },
    { key: '_rating',       label: 'Vendor Rating', fmt: (_, q) => `${getVendorRating(q.vendorName)} / 5.0`, hi: () => false },
  ];

  return (
    <Layout title="Quotation Comparison">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* ── RFQ Selector ── */}
        <div className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Select RFQ</label>
            <div className="relative">
              <select
                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                value={selectedRFQId}
                onChange={e => setSelectedRFQId(e.target.value)}
              >
                {rfqsWithQuotes.map(r => (
                  <option key={r.id} value={r.id}>[{r.id}] {r.title}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
            </div>
          </div>
          {activeRFQ && (
            <div className="flex items-center gap-4 text-[13px] text-slate-500">
              <div className="text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold block mb-1 ${activeRFQ.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {activeRFQ.status}
                </span>
                <span>Deadline: {activeRFQ.deadline}</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-center">
                <p className="font-bold text-[20px] text-slate-800">{activeQuotes.length}</p>
                <p className="text-[11px]">quote{activeQuotes.length !== 1 ? 's' : ''} received</p>
              </div>
              {canAct && returnNotif && (
                <>
                  <div className="h-10 w-px bg-slate-200" />
                  <button
                    onClick={() => { const q = quotations.find(q => q.id === returnNotif.sourceId); setRejectionPopup({ notif: returnNotif, quote: q }); }}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 border border-orange-300 text-orange-700 text-[12px] font-bold rounded-xl transition-all"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>assignment_return</span>
                    View Rejection
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {activeQuotes.length === 0 ? (
          <div className="card p-16 text-center">
            <span className="material-symbols-outlined text-slate-300 block mb-3" style={{ fontSize: 52 }}>ballot</span>
            <p className="font-bold text-[16px] text-slate-600">No quotations yet</p>
            <p className="text-slate-400 text-[14px] mt-1">Vendors assigned to this RFQ haven't submitted quotes yet.</p>
          </div>
        ) : (
          <>
            {/* ── Comparison table ── */}
            <div className="card overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-4 bg-slate-50 text-slate-400 text-[11px] uppercase font-bold tracking-wide w-[160px]">Criteria</th>
                    {activeQuotes.map(q => {
                      const isBest     = q.amount === minAmount;
                      const isFastest  = q.deliveryDays === minDelivery;
                      const isApproved = q.status === 'Approved';
                      const isReturned = !!returnNotif && returnNotif.sourceId === q.id;

                      return (
                        <th key={q.id} className={`px-5 py-4 text-center ${
                          isReturned ? 'bg-orange-50' :
                          isApproved ? 'bg-emerald-50' :
                          isBest     ? 'bg-indigo-50' : 'bg-slate-50/40'
                        }`}>
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                              isReturned ? 'bg-orange-100' : 'bg-indigo-100'
                            }`}>
                              <span className={`material-symbols-outlined ${isReturned ? 'text-orange-500' : 'text-indigo-500'}`} style={{ fontSize: 22 }}>business</span>
                            </div>
                            <p className="font-bold text-[14px] text-slate-800">{q.vendorName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{q.id}</p>
                            <div className="flex flex-wrap justify-center gap-1.5">
                              {isBest && !isApproved && !isReturned && (
                                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Lowest Price</span>
                              )}
                              {isFastest && !isApproved && !isReturned && (
                                <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Fastest</span>
                              )}
                              {isApproved && (
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Selected</span>
                              )}
                              {isReturned && (
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Returned</span>
                              )}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(row => (
                    <tr key={row.key} className="border-b border-slate-100 last:border-none">
                      <td className="px-5 py-4 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wide">{row.label}</td>
                      {activeQuotes.map(q => {
                        const val         = row.key === '_rating' ? null : q[row.key];
                        const highlighted = row.hi(q);
                        const isApproved  = q.status === 'Approved';
                        const isReturned  = !!returnNotif && returnNotif.sourceId === q.id;
                        return (
                          <td key={q.id} className={`px-5 py-4 text-center font-semibold text-[15px] ${
                            isApproved  ? 'bg-emerald-50/60' :
                            isReturned  ? 'bg-orange-50/60' :
                            highlighted ? 'bg-indigo-50' : ''
                          }`}>
                            {row.key === '_rating' ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span>{row.fmt(null, q)}</span>
                              </div>
                            ) : row.key === 'amount' ? (
                              <span className={`text-[18px] font-black ${highlighted && !isReturned ? 'text-indigo-700' : isReturned ? 'text-orange-600' : 'text-slate-700'}`}>
                                {row.fmt(val)}
                              </span>
                            ) : (
                              <span className={highlighted && !isReturned ? 'text-indigo-700' : 'text-slate-600'}>{row.fmt(val)}</span>
                            )}
                            {highlighted && !isReturned && row.key !== '_rating' && (
                              <span className="material-symbols-outlined text-indigo-500 ml-1 align-middle" style={{ fontSize: 14 }}>arrow_downward</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Action row */}
                  <tr className="bg-slate-50/80">
                    <td className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Action</td>
                    {activeQuotes.map(q => {
                      const isReturned = !!returnNotif && returnNotif.sourceId === q.id;
                      return (
                        <td key={q.id} className={`px-5 py-5 text-center ${isReturned ? 'bg-orange-50/60' : ''}`}>

                          {/* Approved */}
                          {q.status === 'Approved' && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-[13px] border border-emerald-200">
                              <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              Accepted Bid
                            </div>
                          )}

                          {/* Returned — show both resubmit same + pick different */}
                          {q.status === 'Pending' && canAct && isReturned && (
                            <div className="flex flex-col items-center gap-2">
                              <button
                                onClick={() => setRejectionPopup({ notif: returnNotif, quote: q })}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[12px] text-white transition-all hover:opacity-90 active:scale-[0.98] w-full justify-center"
                                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 3px 10px rgba(234,88,12,.35)' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>assignment_return</span>
                                Review Rejection
                              </button>
                            </div>
                          )}

                          {/* Normal pending — select & approve */}
                          {q.status === 'Pending' && canAct && !isReturned && (
                            <button
                              onClick={() => setConfirmVendor(q)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
                              style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 3px 12px rgba(79,70,229,.35)' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>thumb_up</span>
                              Select & Approve
                            </button>
                          )}

                          {/* View only (manager/admin) */}
                          {q.status === 'Pending' && !canAct && (
                            <span className="text-[12px] text-slate-400 font-medium">View only</span>
                          )}

                          {/* Hard rejected */}
                          {q.status === 'Rejected' && (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-red-500 font-semibold">
                              <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>cancel</span>
                              Rejected
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[12px] text-slate-400 text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-indigo-400" style={{ fontSize: 14 }}>info</span>
              Indigo highlights = lowest price / fastest delivery. Select a vendor to send for Manager approval.
            </p>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          REJECTION DETAIL POPUP
          Shows when manager has rejected and returned the request.
          Officer can: (A) resubmit the same quotation, (B) pick different vendor
          ══════════════════════════════════════════════════════════ */}
      {rejectionPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">

            {/* Header — red accent */}
            <div className="px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(135deg,#FEF2F2,#FFF7ED)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>cancel</span>
                </div>
                <div>
                  <h3 className="font-bold text-[17px] text-slate-800">Request Rejected by Manager</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    {rejectionPopup.notif?.rejectedBy} · {rejectionPopup.notif?.date}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">

              {/* Rejection reason */}
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-[11px] font-bold text-red-500 uppercase tracking-wide mb-2">Manager's Rejection Reason</p>
                <p className="text-[14px] text-red-800 font-medium leading-relaxed italic">
                  "{rejectionPopup.notif?.rejectionRemark}"
                </p>
              </div>

              {/* The quotation that was rejected */}
              {rejectionPopup.quote && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Rejected Quotation</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-orange-500" style={{ fontSize: 20 }}>business</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[15px]">{rejectionPopup.quote.vendorName}</p>
                      <p className="text-[12px] text-slate-400 font-mono">{rejectionPopup.quote.id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Grand Total',    value: `₹${rejectionPopup.quote.amount?.toLocaleString()}` },
                      { label: 'Delivery',       value: `${rejectionPopup.quote.deliveryDays} days` },
                      { label: 'Payment Terms',  value: rejectionPopup.quote.terms },
                    ].map(item => (
                      <div key={item.label} className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
                        <p className="font-bold text-[14px] text-slate-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What would you like to do? */}
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-3">What would you like to do?</p>

                <div className="space-y-3">
                  {/* Option A — Resubmit same quotation */}
                  <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-indigo-600" style={{ fontSize: 17 }}>replay</span>
                      </div>
                      <div>
                        <p className="font-bold text-[14px] text-indigo-800">Resubmit the same quotation</p>
                        <p className="text-[12px] text-indigo-600 mt-0.5">
                          Send <strong>{rejectionPopup.quote?.vendorName}</strong>'s existing quotation back to the Manager for another review.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResubmitSame}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white font-bold text-[14px] transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 4px 14px rgba(79,70,229,.4)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                      Resubmit Same Quotation
                    </button>
                  </div>

                  {/* Option B — Pick different vendor */}
                  <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 17 }}>compare_arrows</span>
                      </div>
                      <div>
                        <p className="font-bold text-[14px] text-slate-800">Pick a different vendor</p>
                        <p className="text-[12px] text-slate-500 mt-0.5">
                          Close this popup and select another vendor from the comparison table.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handlePickDifferent}
                      className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-[13px] transition-all hover:bg-white hover:border-slate-400"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>compare_arrows</span>
                      Choose Different Vendor
                    </button>
                  </div>
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => setRejectionPopup(null)}
                className="w-full text-center text-[12px] text-slate-400 hover:text-slate-600 transition-colors py-1"
              >
                Dismiss for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Select & Approve modal ── */}
      {confirmVendor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-[16px] text-slate-800">Confirm Vendor Selection</h3>
              <p className="text-[13px] text-slate-500 mt-1">This will send an approval request to the Manager.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 20 }}>business</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{confirmVendor.vendorName}</p>
                  <p className="text-[14px] text-indigo-700 font-bold">₹{confirmVendor.amount?.toLocaleString()}</p>
                  <p className="text-[12px] text-slate-500">{confirmVendor.deliveryDays} days · {confirmVendor.terms}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmVendor(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelect}
                  className="flex-1 h-11 rounded-xl text-white font-bold text-[13px] transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 4px 14px rgba(79,70,229,.4)' }}
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full text-[13px] font-semibold shadow-lg z-50 animate-fade-in flex items-center gap-2 whitespace-nowrap">
          <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {toast}
        </div>
      )}
    </Layout>
  );
};

export default QuotationComparison;

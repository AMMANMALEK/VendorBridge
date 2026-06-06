import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const QuotationComparison = () => {
  const { rfqs, quotations, vendors, approveQuotation, user } = useAppState();
  const navigate = useNavigate();
  const role = user?.role || 'officer';
  const canSelect = role === 'officer';

  const rfqsWithQuotes = rfqs.filter(r =>
    quotations.some(q => q.rfqId === r.id) || r.status === 'Open'
  );

  const [selectedRFQId, setSelectedRFQId] = useState(
    rfqsWithQuotes[0]?.id || ''
  );
  const [confirmVendor, setConfirmVendor] = useState(null);

  const activeRFQ = rfqs.find(r => r.id === selectedRFQId);
  const activeQuotes = quotations.filter(q => q.rfqId === selectedRFQId);

  const minAmount = activeQuotes.length ? Math.min(...activeQuotes.map(q => q.amount)) : null;
  const minDelivery = activeQuotes.length ? Math.min(...activeQuotes.map(q => q.deliveryDays)) : null;

  const getVendorRating = (vendorName) => {
    const v = vendors.find(v => v.name === vendorName);
    return v ? v.rating : '—';
  };

  const handleConfirmSelect = () => {
    if (!confirmVendor) return;
    approveQuotation(confirmVendor.id);
    setConfirmVendor(null);
    alert(`✅ ${confirmVendor.vendorName} selected! Approval workflow has been initiated.\n\nThe Manager has been notified to review and sign off.`);
    navigate('/approvals');
  };

  const ROWS = [
    { key: 'amount',       label: 'Grand Total',      format: v => `₹${v?.toLocaleString()}`,  highlight: (q) => q.amount === minAmount },
    { key: 'deliveryDays', label: 'Delivery Time',    format: v => `${v} days`,                highlight: (q) => q.deliveryDays === minDelivery },
    { key: 'terms',        label: 'Payment Terms',    format: v => v,                          highlight: () => false },
    { key: 'submittedDate',label: 'Submitted On',     format: v => v,                          highlight: () => false },
    { key: '_rating',      label: 'Vendor Rating',    format: (_, q) => `⭐ ${getVendorRating(q.vendorName)} / 5.0`, highlight: () => false },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <div className="flex-1 ml-sidebar_width pt-header_height min-h-screen flex flex-col">
        <Header title="Quotation Comparison" />

        <main className="p-xl max-w-container_max_width w-full mx-auto flex-1 animate-fade-in space-y-lg">

          {/* RFQ selector */}
          <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div className="space-y-xs flex-1">
              <label className="text-on-surface-variant block uppercase text-[11px] font-semibold">Select RFQ</label>
              <select
                className="w-full max-w-lg h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={selectedRFQId}
                onChange={e => setSelectedRFQId(e.target.value)}
              >
                {rfqsWithQuotes.map(r => (
                  <option key={r.id} value={r.id}>[{r.id}] {r.title}</option>
                ))}
              </select>
            </div>
            {activeRFQ && (
              <div className="text-right space-y-xs">
                <span className={`px-sm py-1 rounded-full text-xs font-semibold inline-block ${
                  activeRFQ.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-variant text-on-surface-variant'
                }`}>
                  {activeRFQ.status}
                </span>
                <p className="text-xs text-on-surface-variant">Deadline: {activeRFQ.deadline}</p>
                <p className="text-xs text-on-surface-variant">{activeQuotes.length} quote{activeQuotes.length !== 1 ? 's' : ''} received</p>
              </div>
            )}
          </div>

          {activeQuotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-xl text-center space-y-md">
              <span className="material-symbols-outlined text-[56px] text-on-surface-variant">ballot</span>
              <p className="font-semibold text-[16px]">No quotations yet</p>
              <p className="text-on-surface-variant text-[14px]">Vendors assigned to this RFQ haven't submitted quotes yet.</p>
            </div>
          ) : (
            <>
              {/* Side-by-side comparison table */}
              <div className="bg-white rounded-xl border border-outline-variant custom-shadow overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      {/* Row label col */}
                      <th className="px-lg py-md bg-surface-container-low text-on-surface-variant text-[12px] uppercase font-semibold w-[160px]">
                        Criteria
                      </th>
                      {activeQuotes.map(q => {
                        const isBestPrice = q.amount === minAmount;
                        const isApproved = q.status === 'Approved';
                        return (
                          <th key={q.id} className={`px-lg py-md text-center relative ${
                            isApproved ? 'bg-secondary-container/20' :
                            isBestPrice ? 'bg-emerald-50' : 'bg-surface-container-lowest'
                          }`}>
                            <div className="flex flex-col items-center gap-xs">
                              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-[18px]">🏭</div>
                              <p className="font-semibold text-[14px]">{q.vendorName}</p>
                              <p className="text-[11px] text-on-surface-variant">ID: {q.id}</p>
                              {isBestPrice && !isApproved && (
                                <span className="bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Lowest Price</span>
                              )}
                              {q.deliveryDays === minDelivery && !isApproved && (
                                <span className="bg-sky-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Fastest</span>
                              )}
                              {isApproved && (
                                <span className="bg-secondary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Selected</span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map(row => (
                      <tr key={row.key} className="border-b border-outline-variant last:border-none">
                        <td className="px-lg py-md bg-surface-container-lowest text-[12px] font-semibold text-on-surface-variant uppercase">
                          {row.label}
                        </td>
                        {activeQuotes.map(q => {
                          const val = row.key === '_rating' ? null : q[row.key];
                          const isHighlighted = row.highlight(q);
                          const isApproved = q.status === 'Approved';
                          return (
                            <td key={q.id} className={`px-lg py-md text-center font-semibold text-[15px] ${
                              isApproved ? 'bg-secondary-container/10' :
                              isHighlighted ? 'bg-emerald-50 text-emerald-700' : ''
                            }`}>
                              {row.key === '_rating'
                                ? row.format(null, q)
                                : row.key === 'amount'
                                  ? <span className={`text-[18px] font-bold ${isHighlighted ? 'text-emerald-700' : 'text-primary'}`}>{row.format(val)}</span>
                                  : row.format(val)
                              }
                              {isHighlighted && row.key !== '_rating' && (
                                <span className="material-symbols-outlined text-emerald-600 text-[14px] ml-xs align-middle">arrow_downward</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Action row */}
                    <tr className="bg-surface-container-lowest">
                      <td className="px-lg py-md text-[12px] font-semibold text-on-surface-variant uppercase">Action</td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className={`px-lg py-md text-center ${q.status === 'Approved' ? 'bg-secondary-container/10' : ''}`}>
                          {q.status === 'Pending' && canSelect && (
                            <button onClick={() => setConfirmVendor(q)}
                              className="bg-primary text-white px-md py-sm rounded-lg hover:opacity-90 transition-all font-semibold text-[12px] flex items-center gap-xs mx-auto">
                              <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                              Select & Approve
                            </button>
                          )}
                          {q.status === 'Pending' && !canSelect && (
                            <span className="text-[12px] text-on-surface-variant font-medium">👁️ View only</span>
                          )}
                          {q.status === 'Approved' && (
                            <div className="bg-secondary-container/30 text-on-secondary-container py-sm px-md rounded-lg font-semibold text-[12px] border border-secondary/20 inline-block">
                              ✅ Accepted Bid
                            </div>
                          )}
                          {q.status === 'Rejected' && (
                            <span className="text-[12px] text-error font-medium">Rejected</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer note */}
              <p className="text-xs text-on-surface-variant text-center">
                🟢 Green highlights indicate the lowest price / fastest delivery. Selecting a vendor will initiate the Manager approval workflow.
              </p>
            </>
          )}
        </main>
      </div>

      {/* Confirm modal */}
      {confirmVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md animate-fade-in">
          <div className="bg-white rounded-xl border border-outline-variant shadow-2xl w-full max-w-sm p-lg space-y-md">
            <h3 className="font-semibold text-[18px]">Confirm Vendor Selection</h3>
            <p className="text-[14px] text-on-surface-variant">
              You are selecting <span className="font-semibold text-on-surface">{confirmVendor.vendorName}</span> for this RFQ.
            </p>
            <div className="bg-surface-container-low rounded-lg p-md space-y-xs text-[13px]">
              <div className="flex justify-between"><span className="text-on-surface-variant">Amount</span><span className="font-bold text-primary">₹{confirmVendor.amount?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Delivery</span><span className="font-semibold">{confirmVendor.deliveryDays} days</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Terms</span><span className="font-semibold">{confirmVendor.terms}</span></div>
            </div>
            <p className="text-[12px] text-on-surface-variant">This will lock the comparison and notify the Manager to approve the Purchase Order.</p>
            <div className="flex gap-sm pt-sm">
              <button onClick={() => setConfirmVendor(null)}
                className="flex-1 border border-outline-variant hover:bg-surface-container-low py-sm rounded-lg font-semibold text-[13px] transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmSelect}
                className="flex-1 bg-primary text-white py-sm rounded-lg font-semibold text-[13px] hover:opacity-90 transition-all">
                Confirm & Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationComparison;

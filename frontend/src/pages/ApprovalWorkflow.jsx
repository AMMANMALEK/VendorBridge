import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// ── Stepper showing pipeline stages ──────────────────────────────────────────
const STAGES = ['Submitted', 'Under Review', 'Decision Made', 'PO Generated'];

const Stepper = ({ approval }) => {
  const stageIndex =
    approval.status === 'Pending'  ? 1 :
    approval.status === 'Approved' ? (approval.type === 'Purchase Order' ? 3 : 2) :
    approval.status === 'Rejected' ? 2 : 0;

  return (
    <div className="flex items-center gap-0 w-full">
      {STAGES.map((label, i) => {
        const done    = i < stageIndex;
        const active  = i === stageIndex;
        const failed  = approval.status === 'Rejected' && i === 2;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-xs">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all ${
                failed  ? 'bg-error border-error text-white' :
                done    ? 'bg-secondary border-secondary text-white' :
                active  ? 'bg-primary border-primary text-white' :
                          'bg-white border-outline-variant text-on-surface-variant'
              }`}>
                {failed ? '✕' : done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                failed ? 'text-error' : active ? 'text-primary' : done ? 'text-secondary' : 'text-on-surface-variant'
              }`}>{label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-xs mb-4 ${done ? 'bg-secondary' : 'bg-outline-variant'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Status badge helper ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Pending:  'bg-amber-100 text-amber-700 border-amber-200',
    Approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Rejected: 'bg-error-container text-on-error-container border-error/20',
  };
  return (
    <span className={`px-sm py-0.5 rounded-full text-[11px] font-semibold border ${map[status] || 'bg-surface-variant text-on-surface-variant border-outline-variant'}`}>
      {status === 'Pending' ? '⏳ Pending' : status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
    </span>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const ApprovalWorkflow = () => {
  const { approvals, quotations, vendors, approveApproval, rejectApproval, user } = useAppState();
  const role = user?.role || 'officer';
  const isManager = role === 'manager';

  const [activeTab, setActiveTab]   = useState('Pending');
  const [selected, setSelected]     = useState(null);
  const [remark, setRemark]         = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [toast, setToast]           = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = approvals.filter(a => a.status === activeTab);
  const pendingCount = approvals.filter(a => a.status === 'Pending').length;

  // Pull context for the selected approval
  const relatedQuote = selected
    ? quotations.find(q => q.id === selected.sourceId || (selected.type === 'Purchase Order' && quotations.find(q2 => q2.rfqTitle && q2.vendorName === selected.title.split(' PO')[0])))
    : null;
  const vendorInfo = selected
    ? vendors.find(v => v.name === selected.title.split(' - ')[0] || v.name === selected.title.split(' PO')[0])
    : null;

  const handleSelect = (app) => {
    setSelected(app);
    setRemark('');
    setRejectMode(false);
  };

  const handleApprove = () => {
    if (!selected) return;
    if (!remark.trim()) { showToast('Please enter an approval remark before approving.'); return; }
    approveApproval(selected.id, remark.trim());
    showToast('✅ Request approved and moved to next stage');
    setSelected(null);
    setRemark('');
  };

  const handleReject = () => {
    if (!selected) return;
    if (!remark.trim()) { showToast('Please enter a rejection reason.'); return; }
    rejectApproval(selected.id, remark.trim());
    showToast('❌ Request rejected. Officer has been notified.');
    setSelected(null);
    setRemark('');
    setRejectMode(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <div className="flex-1 ml-sidebar_width pt-header_height min-h-screen flex flex-col">
        <Header title="Approval Workflow" />

        <main className="p-xl max-w-container_max_width w-full mx-auto flex-1 flex flex-col gap-lg animate-fade-in">

          {/* Manager context banner */}
          {isManager && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-lg py-md flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-[14px] text-green-800">Manager Approval Workspace</p>
                  <p className="text-[12px] text-green-700">Review procurement requests, check details, then approve or reject with a remark.</p>
                </div>
              </div>
              {pendingCount > 0 && (
                <span className="bg-error text-white text-[13px] font-bold px-md py-xs rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </div>
          )}

          {/* Officer / Admin monitor banner */}
          {!isManager && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-lg py-sm flex items-center gap-sm">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">visibility</span>
              <p className="text-[13px] text-blue-800 font-medium">
                {role === 'officer' ? 'Monitor view — track the status of your submitted requests.' : 'Admin oversight — full view of all approval activity.'}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-outline-variant gap-lg">
            {['Pending', 'Approved', 'Rejected'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSelected(null); }}
                className={`pb-sm font-semibold text-[14px] relative transition-colors flex items-center gap-xs ${
                  activeTab === tab ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}>
                {tab}
                {tab === 'Pending' && pendingCount > 0 && (
                  <span className="bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pendingCount}</span>
                )}
                {tab === 'Approved' && (
                  <span className="bg-surface-container-high text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {approvals.filter(a => a.status === 'Approved').length}
                  </span>
                )}
                {tab === 'Rejected' && (
                  <span className="bg-surface-container-high text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {approvals.filter(a => a.status === 'Rejected').length}
                  </span>
                )}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />}
              </button>
            ))}
          </div>

          {/* Content: list + detail panel */}
          <div className="flex flex-col lg:flex-row gap-lg flex-1">

            {/* ── Left: request list ── */}
            <div className="flex-1 space-y-sm">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-xl text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[52px] mb-sm">task_alt</span>
                  <p className="font-semibold text-[16px]">
                    {activeTab === 'Pending' ? 'All caught up!' : `No ${activeTab.toLowerCase()} requests`}
                  </p>
                  <p className="text-[13px] mt-xs">
                    {activeTab === 'Pending' && isManager ? 'No procurement requests waiting for your decision.' : ''}
                  </p>
                </div>
              ) : filtered.map(app => (
                <div key={app.id}
                  onClick={() => handleSelect(app)}
                  className={`bg-white rounded-xl border custom-shadow p-lg cursor-pointer transition-all hover:border-primary/40 ${
                    selected?.id === app.id ? 'border-primary ring-1 ring-primary/20' : 'border-outline-variant'
                  }`}>

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-md mb-md">
                    <div className="flex items-center gap-sm flex-wrap">
                      <span className={`px-sm py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        app.type === 'Purchase Order'
                          ? 'bg-secondary-container/20 text-secondary'
                          : 'bg-primary-container/20 text-primary'
                      }`}>
                        {app.type}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{app.id}</span>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-[15px] text-on-surface mb-sm">{app.title}</h4>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-md text-[12px] text-on-surface-variant mb-md">
                    <span className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      {app.requester}
                    </span>
                    <span className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {app.date}
                    </span>
                    <span className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">tag</span>
                      {app.sourceId}
                    </span>
                  </div>

                  {/* Stepper */}
                  <Stepper approval={app} />

                  {/* Amount + remark if resolved */}
                  <div className="flex items-center justify-between mt-md pt-md border-t border-outline-variant">
                    <div>
                      <p className="text-[11px] text-on-surface-variant uppercase font-semibold">Amount</p>
                      <p className="font-bold text-[20px] text-primary">₹{app.amount?.toLocaleString()}</p>
                    </div>
                    {app.remark && (
                      <div className="max-w-xs text-right">
                        <p className="text-[11px] text-on-surface-variant uppercase font-semibold">
                          {app.status === 'Rejected' ? 'Rejection reason' : 'Remark'}
                        </p>
                        <p className="text-[12px] text-on-surface italic">"{app.remark}"</p>
                        {app.decidedBy && (
                          <p className="text-[11px] text-on-surface-variant mt-0.5">— {app.decidedBy}</p>
                        )}
                      </div>
                    )}
                    {app.status === 'Pending' && isManager && (
                      <span className="text-[12px] text-primary font-semibold">Click to review →</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Right: decision panel (manager + pending only) ── */}
            {selected && (
              <aside className="w-full lg:w-[360px] bg-white rounded-xl border border-outline-variant custom-shadow self-start flex flex-col overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                  <div className="flex items-center justify-between mb-xs">
                    <h3 className="font-semibold text-[16px]">Request Details</h3>
                    <button onClick={() => setSelected(null)}
                      className="text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="p-lg space-y-lg flex-1">

                  {/* What they're approving */}
                  <div className="space-y-md">
                    <div className="bg-surface-container-lowest rounded-lg p-md space-y-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Type</span>
                        <span className={`px-sm py-0.5 rounded text-[11px] font-semibold ${
                          selected.type === 'Purchase Order' ? 'bg-secondary-container/20 text-secondary' : 'bg-primary-container/20 text-primary'
                        }`}>{selected.type}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Request</span>
                        <span className="text-[13px] font-semibold text-right max-w-[180px]">{selected.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Raised by</span>
                        <span className="text-[13px] font-medium">{selected.requester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Date</span>
                        <span className="text-[13px] font-medium">{selected.date}</span>
                      </div>
                    </div>

                    {/* Grand total — prominent */}
                    <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-md text-center">
                      <p className="text-[11px] text-primary uppercase font-semibold mb-xs">Grand Total</p>
                      <p className="font-bold text-[28px] text-primary">₹{selected.amount?.toLocaleString()}</p>
                    </div>

                    {/* Vendor context if available */}
                    {vendorInfo && (
                      <div className="space-y-sm">
                        <p className="text-[11px] text-on-surface-variant uppercase font-semibold">Vendor Profile</p>
                        <div className="bg-surface-container-lowest rounded-lg p-md space-y-xs text-[13px]">
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Vendor</span>
                            <span className="font-semibold">{vendorInfo.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Category</span>
                            <span className="font-medium">{vendorInfo.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Rating</span>
                            <span className="font-semibold text-amber-600">⭐ {vendorInfo.rating} / 5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Location</span>
                            <span className="font-medium">{vendorInfo.address}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quote details if linked */}
                    {relatedQuote && (
                      <div className="space-y-sm">
                        <p className="text-[11px] text-on-surface-variant uppercase font-semibold">Quotation Details</p>
                        <div className="bg-surface-container-lowest rounded-lg p-md space-y-xs text-[13px]">
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Delivery</span>
                            <span className="font-semibold">{relatedQuote.deliveryDays} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Payment Terms</span>
                            <span className="font-medium">{relatedQuote.terms}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Submitted</span>
                            <span className="font-medium">{relatedQuote.submittedDate}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Already decided — show remark */}
                  {selected.status !== 'Pending' && selected.remark && (
                    <div className={`rounded-lg p-md border ${
                      selected.status === 'Approved'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-error-container/30 border-error/20'
                    }`}>
                      <p className="text-[11px] font-semibold uppercase mb-xs text-on-surface-variant">
                        {selected.status === 'Approved' ? 'Approval Remark' : 'Rejection Reason'}
                      </p>
                      <p className="text-[13px] font-medium italic">"{selected.remark}"</p>
                      {selected.decidedBy && (
                        <p className="text-[11px] text-on-surface-variant mt-xs">— {selected.decidedBy}</p>
                      )}
                    </div>
                  )}

                  {/* Decision area — manager + pending only */}
                  {isManager && selected.status === 'Pending' && (
                    <div className="space-y-md border-t border-outline-variant pt-md">
                      <div className="space-y-xs">
                        <label className="text-[11px] text-on-surface-variant uppercase font-semibold block">
                          {rejectMode ? 'Rejection Reason *' : 'Approval Remark *'}
                        </label>
                        <textarea
                          className={`w-full h-24 p-md border rounded-lg text-[13px] resize-none outline-none focus:ring-2 transition-all ${
                            rejectMode
                              ? 'border-error/50 focus:ring-error/20 focus:border-error bg-error-container/10'
                              : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                          }`}
                          placeholder={rejectMode
                            ? 'State your reason for rejection (required)…'
                            : 'Add your approval remark (required)…'
                          }
                          value={remark}
                          onChange={e => setRemark(e.target.value)}
                        />
                        <p className="text-[11px] text-on-surface-variant">
                          This remark will be recorded in the audit log and notified to the officer.
                        </p>
                      </div>

                      {!rejectMode ? (
                        <div className="flex flex-col gap-sm">
                          <button onClick={handleApprove}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-sm rounded-lg font-semibold text-[14px] transition-all flex items-center justify-center gap-xs active:scale-[0.98]">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Approve Request
                          </button>
                          <button onClick={() => setRejectMode(true)}
                            className="w-full border-2 border-error text-error hover:bg-error-container py-sm rounded-lg font-semibold text-[14px] transition-all flex items-center justify-center gap-xs">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Reject Request
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-sm">
                          <div className="bg-error-container/30 border border-error/20 rounded-lg p-sm text-[12px] text-on-error-container text-center">
                            ⚠️ Rejecting will send this back to the Procurement Officer.
                          </div>
                          <button onClick={handleReject}
                            className="w-full bg-error hover:opacity-90 text-white py-sm rounded-lg font-semibold text-[14px] transition-all flex items-center justify-center gap-xs active:scale-[0.98]">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Confirm Rejection
                          </button>
                          <button onClick={() => { setRejectMode(false); setRemark(''); }}
                            className="w-full border border-outline-variant hover:bg-surface-container-low text-on-surface py-sm rounded-lg font-semibold text-[13px] transition-colors">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Non-manager pending message */}
                  {!isManager && selected.status === 'Pending' && (
                    <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md text-center">
                      <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-xs">hourglass_top</span>
                      <p className="text-[13px] font-medium text-on-surface-variant">Awaiting Manager decision</p>
                      <p className="text-[12px] text-on-surface-variant mt-xs">The assigned Manager will review and decide.</p>
                    </div>
                  )}
                </div>
              </aside>
            )}

            {/* Empty state for detail panel */}
            {!selected && filtered.length > 0 && (
              <aside className="hidden lg:flex w-[360px] bg-white rounded-xl border border-outline-variant custom-shadow self-start items-center justify-center flex-col gap-sm p-xl text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant">fact_check</span>
                <p className="font-semibold text-[15px]">Select a request</p>
                <p className="text-[13px] text-on-surface-variant">
                  {isManager ? 'Click any pending request to review details and make your decision.' : 'Click any request to see full details.'}
                </p>
              </aside>
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

export default ApprovalWorkflow;

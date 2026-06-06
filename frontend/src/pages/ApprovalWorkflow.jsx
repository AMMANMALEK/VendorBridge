import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Layout from '../components/Layout';

const STAGES = ['Submitted', 'Under Review', 'Decision Made', 'PO Generated'];

const Stepper = ({ approval }) => {
  const stageIndex =
    approval.status === 'Pending'          ? 1 :
    approval.status === 'Action Required'  ? 1 :
    approval.status === 'Approved'         ? (approval.type === 'Purchase Order' ? 3 : 2) :
    approval.status === 'Rejected'         ? 2 : 0;

  return (
    <div className="flex items-center w-full">
      {STAGES.map((label, i) => {
        const done   = i < stageIndex;
        const active = i === stageIndex;
        const failed = (approval.status === 'Rejected' || approval.status === 'Action Required') && i === 2;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all ${
                failed  ? 'bg-red-500 border-red-500 text-white' :
                done    ? 'bg-emerald-500 border-emerald-500 text-white' :
                active  ? 'bg-indigo-500 border-indigo-500 text-white' :
                          'bg-white border-slate-200 text-slate-400'
              }`}>
                {failed ? '✕' : done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                failed ? 'text-red-500' : active ? 'text-indigo-600' : done ? 'text-emerald-600' : 'text-slate-400'
              }`}>{label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const MAP = {
    'Pending':         { cls: 'bg-amber-100 text-amber-700 border-amber-200',   label: 'Pending Review' },
    'Approved':        { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Approved' },
    'Rejected':        { cls: 'bg-red-100 text-red-700 border-red-200',         label: 'Rejected' },
    'Action Required': { cls: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Returned — Action Required' },
  };
  const cfg = MAP[status] || { cls: 'bg-slate-100 text-slate-600 border-slate-200', label: status };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const ApprovalWorkflow = () => {
  const { approvals, quotations, vendors, approveApproval, rejectApproval, dismissReturnNotif, user } = useAppState();
  const navigate  = useNavigate();
  const role      = user?.role || 'officer';
  const isManager = role === 'manager';
  const isOfficer = role === 'officer';

  const [activeTab,  setActiveTab]  = useState('Pending');
  const [selected,   setSelected]   = useState(null);
  const [remark,     setRemark]     = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const TABS = isOfficer
    ? ['Action Required', 'Pending', 'Approved', 'Rejected']
    : ['Pending', 'Approved', 'Rejected'];

  const returnedItems  = approvals.filter(a => a.status === 'Action Required' && a.type === 'Returned to Officer');
  const pendingCount   = approvals.filter(a => a.status === 'Pending').length;
  const returnedCount  = returnedItems.length;

  const filtered = approvals.filter(a => {
    if (activeTab === 'Action Required') return a.status === 'Action Required' && a.type === 'Returned to Officer';
    if (activeTab === 'Pending')         return a.status === 'Pending';
    if (activeTab === 'Approved')        return a.status === 'Approved';
    if (activeTab === 'Rejected')        return a.status === 'Rejected';
    return false;
  });

  const relatedQuote = selected ? quotations.find(q => q.id === selected.sourceId) : null;
  const vendorInfo   = selected ? vendors.find(v =>
    v.name === (selected.title || '').split(' - ')[0] ||
    v.name === (selected.title || '').split(' PO')[0]
  ) : null;

  const handleSelect  = (app) => { setSelected(app); setRemark(''); setRejectMode(false); };

  const handleApprove = () => {
    if (!selected) return;
    if (!remark.trim()) { showToast('Add an approval remark before approving.', 'warn'); return; }
    approveApproval(selected.id, remark.trim());
    showToast('Request approved — PO workflow initiated.', 'success');
    setSelected(null); setRemark('');
  };

  const handleReject = () => {
    if (!selected) return;
    if (!remark.trim()) { showToast('Enter a rejection reason.', 'warn'); return; }
    rejectApproval(selected.id, remark.trim());
    showToast('Request rejected and returned to the Procurement Officer.', 'error');
    setSelected(null); setRemark(''); setRejectMode(false);
  };

  const handleDismiss = (id) => {
    dismissReturnNotif(id);
    setSelected(null);
    showToast('Notification dismissed.');
  };

  const tabCount = (tab) => {
    if (tab === 'Action Required') return returnedCount;
    if (tab === 'Pending')         return pendingCount;
    if (tab === 'Approved')        return approvals.filter(a => a.status === 'Approved').length;
    if (tab === 'Rejected')        return approvals.filter(a => a.status === 'Rejected').length;
    return 0;
  };

  const tabActiveClass = (tab) => {
    if (tab === 'Action Required') return 'text-orange-600 bg-orange-50';
    if (tab === 'Approved')        return 'text-emerald-600 bg-emerald-50';
    if (tab === 'Rejected')        return 'text-red-600 bg-red-50';
    return 'text-indigo-600 bg-indigo-50';
  };

  const tabUnderlineClass = (tab) => {
    if (tab === 'Action Required') return 'bg-orange-500';
    if (tab === 'Approved')        return 'bg-emerald-500';
    if (tab === 'Rejected')        return 'bg-red-500';
    return 'bg-indigo-500';
  };

  const badgeClass = (tab) => {
    if (tab === 'Action Required') return 'bg-orange-500 text-white';
    if (tab === 'Pending')         return 'bg-red-500 text-white';
    return 'bg-slate-200 text-slate-600';
  };

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <div className="flex-1 ml-[240px] pt-14 min-h-screen flex flex-col">
        <Header title="Approval Workflow" />

        <main className="p-xl max-w-7xl w-full mx-auto flex-1 flex flex-col gap-lg animate-fade-in">

          {/* Manager context banner */}
          {isManager && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-lg py-md flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-[14px] text-green-800">Manager Approval Workspace</p>
                  <p className="text-[12px] text-green-700">Review procurement requests, check details, then approve or reject with a remark.</p>
                </div>
=======
    <Layout title="Approval Workflow">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* Manager banner */}
        {isManager && (
          <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 22 }}>verified_user</span>
              </div>
              <div>
                <p className="font-bold text-[14px] text-emerald-800">Manager Approval Workspace</p>
                <p className="text-[12px] text-emerald-700">Approving creates a PO. Rejecting returns the request to the Officer with your reason.</p>
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
              </div>
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[13px] font-bold px-3 py-1 rounded-full flex-shrink-0">
                {pendingCount} pending
              </span>
            )}
          </div>
        )}

        {/* Officer returned banner */}
        {isOfficer && returnedCount > 0 && (
          <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-orange-50 border border-orange-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-orange-600" style={{ fontSize: 22 }}>assignment_return</span>
              </div>
              <div>
                <p className="font-bold text-[14px] text-orange-800">
                  {returnedCount} request{returnedCount > 1 ? 's' : ''} returned for your revision
                </p>
                <p className="text-[12px] text-orange-700">
                  The Manager sent back {returnedCount === 1 ? 'a request' : 'requests'} with feedback. Review it and resubmit from Quotation Comparison.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('Action Required')}
              className="flex-shrink-0 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              View Returns
            </button>
          </div>
        )}

        {/* Officer monitor banner */}
        {isOfficer && returnedCount === 0 && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-50 border border-blue-200">
            <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 18 }}>info</span>
            <p className="text-[13px] text-blue-800 font-medium">Monitor view — track the status of your submitted approval requests.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const count    = tabCount(tab);
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelected(null); }}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-t-lg whitespace-nowrap transition-all ${
                  isActive ? tabActiveClass(tab) : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${badgeClass(tab)}`}>
                    {count}
                  </span>
                )}
                {isActive && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t ${tabUnderlineClass(tab)}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* List */}
          <div className="flex-1 space-y-3">
            {filtered.length === 0 ? (
              <div className="card p-12 text-center">
                <span className="material-symbols-outlined text-slate-300 block mb-3" style={{ fontSize: 48 }}>task_alt</span>
                <p className="font-semibold text-[16px] text-slate-600">
                  {activeTab === 'Pending'          ? 'All caught up!' :
                   activeTab === 'Action Required'  ? 'No returns yet' :
                   `No ${activeTab.toLowerCase()} requests`}
                </p>
                <p className="text-[13px] text-slate-400 mt-1">
                  {activeTab === 'Pending' && isManager ? 'No requests waiting for your decision.' : ''}
                  {activeTab === 'Action Required' ? 'The manager has not returned any requests yet.' : ''}
                </p>
              </div>
            ) : filtered.map(app => (
              app.type === 'Returned to Officer' ? (
                /* ── Returned card ── */
                <div
                  key={app.id}
                  onClick={() => handleSelect(app)}
                  className={`card p-5 cursor-pointer transition-all border-l-4 border-orange-400 ${selected?.id === app.id ? 'ring-2 ring-orange-300' : 'hover:shadow-md'}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-orange-600" style={{ fontSize: 17 }}>assignment_return</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">Returned to Officer</p>
                        <p className="text-[11px] text-slate-400 font-mono">{app.id}</p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <h4 className="font-bold text-[15px] text-slate-800 mb-2">{app.rfqTitle || app.title}</h4>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200 mb-3">
                    <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>cancel</span>
                    <div>
                      <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide mb-0.5">Manager's Rejection Reason</p>
                      <p className="text-[13px] text-red-800 italic">"{app.rejectionRemark}"</p>
                      {app.rejectedBy && <p className="text-[11px] text-red-400 mt-1">— {app.rejectedBy}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Amount</p>
                      <p className="font-bold text-[18px] text-indigo-600">₹{app.amount?.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); navigate('/quotation-comparison'); }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>compare_arrows</span>
                      Go to Comparison
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Normal approval card ── */
                <div
                  key={app.id}
                  onClick={() => handleSelect(app)}
                  className={`card p-5 cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md ${selected?.id === app.id ? 'ring-2 ring-indigo-200 border-indigo-400' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        app.type === 'Purchase Order' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>{app.type}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{app.id}</span>
                      {app.isResubmission && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700">Resubmission</span>
                      )}
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <h4 className="font-bold text-[15px] text-slate-800 mb-2">{app.title}</h4>
                  <div className="flex flex-wrap gap-4 text-[12px] text-slate-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>{app.requester}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>{app.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>tag</span>{app.sourceId}
                    </span>
                  </div>
                  <Stepper approval={app} />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Amount</p>
                      <p className="font-bold text-[20px] text-indigo-600">₹{app.amount?.toLocaleString()}</p>
                    </div>
                    {app.remark && (
                      <div className="max-w-xs text-right">
                        <p className="text-[11px] text-slate-400 uppercase font-semibold">
                          {app.status === 'Rejected' ? 'Rejection Reason' : 'Approval Remark'}
                        </p>
                        <p className="text-[12px] text-slate-700 italic">"{app.remark}"</p>
                        {app.decidedBy && <p className="text-[11px] text-slate-400 mt-0.5">— {app.decidedBy}</p>}
                      </div>
                    )}
                    {app.status === 'Pending' && isManager && (
                      <span className="text-[12px] text-indigo-600 font-semibold">Click to review →</span>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <aside className="w-full lg:w-[360px] card self-start animate-scale-in overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[15px] text-slate-800">
                    {selected.type === 'Returned to Officer' ? 'Return Details' : 'Request Details'}
                  </h3>
                  <div className="mt-1"><StatusBadge status={selected.status} /></div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

                {/* Returned detail */}
                {selected.type === 'Returned to Officer' && (
                  <>
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-red-500" style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}>cancel</span>
                        <p className="font-bold text-[13px] text-red-700">Manager Rejected This Request</p>
                      </div>
                      <p className="text-[13px] text-red-800 italic mb-2">"{selected.rejectionRemark}"</p>
                      <p className="text-[11px] text-red-400">By {selected.rejectedBy} on {selected.date}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Next Steps</p>
                      {[
                        { n: 1, text: 'Go to Quotation Comparison', icon: 'compare_arrows' },
                        { n: 2, text: 'Select a vendor based on the feedback', icon: 'edit_note' },
                        { n: 3, text: 'Click "Resubmit for Approval"', icon: 'send' },
                      ].map(s => (
                        <div key={s.n} className="flex items-center gap-3 py-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[11px] font-bold flex-shrink-0">{s.n}</div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 14 }}>{s.icon}</span>
                            <p className="text-[13px] text-slate-600">{s.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => { handleDismiss(selected.id); navigate('/quotation-comparison'); }}
                        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white font-bold text-[14px] transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 4px 14px rgba(79,70,229,.35)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>compare_arrows</span>
                        Go to Quotation Comparison
                      </button>
                      <button
                        onClick={() => handleDismiss(selected.id)}
                        className="w-full h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 font-semibold text-[13px] hover:bg-slate-50 transition-all"
                      >
                        Dismiss Notification
                      </button>
                    </div>
                  </>
                )}

                {/* Normal detail */}
                {selected.type !== 'Returned to Officer' && (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-[13px]">
                      {[
                        ['Type', <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${selected.type === 'Purchase Order' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{selected.type}</span>],
                        ['Request', <span className="font-semibold text-right max-w-[180px] leading-tight block">{selected.title}</span>],
                        ['Raised by', selected.requester],
                        ['Date', selected.date],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center">
                          <span className="text-slate-400 font-semibold uppercase text-[11px] flex-shrink-0">{k}</span>
                          <span className="text-right ml-2">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl p-4 text-center border border-indigo-200 bg-indigo-50">
                      <p className="text-[11px] text-indigo-500 uppercase font-bold mb-1">Grand Total</p>
                      <p className="font-black text-[28px] text-indigo-700">₹{selected.amount?.toLocaleString()}</p>
                    </div>

                    {vendorInfo && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-[13px]">
                        <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Vendor</p>
                        {[['Name', vendorInfo.name], ['Category', vendorInfo.category], ['Rating', `${vendorInfo.rating} / 5.0`], ['Location', vendorInfo.address]].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-400">{k}</span>
                            <span className="font-semibold">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {relatedQuote && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-[13px]">
                        <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Quotation</p>
                        {[['Delivery', `${relatedQuote.deliveryDays} days`], ['Payment', relatedQuote.terms], ['Submitted', relatedQuote.submittedDate]].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-400">{k}</span>
                            <span className="font-semibold">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selected.status !== 'Pending' && selected.remark && (
                      <div className={`rounded-xl p-4 border ${selected.status === 'Approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-[11px] font-bold uppercase mb-1 text-slate-400">
                          {selected.status === 'Approved' ? 'Approval Remark' : 'Rejection Reason'}
                        </p>
                        <p className="text-[13px] italic font-medium">"{selected.remark}"</p>
                        {selected.decidedBy && <p className="text-[11px] text-slate-400 mt-1">— {selected.decidedBy}</p>}
                      </div>
                    )}

                    {/* Manager decision */}
                    {isManager && selected.status === 'Pending' && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                          {rejectMode ? 'Rejection Reason *' : 'Approval Remark *'}
                        </label>
                        <textarea
                          rows={3}
                          className={`w-full p-3 border rounded-xl text-[13px] resize-none outline-none transition-all ${
                            rejectMode
                              ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200'
                              : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white'
                          }`}
                          placeholder={rejectMode
                            ? 'Explain why this is being rejected and what the officer should change…'
                            : 'Add your approval remark (required)…'}
                          value={remark}
                          onChange={e => setRemark(e.target.value)}
                        />
                        <p className="text-[11px] text-slate-400">Recorded in the audit log and visible to the officer.</p>

                        {!rejectMode ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={handleApprove}
                              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                              Approve Request
                            </button>
                            <button
                              onClick={() => setRejectMode(true)}
                              className="w-full h-10 border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span>
                              Reject & Return to Officer
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-[12px] text-orange-700">
                              <span className="material-symbols-outlined text-orange-500 flex-shrink-0" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>warning</span>
                              Rejecting returns this to the Procurement Officer. They must revise and resubmit.
                            </div>
                            <button
                              onClick={handleReject}
                              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>assignment_return</span>
                              Confirm Rejection & Return
                            </button>
                            <button
                              onClick={() => { setRejectMode(false); setRemark(''); }}
                              className="w-full h-9 border border-slate-200 text-slate-500 rounded-xl font-semibold text-[13px] hover:bg-slate-50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Officer pending info */}
                    {isOfficer && selected.status === 'Pending' && (
                      <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-center">
                        <span className="material-symbols-outlined text-indigo-400 block mb-1" style={{ fontSize: 28 }}>hourglass_top</span>
                        <p className="text-[13px] font-semibold text-indigo-700">Awaiting Manager Decision</p>
                        <p className="text-[12px] text-indigo-500 mt-1">The assigned Manager will review and decide.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </aside>
          )}

          {/* Empty state */}
          {!selected && filtered.length > 0 && (
            <aside className="hidden lg:flex w-[360px] card self-start items-center justify-center flex-col gap-3 p-10 text-center min-h-[200px]">
              <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 44 }}>fact_check</span>
              <p className="font-bold text-[15px] text-slate-600">Select a request</p>
              <p className="text-[13px] text-slate-400">
                {isManager ? 'Click any pending request to review and decide.' : 'Click any request to see full details.'}
              </p>
            </aside>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-[13px] font-semibold shadow-xl z-50 animate-fade-in flex items-center gap-2 whitespace-nowrap ${
          toast.type === 'success' ? 'bg-emerald-700 text-white' :
          toast.type === 'error'   ? 'bg-red-600 text-white' :
          toast.type === 'warn'    ? 'bg-amber-500 text-white' :
                                     'bg-slate-800 text-white'
        }`}>
          <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'cancel' : toast.type === 'warn' ? 'warning' : 'info'}
          </span>
          {toast.msg}
        </div>
      )}
    </Layout>
  );
};

export default ApprovalWorkflow;

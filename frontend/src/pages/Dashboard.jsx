import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Layout from '../components/Layout';

const StatusBadge = ({ status }) => {
  const MAP = {
    'Approved':         { cls: 'badge badge-approved', icon: 'check_circle' },
    'Pending Approval': { cls: 'badge badge-pending',  icon: 'schedule' },
    'Pending':          { cls: 'badge badge-pending',  icon: 'schedule' },
    'Draft':            { cls: 'badge badge-draft',    icon: 'edit_note' },
    'Rejected':         { cls: 'badge badge-rejected', icon: 'cancel' },
  };
  const cfg = MAP[status] || { cls: 'badge badge-draft', icon: 'info' };
  return (
    <span className={cfg.cls}>
      <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
      {status}
    </span>
  );
};

const KPICard = ({ label, value, sub, subColor = '#6366F1', icon, iconBg, iconColor, onClick, alert }) => (
  <div
    className={`card p-5 flex items-start justify-between ${onClick ? 'cursor-pointer hover:border-indigo-300 transition-all hover:shadow-md' : ''}`}
    onClick={onClick}
  >
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <h3 className={`font-bold text-[30px] leading-none mb-1.5 ${alert ? 'text-red-500' : 'text-slate-800'}`}>{value}</h3>
      {sub && (
        <p className="text-[12px] font-medium flex items-center gap-1" style={{ color: subColor }}>
          {sub}
        </p>
      )}
    </div>
    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ml-3"
      style={{ background: iconBg }}>
      <span className="material-symbols-outlined" style={{ fontSize: 22, color: iconColor }}>{icon}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { rfqs, approvals, pos, invoices, vendors, registeredUsers, user } = useAppState();
  const navigate = useNavigate();

  const role = user?.role || 'officer';

  const activeRFQsCount       = rfqs.filter(r => r.status === 'Open').length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const returnedToOfficerCount = approvals.filter(a => a.status === 'Action Required' && a.type === 'Returned to Officer').length;
  const totalSpend            = pos.filter(p => p.status === 'Approved').reduce((s, p) => s + p.amount, 0);
  const formattedSpend        = totalSpend >= 100000
    ? `₹${(totalSpend / 100000).toFixed(1)}L`
    : `₹${totalSpend.toLocaleString()}`;
  const overdueInvoicesCount  = invoices.filter(i => i.status === 'Overdue').length;
  const pendingVendors        = vendors.filter(v => v.status === 'Pending');
  const totalUsers            = registeredUsers.length;
  const recentPOs             = pos.slice(-5).reverse();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const ROLE_DESCS = {
    admin:   'Full organization overview — users, RFQs, approvals, and spend.',
    officer: "Here's your procurement pipeline status for today.",
    manager: 'Approvals dashboard — pending sign-offs and procurement review.',
  };

  const CHART_BARS = [
    { month: 'Jan', pct: 60 }, { month: 'Feb', pct: 45 },
    { month: 'Mar', pct: 85 }, { month: 'Apr', pct: 70 },
    { month: 'May', pct: 95 }, { month: 'Jun', pct: 75 },
  ];

  return (
    <Layout title="Dashboard">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* ── Welcome ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-slate-800 font-bold text-[24px] leading-tight">
              {greeting()}, {user?.name?.split(' ')[0] || 'User'}
            </h2>
            <p className="text-slate-500 text-[14px] mt-1">{ROLE_DESCS[role]}</p>
          </div>
          <p className="text-[13px] text-slate-400 whitespace-nowrap hidden md:block">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label={role === 'admin' ? 'Total Users' : 'Active RFQs'}
            value={role === 'admin' ? totalUsers : activeRFQsCount}
            sub={role === 'admin' ? 'Registered accounts' : 'Live requests'}
            icon={role === 'admin' ? 'group' : 'request_quote'}
            iconBg="#EEF2FF" iconColor="#6366F1"
          />
          <KPICard
            label={role === 'admin' ? 'Pending Vendors' : 'Pending Approvals'}
            value={role === 'admin' ? pendingVendors.length : pendingApprovalsCount}
            sub="Awaiting action"
            subColor="#D97706"
            icon={role === 'admin' ? 'storefront' : 'task_alt'}
            iconBg="#FEF3C7" iconColor="#D97706"
            onClick={() => navigate(role === 'admin' ? '/vendors' : '/approvals')}
          />
          <KPICard
            label="Approved PO Spend"
            value={formattedSpend}
            sub="Total committed spend"
            icon="receipt_long"
            iconBg="#ECFDF5" iconColor="#059669"
          />
          <KPICard
            label="Overdue Invoices"
            value={overdueInvoicesCount}
            sub="Needs immediate attention"
            subColor="#EF4444"
            icon="warning"
            iconBg="#FEE2E2" iconColor="#EF4444"
            onClick={() => navigate('/purchase-orders')}
            alert={overdueInvoicesCount > 0}
          />
        </div>

        {/* ── Returned-to-Officer urgent banner ── */}
        {role === 'officer' && returnedToOfficerCount > 0 && (
          <div
            className="flex items-center justify-between px-5 py-4 rounded-2xl bg-orange-50 border-2 border-orange-300 cursor-pointer hover:bg-orange-100 transition-colors"
            onClick={() => navigate('/approvals')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-orange-600" style={{ fontSize: 22 }}>assignment_return</span>
              </div>
              <div>
                <p className="font-bold text-[14px] text-orange-800">
                  {returnedToOfficerCount} request{returnedToOfficerCount > 1 ? 's' : ''} returned for your revision
                </p>
                <p className="text-[12px] text-orange-600">The Manager rejected and returned {returnedToOfficerCount === 1 ? 'a request' : 'requests'} with feedback. Go to Approvals to read the reason, then resubmit from Quotation Comparison.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="bg-orange-500 text-white text-[12px] font-bold px-3 py-1 rounded-full">{returnedToOfficerCount} action{returnedToOfficerCount > 1 ? 's' : ''}</span>
              <span className="material-symbols-outlined text-orange-500" style={{ fontSize: 20 }}>arrow_forward</span>
            </div>
          </div>
        )}

        {/* ── Mid row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
          {/* Recent POs */}
          <div className="lg:col-span-6 card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-[15px]">Recent Purchase Orders</h3>
                <p className="text-slate-400 text-[12px] mt-0.5">{recentPOs.length} most recent</p>
              </div>
              <button
                onClick={() => navigate('/purchase-orders')}
                className="text-indigo-600 text-[13px] font-semibold hover:underline flex items-center gap-1"
              >
                View all
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPOs.map(po => (
                    <tr
                      key={po.id}
                      className="cursor-pointer"
                      onClick={() => navigate('/purchase-orders')}
                    >
                      <td><span className="font-mono text-[12px] font-semibold text-slate-500">{po.id}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 14 }}>business</span>
                          </div>
                          <span className="font-medium text-slate-700 text-[13px]">{po.vendorName}</span>
                        </div>
                      </td>
                      <td><span className="font-semibold text-slate-800">₹{po.amount?.toLocaleString()}</span></td>
                      <td><StatusBadge status={po.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Spending Trend */}
          <div className="lg:col-span-4 card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800 text-[15px]">Spending Trend</h3>
                <p className="text-slate-400 text-[12px] mt-0.5">Last 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[11px] font-semibold text-indigo-600">2026</span>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-2 pb-2" style={{ minHeight: 140 }}>
              {CHART_BARS.map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{
                      height: `${bar.pct * 1.4}px`,
                      background: i === CHART_BARS.length - 1
                        ? 'linear-gradient(180deg, #6366F1, #4F46E5)'
                        : '#E8EDF5',
                    }}
                  />
                  <span className={`text-[11px] font-medium ${i === CHART_BARS.length - 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <span className="text-[12px] text-slate-400">Peak: May 2026</span>
              <span className="text-[12px] font-semibold text-indigo-600">+12% vs last month</span>
            </div>
          </div>
        </div>

        {/* ── Alerts (admin) ── */}
        {role === 'admin' && (pendingVendors.length > 0 || overdueInvoicesCount > 0 || pendingApprovalsCount > 0) && (
          <div className="card p-5 border-l-4 border-amber-400">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 20 }}>notifications_active</span>
              <h3 className="font-bold text-slate-800 text-[15px]">Action Required</h3>
            </div>
            <div className="space-y-2">
              {pendingVendors.length > 0 && (
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => navigate('/vendors')}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 18 }}>storefront</span>
                    <span className="text-[13px] font-medium text-slate-700">
                      {pendingVendors.length} vendor{pendingVendors.length > 1 ? 's' : ''} awaiting your approval
                    </span>
                  </div>
                  <span className="text-indigo-600 text-[12px] font-semibold">Review</span>
                </div>
              )}
              {overdueInvoicesCount > 0 && (
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => navigate('/purchase-orders')}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500" style={{ fontSize: 18 }}>receipt_long</span>
                    <span className="text-[13px] font-medium text-slate-700">
                      {overdueInvoicesCount} overdue invoice{overdueInvoicesCount > 1 ? 's' : ''} need attention
                    </span>
                  </div>
                  <span className="text-indigo-600 text-[12px] font-semibold">Review</span>
                </div>
              )}
              {pendingApprovalsCount > 0 && (
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => navigate('/approvals')}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 18 }}>task_alt</span>
                    <span className="text-[13px] font-medium text-slate-700">
                      {pendingApprovalsCount} approval{pendingApprovalsCount > 1 ? 's' : ''} waiting for sign-off
                    </span>
                  </div>
                  <span className="text-indigo-600 text-[12px] font-semibold">Review</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div>
          <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {role === 'admin' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-4 p-4 rounded-2xl text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] text-left"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>manage_accounts</span>
                </div>
                <div>
                  <p className="font-bold text-[15px]">User Management</p>
                  <p className="text-white/65 text-[12px] mt-0.5">Manage roles, access, passwords</p>
                </div>
              </button>
            )}
            {role === 'officer' && (
              <button
                onClick={() => navigate('/create-rfq')}
                className="flex items-center gap-4 p-4 rounded-2xl text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] text-left"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>add_circle</span>
                </div>
                <div>
                  <p className="font-bold text-[15px]">Create New RFQ</p>
                  <p className="text-white/65 text-[12px] mt-0.5">Send request for quotations</p>
                </div>
              </button>
            )}
            {role === 'manager' && (
              <button
                onClick={() => navigate('/approvals')}
                className="flex items-center gap-4 p-4 rounded-2xl text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] text-left"
                style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>task_alt</span>
                </div>
                <div>
                  <p className="font-bold text-[15px]">Review Approvals</p>
                  <p className="text-white/65 text-[12px] mt-0.5">{pendingApprovalsCount} pending sign-offs</p>
                </div>
              </button>
            )}

            <button
              onClick={() => navigate('/vendors')}
              className="flex items-center gap-4 p-4 card hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.98] text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 24 }}>storefront</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-[15px]">Vendor Directory</p>
                <p className="text-slate-400 text-[12px] mt-0.5">
                  {role === 'admin' ? `${pendingVendors.length} pending approval` : role === 'manager' ? 'View vendor profiles' : 'Onboard new partner'}
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/purchase-orders')}
              className="flex items-center gap-4 p-4 card hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.98] text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 24 }}>receipt_long</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-[15px]">
                  {role === 'admin' ? 'All POs & Invoices' : 'Purchase Orders'}
                </p>
                <p className="text-slate-400 text-[12px] mt-0.5">Review billing and payments</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* FAB — officer only */}
      {role === 'officer' && (
        <button
          onClick={() => navigate('/create-rfq')}
          className="fixed bottom-7 right-7 w-14 h-14 rounded-full text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-30 group"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)', boxShadow: '0 6px 24px rgba(79,70,229,0.45)' }}
          title="Create new RFQ"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 26 }}>add</span>
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-800 text-white text-[12px] rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-lg">
            Create RFQ
          </span>
        </button>
      )}
    </Layout>
  );
};

export default Dashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
  const { rfqs, approvals, pos, invoices, vendors, registeredUsers, user } = useAppState();
  const navigate = useNavigate();

  // Dynamic calculations
  const activeRFQsCount = rfqs.filter(r => r.status === 'Open').length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  
  const totalSpend = pos
    .filter(p => p.status === 'Approved')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const formattedSpend = totalSpend >= 100000 
    ? `₹${(totalSpend / 100000).toFixed(1)}L` 
    : `₹${totalSpend.toLocaleString()}`;

  const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;
  const pendingVendors = (vendors || []).filter(v => v.status === 'Pending');
  const totalUsers = (registeredUsers || []).length;

  // Recent POs
  const recentPOs = pos.slice(-4).reverse();

  // Helper status styling for POs
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-sm py-1 rounded-full text-xs font-semibold bg-secondary-container/30 text-on-secondary-container">Approved</span>;
      case 'Pending Approval':
      case 'Pending':
        return <span className="px-sm py-1 rounded-full text-xs font-semibold bg-tertiary-fixed/30 text-tertiary">Pending</span>;
      default:
        return <span className="px-sm py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">{status}</span>;
    }
  };

  const role = user?.role || 'officer';

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      
      <div className="flex-1 ml-sidebar_width pt-header_height min-h-screen flex flex-col">
        <Header title="Dashboard" />

        <main className="p-xl max-w-container_max_width w-full mx-auto flex-1 animate-fade-in">
          {/* Welcome Header */}
          <div className="mb-xl">
            <div className="flex items-center gap-sm mb-xs">
              <h2 className="font-h1 text-h1 text-on-surface font-bold text-[28px]">Welcome back, {user ? user.name.split(' ')[0] : 'User'} {user?.symbol}</h2>
            </div>
            <p className="text-on-surface-variant font-body-md text-[14px]">
              {role === 'admin' && 'Full organization overview — all users, RFQs, approvals, and spend.'}
              {role === 'officer' && "Here's what's happening in your procurement pipeline today."}
              {role === 'manager' && 'Approvals dashboard — review and sign off on pending procurement requests.'}
            </p>
          </div>

          {/* Top KPI Row — admin gets extra cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
            {/* Card 1 */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow flex items-start justify-between">
              <div>
                <p className="text-on-surface-variant font-label-md mb-xs text-[13px] uppercase tracking-wider">
                  {role === 'admin' ? 'Total Users' : 'Active RFQs'}
                </p>
                <h3 className="font-h1 text-h1 text-on-surface font-bold text-[28px]">
                  {role === 'admin' ? totalUsers : activeRFQsCount}
                </h3>
                <p className="text-secondary text-xs mt-xs flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  {role === 'admin' ? 'Registered accounts' : 'Live RFQs'}
                </p>
              </div>
              <div className="bg-primary-container/10 p-sm rounded-lg text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">{role === 'admin' ? 'group' : 'request_quote'}</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow flex items-start justify-between cursor-pointer hover:border-primary transition-all"
              onClick={() => navigate(role === 'admin' ? '/vendors' : '/approvals')}>
              <div>
                <p className="text-on-surface-variant font-label-md mb-xs text-[13px] uppercase tracking-wider">
                  {role === 'admin' ? 'Pending Vendors' : 'Pending Approvals'}
                </p>
                <h3 className="font-h1 text-h1 text-on-surface font-bold text-[28px]">
                  {role === 'admin' ? pendingVendors.length : pendingApprovalsCount}
                </h3>
                <p className="text-amber-600 text-xs mt-xs flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Awaiting verification
                </p>
              </div>
              <div className="bg-amber-100 p-sm rounded-lg text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined">{role === 'admin' ? 'storefront' : 'fact_check'}</span>
              </div>
            </div>

            {/* Card 3 — same for all */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow flex items-start justify-between">
              <div>
                <p className="text-on-surface-variant font-label-md mb-xs text-[13px] uppercase tracking-wider">
                  {role === 'admin' ? 'Total PO Spend' : 'POs This Month'}
                </p>
                <h3 className="font-h1 text-h1 text-on-surface font-bold text-[28px]">{formattedSpend}</h3>
                <p className="text-secondary text-xs mt-xs flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  Approved PO total
                </p>
              </div>
              <div className="bg-secondary-container/30 p-sm rounded-lg text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined">shopping_bag</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow flex items-start justify-between cursor-pointer hover:border-error transition-all"
              onClick={() => navigate('/purchase-orders')}>
              <div>
                <p className="text-on-surface-variant font-label-md mb-xs text-[13px] uppercase tracking-wider">Overdue Invoices</p>
                <h3 className="font-h1 text-h1 text-error font-bold text-[28px]">{overdueInvoicesCount}</h3>
                <p className="text-error text-xs mt-xs flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Needs immediate action
                </p>
              </div>
              <div className="bg-error-container p-sm rounded-lg text-on-error-container flex items-center justify-center">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Recent POs & Spending Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-lg mb-xl">
            {/* Recent POs Table (60%) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-outline-variant custom-shadow flex flex-col overflow-hidden">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-h3 text-h3 font-semibold text-[18px]">Recent Purchase Orders</h3>
                <button onClick={() => navigate('/purchase-orders')} className="text-primary font-label-md hover:underline text-[13px] font-semibold">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">PO#</th>
                      <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Vendor</th>
                      <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Amount</th>
                      <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {recentPOs.map(po => (
                      <tr 
                        key={po.id} 
                        className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                        onClick={() => navigate('/purchase-orders')}
                      >
                        <td className="px-lg py-md font-label-md text-[13px]">{po.id}</td>
                        <td className="px-lg py-md text-body-md text-[14px]">{po.vendorName}</td>
                        <td className="px-lg py-md text-body-md text-[14px]">₹{po.amount?.toLocaleString()}</td>
                        <td className="px-lg py-md">{getStatusBadge(po.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Spending Trends Chart (40%) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-outline-variant custom-shadow flex flex-col p-lg">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-h3 text-h3 font-semibold text-[18px]">Spending Trends</h3>
                <div className="flex gap-xs items-center">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="text-[12px] text-on-surface-variant">Last 6 Months</span>
                </div>
              </div>
              <div className="flex-1 flex items-end justify-between gap-sm pt-xl h-[160px]">
                {[
                  { month: 'Jan', val: '60%', active: false },
                  { month: 'Feb', val: '45%', active: false },
                  { month: 'Mar', val: '85%', active: false },
                  { month: 'Apr', val: '70%', active: false },
                  { month: 'May', val: '95%', active: false },
                  { month: 'Jun', val: '75%', active: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-sm flex-1">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-300 hover:scale-y-105 cursor-pointer origin-bottom ${
                        item.active ? 'bg-primary' : 'bg-surface-container-high hover:bg-primary'
                      }`}
                      style={{ height: item.val }}
                    ></div>
                    <span className={`text-xs font-label-md ${item.active ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin: Notifications + pending vendor alerts */}
          {role === 'admin' && (pendingVendors.length > 0 || overdueInvoicesCount > 0 || pendingApprovalsCount > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-lg mb-xl space-y-sm">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-amber-600">notifications_active</span>
                <h3 className="font-semibold text-[15px] text-amber-800">System Alerts</h3>
              </div>
              {pendingVendors.length > 0 && (
                <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-md py-sm cursor-pointer hover:bg-amber-50 transition-colors"
                  onClick={() => navigate('/vendors')}>
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-amber-600 text-[18px]">storefront</span>
                    <span className="text-[13px] font-medium text-on-surface">{pendingVendors.length} vendor{pendingVendors.length > 1 ? 's' : ''} awaiting verification</span>
                  </div>
                  <span className="text-primary text-[12px] font-semibold">Review →</span>
                </div>
              )}
              {overdueInvoicesCount > 0 && (
                <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-md py-sm cursor-pointer hover:bg-amber-50 transition-colors"
                  onClick={() => navigate('/purchase-orders')}>
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-error text-[18px]">receipt_long</span>
                    <span className="text-[13px] font-medium text-on-surface">{overdueInvoicesCount} overdue invoice{overdueInvoicesCount > 1 ? 's' : ''} need attention</span>
                  </div>
                  <span className="text-primary text-[12px] font-semibold">Review →</span>
                </div>
              )}
              {pendingApprovalsCount > 0 && (
                <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-md py-sm cursor-pointer hover:bg-amber-50 transition-colors"
                  onClick={() => navigate('/approvals')}>
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">fact_check</span>
                    <span className="text-[13px] font-medium text-on-surface">{pendingApprovalsCount} approval{pendingApprovalsCount > 1 ? 's' : ''} waiting for sign-off</span>
                  </div>
                  <span className="text-primary text-[12px] font-semibold">Review →</span>
                </div>
              )}
            </div>
          )}

          {/* Bottom Quick Actions — role-filtered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {role === 'admin' && (
              <button onClick={() => navigate('/admin/users')}
                className="bg-purple-600 text-white p-lg rounded-xl custom-shadow hover:opacity-90 transition-all flex items-center gap-md group text-left">
                <div className="bg-white/20 p-sm rounded-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">manage_accounts</span>
                </div>
                <div>
                  <p className="font-h3 text-h3 leading-none text-[18px] font-semibold">User Management</p>
                  <p className="text-white/70 text-body-sm mt-1 text-[12px]">Roles, access, passwords</p>
                </div>
              </button>
            )}
            {role === 'officer' && (
              <button onClick={() => navigate('/create-rfq')}
                className="bg-primary text-white p-lg rounded-xl custom-shadow hover:opacity-90 transition-all flex items-center gap-md group text-left">
                <div className="bg-white/20 p-sm rounded-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <div>
                  <p className="font-h3 text-h3 leading-none text-[18px] font-semibold">+ New RFQ</p>
                  <p className="text-white/70 text-body-sm mt-1 text-[12px]">Send request for quotations</p>
                </div>
              </button>
            )}
            {role === 'manager' && (
              <button onClick={() => navigate('/approvals')}
                className="bg-primary text-white p-lg rounded-xl custom-shadow hover:opacity-90 transition-all flex items-center gap-md group text-left">
                <div className="bg-white/20 p-sm rounded-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">fact_check</span>
                </div>
                <div>
                  <p className="font-h3 text-h3 leading-none text-[18px] font-semibold">Review Approvals</p>
                  <p className="text-white/70 text-body-sm mt-1 text-[12px]">{pendingApprovalsCount} pending sign-offs</p>
                </div>
              </button>
            )}
            <button onClick={() => navigate('/vendors')}
              className="bg-white text-on-surface p-lg rounded-xl border border-outline-variant custom-shadow hover:bg-surface-container-low transition-all flex items-center gap-md group text-left">
              <div className="bg-primary-container/10 p-sm rounded-lg text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <p className="font-h3 text-h3 leading-none text-[18px] font-semibold">Vendors</p>
                <p className="text-on-surface-variant text-body-sm mt-1 text-[12px]">
                  {role === 'admin' ? `${pendingVendors.length} pending approval` : role === 'manager' ? 'View vendor profiles' : 'Onboard new partner'}
                </p>
              </div>
            </button>
            <button onClick={() => navigate('/purchase-orders')}
              className="bg-white text-on-surface p-lg rounded-xl border border-outline-variant custom-shadow hover:bg-surface-container-low transition-all flex items-center gap-md group text-left">
              <div className="bg-secondary-container/30 p-sm rounded-lg text-on-secondary-container group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <div>
                <p className="font-h3 text-h3 leading-none text-[18px] font-semibold">
                  {role === 'admin' ? 'All POs & Invoices' : 'View Invoices'}
                </p>
                <p className="text-on-surface-variant text-body-sm mt-1 text-[12px]">Review billing status</p>
              </div>
            </button>
          </div>
        </main>

        {/* FAB — officer only */}
        {role === 'officer' && (
          <button onClick={() => navigate('/create-rfq')}
            className="fixed bottom-xl right-xl w-14 h-14 bg-primary text-white rounded-full custom-shadow flex items-center justify-center hover:scale-110 transition-all active:scale-95 group z-30 shadow-xl">
            <span className="material-symbols-outlined text-2xl">add</span>
            <div className="absolute right-full mr-md px-md py-xs bg-inverse-surface text-inverse-on-surface text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-md">
              Create RFQ
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

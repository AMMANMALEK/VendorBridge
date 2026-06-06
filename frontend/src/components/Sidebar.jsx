import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const ALL_NAV = [
  { name: 'Dashboard',            path: '/dashboard',            icon: 'dashboard',        roles: ['admin','officer','manager'] },
  { name: 'User Management',      path: '/admin/users',          icon: 'manage_accounts',  roles: ['admin'] },
  { name: 'Vendors',              path: '/vendors',              icon: 'storefront',       roles: ['admin','officer','manager'] },
  { name: 'All RFQs',             path: '/create-rfq',           icon: 'request_quote',    roles: ['admin'] },
  { name: 'Create RFQ',           path: '/create-rfq',           icon: 'request_quote',    roles: ['officer'] },
  { name: 'Submit Quotation',     path: '/submit-quotation',     icon: 'description',      roles: ['vendor'] },
  { name: 'Quotation Comparison', path: '/quotation-comparison', icon: 'compare',          roles: ['officer','manager'] },
  { name: 'Approvals',            path: '/approvals',            icon: 'fact_check',       roles: ['officer','manager'], badge: true },
  { name: 'Purchase Orders',      path: '/purchase-orders',      icon: 'shopping_cart',    roles: ['admin','officer','manager','vendor'] },
  { name: 'Reports',              path: '/reports',              icon: 'bar_chart',        roles: ['admin','officer','manager'] },
  { name: 'Activity Logs',        path: '/activity-logs',        icon: 'history',          roles: ['admin','officer','manager'] },
];

const ROLE_META = {
  admin:   { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',  dot: 'bg-purple-400' },
  officer: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',        dot: 'bg-blue-400' },
  manager: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  vendor:  { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',  dot: 'bg-orange-400' },
};

const NAV_SECTIONS = {
  admin:   [
    { label: 'Overview',    items: ['Dashboard', 'User Management'] },
    { label: 'Procurement', items: ['Vendors', 'All RFQs', 'Purchase Orders'] },
    { label: 'Analytics',   items: ['Reports', 'Activity Logs'] },
  ],
  officer: [
    { label: 'Overview',    items: ['Dashboard'] },
    { label: 'Procurement', items: ['Vendors', 'Create RFQ', 'Quotation Comparison', 'Approvals'] },
    { label: 'Finance',     items: ['Purchase Orders'] },
    { label: 'Analytics',   items: ['Reports', 'Activity Logs'] },
  ],
  manager: [
    { label: 'Overview',    items: ['Dashboard'] },
    { label: 'Review',      items: ['Vendors', 'Quotation Comparison', 'Approvals'] },
    { label: 'Finance',     items: ['Purchase Orders'] },
    { label: 'Analytics',   items: ['Reports', 'Activity Logs'] },
  ],
  vendor:  [
    { label: 'My Work',     items: ['Submit Quotation', 'Purchase Orders'] },
  ],
};

const Sidebar = () => {
  const { approvals, vendors, rejectedRFQs, user, logout } = useAppState();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const pendingVendorsCount   = vendors.filter(v => v.status === 'Pending').length;
  const rejectedRFQCount      = (rejectedRFQs || []).length;
  const role = user?.role || 'officer';

  const roleMeta    = ROLE_META[role] || ROLE_META.officer;
  const sections    = NAV_SECTIONS[role] || [];
  const allNavByName = Object.fromEntries(ALL_NAV.map(n => [n.name, n]));

  const getBadge = (name, path) => {
    if (name === 'Approvals' && pendingApprovalsCount > 0)
      return <span className="ml-auto min-w-[20px] text-center bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{pendingApprovalsCount}</span>;
    if (path === '/quotation-comparison' && role === 'officer' && rejectedRFQCount > 0)
      return <span className="ml-auto min-w-[20px] text-center bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none animate-pulse">{rejectedRFQCount}</span>;
    if (path === '/vendors' && role === 'admin' && pendingVendorsCount > 0)
      return <span className="ml-auto min-w-[20px] text-center bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{pendingVendorsCount}</span>;
    return null;
  };

  const handleLogout = () => {
    if (confirm('Sign out of VendorBridge?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen flex flex-col z-20 transition-all duration-300 ${collapsed ? 'w-[64px]' : 'w-[240px]'}`}
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>

      {/* Top: Logo + collapse toggle */}
      <div className={`flex items-center border-b border-white/5 h-16 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[16px]">hub</span>
            </div>
            <div>
              <p className="text-white font-bold text-[14px] leading-none tracking-tight">VendorBridge</p>
              <p className="text-slate-400 text-[10px] leading-none mt-0.5">Enterprise ERP</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px]">hub</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className={`text-slate-400 hover:text-white hover:bg-white/5 rounded-lg p-1 transition-all ${collapsed ? 'absolute right-[-12px] bg-slate-800 border border-white/10 shadow-lg' : ''}`}
        >
          <span className="material-symbols-outlined text-[16px]">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
      </div>

      {/* User identity chip */}
      {user && !collapsed && (
        <div className="mx-3 mt-3 mb-1 flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[14px] flex-shrink-0">
            {user.symbol || '👤'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-[12px] font-semibold truncate leading-none">{user.name}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full border ${roleMeta.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dot}`}></span>
              {user.roleLabel}
            </span>
          </div>
        </div>
      )}
      {user && collapsed && (
        <div className="flex justify-center mt-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[14px]">
            {user.symbol || '👤'}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-2 py-2">
        {sections.map(section => {
          const sectionItems = section.items.map(n => allNavByName[n]).filter(Boolean);
          return (
            <div key={section.label} className="mb-3">
              {!collapsed && (
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-1">{section.label}</p>
              )}
              <ul className="space-y-0.5">
                {sectionItems.map(item => (
                  <li key={item.path + item.name}>
                    <NavLink
                      to={item.path}
                      title={collapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg transition-all duration-150 relative group
                        ${collapsed ? 'px-0 py-2 justify-center' : 'px-3 py-2'}
                        ${isActive
                          ? 'bg-blue-600/20 text-blue-300'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !collapsed && (
                            <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue-400 rounded-r" />
                          )}
                          <span
                            className={`material-symbols-outlined flex-shrink-0 ${collapsed ? 'text-[20px]' : 'text-[18px]'}`}
                            style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {item.icon}
                          </span>
                          {!collapsed && (
                            <>
                              <span className="text-[13px] font-medium flex-1 truncate">{item.name}</span>
                              {getBadge(item.name, item.path)}
                            </>
                          )}
                          {/* Tooltip when collapsed */}
                          {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-white/10 z-50">
                              {item.name}
                              {getBadge(item.name, item.path) && <span className="ml-1 text-red-400">●</span>}
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Bottom: logout */}
      <div className={`border-t border-white/5 py-3 ${collapsed ? 'px-2' : 'px-2'}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group relative ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <span className="material-symbols-outlined text-[18px] flex-shrink-0">logout</span>
          {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-white/10 z-50">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

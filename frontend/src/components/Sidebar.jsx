<<<<<<< HEAD
import React, { useState } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const ALL_NAV = [
<<<<<<< HEAD
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
=======
  {
    section: 'Overview',
    items: [
      { name: 'Dashboard',            path: '/dashboard',            icon: 'dashboard',       roles: ['admin','officer','manager'] },
    ]
  },
  {
    section: 'Procurement',
    items: [
      { name: 'Create RFQ',           path: '/create-rfq',           icon: 'request_quote',   roles: ['officer'] },
      { name: 'All RFQs',             path: '/create-rfq',           icon: 'request_quote',   roles: ['admin'] },
      { name: 'Submit Quotation',     path: '/submit-quotation',     icon: 'description',     roles: ['vendor'] },
      { name: 'Quotation Comparison', path: '/quotation-comparison', icon: 'compare_arrows',  roles: ['officer','manager'] },
      { name: 'Approvals',            path: '/approvals',            icon: 'task_alt',        roles: ['officer','manager'], badge: 'approvals' },
      { name: 'Purchase Orders',      path: '/purchase-orders',      icon: 'receipt_long',    roles: ['admin','officer','manager','vendor'] },
    ]
  },
  {
    section: 'Management',
    items: [
      { name: 'Vendors',              path: '/vendors',              icon: 'storefront',      roles: ['admin','officer','manager'], badge: 'vendors' },
      { name: 'User Management',      path: '/admin/users',          icon: 'manage_accounts', roles: ['admin'] },
    ]
  },
  {
    section: 'Analytics',
    items: [
      { name: 'Reports',              path: '/reports',              icon: 'bar_chart_4_bars',roles: ['admin','officer','manager'] },
      { name: 'Activity Logs',        path: '/activity-logs',        icon: 'timeline',        roles: ['admin','officer','manager'] },
    ]
  }
];

const ROLE_CONFIG = {
  admin:   { label: 'Administrator',       color: 'text-purple-400',  bg: 'bg-purple-500/20',  icon: 'shield_person' },
  officer: { label: 'Procurement Officer', color: 'text-blue-400',    bg: 'bg-blue-500/20',    icon: 'badge' },
  manager: { label: 'Manager / Approver',  color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: 'verified_user' },
  vendor:  { label: 'Vendor Partner',      color: 'text-amber-400',   bg: 'bg-amber-500/20',   icon: 'business' },
};

const Sidebar = () => {
  const { approvals, vendors, user, logout } = useAppState();
  const navigate = useNavigate();
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const pendingVendorsCount   = vendors.filter(v => v.status === 'Pending').length;

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('vb_sidebar_collapsed') === 'true'
  );

  const role = user?.role || 'officer';
  const cfg  = ROLE_CONFIG[role] || ROLE_CONFIG.officer;

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    localStorage.setItem('vb_sidebar_collapsed', String(collapsed));
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [collapsed]);

  const userInitials = (user?.name || 'VB')
    .split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  const getBadge = (item) => {
    if (item.badge === 'approvals' && pendingApprovalsCount > 0) return pendingApprovalsCount;
    if (item.badge === 'vendors'   && pendingVendorsCount   > 0) return pendingVendorsCount;
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
    return null;
  };

  const handleLogout = () => {
<<<<<<< HEAD
    if (confirm('Sign out of VendorBridge?')) {
=======
    if (window.confirm('Sign out of VendorBridge?')) {
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
      logout();
      navigate('/login');
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <aside
      className="sidebar-container fixed left-0 top-0 z-20 h-screen"
      style={{ width: 'var(--sidebar-width)' }}
    >
      <div
        className="flex h-full flex-col"
        style={{
          background: 'linear-gradient(180deg, #1E1B4B 0%, #1e293b 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', minHeight: 64 }}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>hub</span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="text-white font-bold text-[15px] tracking-tight whitespace-nowrap">VendorBridge</span>
                <p className="text-white/40 text-[10px] leading-tight whitespace-nowrap">Enterprise Procurement</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(v => !v)}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 text-white/50 hover:text-white ml-1"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {collapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
            </span>
          </button>
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
        </div>

<<<<<<< HEAD
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
=======
        {/* User Card */}
        {!collapsed && user && (
          <div className="mx-3 mt-3 mb-1 rounded-xl p-3 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${cfg.bg} ${cfg.color}`}>
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-white text-[13px] font-semibold truncate">{user.name}</p>
                <p className="text-white/40 text-[11px] truncate">{user.company}</p>
              </div>
            </div>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{cfg.icon}</span>
              {cfg.label}
            </div>
          </div>
        )}

        {collapsed && user && (
          <div className="flex justify-center mt-3 mb-1">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${cfg.bg} ${cfg.color}`}
              title={user.name}>
              {userInitials}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
          {ALL_NAV.map(section => {
            const visibleItems = section.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.section} className="mb-1">
                {!collapsed && (
                  <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 py-2">
                    {section.section}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {visibleItems.map(item => {
                    const badge = getBadge(item);
                    return (
                      <li key={`${item.path}-${item.name}`}>
                        <NavLink
                          to={item.path}
                          title={collapsed ? item.name : undefined}
                          className={({ isActive }) =>
                            `relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 group ${
                              isActive
                                ? 'bg-white/12 text-white shadow-sm'
                                : 'text-white/55 hover:bg-white/7 hover:text-white/90'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-indigo-400" />
                              )}
                              <span
                                className="material-symbols-outlined flex-shrink-0 transition-colors"
                                style={{
                                  fontSize: 20,
                                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                                  color: isActive ? '#A5B4FC' : 'inherit',
                                }}
                              >
                                {item.icon}
                              </span>
                              {!collapsed && (
                                <span className={`text-[13px] font-medium flex-1 truncate transition-colors ${isActive ? 'text-white font-semibold' : ''}`}>
                                  {item.name}
                                </span>
                              )}
                              {!collapsed && badge && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                  {badge}
                                </span>
                              )}
                              {collapsed && badge && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all group"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 20 }}>logout</span>
            {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
          </button>
        </div>
>>>>>>> f5f168f131295355d059a023d5db22fba0abdab1
      </div>
    </aside>
  );
};

export default Sidebar;

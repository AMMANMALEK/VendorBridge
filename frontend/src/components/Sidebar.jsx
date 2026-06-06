import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const ALL_NAV = [
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
    return null;
  };

  const handleLogout = () => {
    if (window.confirm('Sign out of VendorBridge?')) {
      logout();
      navigate('/login');
    }
  };

  return (
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
        </div>

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
      </div>
    </aside>
  );
};

export default Sidebar;

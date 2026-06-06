import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

// Nav items with role access control
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
  { name: 'Activity Logs',        path: '/activity-logs',        icon: 'history',          roles: ['admin','officer','manager'] }
];

// Role color accents
const ROLE_COLORS = {
  admin:   'text-purple-400',
  officer: 'text-blue-400',
  manager: 'text-green-400',
  vendor:  'text-orange-400'
};

const Sidebar = () => {
  const { approvals, vendors, user } = useAppState();
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const pendingVendorsCount = vendors.filter(v => v.status === 'Pending').length;
  const role = user?.role || 'officer';

  const navItems = ALL_NAV.filter(item => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar_width bg-on-secondary-fixed flex flex-col py-lg z-20 shadow-lg border-r border-outline-variant/10 text-white">
      <div className="px-lg mb-xl">
        <h1 className="font-h2 text-h2 font-bold tracking-tight text-white">VendorBridge</h1>
        <p className="text-surface-variant/50 text-body-sm">Enterprise ERP</p>
      </div>

      {/* Role badge */}
      {user && (
        <div className="px-lg mb-md">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-white/10 ${ROLE_COLORS[role]}`}>
            {user.symbol} {user.roleLabel}
          </span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto no-scrollbar">
        <ul className="space-y-xs px-sm">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 relative group ${
                    isActive
                      ? 'text-primary-fixed bg-on-primary-fixed-variant/20 font-medium'
                      : 'text-surface-variant/70 hover:text-white hover:bg-on-primary-fixed-variant/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r"></div>
                    )}
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-label-md text-[13px]">{item.name}</span>
                    {item.badge && pendingApprovalsCount > 0 && (
                      <span className="ml-auto bg-error text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {pendingApprovalsCount}
                      </span>
                    )}
                    {item.path === '/vendors' && role === 'admin' && pendingVendorsCount > 0 && (
                      <span className="ml-auto bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {pendingVendorsCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto px-sm pt-lg border-t border-outline-variant/10 space-y-xs">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 ${
              isActive
                ? 'text-primary-fixed bg-on-primary-fixed-variant/20'
                : 'text-surface-variant/70 hover:text-white hover:bg-on-primary-fixed-variant/10'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
          <span className="font-label-md text-[13px]">Profile</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 ${
              isActive
                ? 'text-primary-fixed bg-on-primary-fixed-variant/20'
                : 'text-surface-variant/70 hover:text-white hover:bg-on-primary-fixed-variant/10'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="font-label-md text-[13px]">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;

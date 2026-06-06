import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const Header = ({ title, onToggleSidebar }) => {
  const { user, logout, approvals } = useAppState();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [notifOpen,    setNotifOpen]      = useState(false);
  const pendingApprovals = approvals.filter(a => a.status === 'Pending');

  const handleLogout = () => {
    setDropdownOpen(false);
    if (window.confirm('Sign out of VendorBridge?')) {
      logout();
      navigate('/login');
    }
  };

  const role = user?.role || 'officer';
  const ROLE_CONFIG = {
    admin:   { label: 'Administrator',       color: '#7C3AED', bg: '#EDE9FE' },
    officer: { label: 'Procurement Officer', color: '#2563EB', bg: '#DBEAFE' },
    manager: { label: 'Manager',             color: '#059669', bg: '#D1FAE5' },
    vendor:  { label: 'Vendor',              color: '#D97706', bg: '#FEF3C7' },
  };
  const rCfg = ROLE_CONFIG[role] || ROLE_CONFIG.officer;

  const userInitials = (user?.name || 'VB')
    .split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header
      className="app-header-shell fixed top-0 z-10 flex items-center justify-between bg-white px-5"
      style={{
        height: 64,
        borderBottom: '1px solid #E8EDF5',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left — toggle + title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="h-5 w-px bg-slate-200 flex-shrink-0" />

        {/* Breadcrumb / Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-slate-400 text-sm font-medium hidden sm:block">VendorBridge</span>
          <span className="text-slate-300 hidden sm:block">/</span>
          <h2 className="text-slate-800 font-semibold text-[15px] truncate">{title}</h2>
        </div>

        {/* Search */}
        <div className="relative ml-4 hidden md:flex flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }}>search</span>
          <input
            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="Search vendors, orders, RFQs…"
            type="text"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setDropdownOpen(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
            {pendingApprovals.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h4 className="font-semibold text-[14px] text-slate-800">Notifications</h4>
                  {pendingApprovals.length > 0 && (
                    <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {pendingApprovals.length} pending
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {pendingApprovals.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2" style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>notifications_none</span>
                      <p className="text-[13px]">All caught up</p>
                    </div>
                  ) : (
                    pendingApprovals.slice(0, 5).map(a => (
                      <div
                        key={a.id}
                        className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors"
                        onClick={() => { navigate('/approvals'); setNotifOpen(false); }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 16 }}>task_alt</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 truncate">{a.type}</p>
                            <p className="text-[12px] text-slate-500 truncate">{a.title}</p>
                            <p className="text-[11px] text-indigo-600 mt-0.5 font-medium">₹{a.amount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {pendingApprovals.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-slate-100">
                    <button
                      className="text-indigo-600 text-[12px] font-semibold hover:underline"
                      onClick={() => { navigate('/approvals'); setNotifOpen(false); }}
                    >
                      View all approvals →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>settings</span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* User profile */}
        <div className="relative">
          <button
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            onClick={() => { setDropdownOpen(v => !v); setNotifOpen(false); }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0"
              style={{ background: rCfg.bg, color: rCfg.color }}>
              {userInitials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{rCfg.label}</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 hidden sm:block" style={{ fontSize: 16 }}>
              {dropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-scale-in">
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[12px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                  <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                    style={{ background: rCfg.bg, color: rCfg.color }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>verified</span>
                    {rCfg.label}
                  </span>
                </div>

                <div className="py-1.5">
                  <button className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>person</span>
                    My Profile
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>settings</span>
                    Preferences
                  </button>
                </div>

                <div className="border-t border-slate-100 py-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-red-400" style={{ fontSize: 18 }}>logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

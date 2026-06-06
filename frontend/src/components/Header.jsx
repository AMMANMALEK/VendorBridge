import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const ROLE_COLORS = {
  admin:   'bg-purple-100 text-purple-700',
  officer: 'bg-blue-100 text-blue-700',
  manager: 'bg-emerald-100 text-emerald-700',
  vendor:  'bg-orange-100 text-orange-700',
};

const Header = ({ title }) => {
  const { user, logout, approvals, rejectedRFQs } = useAppState();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);

  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const role = user?.role || 'officer';
  const totalAlerts = pendingApprovals.length + (rejectedRFQs?.length || 0);

  const handleLogout = () => {
    if (confirm('Sign out of VendorBridge?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-0 right-0 h-14 z-10 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      style={{ left: '240px', width: 'calc(100% - 240px)' }}>

      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-semibold text-slate-800 hidden sm:block">{title}</h2>
      </div>

      {/* Center: search */}
      <div className="flex-1 max-w-sm mx-6 hidden md:block">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
          <input
            className="w-full h-8 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            placeholder="Search vendors, orders, RFQs…"
            type="text"
          />
        </div>
      </div>

      {/* Right: actions + profile */}
      <div className="flex items-center gap-1">

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setDropdownOpen(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <p className="font-semibold text-[13px] text-slate-800">Notifications</p>
                  {totalAlerts > 0 && (
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{totalAlerts} new</span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {totalAlerts === 0 ? (
                    <div className="flex flex-col items-center py-8 text-slate-400">
                      <span className="material-symbols-outlined text-[36px] mb-2">notifications_none</span>
                      <p className="text-[13px]">All caught up!</p>
                    </div>
                  ) : (
                    <>
                      {pendingApprovals.slice(0, 3).map(a => (
                        <button key={a.id}
                          onClick={() => { navigate('/approvals'); setNotifOpen(false); }}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                          <div className="w-7 h-7 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">fact_check</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-slate-800 truncate">{a.type}</p>
                            <p className="text-[11px] text-slate-500 truncate">{a.title}</p>
                            <p className="text-[11px] text-blue-600 font-medium mt-0.5">₹{a.amount?.toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                      {(rejectedRFQs || []).slice(0, 2).map(r => (
                        <button key={r.id}
                          onClick={() => { navigate('/quotation-comparison', { state: { rfqId: r.id } }); setNotifOpen(false); }}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                          <div className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-slate-800 truncate">Rejection — Action Required</p>
                            <p className="text-[11px] text-slate-500 truncate">{r.title}</p>
                            <p className="text-[11px] text-red-500 font-medium mt-0.5">Re-select vendor</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[13px] text-white font-semibold flex-shrink-0">
              {user?.symbol || user?.name?.[0] || '?'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[12px] font-semibold text-slate-800 leading-none">{user?.name || 'User'}</p>
              <span className={`text-[10px] font-medium rounded px-1 ${ROLE_COLORS[role] || 'bg-slate-100 text-slate-600'}`}>
                {user?.roleLabel || role}
              </span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[16px] hidden sm:block">expand_more</span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  {user?.company && <p className="text-[11px] text-slate-400 truncate">{user.company}</p>}
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
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

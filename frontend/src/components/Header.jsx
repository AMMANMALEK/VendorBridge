import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';

const Header = ({ title }) => {
  const { user, logout, approvals } = useAppState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pendingApprovals = approvals.filter(a => a.status === 'Pending');

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logout();
    }
  };

  return (
    <header className="fixed top-0 right-0 h-header_height z-10 bg-white border-b border-outline-variant flex justify-between items-center px-xl ml-sidebar_width w-[calc(100%-theme(spacing.sidebar_width))] shadow-sm">
      <div className="flex items-center gap-lg flex-1">
        <h2 className="font-h3 text-h3 text-on-surface lg:block hidden">{title}</h2>
        <div className="relative w-full max-w-md ml-4">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full pl-xl pr-md py-xs bg-surface-container-low border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[14px]"
            placeholder="Search orders, vendors, or invoices..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-md relative">
        {/* Notifications */}
        <div className="relative group">
          <button className="p-xs text-on-surface-variant hover:bg-surface-container-low rounded-full transition-transform active:scale-95 flex items-center justify-center">
            <span className="material-symbols-outlined">notifications</span>
            {pendingApprovals.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white"></span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 duration-200 p-sm">
            <h4 className="font-semibold text-body-md border-b pb-sm mb-sm px-sm">Recent Tasks</h4>
            {pendingApprovals.length === 0 ? (
              <p className="text-on-surface-variant text-body-sm p-md text-center">No pending notifications</p>
            ) : (
              <div className="space-y-sm max-h-60 overflow-y-auto">
                {pendingApprovals.slice(0, 3).map(a => (
                  <div key={a.id} className="p-sm bg-surface-container-low hover:bg-surface-container rounded-lg text-left text-body-sm transition-colors">
                    <p className="font-semibold">{a.type}</p>
                    <p className="text-[11px] text-on-surface-variant">{a.title}</p>
                    <p className="text-[11px] text-primary mt-1">₹{a.amount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="p-xs text-on-surface-variant hover:bg-surface-container-low rounded-full transition-transform active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="h-8 w-px bg-outline-variant mx-xs"></div>

        {/* User profile dropdown */}
        <div className="relative">
          <div 
            className="flex items-center gap-sm cursor-pointer select-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="text-right">
              <p className="font-label-md text-on-surface text-[13px] font-semibold">{user ? user.name : 'Rahul Sharma'}</p>
              <p className="text-xs text-on-surface-variant">{user ? user.role : 'Procurement Manager'}</p>
            </div>
            <img
              alt="User Avatar"
              className="w-10 h-10 rounded-full border border-outline-variant object-cover hover:border-primary transition-colors"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtLBhNBj4lf05G23s0F7poFB4ZXD32SUjnuHJgrmJw5Hq6dNEbm6GsR7AlnQOOzzJEjzrPz20UhoH2rXBZjSGcqg8wvNehNgNve5sxXMS9Y8HLaScpKwSpaj2kMD6s8goSPUamZ7tGKZc6EOvNS3Ma0hLqdGf2FdESO_-U28Yve4ORv9YrTABHnOd1EgZ7JB1VttcBVj0x9-F6L7iVRHPDT_xora_cJsPsMmRvQGxPU6OpiVGejm1yWCITRB_sjdJC8NlCE-pMcZ8k"
            />
          </div>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-sm w-48 bg-white border border-outline-variant rounded-xl shadow-lg z-50 py-sm">
                <div className="px-md py-sm border-b border-outline-variant/50">
                  <p className="font-semibold text-body-sm truncate">{user?.email}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{user?.company}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-md py-sm hover:bg-error-container hover:text-on-error-container text-error text-body-sm flex items-center gap-sm transition-colors mt-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

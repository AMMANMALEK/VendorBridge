import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ROLES = [
  { value: 'admin',   label: 'Administrator',        symbol: '👑' },
  { value: 'officer', label: 'Procurement Officer',   symbol: '📋' },
  { value: 'manager', label: 'Manager / Approver',    symbol: '✅' },
  { value: 'vendor',  label: 'Vendor',                symbol: '🏭' }
];

const ROLE_COLORS = {
  admin:   'bg-purple-100 text-purple-700',
  officer: 'bg-blue-100 text-blue-700',
  manager: 'bg-green-100 text-green-700',
  vendor:  'bg-orange-100 text-orange-700'
};

const AdminUserManagement = () => {
  const { registeredUsers, updateUserRole, deactivateUser, resetUserPassword, user: currentUser } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filteredUsers = (registeredUsers || []).filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setEditRole(u.role);
    setNewPassword('');
    setShowPasswordField(false);
  };

  const handleRoleChange = () => {
    if (!selectedUser || editRole === selectedUser.role) return;
    const roleObj = ROLES.find(r => r.value === editRole);
    updateUserRole(selectedUser.id, editRole, roleObj.label, roleObj.symbol);
    setSelectedUser(prev => ({ ...prev, role: editRole, roleLabel: roleObj.label, symbol: roleObj.symbol }));
    showToast(`Role updated to ${roleObj.label}`);
  };

  const handleDeactivate = () => {
    if (!selectedUser) return;
    if (selectedUser.id === currentUser?.id) {
      showToast('You cannot deactivate your own account.');
      return;
    }
    deactivateUser(selectedUser.id);
    const newStatus = selectedUser.status === 'Inactive' ? 'Active' : 'Inactive';
    setSelectedUser(prev => ({ ...prev, status: newStatus }));
    showToast(`User ${newStatus === 'Inactive' ? 'deactivated' : 'reactivated'} successfully`);
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }
    resetUserPassword(selectedUser.id, newPassword);
    setNewPassword('');
    setShowPasswordField(false);
    showToast('Password reset successfully');
  };

  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r.value] = (registeredUsers || []).filter(u => u.role === r.value).length;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />

      <div className="flex-1 ml-[240px] pt-14 min-h-screen flex flex-col">
        <Header title="User Management" />

        <main className="p-xl max-w-7xl w-full mx-auto flex-1 flex flex-col gap-lg animate-fade-in">

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {ROLES.map(r => (
              <div key={r.value} className="bg-white rounded-xl border border-outline-variant custom-shadow p-md flex items-center gap-md">
                <span className="text-2xl">{r.symbol}</span>
                <div>
                  <p className="font-bold text-[22px] text-on-surface leading-none">{roleCounts[r.value] || 0}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{r.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-lg flex-1">
            {/* User list */}
            <section className="flex-1 bg-white rounded-xl border border-outline-variant custom-shadow flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row md:items-center gap-md bg-surface-container-lowest">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input
                    className="w-full pl-xl pr-md py-xs bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-md py-xs bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary outline-none"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.symbol} {r.label}</option>)}
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">User</th>
                      <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Email</th>
                      <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Role</th>
                      <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-xl text-on-surface-variant">No users found.</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`cursor-pointer hover:bg-surface-container-low transition-colors ${
                          selectedUser?.id === u.id ? 'bg-primary-container/10 border-l-4 border-primary' : ''
                        }`}
                      >
                        <td className="px-lg py-md">
                          <div className="flex items-center gap-sm">
                            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-[16px]">
                              {u.symbol || '👤'}
                            </div>
                            <span className="font-semibold text-[14px]">{u.name}</span>
                            {u.id === currentUser?.id && (
                              <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-semibold">You</span>
                            )}
                          </div>
                        </td>
                        <td className="px-lg py-md text-[13px] text-on-surface-variant">{u.email}</td>
                        <td className="px-lg py-md">
                          <span className={`px-sm py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLORS[u.role] || 'bg-surface-variant text-on-surface-variant'}`}>
                            {u.symbol} {u.roleLabel || u.role}
                          </span>
                        </td>
                        <td className="px-lg py-md">
                          <span className={`px-sm py-0.5 rounded-full text-[11px] font-semibold ${
                            u.status === 'Inactive'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {u.status === 'Inactive' ? '⛔ Inactive' : '✅ Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Detail / Actions panel */}
            {selectedUser ? (
              <aside className="w-full lg:w-[320px] bg-white rounded-xl border border-outline-variant custom-shadow p-lg flex flex-col gap-lg self-start animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-md border-b pb-md">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-2xl">
                    {selectedUser.symbol || '👤'}
                  </div>
                  <div>
                    <p className="font-semibold text-[16px] text-on-surface">{selectedUser.name}</p>
                    <p className="text-xs text-on-surface-variant">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-md">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase font-semibold mb-xs">Company</p>
                    <p className="text-[14px] font-medium">{selectedUser.company || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase font-semibold mb-xs">User ID</p>
                    <p className="text-[13px] font-mono text-on-surface-variant">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase font-semibold mb-xs">Account Status</p>
                    <span className={`px-sm py-0.5 rounded-full text-[11px] font-semibold ${
                      selectedUser.status === 'Inactive'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {selectedUser.status === 'Inactive' ? '⛔ Inactive' : '✅ Active'}
                    </span>
                  </div>
                </div>

                {/* Change Role */}
                <div className="border-t pt-md space-y-sm">
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">Change Role</p>
                  <select
                    className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    disabled={selectedUser.id === currentUser?.id}
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.symbol} {r.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleRoleChange}
                    disabled={editRole === selectedUser.role || selectedUser.id === currentUser?.id}
                    className="w-full bg-primary text-white py-sm rounded-lg font-semibold text-[13px] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Assign Role
                  </button>
                </div>

                {/* Reset Password */}
                <div className="border-t pt-md space-y-sm">
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">Reset Password</p>
                  {!showPasswordField ? (
                    <button
                      onClick={() => setShowPasswordField(true)}
                      className="w-full border border-outline-variant hover:bg-surface-container-low text-on-surface py-sm rounded-lg font-semibold text-[13px] transition-colors flex items-center justify-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                      Set New Password
                    </button>
                  ) : (
                    <div className="space-y-sm">
                      <input
                        className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        type="text"
                        placeholder="New password (min 8 chars)"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <div className="flex gap-sm">
                        <button onClick={() => setShowPasswordField(false)}
                          className="flex-1 border border-outline-variant hover:bg-surface-container-low py-sm rounded-lg text-[13px] font-semibold transition-colors">
                          Cancel
                        </button>
                        <button onClick={handleResetPassword}
                          className="flex-1 bg-primary text-white py-sm rounded-lg text-[13px] font-semibold hover:opacity-90 transition-all">
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deactivate */}
                <div className="border-t pt-md">
                  <button
                    onClick={handleDeactivate}
                    disabled={selectedUser.id === currentUser?.id}
                    className={`w-full py-sm rounded-lg font-semibold text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-xs ${
                      selectedUser.status === 'Inactive'
                        ? 'bg-emerald-600 text-white hover:opacity-90'
                        : 'border border-error text-error hover:bg-error-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {selectedUser.status === 'Inactive' ? 'person_check' : 'person_off'}
                    </span>
                    {selectedUser.status === 'Inactive' ? 'Reactivate User' : 'Deactivate User'}
                  </button>
                  {selectedUser.id === currentUser?.id && (
                    <p className="text-xs text-on-surface-variant text-center mt-sm">You cannot modify your own account</p>
                  )}
                </div>
              </aside>
            ) : (
              <aside className="w-full lg:w-[320px] bg-white rounded-xl border border-outline-variant custom-shadow p-lg flex flex-col items-center justify-center text-center self-start min-h-[200px]">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">manage_accounts</span>
                <p className="text-on-surface-variant text-[14px]">Select a user to manage their role, password, or account status.</p>
              </aside>
            )}
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-xl left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-lg py-sm rounded-full text-[13px] font-semibold shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;

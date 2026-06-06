import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Layout from '../components/Layout';

const STATUS_TABS = ['All', 'Active', 'Pending', 'Blocked'];

const StatusBadge = ({ status }) => {
  const MAP = {
    Active:  { cls: 'badge badge-active',   icon: 'check_circle',  label: 'Active'  },
    Pending: { cls: 'badge badge-pending',  icon: 'schedule',      label: 'Pending' },
    Blocked: { cls: 'badge badge-blocked',  icon: 'block',         label: 'Blocked' },
  };
  const cfg = MAP[status] || { cls: 'badge badge-draft', icon: 'info', label: status };
  return (
    <span className={cfg.cls}>
      <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

const Vendors = () => {
  const { vendors, addVendor, updateVendorStatus, user } = useAppState();
  const navigate = useNavigate();
  const role = user?.role || 'officer';

  // Access rules:
  //   admin    → can approve / block vendors, NO onboarding
  //   officer  → can onboard vendors (add), NO approve/block
  //   manager  → read-only
  const isAdmin    = role === 'admin';
  const isOfficer  = role === 'officer';
  const isReadOnly = role === 'manager';

  const [activeTab,      setActiveTab]      = useState('All');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [newVendor,      setNewVendor]      = useState({ name: '', contact: '', category: 'IT Hardware', address: '' });
  const [saving,         setSaving]         = useState(false);

  useEffect(() => {
    if (selectedVendor) {
      const updated = vendors.find(v => v.id === selectedVendor.id);
      if (updated) setSelectedVendor(updated);
    }
  }, [vendors]);

  useEffect(() => {
    if (!selectedVendor && vendors.length > 0) setSelectedVendor(vendors[0]);
  }, []);

  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.contact) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const added = addVendor(newVendor);
    setSelectedVendor(added);
    setModalOpen(false);
    setNewVendor({ name: '', contact: '', category: 'IT Hardware', address: '' });
    setSaving(false);
  };

  const handleStatusChange = (vendorId, newStatus) => updateVendorStatus(vendorId, newStatus);

  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'All' ? vendors.length : vendors.filter(v => v.status === tab).length;
    return acc;
  }, {});

  const filteredVendors = vendors.filter(v => {
    const matchTab   = activeTab === 'All' || v.status === activeTab;
    const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat   = categoryFilter === 'All' || v.category === categoryFilter;
    return matchTab && matchSearch && matchCat;
  });

  const ratingStars = (rating) => {
    const val = parseFloat(rating) || 0;
    return [1,2,3,4,5].map(s => (
      <span
        key={s}
        className="material-symbols-outlined"
        style={{ fontSize: 14, color: s <= Math.round(val) ? '#F59E0B' : '#E2E8F0', fontVariationSettings: "'FILL' 1" }}
      >star</span>
    ));
  };

  return (
    <Layout title="Vendor Management">
      <div className="flex flex-col lg:flex-row gap-5 h-full">

        {/* ── Main table panel ── */}
        <section className="flex-1 card flex flex-col overflow-hidden">

          {/* Status Tabs */}
          <div className="flex items-center gap-1 px-5 pt-4 border-b border-slate-100 overflow-x-auto no-scrollbar">
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab}
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tabCounts[tab]}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-slate-50/60 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: 18 }}>search</span>
                <input
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Search vendor name or ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {['IT Hardware','Logistics','Office Supplies','Industrial Parts','Construction','Services'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: 15 }}>expand_more</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Officer: can onboard vendors */}
              {isOfficer && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="h-9 px-4 rounded-xl text-white font-semibold text-[13px] flex items-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  Onboard Vendor
                </button>
              )}
              {isAdmin && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-[12px] font-semibold">
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>shield_person</span>
                  Admin — approval mode
                </div>
              )}
              {isReadOnly && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-[12px] font-semibold">
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>visibility</span>
                  View only
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor ID</th>
                  <th>Vendor Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-slate-400">
                      <span className="material-symbols-outlined text-5xl block mb-2" style={{ fontSize: 42 }}>storefront</span>
                      No {activeTab !== 'All' ? activeTab.toLowerCase() + ' ' : ''}vendors found
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map(vendor => (
                    <tr
                      key={vendor.id}
                      onClick={() => setSelectedVendor(vendor)}
                      className="cursor-pointer"
                      style={{
                        background: selectedVendor?.id === vendor.id ? '#EEF2FF' : '',
                        borderLeft: selectedVendor?.id === vendor.id ? '3px solid #6366F1' : '3px solid transparent',
                      }}
                    >
                      <td>
                        <span className="text-[12px] font-mono font-semibold text-slate-400">{vendor.id}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 16 }}>storefront</span>
                          </div>
                          <span className="font-semibold text-slate-800">{vendor.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[12px] font-medium">{vendor.category}</span>
                      </td>
                      <td className="text-slate-500">{vendor.address || '—'}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          {ratingStars(vendor.rating)}
                          <span className="text-[12px] text-slate-500 ml-1 font-medium">{vendor.rating}</span>
                        </div>
                      </td>
                      <td><StatusBadge status={vendor.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
            <p className="text-[12px] text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filteredVendors.length}</span> of {vendors.length} vendors
            </p>
          </div>
        </section>

        {/* ── Detail panel ── */}
        {selectedVendor && (
          <aside className="w-full lg:w-[320px] card p-5 flex flex-col gap-4 self-start animate-scale-in">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 24 }}>storefront</span>
                </div>
                <h3 className="text-slate-800 font-bold text-[16px] leading-tight">{selectedVendor.name}</h3>
                <p className="text-slate-400 text-[12px] font-mono mt-0.5">{selectedVendor.id}</p>
              </div>
              <StatusBadge status={selectedVendor.status} />
            </div>

            {/* Info */}
            <div className="space-y-3">
              {[
                { label: 'Category',      value: selectedVendor.category,            icon: 'category' },
                { label: 'Contact Email', value: selectedVendor.contact,             icon: 'mail',    link: true },
                { label: 'Location',      value: selectedVendor.address || '—',      icon: 'location_on' },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 15 }}>{row.icon}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{row.label}</p>
                    {row.link ? (
                      <a href={`mailto:${row.value}`} className="text-[13px] text-indigo-600 font-medium hover:underline">{row.value}</a>
                    ) : (
                      <p className="text-[13px] text-slate-700 font-medium">{row.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Rating */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Rating</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex">{ratingStars(selectedVendor.rating)}</div>
                    <span className="text-[13px] font-semibold text-slate-700">{selectedVendor.rating} / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Admin actions: approve / block only ── */}
            {isAdmin && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Vendor Actions</p>

                {selectedVendor.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedVendor.id, 'Active')}
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                      Approve Vendor
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedVendor.id, 'Blocked')}
                      className="w-full h-10 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>block</span>
                      Reject & Block
                    </button>
                  </>
                )}

                {selectedVendor.status === 'Active' && (
                  <button
                    onClick={() => handleStatusChange(selectedVendor.id, 'Blocked')}
                    className="w-full h-10 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>block</span>
                    Block Vendor
                  </button>
                )}

                {selectedVendor.status === 'Blocked' && (
                  <button
                    onClick={() => handleStatusChange(selectedVendor.id, 'Active')}
                    className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_open</span>
                    Unblock Vendor
                  </button>
                )}
              </div>
            )}

            {/* Officer actions */}
            {isOfficer && (
              <div className="border-t border-slate-100 pt-4 flex gap-2">
                <button className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[13px] transition-all">
                  Edit Details
                </button>
                <button
                  onClick={() => navigate('/create-rfq')}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-[13px] transition-all"
                >
                  Create RFQ
                </button>
              </div>
            )}

            {isReadOnly && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[12px] text-slate-400 text-center">Manager — view only</p>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── Onboard Vendor Modal (officer only) ── */}
      {modalOpen && isOfficer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-[16px]">Onboard New Vendor</h3>
                <p className="text-slate-400 text-[12px] mt-0.5">Add a vendor partner to the network</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="p-6 space-y-4">
              {[
                { id: 'vname',    label: 'Vendor / Company Name', icon: 'business', field: 'name',    type: 'text',  placeholder: 'e.g. Zen Distributors Ltd', required: true },
                { id: 'vcontact', label: 'Contact Email',          icon: 'mail',    field: 'contact', type: 'email', placeholder: 'e.g. sales@zen.com',         required: true },
                { id: 'vaddr',    label: 'Office Location',        icon: 'location_on', field: 'address', type: 'text', placeholder: 'e.g. Bengaluru, KA' },
              ].map(row => (
                <div key={row.id}>
                  <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide" htmlFor={row.id}>
                    {row.label}{row.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: 16 }}>{row.icon}</span>
                    <input
                      id={row.id} type={row.type} required={row.required} placeholder={row.placeholder}
                      value={newVendor[row.field]}
                      onChange={(e) => setNewVendor(p => ({ ...p, [row.field]: e.target.value }))}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>
              ))}

              {/* Category select */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide" htmlFor="vcat">Business Category</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: 16 }}>category</span>
                  <select
                    id="vcat"
                    value={newVendor.category}
                    onChange={(e) => setNewVendor(p => ({ ...p, category: e.target.value }))}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                  >
                    {['IT Hardware','Logistics','Office Supplies','Industrial Parts','Construction','Services'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: 15 }}>expand_more</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                      Onboard Partner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Vendors;

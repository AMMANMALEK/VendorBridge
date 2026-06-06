import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const STATUS_TABS = ['All', 'Active', 'Pending', 'Blocked'];

const statusBadge = (status) => {
  switch (status) {
    case 'Active':
      return <span className="px-sm py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">🟢 Active</span>;
    case 'Pending':
      return <span className="px-sm py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">🟡 Pending</span>;
    case 'Blocked':
      return <span className="px-sm py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">🔴 Blocked</span>;
    default:
      return <span className="px-sm py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">{status}</span>;
  }
};

const Vendors = () => {
  const { vendors, addVendor, updateVendorStatus, user } = useAppState();
  const role = user?.role || 'officer';
  const isAdmin = role === 'admin';
  const isReadOnly = role === 'manager';

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', contact: '', category: 'IT Hardware', address: '' });

  // Keep selectedVendor in sync when vendors list changes (e.g. after status update)
  useEffect(() => {
    if (selectedVendor) {
      const updated = vendors.find(v => v.id === selectedVendor.id);
      if (updated) setSelectedVendor(updated);
    }
  }, [vendors]);

  // Set default selection
  useEffect(() => {
    if (!selectedVendor && vendors.length > 0) setSelectedVendor(vendors[0]);
  }, []);

  const handleAddVendor = (e) => {
    e.preventDefault();
    if (newVendor.name && newVendor.contact) {
      const added = addVendor(newVendor);
      setSelectedVendor(added);
      setModalOpen(false);
      setNewVendor({ name: '', contact: '', category: 'IT Hardware', address: '' });
    }
  };

  const handleStatusChange = (vendorId, newStatus) => {
    updateVendorStatus(vendorId, newStatus);
  };

  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'All' ? vendors.length : vendors.filter(v => v.status === tab).length;
    return acc;
  }, {});

  const filteredVendors = vendors.filter(v => {
    const matchesTab = activeTab === 'All' || v.status === activeTab;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    return matchesTab && matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />

      <div className="flex-1 ml-sidebar_width pt-header_height min-h-screen flex flex-col">
        <Header title="Vendor Management" />

        <main className="p-xl max-w-container_max_width w-full mx-auto flex-1 flex flex-col lg:flex-row gap-lg animate-fade-in">
          {/* Main List */}
          <section className="flex-1 bg-white rounded-xl border border-outline-variant custom-shadow flex flex-col overflow-hidden">

            {/* Status Tabs */}
            <div className="px-lg pt-lg border-b border-outline-variant flex items-center gap-lg overflow-x-auto no-scrollbar">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-sm font-semibold text-[13px] whitespace-nowrap relative transition-colors flex items-center gap-xs ${
                    activeTab === tab ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {tabCounts[tab]}
                  </span>
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md bg-surface-container-lowest">
              <div className="flex flex-1 items-center gap-md max-w-lg">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input
                    className="w-full pl-xl pr-md py-xs bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[14px]"
                    placeholder="Search by ID or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-md py-xs bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary focus:border-primary text-[14px] outline-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option>IT Hardware</option>
                  <option>Logistics</option>
                  <option>Office Supplies</option>
                  <option>Industrial Parts</option>
                  <option>Construction</option>
                  <option>Services</option>
                </select>
              </div>

              {!isReadOnly && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-primary text-white px-lg py-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-xs font-semibold text-[13px]"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Onboard Vendor
                </button>
              )}
              {isReadOnly && (
                <span className="text-xs text-on-surface-variant bg-surface-container-low border border-outline-variant px-md py-sm rounded-lg font-medium">
                  👁️ Read-only — Manager view
                </span>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Vendor ID</th>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Vendor Name</th>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Category</th>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Rating</th>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-xl text-on-surface-variant">
                        No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} vendors found.
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map(vendor => (
                      <tr
                        key={vendor.id}
                        onClick={() => setSelectedVendor(vendor)}
                        className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                          selectedVendor?.id === vendor.id ? 'bg-primary-container/10 border-l-4 border-primary' : ''
                        }`}
                      >
                        <td className="px-lg py-md font-label-md text-[13px]">{vendor.id}</td>
                        <td className="px-lg py-md text-body-md text-[14px] font-semibold">{vendor.name}</td>
                        <td className="px-lg py-md text-body-md text-[14px]">{vendor.category}</td>
                        <td className="px-lg py-md text-body-md text-[14px]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-amber-500 font-variation-fill">star</span>
                            {vendor.rating}
                          </span>
                        </td>
                        <td className="px-lg py-md">{statusBadge(vendor.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Detail Panel */}
          {selectedVendor && (
            <aside className="w-full lg:w-[350px] bg-white rounded-xl border border-outline-variant custom-shadow p-lg flex flex-col gap-lg animate-fade-in self-start">
              <div className="flex justify-between items-start border-b pb-md">
                <div>
                  <h3 className="font-h3 text-h3 text-on-surface font-semibold text-[18px]">{selectedVendor.name}</h3>
                  <span className="text-[11px] bg-outline-variant/30 text-on-surface-variant font-label-md px-2 py-0.5 rounded uppercase">{selectedVendor.id}</span>
                </div>
                {statusBadge(selectedVendor.status)}
              </div>

              <div className="space-y-md">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">Category</p>
                  <p className="text-body-md font-medium text-[14px]">{selectedVendor.category}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">Contact Email</p>
                  <p className="text-body-md font-medium text-[14px] text-primary">{selectedVendor.contact}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">Location</p>
                  <p className="text-body-md font-medium text-[14px]">{selectedVendor.address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className="material-symbols-outlined text-[18px] font-variation-fill">star</span>
                      ))}
                    </div>
                    <span className="font-semibold text-[14px]">{selectedVendor.rating} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="border-t pt-lg space-y-sm">
                  <p className="text-xs text-on-surface-variant uppercase font-semibold mb-sm">Admin Actions</p>

                  {selectedVendor.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedVendor.id, 'Active')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-sm rounded-lg font-semibold text-[13px] transition-all flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Approve Vendor
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedVendor.id, 'Blocked')}
                        className="w-full border border-error text-error hover:bg-error-container py-sm rounded-lg font-semibold text-[13px] transition-colors flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">block</span>
                        Reject & Block
                      </button>
                    </>
                  )}

                  {selectedVendor.status === 'Active' && (
                    <button
                      onClick={() => handleStatusChange(selectedVendor.id, 'Blocked')}
                      className="w-full border border-error text-error hover:bg-error-container py-sm rounded-lg font-semibold text-[13px] transition-colors flex items-center justify-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">block</span>
                      Block Vendor
                    </button>
                  )}

                  {selectedVendor.status === 'Blocked' && (
                    <button
                      onClick={() => handleStatusChange(selectedVendor.id, 'Active')}
                      className="w-full bg-primary text-white hover:opacity-90 py-sm rounded-lg font-semibold text-[13px] transition-all flex items-center justify-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock_open</span>
                      Unblock Vendor
                    </button>
                  )}
                </div>
              )}

              {/* Officer actions */}
              {!isReadOnly && !isAdmin && (
                <div className="border-t pt-lg flex gap-sm">
                  <button className="flex-1 border border-outline-variant hover:bg-surface-container-low text-on-surface py-sm rounded-lg font-semibold text-[13px] transition-colors">
                    Edit Details
                  </button>
                  <button className="flex-1 bg-primary text-white py-sm rounded-lg hover:opacity-90 transition-all font-semibold text-[13px]">
                    Create RFQ
                  </button>
                </div>
              )}

              {isReadOnly && (
                <p className="text-xs text-on-surface-variant text-center border-t pt-md">Manager — view only access</p>
              )}
            </aside>
          )}
        </main>

        {/* Onboarding Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md animate-fade-in">
            <div className="bg-white rounded-xl border border-outline-variant shadow-2xl w-full max-w-md p-lg space-y-md">
              <div className="flex justify-between items-center border-b pb-sm">
                <h3 className="font-h3 text-h3 text-on-surface font-semibold text-[18px]">Onboard New Vendor</h3>
                <button onClick={() => setModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleAddVendor} className="space-y-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant block uppercase text-[11px] font-semibold" htmlFor="vname">Vendor / Company Name</label>
                  <input className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-[14px]"
                    id="vname" required type="text" placeholder="e.g. Zen Distributors Ltd"
                    value={newVendor.name} onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })} />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant block uppercase text-[11px] font-semibold" htmlFor="vcontact">Contact Email</label>
                  <input className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-[14px]"
                    id="vcontact" required type="email" placeholder="e.g. sales@zen.com"
                    value={newVendor.contact} onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })} />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant block uppercase text-[11px] font-semibold" htmlFor="vcat">Business Category</label>
                  <select className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-[14px]"
                    id="vcat" value={newVendor.category} onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}>
                    <option>IT Hardware</option>
                    <option>Logistics</option>
                    <option>Office Supplies</option>
                    <option>Industrial Parts</option>
                    <option>Construction</option>
                    <option>Services</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant block uppercase text-[11px] font-semibold" htmlFor="vaddr">Office Address</label>
                  <input className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-[14px]"
                    id="vaddr" type="text" placeholder="e.g. Bengaluru, KA"
                    value={newVendor.address} onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })} />
                </div>
                <button className="w-full h-10 bg-primary text-white font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm mt-md" type="submit">
                  Onboard Partner
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vendors;

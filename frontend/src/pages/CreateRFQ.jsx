import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const CATEGORIES = ['IT Hardware', 'Logistics', 'Office Supplies', 'Industrial Parts', 'Construction', 'Services'];
const UNITS = ['NOS', 'KG', 'Litre', 'Box', 'Set', 'Meter', 'Hour'];

const AdminRFQView = ({ rfqs }) => {
  const statusBadge = (s) => {
    if (s === 'Open') return <span className="px-sm py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Open</span>;
    if (s === 'Draft') return <span className="px-sm py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Draft</span>;
    if (s === 'Closed') return <span className="px-sm py-0.5 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">Closed</span>;
    return <span className="px-sm py-0.5 rounded-full text-xs font-semibold bg-outline-variant text-on-surface-variant">{s}</span>;
  };
  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <div className="flex-1 ml-sidebar_width pt-header_height min-h-screen flex flex-col">
        <Header title="All RFQs" />
        <main className="p-xl max-w-container_max_width w-full mx-auto flex-1 animate-fade-in">
          <div className="bg-purple-50 border border-purple-200 text-purple-800 px-lg py-sm rounded-lg text-[13px] font-medium mb-lg flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Admin view — all RFQs across the organization. Only Procurement Officers can create RFQs.
          </div>
          <div className="bg-white rounded-xl border border-outline-variant custom-shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">RFQ ID</th>
                  <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Title</th>
                  <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Category</th>
                  <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Deadline</th>
                  <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Vendors</th>
                  <th className="px-lg py-sm text-on-surface-variant text-[12px] uppercase font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {rfqs.length === 0
                  ? <tr><td colSpan="6" className="text-center py-xl text-on-surface-variant">No RFQs yet.</td></tr>
                  : rfqs.map(r => (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md font-label-md text-[13px]">{r.id}</td>
                      <td className="px-lg py-md font-semibold text-[14px]">{r.title}</td>
                      <td className="px-lg py-md text-[14px]">{r.category}</td>
                      <td className="px-lg py-md text-[14px]">{r.deadline}</td>
                      <td className="px-lg py-md text-[14px]">{(r.assignedVendors || []).length} assigned</td>
                      <td className="px-lg py-md">{statusBadge(r.status)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

const CreateRFQ = () => {
  const { addRFQ, rfqs, vendors, user } = useAppState();
  const navigate = useNavigate();
  const role = user?.role || 'officer';

  if (role === 'admin') return <AdminRFQView rfqs={rfqs} />;

  const activeVendors = vendors.filter(v => v.status === 'Active');

  const [rfqDetails, setRfqDetails] = useState({
    title: '', category: 'IT Hardware', deadline: '', description: ''
  });
  const [items, setItems] = useState([{ id: 1, name: '', quantity: 1, unit: 'NOS', spec: '' }]);
  const [assignedVendorIds, setAssignedVendorIds] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const set = (field) => (e) => setRfqDetails(prev => ({ ...prev, [field]: e.target.value }));

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), name: '', quantity: 1, unit: 'NOS', spec: '' }]);
  const removeItem = (id) => { if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id)); };
  const changeItem = (id, field, val) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));

  const toggleVendor = (vid) => setAssignedVendorIds(prev =>
    prev.includes(vid) ? prev.filter(v => v !== vid) : [...prev, vid]
  );
  const selectAllVendors = () => setAssignedVendorIds(activeVendors.map(v => v.id));
  const clearVendors = () => setAssignedVendorIds([]);

  const handleAttachment = (e) => {
    const files = Array.from(e.target.files);
    const names = files.map(f => f.name);
    setAttachments(prev => [...prev, ...names]);
  };
  const removeAttachment = (name) => setAttachments(prev => prev.filter(a => a !== name));

  const buildAndSave = (isDraft) => {
    if (!rfqDetails.title || !rfqDetails.deadline) return;
    if (!isDraft && assignedVendorIds.length === 0) {
      alert('Please assign at least one vendor before sending.');
      return;
    }
    const assignedVendors = activeVendors.filter(v => assignedVendorIds.includes(v.id)).map(v => ({ id: v.id, name: v.name }));
    addRFQ({ ...rfqDetails, items, assignedVendors, attachments, isDraft });
    if (isDraft) {
      alert('RFQ saved as draft. Vendors have not been notified.');
      navigate('/dashboard');
    } else {
      alert(`RFQ published and sent to ${assignedVendors.length} vendor(s)!`);
      navigate('/quotation-comparison');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <div className="flex-1 ml-sidebar_width pt-header_height min-h-screen flex flex-col">
        <Header title="Create Request for Quotation" />

        <main className="p-xl max-w-container_max_width w-full mx-auto flex-1 animate-fade-in space-y-lg pb-xl">

          {/* ── Section 1: RFQ Details ── */}
          <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg space-y-md">
            <h3 className="font-semibold text-[16px] border-b pb-sm flex items-center gap-sm">
              <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[12px] font-bold">1</span>
              RFQ Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs md:col-span-2">
                <label className="text-on-surface-variant block uppercase text-[11px] font-semibold">RFQ Title *</label>
                <input className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required type="text" placeholder="e.g. Office Furniture Procurement Q2 2026"
                  value={rfqDetails.title} onChange={set('title')} />
              </div>
              <div className="space-y-xs">
                <label className="text-on-surface-variant block uppercase text-[11px] font-semibold">Category *</label>
                <select className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={rfqDetails.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-on-surface-variant block uppercase text-[11px] font-semibold">Submission Deadline *</label>
                <input className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required type="date" value={rfqDetails.deadline} onChange={set('deadline')} />
              </div>
              <div className="space-y-xs md:col-span-2">
                <label className="text-on-surface-variant block uppercase text-[11px] font-semibold">Description & Scope</label>
                <textarea className="w-full h-24 p-md bg-white border border-outline-variant rounded-lg text-[14px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  placeholder="Detail your requirements, delivery expectations, compliance standards..."
                  value={rfqDetails.description} onChange={set('description')} />
              </div>
            </div>
          </div>

          {/* ── Section 2: Line Items ── */}
          <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg space-y-md">
            <div className="flex justify-between items-center border-b pb-sm">
              <h3 className="font-semibold text-[16px] flex items-center gap-sm">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[12px] font-bold">2</span>
                Line Items
              </h3>
              <button type="button" onClick={addItem}
                className="border border-primary text-primary px-md py-1 rounded-lg hover:bg-primary-container/10 transition-colors font-semibold text-[12px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span>Add Row
              </button>
            </div>

            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-md px-xs">
              <p className="col-span-1 text-[11px] text-on-surface-variant font-semibold uppercase">#</p>
              <p className="col-span-4 text-[11px] text-on-surface-variant font-semibold uppercase">Item Name</p>
              <p className="col-span-2 text-[11px] text-on-surface-variant font-semibold uppercase">Qty</p>
              <p className="col-span-2 text-[11px] text-on-surface-variant font-semibold uppercase">Unit</p>
              <p className="col-span-2 text-[11px] text-on-surface-variant font-semibold uppercase">Specifications</p>
              <p className="col-span-1"></p>
            </div>

            <div className="space-y-sm">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-sm items-center bg-surface-container-lowest rounded-lg p-sm md:p-xs md:bg-transparent md:rounded-none border md:border-none border-outline-variant/50">
                  <div className="md:col-span-1 text-center font-semibold text-on-surface-variant text-[13px]">#{idx + 1}</div>
                  <input className="md:col-span-4 h-9 px-md bg-white border border-outline-variant rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Item / Service Name" required type="text"
                    value={item.name} onChange={e => changeItem(item.id, 'name', e.target.value)} />
                  <input className="md:col-span-2 h-9 px-md bg-white border border-outline-variant rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Qty" required type="number" min="1"
                    value={item.quantity} onChange={e => changeItem(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                  <select className="md:col-span-2 h-9 px-md bg-white border border-outline-variant rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={item.unit} onChange={e => changeItem(item.id, 'unit', e.target.value)}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <input className="md:col-span-2 h-9 px-md bg-white border border-outline-variant rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Specs / Standards" type="text"
                    value={item.spec} onChange={e => changeItem(item.id, 'spec', e.target.value)} />
                  <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1}
                      className="text-error hover:bg-error-container p-1 rounded-full transition-colors disabled:opacity-30">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 3: Assign Vendors ── */}
          <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg space-y-md">
            <div className="flex justify-between items-center border-b pb-sm">
              <h3 className="font-semibold text-[16px] flex items-center gap-sm">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[12px] font-bold">3</span>
                Assign Vendors
                <span className="text-[12px] text-on-surface-variant font-normal ml-xs">
                  {assignedVendorIds.length}/{activeVendors.length} selected
                </span>
              </h3>
              <div className="flex gap-sm">
                <button type="button" onClick={selectAllVendors}
                  className="text-primary text-[12px] font-semibold hover:underline">Select All</button>
                <span className="text-outline-variant">|</span>
                <button type="button" onClick={clearVendors}
                  className="text-on-surface-variant text-[12px] font-semibold hover:underline">Clear</button>
              </div>
            </div>

            {activeVendors.length === 0 ? (
              <p className="text-on-surface-variant text-[14px] text-center py-md">No active vendors available. Go to Vendors to approve some first.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm">
                {activeVendors.map(v => {
                  const selected = assignedVendorIds.includes(v.id);
                  return (
                    <button key={v.id} type="button" onClick={() => toggleVendor(v.id)}
                      className={`flex items-center gap-md p-md rounded-lg border-2 transition-all text-left ${
                        selected
                          ? 'border-primary bg-primary-container/10'
                          : 'border-outline-variant hover:border-primary/40'
                      }`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selected ? 'bg-primary border-primary' : 'border-outline-variant'
                      }`}>
                        {selected && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[13px] truncate">{v.name}</p>
                        <p className="text-[11px] text-on-surface-variant">{v.category} · ⭐ {v.rating}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section 4: Attachments ── */}
          <div className="bg-white rounded-xl border border-outline-variant custom-shadow p-lg space-y-md">
            <h3 className="font-semibold text-[16px] border-b pb-sm flex items-center gap-sm">
              <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[12px] font-bold">4</span>
              Attachments
              <span className="text-[12px] text-on-surface-variant font-normal">Optional</span>
            </h3>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl p-xl cursor-pointer hover:border-primary hover:bg-primary-container/5 transition-all group">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant group-hover:text-primary mb-sm">upload_file</span>
              <p className="font-semibold text-[14px]">Click to upload files</p>
              <p className="text-[12px] text-on-surface-variant mt-xs">Technical specs, drawings, compliance docs, reference images</p>
              <input type="file" multiple className="hidden" onChange={handleAttachment} accept=".pdf,.doc,.docx,.png,.jpg,.xlsx" />
            </label>
            {attachments.length > 0 && (
              <div className="space-y-xs">
                {attachments.map(name => (
                  <div key={name} className="flex items-center justify-between bg-surface-container-low px-md py-sm rounded-lg">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary text-[18px]">attach_file</span>
                      <span className="text-[13px] font-medium">{name}</span>
                    </div>
                    <button type="button" onClick={() => removeAttachment(name)}
                      className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row justify-end gap-sm pb-xl">
            <button type="button" onClick={() => navigate('/dashboard')}
              className="border border-outline-variant hover:bg-surface-container-low text-on-surface px-lg py-sm rounded-lg font-semibold text-[13px] transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => buildAndSave(true)}
              disabled={!rfqDetails.title || !rfqDetails.deadline}
              className="border-2 border-primary text-primary px-lg py-sm rounded-lg font-semibold text-[13px] hover:bg-primary-container/10 transition-all disabled:opacity-40 flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">save</span>
              Save as Draft
            </button>
            <button type="button" onClick={() => buildAndSave(false)}
              disabled={!rfqDetails.title || !rfqDetails.deadline}
              className="bg-primary text-white px-lg py-sm rounded-lg font-semibold text-[13px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">send</span>
              Send to Vendors
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateRFQ;

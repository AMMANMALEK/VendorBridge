import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import Layout from '../components/Layout';

const CATEGORIES = ['IT Hardware', 'Logistics', 'Office Supplies', 'Industrial Parts', 'Construction', 'Services'];
const UNITS = ['NOS', 'KG', 'Litre', 'Box', 'Set', 'Meter', 'Hour'];

const AdminRFQView = ({ rfqs }) => {
  const statusBadge = (s) => {
    const MAP = {
      'Open':   { cls: 'badge badge-active',   icon: 'circle' },
      'Draft':  { cls: 'badge badge-pending',  icon: 'edit_note' },
      'Closed': { cls: 'badge badge-draft',    icon: 'check_circle' },
    };
    const cfg = MAP[s] || { cls: 'badge badge-draft', icon: 'info' };
    return (
      <span className={cfg.cls}>
        <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
        {s}
      </span>
    );
  };

  return (
    <Layout title="All RFQs">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[13px] font-medium">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
          Admin view — all RFQs across the organization. Only Procurement Officers can create new RFQs.
        </div>
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>RFQ ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Deadline</th>
                <th>Vendors</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.length === 0
                ? <tr><td colSpan="6" className="text-center py-16 text-slate-400">No RFQs yet.</td></tr>
                : rfqs.map(r => (
                  <tr key={r.id}>
                    <td><span className="font-mono text-[12px] font-semibold text-slate-400">{r.id}</span></td>
                    <td><span className="font-semibold text-slate-800">{r.title}</span></td>
                    <td><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[12px]">{r.category}</span></td>
                    <td className="text-slate-500">{r.deadline}</td>
                    <td className="text-slate-500">{(r.assignedVendors || []).length} assigned</td>
                    <td>{statusBadge(r.status)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
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
      alert(`RFQ published and sent to ${assignedVendors.length} vendor(s)! Awaiting vendor bids/quotations.`);
      navigate('/dashboard');
    }
  };

  return (
    <Layout title="Create Request for Quotation">
      <div className="max-w-[1400px] mx-auto space-y-5 pb-10">

          {/* ── Section 1: RFQ Details ── */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-[16px] text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-3">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0">1</span>
              RFQ Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">RFQ Title *</label>
                <input className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                  required type="text" placeholder="e.g. Office Furniture Procurement Q2 2026"
                  value={rfqDetails.title} onChange={set('title')} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Category *</label>
                <select className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all appearance-none"
                  value={rfqDetails.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Submission Deadline *</label>
                <input className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                  required type="date" value={rfqDetails.deadline} onChange={set('deadline')} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Description & Scope</label>
                <textarea className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all"
                  placeholder="Detail your requirements, delivery expectations, compliance standards..."
                  value={rfqDetails.description} onChange={set('description')} />
              </div>
            </div>
          </div>

          {/* ── Section 2: Line Items ── */}
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[16px] text-slate-800 flex items-center gap-3">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0">2</span>
                Line Items
              </h3>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1.5 px-4 py-2 border border-indigo-400 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold text-[12px] transition-all">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>Add Row
              </button>
            </div>
            <div className="hidden md:grid grid-cols-12 gap-3 px-1">
              <p className="col-span-1 text-[11px] text-slate-400 font-bold uppercase">#</p>
              <p className="col-span-4 text-[11px] text-slate-400 font-bold uppercase">Item Name</p>
              <p className="col-span-2 text-[11px] text-slate-400 font-bold uppercase">Qty</p>
              <p className="col-span-2 text-[11px] text-slate-400 font-bold uppercase">Unit</p>
              <p className="col-span-2 text-[11px] text-slate-400 font-bold uppercase">Specifications</p>
              <p className="col-span-1"></p>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <div className="md:col-span-1 text-center font-semibold text-slate-400 text-[13px]">#{idx + 1}</div>
                  <input className="md:col-span-4 h-9 px-3 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                    placeholder="Item / Service Name" required type="text"
                    value={item.name} onChange={e => changeItem(item.id, 'name', e.target.value)} />
                  <input className="md:col-span-2 h-9 px-3 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                    placeholder="Qty" required type="number" min="1"
                    value={item.quantity} onChange={e => changeItem(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                  <select className="md:col-span-2 h-9 px-3 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all appearance-none"
                    value={item.unit} onChange={e => changeItem(item.id, 'unit', e.target.value)}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <input className="md:col-span-2 h-9 px-3 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                    placeholder="Specs / Standards" type="text"
                    value={item.spec} onChange={e => changeItem(item.id, 'spec', e.target.value)} />
                  <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1}
                      className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 3: Assign Vendors ── */}
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[16px] text-slate-800 flex items-center gap-3">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0">3</span>
                Assign Vendors
                <span className="text-[12px] text-slate-400 font-normal">{assignedVendorIds.length}/{activeVendors.length} selected</span>
              </h3>
              <div className="flex gap-3">
                <button type="button" onClick={selectAllVendors} className="text-indigo-600 text-[12px] font-bold hover:underline">Select All</button>
                <span className="text-slate-300">|</span>
                <button type="button" onClick={clearVendors} className="text-slate-400 text-[12px] font-bold hover:underline">Clear</button>
              </div>
            </div>
            {activeVendors.length === 0 ? (
              <p className="text-slate-400 text-[14px] text-center py-6">No active vendors. Go to Vendors to approve some first.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeVendors.map(v => {
                  const sel = assignedVendorIds.includes(v.id);
                  return (
                    <button key={v.id} type="button" onClick={() => toggleVendor(v.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        sel ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'
                      }`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        sel ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                      }`}>
                        {sel && <span className="material-symbols-outlined text-white" style={{ fontSize: 13 }}>check</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[13px] text-slate-800 truncate">{v.name}</p>
                        <p className="text-[11px] text-slate-400">{v.category} · {v.rating}/5</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section 4: Attachments ── */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-[16px] text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-3">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0">4</span>
              Attachments
              <span className="text-[12px] text-slate-400 font-normal">Optional</span>
            </h3>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-10 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-indigo-400 mb-2" style={{ fontSize: 40 }}>upload_file</span>
              <p className="font-semibold text-[14px] text-slate-600">Click to upload files</p>
              <p className="text-[12px] text-slate-400 mt-1">Technical specs, drawings, compliance docs, images</p>
              <input type="file" multiple className="hidden" onChange={handleAttachment} accept=".pdf,.doc,.docx,.png,.jpg,.xlsx" />
            </label>
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map(name => (
                  <div key={name} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 18 }}>attach_file</span>
                      <span className="text-[13px] font-medium text-slate-700">{name}</span>
                    </div>
                    <button type="button" onClick={() => removeAttachment(name)}
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button type="button" onClick={() => navigate('/dashboard')}
              className="h-10 px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-[13px] transition-all">
              Cancel
            </button>
            <button type="button" onClick={() => buildAndSave(true)}
              disabled={!rfqDetails.title || !rfqDetails.deadline}
              className="h-10 px-6 border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold text-[13px] transition-all disabled:opacity-40 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
              Save as Draft
            </button>
            <button type="button" onClick={() => buildAndSave(false)}
              disabled={!rfqDetails.title || !rfqDetails.deadline}
              className="h-10 px-6 text-white rounded-xl font-bold text-[13px] transition-all disabled:opacity-40 flex items-center gap-2 hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 4px 14px rgba(79,70,229,.4)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
              Send to Vendors
            </button>
          </div>
      </div>
    </Layout>
  );
};

export default CreateRFQ;

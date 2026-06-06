import React from 'react';
import { useAppState } from '../context/StateContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Reports = () => {
  const { pos, vendors, rfqs } = useAppState();

  // Dynamic Spend Calculations
  const categorySpends = pos
    .filter(p => p.status === 'Approved')
    .reduce((acc, p) => {
      // Find category of PO based on vendor category
      const vendor = vendors.find(v => v.name === p.vendorName);
      const category = vendor ? vendor.category : 'General';
      acc[category] = (acc[category] || 0) + p.amount;
      return acc;
    }, {});

  const totalSpend = Object.values(categorySpends).reduce((sum, val) => sum + val, 0);

  // Cycle time estimations
  const avgCycleDays = rfqs.length > 0 ? (rfqs.length * 3 + 2) : 5;

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      
      <div className="flex-1 ml-[240px] pt-14 min-h-screen flex flex-col">
        <Header title="Reports & Procurement Analytics" />

        <main className="p-xl max-w-7xl w-full mx-auto flex-1 animate-fade-in space-y-lg">
          {/* Spend Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow">
              <p className="text-on-surface-variant font-label-md mb-xs text-[12px] uppercase">Total Certified Spend</p>
              <h3 className="font-h1 text-h1 text-on-surface font-bold text-[28px]">₹{totalSpend?.toLocaleString()}</h3>
              <p className="text-secondary text-xs mt-xs">Active across all categories</p>
            </div>
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow">
              <p className="text-on-surface-variant font-label-md mb-xs text-[12px] uppercase">Average Cycle Time</p>
              <h3 className="font-h1 text-h1 text-on-surface font-bold text-[28px]">{avgCycleDays} Days</h3>
              <p className="text-secondary text-xs mt-xs">RFQ creation to PO generation</p>
            </div>
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow">
              <p className="text-on-surface-variant font-label-md mb-xs text-[12px] uppercase">Certified Vendors</p>
              <h3 className="font-h1 text-h1 text-on-surface font-bold text-[28px]">{vendors.length} Partners</h3>
              <p className="text-secondary text-xs mt-xs">100% compliance rate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Spend by Category Chart */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow space-y-md">
              <h3 className="font-h3 text-h3 text-on-surface font-semibold text-[18px] border-b pb-sm mb-xs">Spend by Procurement Category</h3>
              <div className="space-y-sm pt-sm">
                {Object.keys(categorySpends).map(cat => {
                  const amt = categorySpends[cat];
                  const percent = totalSpend > 0 ? (amt / totalSpend) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-xs">
                      <div className="flex justify-between text-body-md text-[14px]">
                        <span className="font-medium">{cat}</span>
                        <span className="font-semibold text-primary">₹{amt?.toLocaleString()} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(categorySpends).length === 0 && (
                  <p className="text-center py-lg text-on-surface-variant">No approved PO spend to analyze yet.</p>
                )}
              </div>
            </div>

            {/* Vendor Rating / Performance */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant custom-shadow space-y-md">
              <h3 className="font-h3 text-h3 text-on-surface font-semibold text-[18px] border-b pb-sm mb-xs">Vendor Performance Metrics</h3>
              <div className="space-y-sm pt-xs">
                {vendors.map(v => (
                  <div key={v.id} className="flex justify-between items-center border-b pb-xs last:border-none last:pb-0">
                    <div>
                      <p className="font-semibold text-body-md text-[14px]">{v.name}</p>
                      <p className="text-xs text-on-surface-variant">{v.category}</p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="flex items-center gap-1 font-semibold text-[14px] text-on-surface">
                        <span className="material-symbols-outlined text-amber-500 text-[18px] font-variation-fill">star</span>
                        {v.rating}
                      </span>
                      <span className="px-sm py-0.5 rounded-full text-xs font-semibold bg-secondary-container/20 text-on-secondary-container">
                        Excellent
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;

import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import Layout from '../components/Layout';

const ActivityLogs = () => {
  const { logs, user } = useAppState();
  const role = user?.role || 'officer';
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  // Admin sees all logs; others see only their own
  const userLogs = role === 'admin'
    ? logs
    : logs.filter(l => l.user === user?.name || l.user === user?.company);

  const filteredLogs = userLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = catFilter === 'All' || log.category === catFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Authentication':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'RFQ':
        return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
      case 'Quotation':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Purchase Order':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Invoice':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Approvals':
        return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      default:
        return 'bg-surface-variant text-on-surface-variant border-outline-variant/30';
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Layout title="Activity & Audit Logs">
        <div className="max-w-[1400px] mx-auto flex-1 flex flex-col gap-5">
          <section className="bg-white rounded-xl border border-outline-variant custom-shadow flex flex-col overflow-hidden">
            {/* Filter toolbar */}
            <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md bg-surface-container-lowest">
              <div className="flex flex-1 items-center gap-md max-w-lg">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input
                    className="w-full pl-xl pr-md py-xs bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[14px]"
                    placeholder="Search logs by action or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-md py-xs bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary focus:border-primary text-[14px] outline-none"
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option>Authentication</option>
                  <option>RFQ</option>
                  <option>Quotation</option>
                  <option>Purchase Order</option>
                  <option>Invoice</option>
                  <option>Approvals</option>
                  <option>System</option>
                </select>
              </div>
              
              <span className="text-xs text-on-surface-variant font-label-md">
                Showing {filteredLogs.length} audit entries
              </span>
            </div>

            {/* Logs List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Timestamp</th>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">User / Operator</th>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Event Category</th>
                    <th className="px-lg py-sm font-label-md text-on-surface-variant text-[12px] uppercase">Action Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-xl text-on-surface-variant">No logs found matching selected criteria.</td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-surface-container-low transition-colors font-medium">
                        <td className="px-lg py-md text-body-sm text-[12px] whitespace-nowrap text-on-surface-variant">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-lg py-md text-body-md text-[14px] font-semibold">
                          {log.user}
                        </td>
                        <td className="px-lg py-md text-body-md text-[14px]">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getCategoryColor(log.category)}`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-lg py-md text-body-md text-[14px] text-on-surface">
                          {log.action}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </Layout>
  );
};

export default ActivityLogs;

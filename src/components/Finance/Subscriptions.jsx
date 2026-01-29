import React, { useState } from 'react';
import { Crown, Calendar, AlertCircle, Clock, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';

const Subscriptions = ({ subscriptions }) => {
  const [filter, setFilter] = useState('All'); // All, Upcoming, Past Due

  // Helper to calculate days diff (Mocking "Today" as 19 Jan 2026 for consistency with data)
  const getDaysDiff = (dateStr) => {
    const today = new Date('2026-01-19');
    const renewalDate = new Date(dateStr);
    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  // Calculate Stats
  const activeCount = subscriptions.filter(s => s.status === 'Active').length;
  const renewingCount = subscriptions.filter(s => {
      const d = getDaysDiff(s.nextRenewal); 
      return d >= 0 && d <= 3;
  }).length;
  const pastDueCount = subscriptions.filter(s => s.status === 'Past Due').length;
  const cancelledCount = subscriptions.filter(s => s.status === 'Cancelled').length;

  const getStatusBadge = (days, status) => {
    if (status === 'Cancelled') return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">Cancelled</span>;
    if (status === 'Past Due') {
       return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium border border-red-200">Overdue by {Math.abs(days)} days</span>;
    }
    if (days === 0) return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium border border-amber-200">Renewing Today</span>;
    if (days === 1) return <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-medium border border-amber-100">Expiring in 1 day</span>;
    if (days <= 3 && days > 0) return <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium border border-blue-100">Expiring in {days} days</span>;
    
    return <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">Active</span>;
  };

    const filteredSubscriptions = subscriptions.filter(sub => {
      if (filter === 'Cancelled') return sub.status === 'Cancelled';
      if (filter === 'Active') return sub.status === 'Active';
      if (sub.status === 'Cancelled') return false; 

      const days = getDaysDiff(sub.nextRenewal);
      if (filter === 'Upcoming') return days >= 0 && days <= 3;
      if (filter === 'Past Due') return days < 0;
      return true;
  });

  return (
    <div className="space-y-6">
       {/* Summary Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <StatCard 
               icon={<Crown />} 
               color="bg-indigo-50 text-indigo-600" 
               label="Total Active" 
               value={activeCount} 
               onClick={() => setFilter('Active')}
               isActive={filter === 'Active'}
           />
           <StatCard 
               icon={<Clock />} 
               color="bg-amber-50 text-amber-600" 
               label="Renewing (3 Days)" 
               value={renewingCount} 
               onClick={() => setFilter('Upcoming')}
               isActive={filter === 'Upcoming'}
           />
           <StatCard 
               icon={<AlertCircle />} 
               color="bg-red-50 text-red-600" 
               label="Past Due" 
               value={pastDueCount} 
               onClick={() => setFilter('Past Due')}
               isActive={filter === 'Past Due'}
           />
           <StatCard 
               icon={<XCircle />} 
               color="bg-gray-50 text-gray-600" 
               label="Cancelled" 
               value={cancelledCount} 
               onClick={() => setFilter('Cancelled')}
               isActive={filter === 'Cancelled'}
           />
       </div>

      {/* Filters */}
      <div className="flex justify-start">
           <div className="relative">
                <select 
                   value={filter}
                   onChange={(e) => setFilter(e.target.value)}
                   className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 block pl-3 pr-8 py-2 cursor-pointer min-w-[140px]"
                >
                    <option value="All">All Renewals</option>
                    <option value="Active">Active Subscription</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Past Due">Past Due</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                   <ChevronDown size={14} />
                </div>
           </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Plan Type</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date</th>
                <th className="p-4">Next Renewal</th>
                <th className="p-4">Renewal Status</th>
                <th className="p-4">Payment Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubscriptions.map((sub) => {
                 const days = getDaysDiff(sub.nextRenewal);
                 return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{sub.user}</td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                            {sub.plan.includes('Yearly') 
                                ? <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded border border-purple-200">YR</span>
                                : <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-200">MO</span>
                            }
                            {sub.plan}
                        </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sub.startDate}</td>
                    <td className="px-4 py-3 text-gray-600">{sub.endDate}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{sub.nextRenewal}</td>
                    <td className="px-4 py-3">
                        {getStatusBadge(days, sub.status)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{sub.paymentMode}</td>
                    </tr>
                 );
              })}
            </tbody>
          </table>
          {filteredSubscriptions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                  No subscriptions found for this filter.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
);

export default Subscriptions;

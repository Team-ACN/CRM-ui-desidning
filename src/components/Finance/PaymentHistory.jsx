import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, MoveDownLeft, Link2, ChevronDown, Calendar, ArrowRight, IndianRupee } from 'lucide-react';

const PaymentHistory = ({ payments, subscriptions = [], searchQuery }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  
  // Date Filtering State
  const [dateFilter, setDateFilter] = useState('This Month');
  const [customDateRange, setCustomDateRange] = useState({
    from: '',
    to: ''
  });

  // Calculate Subscription Stats
  const subscriptionStats = useMemo(() => {
      const activeSubs = subscriptions.filter(s => s.status === 'Active');
      const yearly = activeSubs.filter(s => s.plan.includes('Yearly')).length;
      const monthly = activeSubs.filter(s => s.plan.includes('Monthly')).length;
      return { totalActive: activeSubs.length, yearly, monthly };
  }, [subscriptions]);

  const tabs = ['All', 'Success', 'Pending', 'Failed'];
  const sources = ['All', 'Payment Link', 'Platform Direct'];
  const dateOptions = ['This Month', 'Last Month', 'This Year', 'All Time', 'Custom Range'];

  // Helper to parse "DD MMM YYYY" to Date object
  const parseDate = (dateStr) => {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const paymentDate = parseDate(p.date);
      const now = new Date();
      
      // Date Logic
      let dateMatch = true;
      if (dateFilter === 'This Month') {
        dateMatch = paymentDate.getMonth() === now.getMonth() && 
                    paymentDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'Last Month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        dateMatch = paymentDate.getMonth() === lastMonth.getMonth() && 
                    paymentDate.getFullYear() === lastMonth.getFullYear();
      } else if (dateFilter === 'This Year') {
        dateMatch = paymentDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'Custom Range') {
        if (customDateRange.from && customDateRange.to) {
            const fromDate = new Date(customDateRange.from);
            const toDate = new Date(customDateRange.to);
            // Set to end of day for inclusive comparison on 'to' date
            toDate.setHours(23, 59, 59, 999);
            dateMatch = paymentDate >= fromDate && paymentDate <= toDate;
        }
      }

      const statusMatch = activeTab === 'All' ? true : p.status === activeTab;
      const sourceMatch = sourceFilter === 'All' ? true : p.source === sourceFilter;
      const searchMatch = searchQuery 
          ? p.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
      
      return statusMatch && sourceMatch && searchMatch && dateMatch;
    });
  }, [payments, activeTab, sourceFilter, searchQuery, dateFilter, customDateRange]);

  // Calculate Revenue from visible payments (only Success status)
  const totalRevenue = useMemo(() => {
    return filteredPayments
        .filter(p => p.status === 'Success')
        .reduce((sum, p) => {
            const amount = parseFloat(p.amount.replace(/[^0-9.-]+/g,""));
            return sum + amount;
        }, 0);
  }, [filteredPayments]);

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Revenue Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
                Total Revenue ({dateFilter})
            </p>
            <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>

        </div>

        {/* Active Subscribers Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-1">Total Active Subscribers</p>
            <p className="text-2xl font-bold text-gray-900">{subscriptionStats.totalActive}</p>

        </div>

        {/* Plan Distribution Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-1">Plan Distribution</p>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">{subscriptionStats.yearly}</p>
                <span className="text-xs text-gray-500 font-medium">Yearly</span>
                <span className="text-gray-300">|</span>
                <p className="text-2xl font-bold text-gray-900">{subscriptionStats.monthly}</p>
                <span className="text-xs text-gray-500 font-medium">Monthly</span>
            </div>

        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
             <div className="flex flex-wrap items-center gap-3">
                 
                 {/* Date Filter Dropdown */}
                 <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={14} className="text-gray-500" />
                     </div>
                     <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 block pl-9 pr-8 py-2 cursor-pointer min-w-[140px]"
                     >
                        {dateOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <ChevronDown size={14} />
                     </div>
                 </div>

                 {/* Custom Date Range Inputs */}
                 {dateFilter === 'Custom Range' && (
                     <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
                         <input 
                            type="date"
                            value={customDateRange.from}
                            onChange={(e) => setCustomDateRange(prev => ({...prev, from: e.target.value}))}
                            className="text-sm text-gray-600 focus:outline-none"
                         />
                         <ArrowRight size={12} className="text-gray-400" />
                         <input 
                            type="date"
                            value={customDateRange.to}
                            onChange={(e) => setCustomDateRange(prev => ({...prev, to: e.target.value}))}
                            className="text-sm text-gray-600 focus:outline-none"
                         />
                     </div>
                 )}

                 <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                 {/* Payment Status Dropdown */}
                 <div className="relative">
                     <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 block pl-3 pr-8 py-2 cursor-pointer min-w-[160px]"
                     >
                        <option value="All">Payment Status: All</option>
                        {tabs.filter(t => t !== 'All').map(tab => (
                            <option key={tab} value={tab}>{tab}</option>
                        ))}
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <ChevronDown size={14} />
                     </div>
                 </div>

                 {/* Source Dropdown */}
                 <div className="relative">
                     <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 block pl-3 pr-8 py-2 cursor-pointer min-w-[140px]"
                     >
                        <option value="All">Source: All</option>
                        {sources.filter(s => s !== 'All').map(source => (
                            <option key={source} value={source}>{source}</option>
                        ))}
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <ChevronDown size={14} />
                     </div>
                 </div>
             </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                <tr>
                <th className="p-4">Transaction Details</th>
                <th className="p-4">User</th>
                <th className="p-4">Date</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Source</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Invoice</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                    <div className="flex flex-col">
                        <span className="font-mono text-xs text-gray-500">{payment.transactionId}</span>
                        <span className="font-medium text-gray-900 text-xs">{payment.method}</span>
                    </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{payment.user}</td>
                <td className="px-4 py-3 text-gray-600">{payment.date}</td>
                 <td className="px-4 py-3">
                     <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        payment.plan && payment.plan.includes('Yearly') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        payment.plan && payment.plan.includes('Monthly') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                     }`}>
                        {payment.plan}
                     </span>
                 </td>
                 <td className="px-4 py-3">
                     {payment.source === 'Payment Link' ? (
                         <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100">
                             <Link2 size={12} />
                             <span className="text-xs font-medium">Link</span>
                         </div>
                     ) : (
                         <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200">
                             <MoveDownLeft size={12} />
                             <span className="text-xs font-medium">Platform</span>
                         </div>
                     )}
                 </td>
                <td className="px-4 py-3 font-medium text-gray-900">{payment.amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex w-fit items-center gap-1.5 ${
                    payment.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' :
                    payment.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                         payment.status === 'Success' ? 'bg-green-500' :
                         payment.status === 'Failed' ? 'bg-red-500' :
                         'bg-orange-500'
                    }`}></span>
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                    <button 
                        disabled={payment.status === 'Failed' || payment.status === 'Pending'}
                        className={`p-1.5 rounded transition-colors ${
                            payment.status === 'Failed' || payment.status === 'Pending'
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Download Invoice"
                    >
                        <Download size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPayments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
                No payments found matching criteria.
            </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default PaymentHistory;

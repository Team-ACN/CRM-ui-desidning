import React, { useState } from 'react';
import { Search, Filter, Download, MoveDownLeft, Link2, ChevronDown } from 'lucide-react';

const PaymentHistory = ({ payments, searchQuery }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  const tabs = ['All', 'Success', 'Pending', 'Failed'];
  const sources = ['All', 'Payment Link', 'Platform Direct'];

  const filteredPayments = payments.filter(p => {
    const statusMatch = activeTab === 'All' ? true : p.status === activeTab;
    const sourceMatch = sourceFilter === 'All' ? true : p.source === sourceFilter;
    const searchMatch = searchQuery 
        ? p.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
    return statusMatch && sourceMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
             <div className="flex items-center gap-3">
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
                <th className="p-4">Type</th>
                <th className="p-4">Source</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
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
                     <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{payment.type}</span>
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

import React from 'react';
import { Phone, Trash2, Edit2, Link, ChevronDown } from 'lucide-react';

const AgentsTable = ({ agents }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              <th className="p-4 w-4"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="p-4 min-w-[150px]">Agent Name</th>
              <th className="p-4 min-w-[120px]">Contact Number</th>
              <th className="p-4">Agent ID</th>
              <th className="p-4">Plan Details</th>
              <th className="p-4">Credits</th>
              <th className="p-4 min-w-[100px]">Next Renewal</th>
              <th className="p-4">Inventories</th>
              <th className="p-4">Enquiries Did</th>
              <th className="p-4">Enquiries Rec</th>
              <th className="p-4 min-w-[100px]">Last Connected</th>
              <th className="p-4 min-w-[100px]">Last Tried</th>
              <th className="p-4 min-w-[150px]">Last Connected Status</th>
              <th className="p-4 min-w-[120px]">KAM</th>
              <th className="p-4 min-w-[100px]">Agent Status</th>
              <th className="p-4 min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 font-medium text-gray-900">{agent.name}</td>
                <td className="px-4 py-3 text-gray-500">{agent.contact}</td>
                <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                  <Link size={14} className="text-gray-400" />
                  {agent.agentId}
                </td>
                <td className="px-4 py-3 text-gray-600">{agent.plan}</td>
                <td className="px-4 py-3 text-gray-600">{agent.credits}</td>
                <td className="px-4 py-3 text-gray-600">{agent.renewal}</td>
                <td className="px-4 py-3">
                  <span className="w-7 h-7 rounded-full border border-orange-200 text-orange-600 flex items-center justify-center text-xs font-medium bg-orange-50">
                    {agent.inventories.toString().padStart(2, '0')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="w-7 h-7 rounded-full border border-orange-200 text-orange-600 flex items-center justify-center text-xs font-medium bg-orange-50">
                    {agent.enquiriesDid.toString().padStart(2, '0')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="w-7 h-7 rounded-full border border-orange-200 text-orange-600 flex items-center justify-center text-xs font-medium bg-orange-50">
                    {agent.enquiriesRec.toString().padStart(2, '0')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{agent.lastConnected}</td>
                <td className="px-4 py-3 text-gray-500">{agent.lastTried}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    agent.lastStatus === 'Connected' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : agent.lastStatus === 'Not Contact' || agent.lastStatus === 'No Contact'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-orange-50 text-orange-700 border-orange-100'
                  }`}>
                    {agent.lastStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-between text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs">
                    {agent.kam}
                    <ChevronDown size={12} className="text-gray-400" />
                  </div>
                </td>
                <td className="px-4 py-3">
                   <div className="flex items-center justify-between text-gray-600 bg-green-50 px-2 py-1 rounded border border-green-200 text-xs">
                    {agent.agentStatus}
                    <ChevronDown size={12} className="text-gray-400" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                      <Phone size={14} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded border border-gray-200 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex justify-center p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, '...', 53].map((page, i) => (
             <button key={i} className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
               page === 1 ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
             }`}>
               {page}
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentsTable;

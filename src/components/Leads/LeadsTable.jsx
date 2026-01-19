import React from 'react';
import { Phone, MessageSquare, User, ChevronDown, CheckSquare, Square } from 'lucide-react';

const LeadsTable = ({ leads }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-4"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-4 py-3 min-w-[100px]">Lead ID</th>
              <th className="px-4 py-3 min-w-[100px]">Lead Name</th>
              <th className="px-4 py-3 min-w-[120px]">Contact Number</th>
              <th className="px-4 py-3 min-w-[130px]">Verification Status</th>
              <th className="px-4 py-3 min-w-[120px]">Last Tried</th>
              <th className="px-4 py-3 min-w-[120px]">Last Connect</th>
              <th className="px-4 py-3 min-w-[140px]">Lead Status</th>
              <th className="px-4 py-3 min-w-[140px]">Connect Status</th>
              <th className="px-4 py-3 min-w-[120px]">KAM Assigned</th>
              <th className="px-4 py-3 min-w-[120px]">Lead Source</th>
              <th className="px-4 py-3 min-w-[100px]">Joined Community</th>
              <th className="px-4 py-3 min-w-[100px]">On Broadcast</th>
              <th className="px-4 py-3 min-w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-gray-600">{lead.leadId}</td>
                <td className="px-4 py-3 text-gray-900">{lead.name}</td>
                <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                  {lead.contact}
                  <span className="text-gray-300 rotate-45 inline-block">📎</span>
                </td>
                <td className="px-4 py-3">
                   <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs text-center">
                     {lead.verificationStatus}
                   </div>
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">{lead.lastTried}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{lead.lastConnect}</td>
                <td className="px-4 py-3">
                  <div className={`px-2 py-1 rounded text-xs flex items-center justify-between border ${
                    lead.leadStatus === 'Interested' ? 'bg-green-100 text-green-800 border-green-200' :
                    lead.leadStatus === 'Not Interested' ? 'bg-gray-200 text-gray-700 border-gray-300' :
                    lead.leadStatus === 'No Contact Yet' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-white border-gray-200 text-gray-500'
                  }`}>
                    {lead.leadStatus}
                    <ChevronDown size={12} className="opacity-50" />
                  </div>
                </td>
                <td className="px-4 py-3">
                   <div className={`px-2 py-1 rounded-full text-xs border inline-block ${
                     lead.connectStatus === 'RNR-1' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                     lead.connectStatus === 'Connected' ? 'bg-white text-gray-700 border-gray-300' :
                     'bg-white text-gray-500 border-gray-200'
                   }`}>
                     {lead.connectStatus}
                   </div>
                </td>
                <td className="px-4 py-3">
                   <div className="flex items-center justify-between text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 text-xs">
                    {lead.kam}
                    <ChevronDown size={12} className="text-gray-400" />
                  </div>
                </td>
                <td className="px-4 py-3">
                   <div className="flex items-center gap-2 text-gray-700 text-xs">
                    {lead.source === 'direct' ? <span className="text-green-600">🍃</span> : <span className="text-gray-900 rounded-full bg-gray-200 p-0.5 w-4 h-4 flex items-center justify-center">✔</span>}
                    {lead.source}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Square size={16} className="text-gray-300 inline-block" />
                </td>
                 <td className="px-4 py-3 text-center">
                  <Square size={16} className="text-gray-300 inline-block" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                      <Phone size={14} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                      <MessageSquare size={14} />
                    </button>
                     <button className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                      <User size={14} />
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
          {[1, 2, 3, 4, 5, 6, 7, '...', 326].map((page, i) => (
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

export default LeadsTable;

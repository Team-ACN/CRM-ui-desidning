import React from 'react';
import { Search } from 'lucide-react';

const QCDashboardTable = ({ items }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 min-w-[70px]">QC ID</th>
              <th className="px-3 py-3 min-w-[180px]">Project Name/Location</th>
              <th className="px-3 py-3 min-w-[80px]">Status</th>
              <th className="px-3 py-3 min-w-[80px]">Kam</th>
              <th className="px-3 py-3 min-w-[80px]">Asset type</th>
              <th className="px-3 py-3 min-w-[100px]">Agent</th>
              <th className="px-3 py-3 min-w-[60px]">SBUA</th>
              <th className="px-3 py-3 min-w-[60px]">Plot Size</th>
              <th className="px-3 py-3 min-w-[80px]">Price</th>
              <th className="px-3 py-3 min-w-[60px]">Config</th>
              <th className="px-3 py-3 min-w-[60px]">Facing</th>
              <th className="px-3 py-3 min-w-[80px]">Furnishing</th>
              <th className="px-3 py-3 min-w-[50px]">Floor</th>
              <th className="px-3 py-3 min-w-[100px]">Micromarket</th>
              <th className="px-3 py-3 min-w-[60px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 font-medium text-gray-800">
                <td className="px-3 py-2.5">{item.qcId}</td>
                <td className="px-3 py-2.5">{item.project}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    item.status === 'Pending' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-2.5">{item.kam}</td>
                <td className="px-3 py-2.5 text-gray-500">{item.assetType}</td>
                <td className="px-3 py-2.5 text-gray-500">{item.agent}</td>
                <td className="px-3 py-2.5">{item.sbua}</td>
                <td className="px-3 py-2.5">{item.plotSize}</td>
                <td className="px-3 py-2.5">{item.price}</td>
                <td className="px-3 py-2.5 text-gray-500">{item.config}</td>
                <td className="px-3 py-2.5 text-gray-500">{item.facing}</td>
                <td className="px-3 py-2.5 text-gray-500 capitalize">{item.furnishing}</td>
                <td className="px-3 py-2.5">{item.floor}</td>
                <td className="px-3 py-2.5">{item.micromarket}</td>
                <td className="px-3 py-2.5">
                   <button className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-gray-600 hover:bg-gray-300">
                     <Search size={12} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* Pagination Footer */}
       <div className="flex justify-center p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-1">
          {[1, 2, 3].map((page, i) => (
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

export default QCDashboardTable;

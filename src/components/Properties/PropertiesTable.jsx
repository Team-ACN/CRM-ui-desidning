import React from 'react';
import { Upload } from 'lucide-react';

const PropertiesTable = ({ properties }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-4"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-4 py-3 min-w-[100px]">Property ID</th>
              <th className="px-4 py-3 min-w-[180px]">Property Name</th>
              <th className="px-4 py-3 min-w-[100px]">Asset Type</th>
              <th className="px-4 py-3 min-w-[100px]">Sale Price</th>
              <th className="px-4 py-3 min-w-[100px]">SBUA</th>
              <th className="px-4 py-3 border-l border-gray-100">Floor</th>
              <th className="px-4 py-3 border-l border-gray-100">Plot Size</th>
              <th className="px-4 py-3 border-l border-gray-100">Facing</th>
              <th className="px-4 py-3 min-w-[120px]">Micromarket</th>
              <th className="px-4 py-3 min-w-[100px]">Status</th>
              <th className="px-4 py-3 min-w-[120px]">Last Check</th>
              <th className="px-4 py-3 min-w-[90px]">Agent</th>
              <th className="px-4 py-3 min-w-[150px]">Agent</th>
              <th className="px-4 py-3 min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-gray-600">{property.propertyId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{property.name}</td>
                <td className="px-4 py-3 text-gray-600">{property.assetType}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{property.price}</td>
                <td className="px-4 py-3 text-gray-600">{property.sbua}</td>
                <td className="px-4 py-3 text-gray-600 border-l border-gray-100">{property.floor}</td>
                <td className="px-4 py-3 text-gray-600 border-l border-gray-100">{property.plotSize}</td>
                <td className="px-4 py-3 text-gray-600 border-l border-gray-100 capitalize">{property.facing}</td>
                <td className="px-4 py-3 text-gray-600">{property.micromarket}</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium border border-green-200">
                    {property.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{property.lastCheck}</td>
                <td className="px-4 py-3 text-gray-600">{property.agentId}</td>
                <td className="px-4 py-3 text-gray-900">{property.agentName}</td>
                <td className="px-4 py-3">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                    <Upload size={14} />
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
          {[1, 2, 3, 4, 5, 6, 7, '...', 20].map((page, i) => (
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

export default PropertiesTable;

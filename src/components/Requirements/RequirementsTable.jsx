import React from 'react';

const RequirementsTable = ({ requirements }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 min-w-[80px]">Req ID</th>
              <th className="px-4 py-3 min-w-[200px]">Project Name/Location</th>
              <th className="px-4 py-3 min-w-[120px]">Asset type</th>
              <th className="px-4 py-3 min-w-[150px]">Budget</th>
              <th className="px-4 py-3 min-w-[100px]">Status</th>
              <th className="px-4 py-3 min-w-[100px]">Int. Status</th>
              <th className="px-4 py-3 min-w-[60px]">Views</th>
              <th className="px-4 py-3 min-w-[100px]">Last Updated</th>
              <th className="px-4 py-3 min-w-[120px]">Agent Name</th>
              <th className="px-4 py-3 min-w-[120px]">Agent Number</th>
              <th className="px-4 py-3 min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requirements.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{req.reqId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{req.project}</td>
                <td className="px-4 py-3 text-gray-600">{req.assetType}</td>
                <td className="px-4 py-3 text-gray-900">{req.budget}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${
                    req.status === 'Open' ? 'bg-green-100 text-green-800 border-green-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs border border-gray-300">
                    {req.intStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900">{req.views}</td>
                <td className="px-4 py-3 text-gray-900">{req.lastUpdated}</td>
                <td className="px-4 py-3 text-gray-900">{req.agentName}</td>
                <td className="px-4 py-3 text-gray-600">{req.agentNumber}</td>
                <td className="px-4 py-3">
                  <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium">
                    View Details
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
          {[1, 2, 3, 4, 5, 6, 7].map((page, i) => (
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

export default RequirementsTable;

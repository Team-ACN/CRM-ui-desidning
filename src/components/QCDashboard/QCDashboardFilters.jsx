import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';

const QCDashboardFilters = () => {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <div className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">
        <RotateCcw size={18} />
      </div>

       {/* Toggle Button Group */}
       <div className="flex bg-gray-100 p-1 rounded-lg">
        <button className="px-3 py-1 bg-gray-900 text-white shadow-sm rounded text-sm font-medium">Resale</button>
        <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded">Rental</button>
      </div>

      <div className="flex ml-2 gap-2">
         <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-sm font-medium">Kam Review</button>
         <button className="px-3 py-1 bg-white border border-gray-200 text-gray-900 font-medium rounded text-sm shadow-sm">Data Review</button>
         <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-sm font-medium">Not Approved</button>
      </div>

      <Dropdown label="All KAMs" />
      <Dropdown label="All Types" />
      <Dropdown label="Sort By" />
    </div>
  );
};

const Dropdown = ({ label }) => {
  return (
    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-transparent hover:border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
      {label}
      <ChevronDown size={14} className="text-gray-400" />
    </button>
  );
};

export default QCDashboardFilters;

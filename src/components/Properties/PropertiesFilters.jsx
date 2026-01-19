import React from 'react';
import { RotateCcw, ChevronDown, Filter } from 'lucide-react';

const PropertiesFilters = () => {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
        <RotateCcw size={18} />
      </button>

      {/* Toggle Button Group */}
      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button className="px-3 py-1 bg-white shadow-sm rounded text-sm font-medium text-gray-900">Resale</button>
        <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded">Rental</button>
      </div>

      <Dropdown label="Inventory Status" />
      <Dropdown label="Asset Type" />
      <Dropdown label="KAM Name" />
      <Dropdown label="Sort" />
      
      <div className="flex items-center gap-2">
         <input type="checkbox" id="delist" className="rounded border-gray-300" />
         <label htmlFor="delist" className="text-sm font-medium text-gray-700">To Be De-Listed</label>
      </div>
      
      <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700">
        <Filter size={16} />
        Filter
      </button>
    </div>
  );
};

const Dropdown = ({ label }) => {
  return (
    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
      {label}
      <ChevronDown size={14} className="text-gray-400" />
    </button>
  );
};

export default PropertiesFilters;

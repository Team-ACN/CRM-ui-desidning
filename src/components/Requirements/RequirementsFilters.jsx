import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';

const RequirementsFilters = () => {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      {/* Toggle Button Group */}
      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button className="px-3 py-1 bg-white shadow-sm rounded text-sm font-medium text-gray-900">Resale</button>
        <button className="px-3 py-1 text-sm font-medium text-gray-50 bg-gray-900 rounded">Rental</button>
      </div>
      
       <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
        <RotateCcw size={18} />
      </button>

      <Dropdown label="Requirement Status" />
      <Dropdown label="Internal Status" />
      <Dropdown label="Asset Type" />
      <Dropdown label="KAM" />
    </div>
  );
};

const Dropdown = ({ label }) => {
  return (
    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200">
      {label}
      <ChevronDown size={14} className="text-gray-400" />
    </button>
  );
};

export default RequirementsFilters;

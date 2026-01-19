import React from 'react';
import { RotateCcw, ChevronDown, Filter } from 'lucide-react';

const LeadsFilters = () => {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
        <RotateCcw size={18} />
      </button>

      <Dropdown label="KAM" />
      <Dropdown label="Sort" />
      <Dropdown label="Connect Status" />
      <Dropdown label="Lead Status" />
      <Dropdown label="Verification Status" />
      <Dropdown label="Source" />
      
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

export default LeadsFilters;

import React from 'react';
import { Search, Plus, ArrowUpDown } from 'lucide-react';
import { SURFACES } from './popupConstants';

const PopupsToolbar = ({
  surface,
  onSurfaceChange,
  searchQuery,
  onSearchChange,
  onManagePriority,
  onCreate,
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center p-1 bg-gray-100 rounded-lg">
      {SURFACES.map((s) => (
        <button
          key={s.id}
          onClick={() => onSurfaceChange(s.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
            surface === s.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search popups..."
          className="pl-9 pr-4 py-2 w-56 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <button
        onClick={onManagePriority}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        <ArrowUpDown size={15} />
        Manage priority
      </button>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        <Plus size={16} />
        New popup
      </button>
    </div>
  </div>
);

export default PopupsToolbar;

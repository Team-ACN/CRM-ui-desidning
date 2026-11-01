import React from 'react';
import { Search } from 'lucide-react';
import { LoanFilterTrigger, LoanFilterPanel } from './LoanFilterBar';

// Exact search box + filter row shared by every Home Loan table page — one component so the
// search input, filter trigger and filter panel are always laid out identically.
const LoanSearchFilterBar = ({ search, onSearchChange, searchPlaceholder, filters, filtersOpen, onToggleFilters }) => (
  <div className="px-6 py-3 bg-white border-b border-neutral-200 shrink-0">
    <div className="flex items-center flex-nowrap gap-3 overflow-x-auto">
      <div className="relative w-[260px] shrink-0">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-neutral-100 rounded-xl py-1.5 pl-8 pr-3 text-[13px] font-medium text-neutral-800 outline-none focus:bg-white focus:border-neutral-300 border border-transparent transition-colors"
        />
      </div>
      <LoanFilterTrigger filters={filters} open={filtersOpen} onToggle={onToggleFilters} />
    </div>
    <LoanFilterPanel filters={filters} open={filtersOpen} />
  </div>
);

export default LoanSearchFilterBar;

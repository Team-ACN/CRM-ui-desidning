import React from 'react';
import { Search, X } from 'lucide-react';

const SearchField = ({ value, onChange, placeholder = 'Search', className = 'w-60' }) => (
  <div className={`relative ${className}`}>
    <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 pl-8 pr-8 rounded-full bg-white text-[14px] text-label placeholder:text-tertiary outline-none border border-neutral-200 transition-colors focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-tertiary text-white flex items-center justify-center"
      >
        <X size={10} strokeWidth={3} />
      </button>
    )}
  </div>
);

export default SearchField;

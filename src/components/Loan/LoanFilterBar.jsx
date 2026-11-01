import React from 'react';
import { Filter, X } from 'lucide-react';
import { MultiFilterSelect } from '../Edge/FilterControls';

// The "Filters" toggle + active-filter chips — goes inside the same flex row as the search box.
export const LoanFilterTrigger = ({ filters, open, onToggle }) => {
  const activeFilters = filters.filter((f) => f.value.length > 0);
  const activeCount = activeFilters.reduce((sum, f) => sum + f.value.length, 0);

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium border transition-colors shrink-0 ${
          open ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
        }`}
      >
        <Filter size={13} /> Filters
        {activeCount > 0 && <span className={`px-1.5 rounded-full text-[11px] ${open ? 'bg-white/20' : 'bg-neutral-100'}`}>{activeCount}</span>}
      </button>

      {activeFilters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-[13px] font-medium"
        >
          {f.label}: {f.value.join(', ')}
          <button type="button" onClick={() => f.onChange([])} className="p-1 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={13} />
          </button>
        </span>
      ))}

      {activeFilters.length > 1 && (
        <button
          type="button"
          onClick={() => filters.forEach((f) => f.onChange([]))}
          className="text-[13px] font-medium text-neutral-400 hover:text-neutral-700"
        >
          Clear all
        </button>
      )}
    </>
  );
};

// The dropdown grid — rendered as its own block below the search/filter row (a true sibling, not
// nested inside the flex-wrap row), so it always lands on its own line instead of trying to
// squeeze in next to the Filters button.
export const LoanFilterPanel = ({ filters, open }) => {
  if (!open) return null;
  return (
    <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-3">
      {filters.map((f) => (
        <div key={f.key} className="w-[200px] shrink-0">
          <MultiFilterSelect label={f.label} allLabel={f.allLabel} value={f.value} onChange={f.onChange} options={f.options} />
        </div>
      ))}
    </div>
  );
};

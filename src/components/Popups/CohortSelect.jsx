import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

// One searchable dropdown: the popup targets everyone, or one cohort.
const ALL_USERS = 'All users';

const CohortSelect = ({ cohorts, selectedIds, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen]);

  const selectedId = selectedIds?.[0] || null;
  const selected = cohorts.find((c) => c.id === selectedId);

  const options = cohorts.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.id.toLowerCase().includes(query.toLowerCase())
  );

  const select = (id) => {
    onChange(id ? [id] : []);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-xs text-left hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors cursor-pointer"
      >
        <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
          {selected ? selected.name : ALL_USERS}
        </span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="relative border-b border-gray-100">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cohorts..."
              className="w-full pl-7 pr-3 py-2 text-xs focus:outline-none rounded-t-lg"
            />
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            <button
              onClick={() => select(null)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="text-xs text-gray-800">{ALL_USERS}</span>
              {!selectedId && <Check size={13} className="text-emerald-600 shrink-0" />}
            </button>

            {options.map((cohort) => (
              <button
                key={cohort.id}
                onClick={() => select(cohort.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-xs text-gray-800 truncate">{cohort.name}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-mono text-gray-400">{cohort.id}</span>
                  {selectedId === cohort.id && <Check size={13} className="text-emerald-600" />}
                </span>
              </button>
            ))}

            {options.length === 0 && (
              <p className="px-3 py-3 text-center text-xs text-gray-400">No matching cohorts.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CohortSelect;

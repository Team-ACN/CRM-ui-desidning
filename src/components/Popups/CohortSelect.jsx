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
        className="w-full h-9 flex items-center justify-between gap-2 px-3 rounded-[10px] bg-fill text-[14px] text-left hover:bg-fill-strong outline-none focus-visible:ring-4 focus-visible:ring-accent/10 transition-colors cursor-pointer"
      >
        <span className={`truncate ${selected ? 'text-label' : 'text-secondary'}`}>
          {selected ? selected.name : ALL_USERS}
        </span>
        <ChevronDown size={14} strokeWidth={1.75} className="text-secondary shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-surface rounded-xl shadow-raised z-20 origin-top transition-[opacity,transform] duration-200 ease-apple starting:opacity-0 starting:scale-95">
          <div className="relative border-b border-separator">
            <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cohorts"
              className="w-full h-10 pl-8 pr-3 bg-transparent text-[14px] text-label placeholder:text-tertiary outline-none rounded-t-xl"
            />
          </div>

          <div className="max-h-52 overflow-y-auto p-1">
            <button
              onClick={() => select(null)}
              className="w-full flex items-center justify-between gap-2 px-2.5 h-9 rounded-lg text-left hover:bg-fill transition-colors cursor-pointer"
            >
              <span className="text-[14px] text-label">{ALL_USERS}</span>
              {!selectedId && <Check size={16} strokeWidth={2} className="text-accent shrink-0" />}
            </button>

            {options.map((cohort) => (
              <button
                key={cohort.id}
                onClick={() => select(cohort.id)}
                className="w-full flex items-center justify-between gap-2 px-2.5 h-9 rounded-lg text-left hover:bg-fill transition-colors cursor-pointer"
              >
                <span className="text-[14px] text-label truncate">{cohort.name}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] text-tertiary tabular-nums">{cohort.id}</span>
                  {selectedId === cohort.id && <Check size={16} strokeWidth={2} className="text-accent" />}
                </span>
              </button>
            ))}

            {options.length === 0 && (
              <p className="px-3 py-3 text-center text-[13px] text-secondary">No matching cohorts.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CohortSelect;

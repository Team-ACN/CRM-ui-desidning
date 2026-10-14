import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { SERVICE_NAME_OPTIONS } from '../../data/mockLegalDoc';

const serviceLabel = (value) => SERVICE_NAME_OPTIONS.find((s) => s.value === value)?.label || value;

// Swiggy / Zomato style legal-service selector — search to add, +/- counter on the same
// chip. Shared by the Agent Connect panel's "Legal Lead" section and the Qualify page's
// side panel, so service editing looks and behaves identically in both places.
const LegalSearchSelect = ({ items = [], onAdd, onIncrement, onDecrement, placeholder = 'Search legal requirements...', maxItems }) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const atLimit = typeof maxItems === 'number' && items.length >= maxItems;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filtered = query.trim()
    ? SERVICE_NAME_OPTIONS.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  return (
    <div ref={containerRef} className="space-y-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.name}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-neutral-900 transition-colors"
            >
              <span className="text-[13px] font-medium text-neutral-900 select-none">
                {serviceLabel(item.name)}
              </span>
              <div className="inline-flex items-center gap-1.5 pl-2 border-l border-neutral-200">
                <button
                  type="button"
                  onClick={() => onDecrement(item.name)}
                  className="w-4 h-4 flex items-center justify-center text-neutral-500 hover:text-neutral-950 font-bold text-[14px] leading-none transition-colors cursor-pointer"
                  title="Decrease quantity"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="text-[12px] font-bold text-neutral-900 min-w-[12px] text-center select-none tabular-nums">
                  {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => onIncrement(item.name)}
                  className="w-4 h-4 flex items-center justify-center text-neutral-500 hover:text-neutral-950 font-bold text-[14px] leading-none transition-colors cursor-pointer"
                  title="Increase quantity"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {atLimit ? (
        <p className="text-[11.5px] text-neutral-400">Remove the service above to pick a different one.</p>
      ) : (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={placeholder}
            className="w-full bg-white border border-neutral-200 rounded-full pl-9 pr-3 py-2 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 outline-none transition-all"
          />
          {isDropdownOpen && filtered.length > 0 && (
            <div className="absolute z-30 mt-1 w-full border border-neutral-200 rounded-xl bg-white shadow-md max-h-48 overflow-y-auto py-1 divide-y divide-neutral-100">
              {filtered.map((o) => {
                const existing = items.find((i) => i.name === o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onAdd(o.value);
                      setQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-neutral-50 flex items-center justify-between text-neutral-800 transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-neutral-900">{o.label}</span>
                    {existing ? (
                      <span className="text-[11.5px] font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                        Qty: {existing.qty} (+)
                      </span>
                    ) : (
                      <span className="text-[11.5px] text-neutral-400">+ Add</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LegalSearchSelect;

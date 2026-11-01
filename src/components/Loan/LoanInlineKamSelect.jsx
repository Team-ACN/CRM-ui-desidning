import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// Compact custom dropdown for reassigning a row's KAM straight from a table cell — no native
// <select> chrome (which renders inconsistently across browsers and forced the row taller), so it
// matches the rest of the app's own dropdown styling exactly.
const LoanInlineKamSelect = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[13px] text-neutral-700 hover:bg-neutral-100 rounded-lg px-1.5 py-1 -ml-1.5 transition-colors"
      >
        {value}
        <ChevronDown size={12} className={`text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 py-1 min-w-[140px] max-h-64 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-[13px] transition-colors ${
                o === value ? 'text-neutral-900 font-semibold bg-neutral-50' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span className="truncate">{o}</span>
              {o === value && <Check size={13} className="shrink-0 text-neutral-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanInlineKamSelect;

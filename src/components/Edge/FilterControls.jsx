import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { summarize } from '../../utils/filters';

// Single-choice custom dropdown (used for filters that are inherently one value at a time, e.g. sort order)
export function FilterSelect({ label, value, onChange, options, defaultValue }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const current = options.find(o => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-left hover:bg-stone-100 hover:border-stone-300 transition-colors"
      >
        <span className="flex items-center gap-1 min-w-0 truncate">
          {value !== defaultValue && <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 shrink-0">{label}:</span>}
          <span className="truncate text-[13px] font-medium text-stone-700">{value === defaultValue ? label : current?.label}</span>
        </span>
        <ChevronDown size={14} className={`text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg z-20 py-1">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-[13px] transition-colors ${o.value === value ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check size={14} className="shrink-0 text-stone-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Multi-choice dropdown — tick as many options as you want, plus an "All" row that clears the selection
export function MultiFilterSelect({ label, allLabel, allCount, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function toggle(v) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-1.5 text-left transition-colors ${value.length > 0 ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'}`}
      >
        <span className="flex items-center gap-1 min-w-0 truncate">
          {value.length > 0 && <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 shrink-0">{label}:</span>}
          <span className="truncate text-[13px] font-medium">{value.length > 0 ? summarize(value, options, allLabel) : label}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${value.length > 0 ? 'text-white/70' : 'text-stone-400'} ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg z-20 py-1">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-[13px] transition-colors border-b border-stone-100 mb-1 ${value.length === 0 ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <span className="flex items-center gap-2 truncate">
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${value.length === 0 ? 'bg-neutral-900 border-neutral-900' : 'border-stone-300'}`}>
                {value.length === 0 && <Check size={11} className="text-white" />}
              </span>
              {allLabel}
            </span>
            {typeof allCount === 'number' && <span className="text-[11px] text-stone-400 shrink-0">({allCount})</span>}
          </button>
          {options.map(o => {
            const checked = value.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-[13px] transition-colors ${checked ? 'text-stone-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-neutral-900 border-neutral-900' : 'border-stone-300'}`}>
                    {checked && <Check size={11} className="text-white" />}
                  </span>
                  <span className="truncate">{o.label}</span>
                </span>
                {typeof o.count === 'number' && <span className="text-[11px] text-stone-400 shrink-0">({o.count})</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

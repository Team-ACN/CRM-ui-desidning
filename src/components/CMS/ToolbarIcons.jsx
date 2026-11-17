import React, { useRef, useState } from 'react';
import { Archive, Search, X } from 'lucide-react';

export function SearchCircle({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const expanded = open || !!value;
  return (
    <div
      className={`relative h-9 rounded-full border bg-white flex items-center overflow-hidden transition-[width,border-color] duration-200 ${
        expanded ? 'w-56 border-neutral-300' : 'w-9 border-neutral-200 hover:bg-neutral-50/40'
      }`}
    >
      <button
        type="button"
        title="Search"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
        className="w-9 h-9 shrink-0 flex items-center justify-center text-neutral-500"
      >
        <Search size={15} />
      </button>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => !value && setOpen(false)}
        placeholder="Search..."
        tabIndex={expanded ? 0 : -1}
        className="flex-1 min-w-0 pr-8 bg-transparent text-[14px] text-label placeholder:text-tertiary outline-none"
      />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="absolute right-2.5 w-4 h-4 rounded-full bg-tertiary text-white flex items-center justify-center">
          <X size={10} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

export function ArchiveCircle({ active, onToggle }) {
  return (
    <button
      type="button"
      title={active ? 'Showing archived · click to go back' : 'Show archived'}
      onClick={onToggle}
      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
        active ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50/40'
      }`}
    >
      <Archive size={15} />
    </button>
  );
}

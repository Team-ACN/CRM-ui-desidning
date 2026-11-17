import React from 'react';
import { X } from 'lucide-react';

const pressable = 'transition-[transform,background-color,color,box-shadow] duration-100 ease-out active:scale-[0.97]';

// Selectable chip (rule-group picker: tap to toggle, fills neutral-dark when selected) and
// removable chip (cohort/cell tags etc: shows an × on the end). Same shape, two behaviors.
const Chip = ({ label, selected = false, onClick, onRemove, className = '' }) => {
  if (onRemove) {
    return (
      <span className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 h-7 rounded-full bg-white border border-neutral-200 text-[12px] font-medium text-neutral-700 ${className}`}>
        {label}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className={`w-4 h-4 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 ${pressable}`}
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center h-7 px-3 rounded-full border text-[12px] font-medium transition-colors ${pressable} ${
        selected
          ? 'bg-neutral-900 border-neutral-900 text-white'
          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50/40'
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default Chip;

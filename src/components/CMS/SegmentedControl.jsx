import React from 'react';

// Neutral pill track on white — the selected segment fills neutral-dark, never the accent colour.
const SegmentedControl = ({ options, value, onChange, size = 'md', className = '' }) => (
  <div role="tablist" className={`inline-flex p-0.5 rounded-full bg-white border border-neutral-200 ${className}`}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(option.value)}
          className={`${size === 'sm' ? 'h-7 px-3 text-[12px]' : 'h-8 px-4 text-[13px]'} rounded-full font-medium transition-colors duration-200 ${
            selected ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;

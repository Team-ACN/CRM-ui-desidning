import React from 'react';

// iOS-style segmented control: grey track, the selected segment floats on a white pill.
const SegmentedControl = ({ options, value, onChange, size = 'md', className = '' }) => (
  <div role="tablist" className={`inline-flex p-0.5 rounded-[10px] bg-fill ${className}`}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(option.value)}
          className={`${size === 'sm' ? 'h-7 px-3 text-[12px]' : 'h-8 px-4 text-[13px]'} rounded-lg font-medium transition-[background-color,color,box-shadow] duration-200 ${
            selected ? 'bg-surface text-label shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]' : 'text-secondary hover:text-label'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;

import React from 'react';

// A two-option pill toggle (Call/WhatsApp, Outbound/Inbound, etc.) — shared by the Agent Connect
// panel and the Legal Doc Leads page's Call Log so the connect-logging controls look identical.
const SegmentedToggle = ({ options, value, onChange, ariaLabel }) => (
  <div role="radiogroup" aria-label={ariaLabel} className="inline-grid grid-cols-2 gap-1 p-0 bg-neutral-50 rounded-full">
    {options.map((o) => {
      const isSelected = value === o.value;
      return (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={isSelected}
          onClick={() => onChange(o.value)}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border text-[13px] transition-colors cursor-pointer ${
            isSelected
              ? 'bg-white border-neutral-900 text-neutral-900 font-semibold'
              : 'bg-transparent border-transparent text-neutral-500 font-medium hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          {isSelected && o.activeIcon ? o.activeIcon : o.icon}
          <span>{o.label}</span>
        </button>
      );
    })}
  </div>
);

export default SegmentedToggle;

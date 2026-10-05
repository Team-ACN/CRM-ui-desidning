import React from 'react';

// iOS switch. The knob slides with a critically-damped curve.
const Switch = ({ checked, onChange, label, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    className={`relative inline-flex shrink-0 w-[42px] h-[26px] rounded-full transition-colors duration-200 disabled:opacity-40 ${
      checked ? 'bg-positive-dot' : 'bg-fill-strong'
    }`}
  >
    <span
      className={`absolute top-[2px] left-[2px] w-[22px] h-[22px] rounded-full bg-white shadow-[0_2px_4px_rgb(0_0_0/0.15),0_0_0_0.5px_rgb(0_0_0/0.04)] transition-transform duration-300 ease-apple ${
        checked ? 'translate-x-4' : ''
      }`}
    />
  </button>
);

export default Switch;

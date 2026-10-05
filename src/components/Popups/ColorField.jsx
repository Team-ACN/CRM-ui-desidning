import React from 'react';
import { labelClass } from '../cms-ui';
import { isValidHex } from './contrast';

const ColorField = ({ label, value, onChange }) => {
  const valid = isValidHex(value);

  return (
    <div>
      {label && (
        <label className={labelClass}>{label}</label>
      )}
      <div
        className={`flex items-center gap-2 pl-1.5 pr-3 h-9 rounded-[10px] bg-fill transition-shadow focus-within:ring-4 focus-within:ring-accent/10 ${
          valid ? '' : 'ring-1 ring-danger'
        }`}
      >
        <input
          type="color"
          value={valid ? value : '#000000'}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent p-0 shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="#059669"
          className="flex-1 min-w-0 bg-transparent text-[13px] font-mono text-label placeholder:text-tertiary outline-none"
        />
      </div>
    </div>
  );
};

export default ColorField;

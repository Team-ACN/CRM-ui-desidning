import React from 'react';
import { isValidHex } from './contrast';

const ColorField = ({ label, value, onChange }) => {
  const valid = isValidHex(value);

  return (
    <div>
      {label && (
        <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
      )}
      <div
        className={`flex items-center gap-2 px-2 py-1.5 border rounded-lg bg-white ${
          valid ? 'border-gray-200' : 'border-red-300'
        }`}
      >
        <input
          type="color"
          value={valid ? value : '#000000'}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-7 h-7 rounded cursor-pointer border border-gray-200 bg-white p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="#059669"
          className="flex-1 min-w-0 text-xs font-mono text-gray-700 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default ColorField;

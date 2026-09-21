import React from 'react';

const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-500 accent-emerald-700"
    />
    <span className="text-sm text-gray-800">{label}</span>
  </label>
);

export default CheckboxField;

import React from 'react';
import FieldShell from './FieldShell';
import { inputRing } from './pillStyles';
import { parsePrice } from '../../BulkUpload/propertySchema';
import { priceInWords } from '../priceWords';

/** Amount input with the ₹ prefix, unit selector and the live "in words" line. */
const PriceField = ({
  label,
  value,
  onChange,
  required,
  issue,
  source,
  confidence,
  placeholder,
  hint,
  unit,
  unitOptions,
  onUnitChange,
  showWords,
}) => (
  <FieldShell label={label} required={required} issue={issue} source={source} confidence={confidence}>
    <div
      className={`flex items-center border rounded-lg overflow-hidden ${inputRing(issue, source, confidence)}`}
    >
      <span className="pl-3 text-sm text-gray-500">₹</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="flex-1 px-2 py-2.5 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
      />

      {unitOptions && (
        <select
          value={unit || unitOptions[0]}
          onChange={(event) => onUnitChange(event.target.value)}
          className="m-1.5 px-3 py-1.5 border border-gray-200 rounded-md bg-white text-sm text-gray-700 focus:outline-none"
        >
          {unitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </div>

    {hint && <p className="text-xs text-gray-500">{hint}</p>}
    {showWords && <p className="text-sm text-gray-700">{priceInWords(parsePrice(value || ''))}</p>}
  </FieldShell>
);

export default PriceField;

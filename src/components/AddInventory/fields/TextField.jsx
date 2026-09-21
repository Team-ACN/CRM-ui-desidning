import React from 'react';
import { Search } from 'lucide-react';
import FieldShell from './FieldShell';
import { inputRing } from './pillStyles';

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  issue,
  source,
  confidence,
  hint,
  suffix,
  withSearchIcon,
}) => (
  <FieldShell label={label} required={required} issue={issue} source={source} confidence={confidence} hint={hint}>
    <div className="relative">
      {withSearchIcon && (
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      )}

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full py-2.5 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
          withSearchIcon ? 'pl-9' : 'pl-3'
        } ${suffix ? 'pr-16' : 'pr-3'} ${inputRing(issue, source, confidence)}`}
      />

      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  </FieldShell>
);

export default TextField;

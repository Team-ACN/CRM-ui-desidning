import React from 'react';
import { SOURCE_AI } from '../formModel';

const parseCount = (value) => {
  const match = String(value ?? '').match(/\d{1,2}/);
  return match ? Number(match[0]) : 0;
};

const Step = ({ symbol, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 text-lg leading-none flex items-center justify-center hover:border-gray-500 disabled:opacity-40 disabled:hover:border-gray-300"
  >
    {symbol}
  </button>
);

/** Stepper used for Parking, laid out label — minus — count — plus like the live form. */
const CounterField = ({ label, value, onChange, max = 20, source }) => {
  const count = parseCount(value);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[15px] font-bold text-gray-900">{label}</span>

      <div className="flex items-center gap-8 flex-1 justify-between max-w-2xl">
        <Step symbol="−" onClick={() => onChange(String(Math.max(0, count - 1)))} disabled={count === 0} />
        <span className={`text-base font-bold ${source === SOURCE_AI ? 'text-violet-700' : 'text-emerald-800'}`}>
          {count}
        </span>
        <Step symbol="+" onClick={() => onChange(String(Math.min(max, count + 1)))} disabled={count === max} />
      </div>
    </div>
  );
};

export default CounterField;

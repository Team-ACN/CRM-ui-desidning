import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, ChevronDown, Check } from 'lucide-react';
import {
  DATE_PRESETS,
  DEFAULT_FILTERS,
  KAM_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  STATUS_OPTIONS,
} from './enquiryConstants';

const FILTERS = [
  { key: 'status', label: 'Enquiry Status', options: STATUS_OPTIONS },
  { key: 'contacted', label: 'Contacted', options: ['Contacted', 'Not Contacted'] },
  { key: 'propertyStatus', label: 'Property Status', options: ['Available', 'Not Available'] },
  { key: 'currentPropertyStatus', label: 'Current Property Status', options: PROPERTY_STATUS_OPTIONS },
  { key: 'buyerKam', label: 'Buyer KAM', options: KAM_OPTIONS },
  { key: 'sellerKam', label: 'Seller KAM', options: KAM_OPTIONS },
];

const EnquiriesFilters = ({ filters, onChange }) => {
  const { dealType, selected, date: dateValue } = filters;

  const setDealType = (type) => onChange({ ...filters, dealType: type });

  const setDateValue = (date) => onChange({ ...filters, date });

  const handleSelect = (key, value) =>
    onChange({
      ...filters,
      selected: {
        ...selected,
        [key]: selected[key] === value ? undefined : value,
      },
    });

  const handleReset = () => onChange(DEFAULT_FILTERS);

  return (
    <div className="relative z-30 flex items-center gap-3 mb-6 flex-wrap">
      {/* Resale / Rental toggle */}
      <div className="flex bg-gray-100 p-1 rounded-lg">
        {['Resale', 'Rental'].map((type) => (
          <button
            key={type}
            onClick={() => setDealType(type)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              dealType === type
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        onClick={handleReset}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
      >
        <RotateCcw size={18} />
      </button>

      {FILTERS.map((filter) => (
        <Dropdown
          key={filter.key}
          label={filter.label}
          options={filter.options}
          value={selected[filter.key]}
          onSelect={(value) => handleSelect(filter.key, value)}
        />
      ))}

      <DateDropdown value={dateValue} onChange={setDateValue} />
    </div>
  );
};

const DateDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const active = Boolean(value);

  const selectPreset = (preset) => {
    onChange(value === preset ? null : preset);
    setFrom('');
    setTo('');
    setOpen(false);
  };

  const applyRange = () => {
    if (!from || !to) return;
    onChange(`${from} → ${to}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {value || 'Date of Enquiry'}
        <ChevronDown
          size={14}
          className={`${active ? 'text-gray-300' : 'text-gray-400'} transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-40 min-w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => selectPreset(preset)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              {preset}
              {value === preset && <Check size={14} className="text-gray-900" />}
            </button>
          ))}

          {/* Custom range */}
          <div className="border-t border-gray-100 mt-1 pt-2 px-3 pb-2">
            <p className="text-xs font-medium text-gray-500 mb-2">Custom range</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between gap-2 text-xs text-gray-600">
                From
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs text-gray-600">
                To
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                  className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </label>
              <button
                onClick={applyRange}
                disabled={!from || !to}
                className="mt-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                Apply range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Dropdown = ({ label, options, value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
          value
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {value || label}
        <ChevronDown
          size={14}
          className={`${value ? 'text-gray-300' : 'text-gray-400'} transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-40 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              {option}
              {value === option && <Check size={14} className="text-gray-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnquiriesFilters;

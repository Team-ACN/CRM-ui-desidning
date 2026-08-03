import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_STATUS_STYLES,
  SELLING_PLATFORMS,
  SOLD_STATUS,
} from './enquiryConstants';

const PlatformSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matches = SELLING_PLATFORMS.filter((platform) =>
    platform.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={open ? query : value}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search or select selling platform"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
      />

      {open && (
        <div className="absolute left-0 top-full mt-1 z-10 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {matches.length === 0
            ? <p className="px-3 py-2 text-sm text-gray-500">No platform found</p>
            : matches.map((platform) => (
              <button
                key={platform}
                onClick={() => {
                  onChange(platform);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-gray-700 text-left hover:bg-gray-50"
              >
                {platform}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

const SoldStatusModal = ({ enquiry, details, onCancel, onUpdate }) => {
  const [status, setStatus] = useState(SOLD_STATUS);
  const [soldPrice, setSoldPrice] = useState(details?.soldPrice || '');
  const [platform, setPlatform] = useState(details?.platform || '');
  const [notes, setNotes] = useState(details?.notes || '');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const submit = () =>
    onUpdate(enquiry.id, status, { soldPrice: soldPrice.trim(), platform, notes: notes.trim() });

  const statusStyle = PROPERTY_STATUS_STYLES[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl max-h-full overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Update Inventory Status</h2>
          <p className="text-sm text-gray-500 mt-1 truncate" title={enquiry.propertyName}>
            Updating status for {enquiry.propertyName} ({enquiry.propertyId})
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Status</p>
            <div className="relative">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={`w-full appearance-none rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 ${statusStyle.trigger}`}
              >
                {PROPERTY_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Sold Price (Optional) (in Lakhs)</p>
            <input
              type="number"
              min="0"
              value={soldPrice}
              onChange={(event) => setSoldPrice(event.target.value)}
              placeholder="Enter amount in lakhs"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Selling Platform (Optional)</p>
            <PlatformSelect value={platform} onChange={setPlatform} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Notes (Optional)</p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Add notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 resize-y focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="border border-gray-300 hover:bg-gray-50 text-gray-800 px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoldStatusModal;

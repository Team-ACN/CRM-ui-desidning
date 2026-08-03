import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PartyNumberPicker from './PartyNumberPicker';
import { CALL_PARTIES, CONNECTION_STATUSES, EMPTY_CALL_RESULT } from './enquiryConstants';

const emptyResults = () =>
  Object.fromEntries(CALL_PARTIES.map((party) => [party.key, EMPTY_CALL_RESULT]));

const CallPanel = ({ enquiry, savedResults, onSave, onClose }) => {
  const [activeParty, setActiveParty] = useState(CALL_PARTIES[0].key);
  const [results, setResults] = useState(() => ({ ...emptyResults(), ...savedResults }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeResult = results[activeParty] || EMPTY_CALL_RESULT;

  const updateActive = (patch) =>
    setResults((prev) => ({
      ...prev,
      [activeParty]: { ...(prev[activeParty] || EMPTY_CALL_RESULT), ...patch },
    }));

  const clearAll = () => setResults(emptyResults());

  const hasAnyResult = CALL_PARTIES.some((party) => results[party.key]?.status);

  const save = () => {
    onSave(enquiry.id, results);
    onClose();
  };

  const initial = enquiry.propertyName.trim().charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="relative w-full max-w-2xl h-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 shrink-0 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-lg font-semibold">
                {initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate" title={enquiry.propertyName}>
                  {enquiry.propertyName}
                </h2>
                <p className="text-sm text-gray-500">{enquiry.enqId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              aria-label="Close call panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Two numbers — pick which one this call result is for */}
          <div className="mt-4">
            <PartyNumberPicker
              enquiry={enquiry}
              activeParty={activeParty}
              onSelectParty={setActiveParty}
              renderBadge={(partyKey) => results[partyKey]?.status || null}
            />
          </div>
        </div>

        {/* Call result for the selected number */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <h3 className="text-base font-bold text-gray-900">
                Call Result — {CALL_PARTIES.find((party) => party.key === activeParty).label}
              </h3>
            </div>

            <p className="text-sm font-semibold text-gray-700 mb-2">Connection Status</p>
            <div className="grid grid-cols-3 gap-3">
              {CONNECTION_STATUSES.map((status) => (
                <label
                  key={status}
                  className={`flex items-center gap-2 px-3 py-3 rounded-lg border cursor-pointer transition-colors ${
                    activeResult.status === status
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`connection-status-${activeParty}`}
                    checked={activeResult.status === status}
                    onChange={() => updateActive({ status })}
                    className="accent-gray-900"
                  />
                  <span className="text-sm font-semibold text-gray-900">{status}</span>
                </label>
              ))}
            </div>

            <p className="text-sm font-semibold text-gray-700 mt-5 mb-2">Notes (Optional)</p>
            <textarea
              value={activeResult.notes}
              onChange={(event) => updateActive({ notes: event.target.value })}
              rows={4}
              placeholder="Add any additional notes about this call..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 resize-y focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={clearAll}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Clear All
          </button>
          <button
            onClick={save}
            disabled={!hasAnyResult}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Save Call Result
          </button>
        </div>
      </aside>
    </div>
  );
};

export default CallPanel;

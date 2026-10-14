import React from 'react';
import { KAM_OPTIONS, SERVICE_NAME_OPTIONS, SOURCE_OPTIONS } from '../../data/mockLegalDoc';

// Shared "create a new lead-shaped record" modal — same fields and layout for the Leads page's
// "Add Lead", the Qualify page's "Qualify Lead" and the Service page's "Add Service", which only
// differ in title/submit label, what happens on submit, and whether a price field is shown.
const AddLeadRecordModal = ({ open, onClose, title, submitLabel, formState, onChange, onSubmit, withPrice = false }) => {
  if (!open) return null;

  const set = (patch) => onChange((f) => ({ ...f, ...patch }));

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-neutral-900 mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Agent ID</label>
            <input
              type="text"
              required
              value={formState.agentId}
              onChange={(e) => set({ agentId: e.target.value })}
              placeholder="e.g. CPC450"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Agent name</label>
            <input
              type="text"
              required
              value={formState.agentName}
              onChange={(e) => set({ agentName: e.target.value })}
              placeholder="e.g. Rohit Verma"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Contact number</label>
            <input
              type="text"
              value={formState.contact}
              onChange={(e) => set({ contact: e.target.value })}
              placeholder="e.g. +919845011450"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">KAM</label>
            <select
              value={formState.kam}
              onChange={(e) => set({ kam: e.target.value })}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] bg-white"
            >
              {KAM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Service</label>
            <select
              value={formState.serviceName}
              onChange={(e) => set({ serviceName: e.target.value })}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] bg-white"
            >
              {SERVICE_NAME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {withPrice && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-500 mb-1">Negotiable price (optional)</label>
              <input
                type="number"
                min="0"
                value={formState.amount}
                onChange={(e) => set({ amount: e.target.value })}
                placeholder="e.g. 9500"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400"
              />
            </div>
          )}
          <div>
            <label className="block text-[12px] font-medium text-neutral-500 mb-1">Source</label>
            <select
              value={formState.source}
              onChange={(e) => set({ source: e.target.value })}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] bg-white"
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-neutral-500 hover:text-neutral-800 font-medium">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-neutral-900 text-white rounded-2xl font-medium hover:bg-neutral-800">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadRecordModal;

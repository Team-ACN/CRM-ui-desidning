import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { CALL_PARTIES } from './enquiryConstants';

// An enquiry has two contacts — buyer and seller. Panels scope their content to whichever is picked.
const PartyNumberPicker = ({ enquiry, activeParty, onSelectParty, renderBadge }) => {
  const [copiedParty, setCopiedParty] = useState(null);

  const copyNumber = async (party) => {
    try {
      await navigator.clipboard.writeText(enquiry[party.numberField]);
      setCopiedParty(party.key);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      setCopiedParty(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {CALL_PARTIES.map((party) => {
        const selected = party.key === activeParty;
        const badge = renderBadge?.(party.key);

        return (
          <div
            key={party.key}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
              selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-gray-50/60'
            }`}
          >
            <button
              onClick={() => copyNumber(party)}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
              aria-label={`Copy ${party.label} number`}
            >
              {copiedParty === party.key ? <Check size={14} /> : <Copy size={14} />}
            </button>

            <button onClick={() => onSelectParty(party.key)} className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                {party.label} · {enquiry[party.nameField]}
              </p>
              <p className="text-base font-bold text-gray-900">{enquiry[party.numberField]}</p>
            </button>

            {badge && (
              <span className="shrink-0 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                {badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PartyNumberPicker;

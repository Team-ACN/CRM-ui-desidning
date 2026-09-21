import React from 'react';
import { RotateCcw, Sparkles, X } from 'lucide-react';
import { SOURCE_AI, labelFor } from './formModel';

const Stat = ({ value, label, tone }) => (
  <div className="flex flex-col">
    <span className={`text-lg font-bold ${tone}`}>{value}</span>
    <span className="text-[11px] text-gray-500">{label}</span>
  </div>
);

/** Result summary shown above the form once a pasted listing has been parsed. */
const AiExtractionBanner = ({ form, summary, onRepaste, onDismiss }) => {
  const lowConfidenceKeys = Object.keys(form.sources).filter(
    (key) => form.sources[key] === SOURCE_AI && form.confidence[key] === 'low',
  );

  return (
    <div className="border border-violet-200 bg-violet-50/60 rounded-xl px-5 py-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-600 text-white shrink-0">
            <Sparkles size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Form filled from your pasted listing</h3>
            <p className="text-xs text-gray-600">
              Violet fields came from the text. Check them, fix anything wrong, then submit.
            </p>
          </div>
        </div>

        <button type="button" onClick={onDismiss} className="p-1 text-violet-400 hover:text-violet-700">
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-8 pl-12">
        <Stat value={summary.filled} label="fields filled" tone="text-violet-700" />
        <Stat value={summary.needsReview} label="need a check" tone="text-amber-600" />
        <Stat value={summary.missingRequired} label="still required" tone="text-red-600" />

        <button
          type="button"
          onClick={onRepaste}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-300 bg-white text-xs font-medium text-violet-700 hover:bg-violet-50"
        >
          <RotateCcw size={13} />
          Paste another listing
        </button>
      </div>

      {lowConfidenceKeys.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pl-12">
          <span className="text-[11px] font-medium text-amber-700">Low confidence:</span>
          {lowConfidenceKeys.map((key) => (
            <span
              key={key}
              className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium"
            >
              {labelFor(key)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiExtractionBanner;

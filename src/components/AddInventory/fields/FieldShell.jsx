import React from 'react';
import { AlertCircle, Sparkles, Pencil } from 'lucide-react';
import { SOURCE_AI, SOURCE_EDITED } from '../formModel';

const CONFIDENCE_LABEL = {
  high: 'AI filled',
  medium: 'AI filled · check',
  low: 'AI guess · verify',
};

const CONFIDENCE_STYLE = {
  high: 'bg-violet-50 text-violet-700 border-violet-200',
  medium: 'bg-violet-50 text-violet-700 border-violet-200',
  low: 'bg-amber-50 text-amber-700 border-amber-200',
};

const SourceBadge = ({ source, confidence }) => {
  if (source === SOURCE_EDITED) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-500">
        <Pencil size={10} />
        Edited
      </span>
    );
  }

  if (source !== SOURCE_AI) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${
        CONFIDENCE_STYLE[confidence] ?? CONFIDENCE_STYLE.medium
      }`}
    >
      <Sparkles size={10} />
      {CONFIDENCE_LABEL[confidence] ?? CONFIDENCE_LABEL.medium}
    </span>
  );
};

/** Label, AI provenance badge and error line shared by every input in the form. */
const FieldShell = ({ label, required, issue, source, confidence, hint, children }) => (
  <div className="flex flex-col gap-2">
    {label && (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[15px] font-bold text-gray-900">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        <SourceBadge source={source} confidence={confidence} />
      </div>
    )}

    {children}

    {hint && !issue && <p className="text-xs text-gray-500">{hint}</p>}

    {issue && (
      <p
        className={`flex items-center gap-1 text-xs ${
          issue.severity === 'error' ? 'text-red-600' : 'text-amber-600'
        }`}
      >
        <AlertCircle size={12} />
        {issue.message}
      </p>
    )}
  </div>
);

export default FieldShell;

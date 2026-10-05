import React from 'react';
import { ArrowLeft, Save, Send, Circle, CheckCircle2 } from 'lucide-react';

const PAGE_TYPE_LABELS = {
  HOME: 'Home',
  PROPERTIES: 'Properties',
  WEBSITE: 'Webpage',
};

const StepIndicator = ({ label, done }) => {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <span className={`flex items-center gap-1 text-[10px] font-medium ${done ? 'text-emerald-600' : 'text-gray-400'}`}>
      <Icon size={9} strokeWidth={2.5} />
      {label}
    </span>
  );
};

const BuilderHeader = ({ isEditing, pageType, steps, canSave, onBack, onSaveDraft, onSubmit }) => (
  <div className="h-[60px] bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        aria-label="Back to templates"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {isEditing ? 'Edit Template' : 'Create Template'}
          </h2>
          {PAGE_TYPE_LABELS[pageType] && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-semibold uppercase tracking-wide">
              {PAGE_TYPE_LABELS[pageType]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {steps.map((step) => (
            <StepIndicator key={step.label} label={step.label} done={step.done} />
          ))}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2.5">
      <button
        onClick={onSaveDraft}
        disabled={!canSave}
        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
      >
        <Save size={15} />
        Save Draft
      </button>
      <button
        onClick={onSubmit}
        disabled={!canSave}
        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Send size={15} />
        Submit for Review
      </button>
    </div>
  </div>
);

export default BuilderHeader;

import React from 'react';
import { ArrowLeft, Save, Send, Circle, CheckCircle2 } from 'lucide-react';
import { Button, IconButton } from '../cms-ui';

const PAGE_TYPE_LABELS = {
  HOME: 'Home',
  PROPERTIES: 'Properties',
  WEBSITE: 'Webpage',
};

const StepIndicator = ({ label, done }) => {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <span className={`flex items-center gap-1 text-[12px] ${done ? 'text-label' : 'text-tertiary'}`}>
      <Icon size={13} strokeWidth={2} className={done ? 'text-accent' : 'text-tertiary'} />
      {label}
    </span>
  );
};

const BuilderHeader = ({ isEditing, pageType, steps, canSave, onBack, onSaveDraft, onSubmit }) => (
  <div className="material sticky top-0 z-20 h-[60px] bg-surface/80 backdrop-blur-xl backdrop-saturate-150 border-b border-separator px-4 flex items-center justify-between shrink-0">
    <div className="flex items-center gap-3">
      <IconButton icon={ArrowLeft} label="Back to templates" onClick={onBack} size={18} />
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-[17px] leading-[22px] font-semibold tracking-[-0.01em] text-label">
            {isEditing ? 'Edit template' : 'Create template'}
          </h2>
          {PAGE_TYPE_LABELS[pageType] && (
            <span className="text-[13px] text-secondary">{PAGE_TYPE_LABELS[pageType]}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {steps.map((step) => (
            <StepIndicator key={step.label} label={step.label} done={step.done} />
          ))}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="secondary" icon={Save} onClick={onSaveDraft} disabled={!canSave}>
        Save draft
      </Button>
      <Button variant="primary" icon={Send} onClick={onSubmit} disabled={!canSave}>
        Submit for review
      </Button>
    </div>
  </div>
);

export default BuilderHeader;

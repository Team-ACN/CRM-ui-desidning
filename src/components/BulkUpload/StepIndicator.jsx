import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Upload File' },
  { id: 2, label: 'Map & Validate' },
  { id: 3, label: 'Result' },
];

const circleClasses = (state) => {
  const styles = {
    complete: 'bg-emerald-800 text-white border-emerald-800',
    current: 'bg-gray-900 text-white border-gray-900',
    upcoming: 'bg-white text-gray-400 border-gray-300',
  };
  return styles[state];
};

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, index) => {
        const state = currentStep > step.id ? 'complete' : currentStep === step.id ? 'current' : 'upcoming';

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2.5">
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-semibold ${circleClasses(state)}`}
              >
                {state === 'complete' ? <Check size={14} /> : step.id}
              </span>
              <span
                className={`text-sm font-medium ${state === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`h-px flex-1 max-w-24 ${currentStep > step.id ? 'bg-emerald-800' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;

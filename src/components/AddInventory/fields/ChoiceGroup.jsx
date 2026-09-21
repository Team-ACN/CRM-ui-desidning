import React from 'react';
import FieldShell from './FieldShell';
import { IDLE_PILL, selectedPill } from './pillStyles';

const titleCase = (value) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

/** Single-select pill picker used for the short enum fields. */
const ChoiceGroup = ({ label, value, options, onChange, required, issue, source, confidence, labels = {} }) => (
  <FieldShell label={label} required={required} issue={issue} source={source} confidence={confidence}>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = String(value).toLowerCase() === option.toLowerCase();

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(isSelected ? '' : option)}
            className={isSelected ? selectedPill(source, confidence) : IDLE_PILL}
          >
            {labels[option] ?? titleCase(option)}
          </button>
        );
      })}
    </div>
  </FieldShell>
);

export default ChoiceGroup;

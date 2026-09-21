import React from 'react';
import { Check, Plus } from 'lucide-react';
import FieldShell from './FieldShell';
import { IDLE_PILL, selectedPill } from './pillStyles';

/** Multi-select pills — amenities, extra rooms, khata approvals. */
const MultiChoiceGroup = ({ label, values = [], options, onToggle, required }) => (
  <FieldShell label={label} required={required}>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = values.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`${isSelected ? selectedPill() : IDLE_PILL} flex items-center gap-1.5`}
          >
            {isSelected ? <Check size={14} /> : <Plus size={14} className="text-gray-400" />}
            {option}
          </button>
        );
      })}
    </div>
  </FieldShell>
);

export default MultiChoiceGroup;

import React from 'react';
import { fieldClass, hintClass, labelClass } from '../../cms-ui';
import Section from './Section';
import { describeFrequency, errorFor } from '../popupValidation';

const NumberField = ({ label, value, min = 0, placeholder, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input
      type="number"
      min={min}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className={`${fieldClass} tabular-nums`}
    />
  </div>
);

const DeliverySection = ({ popup, validation, onChange }) => {
  const frequency = popup.frequency || {};
  const updateFrequency = (updates) => onChange({ frequency: { ...frequency, ...updates } });

  return (
    <Section step={4} title="How often" hint="Capped by default so a popup can never nag.">
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Max shows"
          min={1}
          value={frequency.maxImpressions ?? 1}
          onChange={(maxImpressions) => updateFrequency({ maxImpressions: maxImpressions ?? 1 })}
        />
        <NumberField
          label="Min gap (h)"
          placeholder="—"
          value={frequency.minGapHours}
          onChange={(minGapHours) => updateFrequency({ minGapHours })}
        />
      </div>
      {errorFor(validation, 'frequency.maxImpressions') && (
        <p className="text-[12px] leading-4 text-danger">{errorFor(validation, 'frequency.maxImpressions')}</p>
      )}

      <p className="text-[13px] text-secondary bg-fill rounded-[10px] px-3 py-2">
        {describeFrequency(popup)}
      </p>

      <p className={hintClass}>
        Priority is set by dragging popups in the list — it only matters against popups sharing
        this trigger.
      </p>
    </Section>
  );
};

export default DeliverySection;

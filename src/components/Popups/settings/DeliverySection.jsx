import React from 'react';
import Section from './Section';
import { describeFrequency, errorFor } from '../popupValidation';

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900';

const NumberField = ({ label, value, min = 0, placeholder, onChange }) => (
  <div>
    <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
    <input
      type="number"
      min={min}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className={inputClass}
    />
  </div>
);

const DeliverySection = ({ popup, validation, onChange }) => {
  const frequency = popup.frequency || {};
  const updateFrequency = (updates) => onChange({ frequency: { ...frequency, ...updates } });

  return (
    <Section step={4} title="How often" hint="Capped by default so a popup can never nag.">
      <div className="grid grid-cols-3 gap-2">
        <NumberField
          label="Max shows"
          min={1}
          value={frequency.maxImpressions ?? 1}
          onChange={(maxImpressions) => updateFrequency({ maxImpressions: maxImpressions ?? 1 })}
        />
        <NumberField
          label="Cooldown (h)"
          placeholder="—"
          value={frequency.cooldownHours}
          onChange={(cooldownHours) => updateFrequency({ cooldownHours })}
        />
        <NumberField
          label="Min gap (h)"
          placeholder="—"
          value={frequency.minGapHours}
          onChange={(minGapHours) => updateFrequency({ minGapHours })}
        />
      </div>
      {errorFor(validation, 'frequency.maxImpressions') && (
        <p className="text-[10px] text-red-600">{errorFor(validation, 'frequency.maxImpressions')}</p>
      )}

      <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        {describeFrequency(popup)}
      </p>

      <p className="text-[11px] text-gray-400">
        Priority is set by dragging popups in the list — it only matters against popups sharing
        this trigger.
      </p>
    </Section>
  );
};

export default DeliverySection;

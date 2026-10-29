import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button, cardClass, fieldClass, labelClass, hintClass } from '../cms-ui';
import { THRESHOLD_FIELDS } from '../../data/mockHomeFeed';

const fieldError = (field, raw) => {
  const n = Number(raw);
  if (raw === '' || Number.isNaN(n)) return 'Enter a number';
  if (n < field.min || n > field.max) return `Between ${field.min} and ${field.max}`;
  return null;
};

const crossErrors = (v) => ({
  ...(Number(v.minListings) > Number(v.maxListings) && { maxListings: 'Must be ≥ min listings' }),
  ...(Number(v.yieldMin) >= Number(v.yieldMax) && { yieldMax: 'Must be above yield min' }),
});

const ThresholdsPanel = ({ thresholds, onSubmit }) => {
  const [draft, setDraft] = useState(() => ({ ...thresholds.values }));

  const errors = THRESHOLD_FIELDS.reduce((acc, f) => {
    const err = fieldError(f, String(draft[f.key]));
    return err ? { ...acc, [f.key]: err } : acc;
  }, crossErrors(draft));
  const dirty = THRESHOLD_FIELDS.some((f) => Number(draft[f.key]) !== thresholds.values[f.key]);
  const valid = Object.keys(errors).length === 0;

  const submit = () => {
    const values = THRESHOLD_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: Number(draft[f.key]) }), {});
    onSubmit(values);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-secondary">
          Version {thresholds.version} · <span className="font-medium text-label">{thresholds.status}</span> · {thresholds.updatedAt}
        </p>
        <Button variant="primary" icon={Send} onClick={submit} disabled={!dirty || !valid}>
          Submit for PM approval
        </Button>
      </div>
      <div className={`${cardClass} p-5 grid grid-cols-2 gap-x-6 gap-y-5`}>
        {THRESHOLD_FIELDS.map((f) => (
          <div key={f.key}>
            <label className={labelClass} htmlFor={`thr-${f.key}`}>{f.label}</label>
            <input
              id={`thr-${f.key}`}
              type="number"
              min={f.min}
              max={f.max}
              step={f.step}
              value={draft[f.key]}
              onChange={(e) => setDraft((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className={`${fieldClass} tabular-nums`}
            />
            {errors[f.key]
              ? <p className="text-[12px] text-danger mt-1">{errors[f.key]}</p>
              : f.hint && <p className={`${hintClass} mt-1`}>{f.hint}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThresholdsPanel;

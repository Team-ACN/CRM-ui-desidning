import React from 'react';
import { fieldClass, labelClass } from '../../cms-ui';
import Section from './Section';
import CohortSelect from '../CohortSelect';
import { EVENT_KEYS, PAGE_KEYS, TRIGGER_TYPES } from '../popupConstants';
import { errorFor } from '../popupValidation';

const selectClass = `${fieldClass} cursor-pointer`;

const Field = ({ label, error, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
    {error && <p className="mt-1.5 text-[12px] leading-4 text-danger">{error}</p>}
  </div>
);

const PlacementSection = ({ popup, validation, cohorts, onChange }) => {
  const trigger = popup.trigger || {};
  const triggerDef = TRIGGER_TYPES.find((t) => t.id === trigger.type);

  const updateTrigger = (updates) => onChange({ trigger: { ...trigger, ...updates } });

  return (
    <Section step={3} title="Where it shows" hint="One trigger, one audience.">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Trigger" error={errorFor(validation, 'trigger.type')}>
          <select
            value={trigger.type || ''}
            onChange={(e) =>
              updateTrigger({
                type: e.target.value,
                pageKey: null,
                scrollDepthPct: e.target.value === 'scroll' ? 50 : null,
                eventKey: null,
              })
            }
            className={selectClass}
          >
            {TRIGGER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        {triggerDef?.needsPageKey && (
          <Field label="Page" error={errorFor(validation, 'trigger.pageKey')}>
            <select
              value={trigger.pageKey || ''}
              onChange={(e) => updateTrigger({ pageKey: e.target.value })}
              className={selectClass}
            >
              <option value="">Select...</option>
              {PAGE_KEYS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        )}

        {trigger.type === 'event' && (
          <Field label="Event" error={errorFor(validation, 'trigger.eventKey')}>
            <select
              value={trigger.eventKey || ''}
              onChange={(e) => updateTrigger({ eventKey: e.target.value })}
              className={selectClass}
            >
              <option value="">Select...</option>
              {EVENT_KEYS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {trigger.type === 'scroll' && (
        <Field
          label={`Scroll depth — ${trigger.scrollDepthPct || 0}%`}
          error={errorFor(validation, 'trigger.scrollDepthPct')}
        >
          <input
            type="range"
            min={1}
            max={100}
            step={5}
            value={trigger.scrollDepthPct || 50}
            onChange={(e) => updateTrigger({ scrollDepthPct: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </Field>
      )}

      <Field label="Audience">
        <CohortSelect
          cohorts={cohorts}
          selectedIds={popup.cohortIncludeIds || []}
          onChange={(cohortIncludeIds) => onChange({ cohortIncludeIds })}
        />
      </Field>
    </Section>
  );
};

export default PlacementSection;

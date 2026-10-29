import React, { useState } from 'react';
import { Save, RotateCcw, Lock } from 'lucide-react';
import { Button, cardClass, fieldClass, labelClass, hintClass } from '../cms-ui';
import { COPY_LIMITS, DEFAULT_TEMPLATE_COPY } from '../../data/mockHomeFeed';
import { measure, tokensOf, validateCopy, validateCopyEntry } from './headingRules';

const PARTS = [
  { key: 'title', label: 'Title' },
  { key: 'context', label: 'Context line' },
  { key: 'tag', label: 'Card tag' },
];

const Counter = ({ part, text }) => {
  const limit = COPY_LIMITS[part];
  const { raw, min } = measure(part, text);
  if (min > limit) return <span className="text-danger">{min}/{limit} after overflow rules</span>;
  if (raw > limit) return <span className="text-warning">{raw}/{limit} worst case · shortened at runtime</span>;
  return <span className="text-secondary">{raw}/{limit} worst case</span>;
};

const PartField = ({ part, label, value, lockedTokens, error, onChange }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className={`${labelClass} mb-0`} htmlFor={`copy-${part}`}>{label}</label>
      <span className="text-[12px] tabular-nums"><Counter part={part} text={value} /></span>
    </div>
    <input id={`copy-${part}`} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
      {lockedTokens.map((t, i) => (
        <span key={`${t}-${i}`} className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-accent-soft text-accent text-[11px] font-medium">
          <Lock size={9} strokeWidth={2} /> {t}
        </span>
      ))}
    </div>
    {error && <p className="text-[12px] text-danger mt-1">{error}</p>}
  </div>
);

const CopyEditorPanel = ({ sectionTypes, copy, onSave, onSaved }) => {
  const [draft, setDraft] = useState(copy);
  const [selectedId, setSelectedId] = useState(1);
  const [saveErrors, setSaveErrors] = useState({});

  const allErrors = validateCopy(draft, DEFAULT_TEMPLATE_COPY);
  const entry = draft[selectedId];
  const entryErrors = validateCopyEntry(entry, DEFAULT_TEMPLATE_COPY[selectedId]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(copy);

  const update = (part, value) =>
    setDraft((prev) => ({ ...prev, [selectedId]: { ...prev[selectedId], [part]: value } }));

  const save = () => {
    const errors = onSave(draft);
    setSaveErrors(errors);
    if (Object.keys(errors).length === 0) onSaved?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-secondary">
          Edit fixed words only. Tokens and their order are locked. Saves are rejected if any template
          can exceed {COPY_LIMITS.title} / {COPY_LIMITS.context} / {COPY_LIMITS.tag} characters with worst-case tokens.
        </p>
        <Button variant="primary" icon={Save} onClick={save} disabled={!dirty}>Save copy</Button>
      </div>
      {Object.keys(saveErrors).length > 0 && (
        <p className="text-[13px] text-danger">
          Rejected: fix section {Object.keys(saveErrors).map((id) => `#${id}`).join(', ')}.
        </p>
      )}
      <div className="grid grid-cols-[240px_1fr] gap-4">
        <div className={`${cardClass} py-1 max-h-[520px] overflow-y-auto custom-scrollbar`}>
          {sectionTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                selectedId === t.id ? 'bg-accent-soft text-label font-medium' : 'text-secondary hover:bg-black/[0.02]'
              }`}
            >
              <span className="w-7 tabular-nums text-tertiary">#{t.id}</span>
              <span className="flex-1 truncate">{t.name}</span>
              {allErrors[t.id] && <span className="w-1.5 h-1.5 rounded-full bg-danger" />}
            </button>
          ))}
        </div>
        <div className={`${cardClass} p-5 space-y-5`}>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-label">#{selectedId} {sectionTypes.find((t) => t.id === selectedId)?.name}</h3>
            <Button
              variant="plain"
              size="sm"
              icon={RotateCcw}
              onClick={() => setDraft((prev) => ({ ...prev, [selectedId]: DEFAULT_TEMPLATE_COPY[selectedId] }))}
            >
              Reset
            </Button>
          </div>
          {PARTS.map((p) => (
            <PartField key={p.key} part={p.key} label={p.label} value={entry[p.key]} lockedTokens={tokensOf(DEFAULT_TEMPLATE_COPY[selectedId][p.key])} error={entryErrors[p.key]} onChange={(v) => update(p.key, v)} />
          ))}
          <p className={hintClass}>Card tag may be empty (shown as no tag). Missing tokens at runtime use the section fallback; no fallback hides the section.</p>
        </div>
      </div>
    </div>
  );
};

export default CopyEditorPanel;

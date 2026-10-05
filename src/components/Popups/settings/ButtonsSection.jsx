import React from 'react';
import { AlertTriangle, CheckCircle2, Wand2 } from 'lucide-react';
import { fieldClass, hintClass, labelClass } from '../../cms-ui';
import Section from './Section';
import ColorField from '../ColorField';
import { contrastLevel, formatRatio } from '../contrast';
import { getTemplate } from '../popupTemplates';
import { errorFor } from '../popupValidation';

const Field = ({ label, error, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
    {error && <p className="mt-1.5 text-[12px] leading-4 text-danger">{error}</p>}
  </div>
);

const inputClass = fieldClass;

// App popups render the buttons in a solid action area under the poster. That colour
// is read off the poster's bottom edge so the sheet reads as one surface — the author
// only steps in when the automatic match is wrong.
const ActionColorField = ({ popup, onChange, onMatchPoster }) => {
  const isMatched = popup.matchPosterColor !== false;
  const creativeWord = popup.surface === 'app' ? 'poster' : 'banner';

  return (
    <div>
      <label className={labelClass}>Action area colour</label>

      {isMatched ? (
        <div className="flex items-center gap-2 pl-1.5 pr-3 h-9 rounded-[10px] bg-fill">
          <span
            className="w-6 h-6 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] shrink-0"
            style={{ backgroundColor: popup.actionBarColor || '#111111' }}
          />
          <span className="flex-1 min-w-0 text-[13px] font-mono text-label truncate">
            {popup.actionBarColor || '—'}
          </span>
          <span className="flex items-center gap-1 text-[12px] font-medium text-accent shrink-0">
            <Wand2 size={14} strokeWidth={1.75} />
            Matched
          </span>
        </div>
      ) : (
        <ColorField
          label=""
          value={popup.actionBarColor || ''}
          onChange={(actionBarColor) => onChange({ actionBarColor })}
        />
      )}

      <div className="flex items-center justify-between gap-3 mt-1.5">
        <p className={hintClass}>
          {isMatched
            ? `Taken from the ${creativeWord}'s bottom edge.`
            : `Set by hand — may not line up with the ${creativeWord}.`}
        </p>
        <button
          onClick={() => onMatchPoster(!isMatched)}
          className="text-[12px] font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer shrink-0"
        >
          {isMatched ? 'Set manually' : `Match ${creativeWord}`}
        </button>
      </div>
    </div>
  );
};

const ActionAreaFields = ({ popup, onChange, onMatchPoster }) => (
  <>
    <Field label="Divider label">
      <input
        type="text"
        value={popup.dividerLabel ?? ''}
        onChange={(e) => onChange({ dividerLabel: e.target.value })}
        placeholder="TRY IT YOURSELF"
        className={inputClass}
      />
      <p className={`mt-1.5 ${hintClass}`}>
        Text is yours; the font is fixed (Inter Medium 14).
      </p>
    </Field>

    {popup.surface === 'app' && (
      <ActionColorField popup={popup} onChange={onChange} onMatchPoster={onMatchPoster} />
    )}
  </>
);

const TOAST_MAX = 80;

const ToastField = ({ popup, onChange }) => {
  const value = popup.toastMessage ?? '';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[13px] font-medium text-label">Toast message</label>
        <span className="text-[12px] text-tertiary tabular-nums">
          {value.length}/{TOAST_MAX}
        </span>
      </div>
      <input
        type="text"
        value={value}
        maxLength={TOAST_MAX}
        onChange={(e) => onChange({ toastMessage: e.target.value })}
        placeholder="We'll call you back shortly"
        className={inputClass}
      />
      <p className={`mt-1.5 ${hintClass}`}>
        Shown after a CTA tap. Leave empty for no toast.
      </p>
    </div>
  );
};

const ButtonsSection = ({
  popup,
  validation,
  selectedSlotIndex,
  onSelectSlot,
  onChange,
  onMatchPoster,
}) => {
  const template = getTemplate(popup.templateKey);
  const isApp = popup.surface === 'app';

  const updateButton = (slotIndex, updates) =>
    onChange({
      buttons: (popup.buttons || []).map((button) =>
        button.slotIndex === slotIndex ? { ...button, ...updates } : button
      ),
    });

  if (template.wholeCardTap) {
    const target = (popup.buttons || [])[0] || {};
    return (
      <Section
        step={2}
        title="Destination"
        hint={isApp ? 'No button — the poster itself is the link.' : 'No button — the whole banner is one link.'}
      >
        {isApp && (
          <ActionColorField popup={popup} onChange={onChange} onMatchPoster={onMatchPoster} />
        )}

        <Field label="Destination URL" error={errorFor(validation, 'buttons.0.redirectUrl')}>
          <input
            type="url"
            value={target.redirectUrl || ''}
            onChange={(e) => updateButton(0, { redirectUrl: e.target.value })}
            placeholder="https://acn.example.com/offer"
            className={inputClass}
          />
        </Field>
        <Field label="Analytics key">
          <input
            type="text"
            value={target.analyticsKey || ''}
            onChange={(e) => updateButton(0, { analyticsKey: e.target.value })}
            placeholder="launch_card"
            className={`${inputClass} font-mono`}
          />
        </Field>

        <ToastField popup={popup} onChange={onChange} />
      </Section>
    );
  }

  return (
    <Section
      step={2}
      title={isApp ? 'Action area' : 'Call to action'}
      hint={
        isApp
          ? 'Buttons sit in a solid strip under the poster.'
          : "Drawn over the banner, inside the well the artwork leaves clear."
      }
    >
      <ActionAreaFields popup={popup} onChange={onChange} onMatchPoster={onMatchPoster} />

      {template.slots.map((slot) => {
        const button = (popup.buttons || []).find((b) => b.slotIndex === slot.index) || {};
        const contrast = contrastLevel(button.textColor, button.bgColor);
        const isSelected = selectedSlotIndex === slot.index;

        return (
          <div
            key={slot.index}
            onClick={() => onSelectSlot(slot.index)}
            className={`rounded-2xl p-4 space-y-4 transition-shadow duration-200 ${
              isSelected ? 'ring-2 ring-accent' : 'ring-1 ring-separator'
            }`}
          >
            {template.slots.length > 1 && (
              <p className="text-[13px] font-semibold text-label">
                {slot.index === 0 ? 'Primary' : 'Secondary'}
              </p>
            )}

            <Field label="Label" error={errorFor(validation, `buttons.${slot.index}.label`)}>
              <input
                type="text"
                value={button.label || ''}
                onChange={(e) => updateButton(slot.index, { label: e.target.value })}
                placeholder="Book a demo"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Background"
                value={button.bgColor || ''}
                onChange={(bgColor) => updateButton(slot.index, { bgColor })}
              />
              <ColorField
                label="Text"
                value={button.textColor || ''}
                onChange={(textColor) => updateButton(slot.index, { textColor })}
              />
            </div>

            <p
              className={`flex items-center gap-1.5 text-[12px] font-medium tabular-nums ${
                contrast.pass ? 'text-secondary' : 'text-danger'
              }`}
            >
              {contrast.pass ? <CheckCircle2 size={14} strokeWidth={1.75} /> : <AlertTriangle size={14} strokeWidth={1.75} />}
              {contrast.level} · {formatRatio(contrast.ratio)}
              {!contrast.pass && ' — hard to read'}
            </p>

            <Field label="Redirect URL" error={errorFor(validation, `buttons.${slot.index}.redirectUrl`)}>
              <input
                type="url"
                value={button.redirectUrl || ''}
                onChange={(e) => updateButton(slot.index, { redirectUrl: e.target.value })}
                placeholder="https://acn.example.com/demo"
                className={inputClass}
              />
            </Field>

            <Field label="Analytics key" error={errorFor(validation, `buttons.${slot.index}.analyticsKey`)}>
              <input
                type="text"
                value={button.analyticsKey || ''}
                onChange={(e) => updateButton(slot.index, { analyticsKey: e.target.value })}
                placeholder="book_demo"
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>
        );
      })}

      <ToastField popup={popup} onChange={onChange} />
    </Section>
  );
};

export default ButtonsSection;

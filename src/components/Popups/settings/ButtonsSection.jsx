import React from 'react';
import { AlertTriangle, CheckCircle2, Wand2 } from 'lucide-react';
import Section from './Section';
import ColorField from '../ColorField';
import { contrastLevel, formatRatio } from '../contrast';
import { getTemplate } from '../popupTemplates';
import { errorFor } from '../popupValidation';

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
    {children}
    {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
  </div>
);

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900';

// App popups render the buttons in a solid action area under the poster. That colour
// is read off the poster's bottom edge so the sheet reads as one surface — the author
// only steps in when the automatic match is wrong.
const ActionColorField = ({ popup, onChange, onMatchPoster }) => {
  const isMatched = popup.matchPosterColor !== false;
  const creativeWord = popup.surface === 'app' ? 'poster' : 'banner';

  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-600 mb-1">Action area colour</label>

      {isMatched ? (
        <div className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50">
          <span
            className="w-7 h-7 rounded border border-gray-200 shrink-0"
            style={{ backgroundColor: popup.actionBarColor || '#111111' }}
          />
          <span className="flex-1 min-w-0 text-xs font-mono text-gray-600 truncate">
            {popup.actionBarColor || '—'}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 shrink-0">
            <Wand2 size={11} />
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

      <div className="flex items-center justify-between mt-1">
        <p className="text-[10px] text-gray-400">
          {isMatched
            ? `Taken from the ${creativeWord}'s bottom edge.`
            : `Set by hand — may not line up with the ${creativeWord}.`}
        </p>
        <button
          onClick={() => onMatchPoster(!isMatched)}
          className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
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
      <p className="mt-1 text-[10px] text-gray-400">
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
    <div className="pt-1">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-medium text-gray-600">Toast message</label>
        <span className="text-[10px] text-gray-400">
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
      <p className="mt-1 text-[10px] text-gray-400">
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
            className={`rounded-xl border p-3 space-y-3 transition-colors ${
              isSelected ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200'
            }`}
          >
            {template.slots.length > 1 && (
              <p className="text-[11px] font-semibold text-gray-700">
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

            <div className="grid grid-cols-2 gap-2">
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
              className={`flex items-center gap-1.5 text-[10px] font-medium ${
                contrast.pass ? 'text-gray-400' : 'text-red-600'
              }`}
            >
              {contrast.pass ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
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

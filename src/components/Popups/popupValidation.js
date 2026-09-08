// Pure validators + human-readable summaries for a popup record.
// Same shape as src/components/BulkUpload/validateRows.js: no schema lib, plain functions.

import { getTemplate } from './popupTemplates';
import { contrastLevel, isValidHex } from './contrast';
import {
  eventLabel,
  pageLabel,
  surfaceLabel,
  TRIGGER_TYPES,
} from './popupConstants';

const isBlank = (value) => !String(value ?? '').trim();

const isValidUrl = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return false;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const validateButtons = (popup, template) => {
  const errors = [];
  const warnings = [];
  const buttons = popup.buttons || [];

  if (template.wholeCardTap) {
    const target = buttons[0];
    if (!isValidUrl(target?.redirectUrl)) {
      errors.push({ field: 'buttons.0.redirectUrl', message: 'Full-tap popups need a destination URL.' });
    }
    return { errors, warnings };
  }

  template.slots.forEach((slot) => {
    const button = buttons.find((b) => b.slotIndex === slot.index);
    const prefix = `Button ${slot.index + 1}`;

    if (!button) {
      errors.push({ field: `buttons.${slot.index}`, message: `${prefix} is missing.` });
      return;
    }
    if (isBlank(button.label)) {
      errors.push({ field: `buttons.${slot.index}.label`, message: `${prefix} needs a label.` });
    }
    if (!isValidUrl(button.redirectUrl)) {
      errors.push({ field: `buttons.${slot.index}.redirectUrl`, message: `${prefix} needs a valid http(s) URL.` });
    }
    if (isBlank(button.analyticsKey)) {
      errors.push({ field: `buttons.${slot.index}.analyticsKey`, message: `${prefix} needs an analytics key.` });
    }
    if (!isValidHex(button.bgColor) || !isValidHex(button.textColor)) {
      errors.push({ field: `buttons.${slot.index}.colors`, message: `${prefix} has an invalid colour.` });
      return;
    }

    const contrast = contrastLevel(button.textColor, button.bgColor);
    if (!contrast.pass) {
      warnings.push({
        field: `buttons.${slot.index}.colors`,
        message: `${prefix} label fails WCAG AA (${contrast.ratio.toFixed(2)}:1) — pick a stronger colour pair.`,
      });
    }
  });

  return { errors, warnings };
};

const validateTrigger = (popup) => {
  const errors = [];
  const trigger = popup.trigger || {};
  const def = TRIGGER_TYPES.find((t) => t.id === trigger.type);

  if (!def) {
    errors.push({ field: 'trigger.type', message: 'Pick a trigger.' });
    return errors;
  }
  if (def.needsPageKey && isBlank(trigger.pageKey)) {
    errors.push({ field: 'trigger.pageKey', message: 'Pick the page this fires on.' });
  }
  if (trigger.type === 'scroll') {
    const depth = Number(trigger.scrollDepthPct);
    if (!Number.isFinite(depth) || depth < 1 || depth > 100) {
      errors.push({ field: 'trigger.scrollDepthPct', message: 'Scroll depth must be between 1 and 100%.' });
    }
  }
  if (trigger.type === 'event' && isBlank(trigger.eventKey)) {
    errors.push({ field: 'trigger.eventKey', message: 'Pick the event that fires this popup.' });
  }

  return errors;
};

export const validatePopup = (popup) => {
  const template = getTemplate(popup?.templateKey);
  const errors = [];
  const warnings = [];

  if (isBlank(popup?.name)) errors.push({ field: 'name', message: 'Give the popup a name.' });

  if (popup?.surface === 'app') {
    if (isBlank(popup?.imageUrl)) {
      errors.push({ field: 'creative', message: 'Upload the app creative.' });
    }
  } else if (isBlank(popup?.imageUrlDesktop)) {
    errors.push({ field: 'creative', message: 'Upload the web creative.' });
  }

  const buttonResult = validateButtons(popup || {}, template);
  errors.push(...buttonResult.errors, ...validateTrigger(popup || {}));
  warnings.push(...buttonResult.warnings);

  const frequency = popup?.frequency || {};
  if (Number(frequency.maxImpressions) < 1) {
    errors.push({ field: 'frequency.maxImpressions', message: 'Max impressions must be at least 1.' });
  }

  return { errors, warnings, isValid: errors.length === 0 };
};

export const errorFor = (validation, field) =>
  validation.errors.find((e) => e.field === field)?.message || null;

export const warningFor = (validation, field) =>
  validation.warnings.find((w) => w.field === field)?.message || null;

// ---- Plain-English summaries shown under each settings section ----

export const describeTrigger = (popup) => {
  const trigger = popup?.trigger || {};
  switch (trigger.type) {
    case 'session':
      return 'Fires on the first authenticated load of a session';
    case 'page':
      return `Fires on the ${pageLabel(trigger.pageKey) || '—'} page`;
    case 'scroll':
      return `Fires at ${trigger.scrollDepthPct || 0}% scroll on the ${pageLabel(trigger.pageKey) || '—'} page`;
    case 'event':
      return `Fires after ${eventLabel(trigger.eventKey) || '—'}`;
    default:
      return 'No trigger set';
  }
};

export const describeFrequency = (popup) => {
  const { maxImpressions = 1, cooldownHours, minGapHours } = popup?.frequency || {};
  const parts = [
    maxImpressions === 1 ? 'Shows once per user' : `Shows up to ${maxImpressions} times per user`,
  ];
  if (cooldownHours) parts.push(`${cooldownHours}h cooldown between shows`);
  if (minGapHours) parts.push(`${minGapHours}h minimum gap after any popup`);
  parts.push('stops once dismissed or completed');
  return parts.join(' · ');
};

export const describeTargeting = (popup, cohorts = []) => {
  const include = popup?.cohortIncludeIds || [];
  const audience = include.length
    ? cohorts.find((c) => c.id === include[0])?.name || include[0]
    : 'All users';
  return `${surfaceLabel(popup?.surface)} · ${audience}`;
};

export { isValidUrl };

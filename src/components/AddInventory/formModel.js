/**
 * Form state helpers for the single-property add flow.
 * Values are plain strings keyed by the shared property schema, so the same
 * validators the bulk upload uses also guard the manual form.
 */
import {
  FIELDS_BY_KEY,
  PROPERTY_FIELDS,
  REQUIREMENT_NOTES,
  isFieldRequired,
} from '../BulkUpload/propertySchema';
import {
  CHOICE_CONSTRAINED_KEYS,
  EXTRA_FLAG_KEYS,
  EXTRA_LIST_KEYS,
  EXTRA_VALUE_KEYS,
  FORM_LABELS,
} from './formOptions';

/** How a value got into the form — drives the "filled by AI" markers. */
export const SOURCE_AI = 'ai';
export const SOURCE_EDITED = 'edited';

const CHOICE_KEYS = new Set(CHOICE_CONSTRAINED_KEYS);

const isRental = (values) => String(values.listingType).toLowerCase() === 'rental';

/** Fields the live form does not show — they never block a submit. */
const HIDDEN_KEYS = new Set(['pricePerSqft']);

/** Mandatory on this form even though the upload schema treats them as optional. */
const EXTRA_REQUIRED = { maintenanceAmount: isRental };

/** The live form opens on a residential apartment for sale. */
const DEFAULT_VALUES = { listingType: 'resale', propertyType: 'residential', assetType: 'apartment' };

export const createEmptyValues = () => ({
  ...Object.fromEntries(PROPERTY_FIELDS.map((entry) => [entry.key, ''])),
  ...DEFAULT_VALUES,
  ...Object.fromEntries(EXTRA_VALUE_KEYS.map((key) => [key, ''])),
  ...Object.fromEntries(EXTRA_LIST_KEYS.map((key) => [key, []])),
  ...Object.fromEntries(EXTRA_FLAG_KEYS.map((key) => [key, false])),
});

export const createEmptyForm = () => ({
  values: createEmptyValues(),
  sources: {},
  confidence: {},
});

/** Merge an extraction result into the form, leaving anything it did not find untouched. */
export const applyExtraction = (form, extraction) => ({
  values: { ...form.values, ...extraction.values },
  sources: {
    ...form.sources,
    ...Object.fromEntries(extraction.keys.map((key) => [key, SOURCE_AI])),
  },
  confidence: {
    ...form.confidence,
    ...Object.fromEntries(extraction.keys.map((key) => [key, extraction.meta[key].confidence])),
  },
});

/** A field the user touches stops being an AI field — it becomes theirs. */
export const setFieldValue = (form, key, value) => ({
  values: { ...form.values, [key]: value },
  sources: { ...form.sources, [key]: form.sources[key] === SOURCE_AI ? SOURCE_EDITED : form.sources[key] },
  confidence: form.confidence,
});

/** Toggle one entry of a multi-select field (amenities, extra rooms, khata flags). */
export const toggleListValue = (form, key, option) => {
  const current = form.values[key] ?? [];
  const next = current.includes(option)
    ? current.filter((entry) => entry !== option)
    : [...current, option];

  return setFieldValue(form, key, next);
};

const missingMessage = (entry) =>
  REQUIREMENT_NOTES[entry.key] ? `Required for this listing (${REQUIREMENT_NOTES[entry.key]})` : 'Required';

const requiredHere = (entry, values) =>
  isFieldRequired(entry, values) || Boolean(EXTRA_REQUIRED[entry.key]?.(values));

const issueFor = (entry, value, values) => {
  if (HIDDEN_KEYS.has(entry.key)) return null;

  if (value.trim() === '') {
    return requiredHere(entry, values) ? { message: missingMessage(entry), severity: 'error' } : null;
  }

  // Pill pickers can only produce values from their own option list.
  return CHOICE_KEYS.has(entry.key) ? null : entry.validate(value) ?? null;
};

/** @returns {Record<string,{message:string,severity:string}>} keyed by field. */
export const validateForm = (values) =>
  PROPERTY_FIELDS.reduce((issues, entry) => {
    const value = values[entry.key];
    const issue = issueFor(entry, typeof value === 'string' ? value : '', values);
    return issue ? { ...issues, [entry.key]: issue } : issues;
  }, {});

export const countBySeverity = (issues, severity) =>
  Object.values(issues).filter((issue) => issue.severity === severity).length;

export const isRequiredField = (key, values) =>
  FIELDS_BY_KEY[key] ? requiredHere(FIELDS_BY_KEY[key], values) : false;

export const labelFor = (key) => FORM_LABELS[key] ?? FIELDS_BY_KEY[key]?.label ?? key;

/** Counts shown in the post-extraction banner. */
export const summarizeExtraction = (form) => {
  const aiKeys = Object.keys(form.sources).filter((key) => form.sources[key] === SOURCE_AI);
  const issues = validateForm(form.values);

  return {
    filled: aiKeys.length,
    needsReview: aiKeys.filter((key) => form.confidence[key] === 'low').length,
    missingRequired: countBySeverity(issues, 'error'),
  };
};

/**
 * Reusable cell types for the property upload schema.
 * A type is `{ validate, normalize }`; `validate` only ever sees a non-empty value
 * and returns `null` (ok) or `{ message, severity }`.
 */

const error = (message) => ({ message, severity: 'error' });
const warning = (message) => ({ message, severity: 'warning' });

const LAKH = 100000;
const CRORE = 10000000;

const PRICE_UNITS = {
  '': 1,
  k: 1000,
  l: LAKH,
  lac: LAKH,
  lacs: LAKH,
  lakh: LAKH,
  lakhs: LAKH,
  cr: CRORE,
  crore: CRORE,
  crores: CRORE,
};

export const parsePrice = (raw) => {
  const value = raw.replace(/[₹,\s]/g, '').toLowerCase();
  const match = value.match(/^(\d+(?:\.\d+)?)([a-z]*)$/);
  if (!match) return null;

  const multiplier = PRICE_UNITS[match[2]];
  return multiplier === undefined ? null : Number(match[1]) * multiplier;
};

export const formatPrice = (amount) => {
  if (amount >= CRORE) return `₹${(amount / CRORE).toFixed(2)} Cr`;
  if (amount >= LAKH) return `₹${(amount / LAKH).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const parseNumber = (raw) => {
  const value = raw.replace(/(sq\.?\s*ft|sqft|sft|₹|,|%|\s)/gi, '');
  const amount = Number(value);
  return value === '' || Number.isNaN(amount) ? null : amount;
};

const NOT_APPLICABLE = new Set(['n/a', 'na', '-', 'none', 'nil']);
export const isNotApplicable = (value) => NOT_APPLICABLE.has(value.trim().toLowerCase());

export const text = { validate: () => null };

/** Unknown values are accepted but flagged — messy source data stays importable. */
export const softEnum = (options) => ({
  validate: (value) =>
    options.some((option) => option.toLowerCase() === value.toLowerCase())
      ? null
      : warning(`Unexpected value — usually one of: ${options.join(', ')}`),
  normalize: (value) => options.find((option) => option.toLowerCase() === value.toLowerCase()) ?? value,
});

export const strictEnum = (options) => ({
  validate: (value) =>
    options.some((option) => option.toLowerCase() === value.toLowerCase())
      ? null
      : error(`Must be one of: ${options.join(', ')}`),
  normalize: (value) => options.find((option) => option.toLowerCase() === value.toLowerCase()) ?? value,
});

export const number = (unit) => ({
  validate: (value) =>
    isNotApplicable(value) || parseNumber(value) !== null
      ? null
      : error(`Must be a number${unit ? ` (${unit})` : ''}`),
  normalize: (value) => (isNotApplicable(value) ? 'N/A' : String(parseNumber(value))),
});

export const integer = {
  validate: (value) =>
    isNotApplicable(value) || /^\d{1,4}$/.test(value.trim()) ? null : error('Must be a whole number or N/A'),
  normalize: (value) => (isNotApplicable(value) ? 'N/A' : value.trim()),
};

export const price = {
  validate: (value) =>
    parsePrice(value) === null ? error('Not a valid amount (e.g. 17600000, 1.76 Cr, 85 L)') : null,
  normalize: (value) => formatPrice(parsePrice(value)),
};

const TRUE_VALUES = new Set(['true', 'yes', 'y', '1']);
const FALSE_VALUES = new Set(['false', 'no', 'n', '0']);

export const boolean = {
  validate: (value) => {
    const normalized = value.trim().toLowerCase();
    return TRUE_VALUES.has(normalized) || FALSE_VALUES.has(normalized)
      ? null
      : error('Must be TRUE or FALSE');
  },
  normalize: (value) => (TRUE_VALUES.has(value.trim().toLowerCase()) ? 'TRUE' : 'FALSE'),
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Accepts 26/Dec/2025, 26/12/2025, 2025-12-26 and ISO timestamps. */
export const date = {
  validate: (value) => {
    const trimmed = value.trim();
    const named = trimmed.match(/^(\d{1,2})[/-]([A-Za-z]{3,})[/-](\d{4})$/);
    if (named) {
      return MONTHS.includes(named[2].slice(0, 3).toLowerCase())
        ? null
        : error(`Unknown month "${named[2]}"`);
    }

    if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed) || /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return Number.isNaN(new Date(trimmed.replace(/\//g, '-')).getTime())
        ? error('Not a valid date')
        : null;
    }

    return error('Expected a date like 26/Dec/2025, 26/12/2025 or 2025-12-26');
  },
  normalize: (value) => value.trim(),
};

export const phone = {
  validate: (value) => {
    const digits = value.replace(/[\s+()-]/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    return /^[6-9]\d{9}$/.test(digits) ? null : error('Must be a 10-digit Indian mobile number');
  },
  normalize: (value) => value.replace(/[\s+()-]/g, '').replace(/^(91|0)(?=\d{10}$)/, ''),
};

export const coordinates = {
  validate: (value) => {
    const parts = value.split(',').map((part) => Number(part.trim()));
    const isValid =
      parts.length === 2 &&
      parts.every((part) => !Number.isNaN(part)) &&
      Math.abs(parts[0]) <= 90 &&
      Math.abs(parts[1]) <= 180;
    return isValid ? null : error('Expected "latitude,longitude" (e.g. 12.9735,77.6125)');
  },
  normalize: (value) => value.split(',').map((part) => part.trim()).join(','),
};

const isUrl = (value) => /^https?:\/\/\S+$/i.test(value.trim());

export const url = {
  validate: (value) => (isUrl(value) ? null : error('Must start with http:// or https://')),
  normalize: (value) => value.trim(),
};

/** "3", "3 BHK", "3b 2t" all resolve to a bedroom count. */
export const bedrooms = {
  validate: (value) => {
    const match = value.trim().match(/\d{1,2}/);
    return match && Number(match[0]) > 0 && Number(match[0]) <= 20
      ? null
      : error('Expected a bedroom count (e.g. 3, 3 BHK, 3B 2T)');
  },
  normalize: (value) => value.trim().match(/\d{1,2}/)[0],
};

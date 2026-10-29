import { COPY_LIMITS, TOKEN_WORST_CASE } from '../../data/mockHomeFeed.js';

const TOKEN_RE = /\{([^}]+)\}/g;
const SEPARATOR = ' · ';

export const tokensOf = (text = '') => [...text.matchAll(TOKEN_RE)].map((m) => m[1]);

const render = (text, overrides = {}) =>
  text
    .replace(TOKEN_RE, (_, token) => overrides[token] ?? TOKEN_WORST_CASE[token] ?? token)
    .replace(/\s+/g, ' ')
    .trim();

// Title overflow chain (PRD §10): drop {config} → generalise {asset} → move {location} to context.
const TITLE_REDUCED = {
  config: '',
  'config + 1': '',
  asset: 'homes',
  'substitute assets': 'homes',
  location: '',
  'searched location': '',
};

// Worst-case lengths: `raw` before overflow rules, `min` after every rule the renderer may apply.
// The save check rejects only when even `min` is over the limit; `raw` over limit just warns.
export const measure = (part, text = '') => {
  const raw = render(text).length;
  if (part === 'title') return { raw, min: render(text, TITLE_REDUCED).length };
  if (part === 'context') return { raw, min: render(text.split(SEPARATOR)[0]).length };
  return { raw, min: raw };
};

const sameTokens = (a, b) => a.length === b.length && a.every((t, i) => t === b[i]);

// Returns { [part]: message } for one section type's copy; empty object = valid.
export const validateCopyEntry = (entry, defaults) =>
  Object.entries(COPY_LIMITS).reduce((errors, [part, limit]) => {
    const text = entry[part] ?? '';
    if (!sameTokens(tokensOf(text), tokensOf(defaults[part] ?? ''))) {
      return { ...errors, [part]: 'Tokens and their order are locked' };
    }
    if (part !== 'tag' && !text.trim()) return { ...errors, [part]: 'Required' };
    const { min } = measure(part, text);
    return min > limit ? { ...errors, [part]: `${min} characters at worst case (max ${limit})` } : errors;
  }, {});

export const validateCopy = (copy, defaults) =>
  Object.keys(copy).reduce((all, id) => {
    const errors = validateCopyEntry(copy[id], defaults[id]);
    return Object.keys(errors).length ? { ...all, [id]: errors } : all;
  }, {});

export const FILL_TYPE_ID = 18;

// #18 is the fill of last resort; it can't go off while > 1% of pages need it.
export const canDisableType = (typeId, fillNeededPct) => typeId !== FILL_TYPE_ID || fillNeededPct <= 1;

// PRD §9: flagged when position-normalised CTR < 0.5 for 14 days on ≥ 5,000 impressions.
export const isRetirementFlagged = (perf) => !!perf && perf.ctr < 0.5 && perf.daysBelow >= 14 && perf.impressions >= 5000;

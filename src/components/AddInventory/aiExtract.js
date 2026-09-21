/**
 * Mock "Add with AI" extractor.
 * Stands in for a model call: reads a pasted listing message and returns field values
 * with a confidence per field, so the form can show what was auto-filled and what to check.
 */
import { mockProperties } from '../../data/mockProperties';
import { mockAgents } from '../../data/mockAgents';
import { EXTRACTION_RULES } from './extractionRules';

export const EXTRACTION_DELAY_MS = 1400;

const KNOWN_MICROMARKETS = [...new Set(mockProperties.map((property) => property.micromarket))];
const KNOWN_PROPERTY_NAMES = [...new Set(mockProperties.map((property) => property.name))];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const namedInText = (text, names) =>
  [...names]
    .sort((a, b) => b.length - a.length)
    .find((name) => new RegExp(escapeRegExp(name), 'i').test(text)) ?? null;

/** Fall back to the first line — brokers almost always lead with the project name. */
const firstLineName = (text) => {
  const line = text.split('\n').map((entry) => entry.trim()).find(Boolean) ?? '';
  const candidate = line.split(/[,|–—-]/)[0].trim();
  return /^[A-Za-z][A-Za-z0-9 &.'()]{3,60}$/.test(candidate) ? candidate : '';
};

const propertyNameFrom = (text) => {
  const known = namedInText(text, KNOWN_PROPERTY_NAMES);
  if (known) return { value: known, confidence: 'high' };

  const guess = firstLineName(text);
  return guess ? { value: guess, confidence: 'low' } : null;
};

const micromarketFrom = (text) => {
  const known = namedInText(text, KNOWN_MICROMARKETS);
  return known ? { value: known, confidence: 'high' } : null;
};

const digitsOf = (phone) => String(phone ?? '').replace(/\D/g, '').slice(-10);

/** Known agent details beat anything guessed out of the message body. */
const agentFieldsFrom = (found) => {
  const phone = found.agentPhoneNumber?.value;
  const cpId = found.cpId?.value;

  const agent = mockAgents.find(
    (entry) =>
      (phone && digitsOf(entry.contact) === digitsOf(phone)) ||
      (cpId && String(entry.agentId).toUpperCase() === cpId.toUpperCase()),
  );

  if (!agent) return {};

  return {
    cpId: { value: agent.agentId, confidence: 'high' },
    agentName: { value: agent.name, confidence: 'high' },
    agentPhoneNumber: { value: digitsOf(agent.contact), confidence: 'high' },
  };
};

const runRules = (text) =>
  EXTRACTION_RULES.reduce((found, rule) => {
    const result = rule.run(text);
    return result ? { ...found, [rule.key]: result } : found;
  }, {});

/**
 * @returns {{ values: Record<string,string>, meta: Record<string,{confidence:string}>, keys: string[] }}
 */
export const extractListing = (rawText) => {
  const text = rawText.replace(/[\u00a0\u2007\u202f]/g, ' ').trim();

  if (text === '') return { values: {}, meta: {}, keys: [] };

  const fromRules = runRules(text);
  const name = propertyNameFrom(text);
  const micromarket = micromarketFrom(text) ?? fromRules.micromarket;

  const found = {
    ...fromRules,
    ...(name ? { propertyName: name } : {}),
    ...(micromarket ? { micromarket } : {}),
    ...agentFieldsFrom(fromRules),
  };

  return {
    values: Object.fromEntries(Object.entries(found).map(([key, entry]) => [key, entry.value])),
    meta: Object.fromEntries(Object.entries(found).map(([key, entry]) => [key, { confidence: entry.confidence }])),
    keys: Object.keys(found),
  };
};

/** Mimics the round trip to a model so the UI can show a real loading state. */
export const extractListingAsync = (rawText) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(extractListing(rawText)), EXTRACTION_DELAY_MS);
  });

export const SAMPLE_LISTING = `Sobha Royal Pavilion, Chikkakannalli
3 BHK apartment for sale, 1817 sqft, 7th floor of 21
West facing, semi furnished, gated community
Asking price 3.35 Cr, 12,689 per sqft
Ready to move, 3 bath, 2 balcony, 2 covered parking
Maintenance 5500 per month
Agent: Vedamurthy N 9886114107`;

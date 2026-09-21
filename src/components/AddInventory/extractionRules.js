/**
 * Heuristic rules used by the mock "Add with AI" extractor.
 * Each rule pulls one field out of a pasted listing message and says how sure it is.
 * A rule returns `{ value, confidence }` or null when the text says nothing about it.
 */
import {
  APARTMENT_TYPES,
  ASSET_TYPES,
  FACINGS,
  FURNISHINGS,
  formatPrice,
  parsePrice,
} from '../BulkUpload/propertySchema';

const HIGH = 'high';
const MEDIUM = 'medium';
const LOW = 'low';

const hit = (value, confidence) =>
  value === null || value === '' ? null : { value: String(value).trim(), confidence };

/** First capture group of the first matching pattern. */
const capture = (text, patterns) => {
  const match = patterns.reduce((found, pattern) => found ?? text.match(pattern), null);
  return match ? match[1] : null;
};

/** Longest option mentioned anywhere in the text — longest first so "north east" beats "north". */
const mentioned = (text, options) =>
  [...options]
    .sort((a, b) => b.length - a.length)
    .find((option) => new RegExp(`\\b${option}\\b`, 'i').test(text)) ?? null;

const ASSET_SYNONYMS = {
  flat: 'apartment',
  'independent house': 'villa',
  'independent building': 'villa',
  bungalow: 'villa',
  shop: 'retail',
  showroom: 'retail',
  godown: 'warehouse',
};

const assetTypeFrom = (text) => {
  const direct = mentioned(text, ASSET_TYPES);
  if (direct) return hit(direct, HIGH);

  const synonym = Object.keys(ASSET_SYNONYMS).find((word) => new RegExp(`\\b${word}\\b`, 'i').test(text));
  return synonym ? hit(ASSET_SYNONYMS[synonym], MEDIUM) : null;
};

const RENTAL_WORDS = /\b(for rent|rental|rent out|to let|lease|monthly rent|deposit)\b/i;
const RESALE_WORDS = /\b(for sale|resale|selling|asking|ask price|sale price)\b/i;

const listingTypeFrom = (text) => {
  if (RENTAL_WORDS.test(text)) return hit('rental', HIGH);
  if (RESALE_WORDS.test(text)) return hit('resale', HIGH);
  return hit('resale', LOW);
};

const COMMERCIAL_WORDS = /\b(office|retail|shop|showroom|warehouse|godown|commercial|co-?working|seats?)\b/i;

const propertyTypeFrom = (text) =>
  COMMERCIAL_WORDS.test(text) ? hit('commercial', MEDIUM) : hit('residential', LOW);

const possessionFrom = (text) => {
  if (/ready to move|\brtm\b|ready possession/i.test(text)) return hit('ready to move', HIGH);
  if (/under construction|\bu\/?c\b|possession in|handover/i.test(text)) return hit('under construction', HIGH);
  if (/available (from|by)/i.test(text)) return hit('available by', HIGH);
  return null;
};

const DATE_PATTERNS = [
  /\b(\d{1,2}[/-][A-Za-z]{3,}[/-]\d{4})\b/,
  /\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b/,
  /\b(\d{4}-\d{2}-\d{2})\b/,
];

const priceFrom = (text, patterns) => {
  const raw = capture(text, patterns);
  if (!raw) return null;

  const amount = parsePrice(raw);
  return amount === null ? null : hit(formatPrice(amount), HIGH);
};

const floorFrom = (text) => {
  if (/ground floor|\bgf\b/i.test(text)) return hit('Ground floor', HIGH);
  if (/top floor/i.test(text)) return hit('Top floor', HIGH);

  return hit(
    capture(text, [
      /\b(\d{1,3})(?:st|nd|rd|th)?\s*floor\b/i,
      /\bfloor\s*(?:no\.?|number)?\s*[:-]?\s*(\d{1,3})\b/i,
    ]),
    HIGH,
  );
};

/** Rule order is for readability only — every rule reads the same raw text. */
export const EXTRACTION_RULES = [
  { key: 'listingType', run: listingTypeFrom },
  { key: 'propertyType', run: propertyTypeFrom },
  { key: 'assetType', run: assetTypeFrom },
  { key: 'apartmentType', run: (text) => hit(mentioned(text, APARTMENT_TYPES), HIGH) },
  { key: 'communityType', run: (text) => hit(mentioned(text, ['gated', 'standalone', 'independent']), MEDIUM) },

  { key: 'cpId', run: (text) => hit(capture(text, [/\b([A-Za-z]{2,5}\d{2,6})\b/]), MEDIUM) },
  {
    key: 'agentName',
    run: (text) => hit(capture(text, [/\b(?:agent|cp|broker|posted by)\s*[:-]\s*([A-Za-z][A-Za-z .]{2,40})/i]), MEDIUM),
  },
  { key: 'agentPhoneNumber', run: (text) => hit(capture(text, [/(?:\+?91[\s-]?)?([6-9]\d{9})\b/]), HIGH) },

  {
    key: 'micromarket',
    run: (text) => hit(capture(text, [/\b(?:micromarket|locality|location)\s*[:-]\s*([A-Za-z][A-Za-z .]{2,40})/i]), MEDIUM),
  },
  { key: 'address', run: (text) => hit(capture(text, [/\baddress\s*[:-]\s*(.{5,120})/i]), MEDIUM) },
  { key: 'mapLocation', run: (text) => hit(capture(text, [/(https?:\/\/\S*(?:maps|goo\.gl)\S*)/i]), HIGH) },

  { key: 'noOfBedrooms', run: (text) => hit(capture(text, [/\b(\d{1,2})\s*(?:bhk|bed|bedrooms?)/i]), HIGH) },
  { key: 'noOfBathrooms', run: (text) => hit(capture(text, [/\b(\d{1,2})\s*(?:bath|baths|bathrooms?|toilets?)/i]), HIGH) },
  { key: 'noOfBalcony', run: (text) => hit(capture(text, [/\b(\d{1,2})\s*balcon/i]), HIGH) },
  { key: 'sbua', run: (text) => hit(capture(text, [/\b(\d{3,5}(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|sft|sq\.?\s*feet)\b/i]), HIGH) },
  { key: 'plotArea', run: (text) => hit(capture(text, [/\bplot\s*(?:area|size)?\s*[:-]?\s*(\d{3,6})/i]), HIGH) },
  { key: 'structure', run: (text) => hit(capture(text, [/\bstructure\s*[:-]?\s*(\d\s*[Bb]\s*\d\s*[Tt])/]), MEDIUM) },
  { key: 'floorNumber', run: floorFrom },
  {
    key: 'totalFloors',
    run: (text) => hit(capture(text, [/\bof\s*(\d{1,3})\s*floors?\b/i, /\btotal\s*floors?\s*[:-]?\s*(\d{1,3})/i]), MEDIUM),
  },
  { key: 'facing', run: (text) => hit(mentioned(text, FACINGS), /facing/i.test(text) ? HIGH : LOW) },
  { key: 'furnishing', run: (text) => hit(mentioned(text, FURNISHINGS), HIGH) },
  {
    key: 'parking',
    run: (text) => hit(capture(text, [/\b(\d{1,2})\s*(?:covered|open|basement)?\s*(?:car\s*)?park\w*/i]), MEDIUM),
  },
  { key: 'unitNo', run: (text) => hit(capture(text, [/\bunit\s*(?:no\.?|number)?\s*[:-]\s*([A-Za-z0-9-]{1,10})/i]), MEDIUM) },
  { key: 'ageOfBuilding', run: (text) => hit(capture(text, [/\b(\d{1,2})\s*(?:years?|yrs?)\s*old\b/i]), HIGH) },
  { key: 'possession', run: possessionFrom },
  {
    key: 'handOverDate',
    run: (text) => (/under construction|handover/i.test(text) ? hit(capture(text, DATE_PATTERNS), MEDIUM) : null),
  },
  {
    key: 'availableFrom',
    run: (text) => (/available (from|by)/i.test(text) ? hit(capture(text, DATE_PATTERNS), MEDIUM) : null),
  },

  {
    key: 'totalAskPrice',
    run: (text) =>
      priceFrom(text, [
        /\b(?:price|ask|asking|quote|sale price|cost)\s*[:-]?\s*(?:₹|rs\.?)?\s*(\d[\d.,]*\s*(?:cr|crores?|l|lacs?|lakhs?|k)?)/i,
        /(?:₹|rs\.?)\s*(\d[\d.,]*\s*(?:cr|crores?|l|lacs?|lakhs?))/i,
        /\b(\d[\d.]*\s*(?:cr|crores?|lakhs?|lacs?))\b/i,
      ]),
  },
  { key: 'pricePerSqft', run: (text) => hit(capture(text, [/\b([\d,]{3,7})\s*(?:\/|per\s*)\s*sq\.?\s*ft/i]), HIGH) },
  { key: 'rent', run: (text) => priceFrom(text, [/\brent\s*[:-]?\s*(?:₹|rs\.?)?\s*(\d[\d.,]*\s*(?:k|l|lacs?|lakhs?)?)/i]) },
  {
    key: 'deposit',
    run: (text) => priceFrom(text, [/\b(?:deposit|advance|security)\s*[:-]?\s*(?:₹|rs\.?)?\s*(\d[\d.,]*\s*(?:k|l|lacs?|lakhs?)?)/i]),
  },
  {
    key: 'maintenanceAmount',
    run: (text) => priceFrom(text, [/\bmaint\w*\s*[:-]?\s*(?:₹|rs\.?)?\s*(\d[\d.,]*\s*(?:k|l)?)/i]),
  },
];

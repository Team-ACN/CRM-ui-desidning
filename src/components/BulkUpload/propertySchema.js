import {
  bedrooms,
  boolean,
  coordinates,
  date,
  integer,
  number,
  phone,
  price,
  softEnum,
  strictEnum,
  text,
  url,
} from './fieldTypes';

export { parsePrice, formatPrice } from './fieldTypes';

export const IGNORE_FIELD = '__ignore__';

export const FIELD_GROUPS = [
  'Identity & Listing',
  'Agent',
  'Location',
  'Configuration',
  'Pricing',
  'Rental Terms',
];

const field = (key, label, group, type, extra = {}) => ({
  key,
  label,
  group,
  required: false,
  recommended: false,
  unique: false,
  aliases: [],
  ...type,
  ...extra,
});

export const LISTING_TYPES = ['resale', 'rental'];
export const PROPERTY_TYPES = ['residential', 'commercial'];
export const ASSET_TYPES = ['apartment', 'villa', 'plot', 'row house', 'penthouse', 'villament', 'office', 'retail', 'warehouse', 'land'];
export const FACINGS = ['east', 'west', 'north', 'south', 'north east', 'north west', 'south east', 'south west'];
export const ZONES = ['East', 'West', 'North', 'South', 'Central'];

const ID_PATTERN = /^[A-Za-z]{2,5}\d{2,6}$/;

const idType = (example) => ({
  validate: (value) => (ID_PATTERN.test(value.trim()) ? null : { message: `Expected format like ${example}`, severity: 'error' }),
  normalize: (value) => value.trim().toUpperCase(),
});

/** Mirrors the ACN properties sheet, column for column. */
export const PROPERTY_FIELDS = [
  // Identity & Listing
  field('propertyId', 'Property ID', 'Identity & Listing', text, {
    unique: true,
    hint: 'Leave blank — generated on upload',
    sample: '',
  }),
  field('listingType', 'Listing Type', 'Identity & Listing', strictEnum(LISTING_TYPES), { required: true, sample: 'resale' }),
  field('communityType', 'Community Type', 'Identity & Listing', softEnum(['gated', 'standalone', 'independent']), { sample: 'gated' }),
  field('propertyType', 'Property Type', 'Identity & Listing', strictEnum(PROPERTY_TYPES), { required: true, sample: 'residential' }),
  field('assetType', 'Asset Type', 'Identity & Listing', strictEnum(ASSET_TYPES), { required: true, sample: 'apartment' }),
  field('apartmentType', 'Apartment Type', 'Identity & Listing', softEnum(['simplex', 'duplex', 'triplex', 'studio', 'penthouse']), { sample: 'simplex' }),

  // Agent & KAM
  field('cpId', 'CP ID', 'Agent', idType('CPC330'), { required: true, aliases: ['agent id', 'channel partner id'], sample: 'CPC330' }),
  field('agentName', 'Agent Name', 'Agent', text, { recommended: true, sample: 'Shariff Housing Trio' }),
  field('agentPhoneNumber', 'Agent Phone', 'Agent', phone, { recommended: true, sample: '9739317577' }),

  // Location
  field('propertyName', 'Property Name', 'Location', text, { required: true, aliases: ['project name'], sample: 'Prestige Meridian Park' }),
  field('micromarket', 'Micromarket', 'Location', text, { recommended: true, sample: 'Thanisandra' }),
  field('area', 'Area', 'Location', text, { aliases: ['locality'], sample: 'East Bangalore' }),
  field('coordinates', 'Coordinates', 'Location', coordinates, { sample: '12.9735545,77.6125285' }),
  field('zone', 'Zone', 'Location', softEnum(ZONES), { sample: 'East' }),
  field('address', 'Address', 'Location', text, { sample: '29, Mahatma Gandhi Rd, Bengaluru 560001' }),
  field('mapLocation', 'Map Location', 'Location', url, { sample: 'https://www.google.com/maps/place/?q=place_id:ChIJ' }),

  // Configuration
  field('sbua', 'SBUA', 'Configuration', number('sq ft'), { recommended: true, aliases: ['super built up area'], sample: '1387' }),
  field('facing', 'Facing', 'Configuration', softEnum(FACINGS), { sample: 'West' }),
  field('noOfBedrooms', 'Bedrooms', 'Configuration', bedrooms, { recommended: true, aliases: ['bhk'], sample: '3' }),
  field('noOfBalcony', 'Balconies', 'Configuration', integer, { sample: '2' }),
  field('noOfBathrooms', 'Bathrooms', 'Configuration', integer, { sample: '3' }),
  field('plotArea', 'Plot Area', 'Configuration', number('sq ft'), { sample: '' }),
  field('structure', 'Structure', 'Configuration', text, { sample: '3B 3T' }),
  field('floorNumber', 'Floor Number', 'Configuration', integer, { sample: '23' }),
  field('referredFloorNumber', 'Referred Floor Number', 'Configuration', text, { sample: '' }),
  field('totalFloors', 'Total Floors', 'Configuration', integer, { sample: '30' }),
  field('noOfSeats', 'Seats', 'Configuration', integer, { sample: '' }),
  field('furnishing', 'Furnishing', 'Configuration', softEnum(['furnished', 'semi furnished', 'unfurnished', 'bare shell', 'warm shell']), { sample: '' }),
  field('possession', 'Possession', 'Configuration', text, { sample: 'under construction' }),
  field('readyToMove', 'Ready To Move', 'Configuration', boolean, { sample: 'FALSE' }),
  field('handOverDate', 'Handover Date', 'Configuration', date, { sample: '26/Dec/2025' }),
  field('unitNo', 'Unit No', 'Configuration', text, { sample: '' }),
  field('uds', 'UDS', 'Configuration', text, { sample: '' }),
  field('parking', 'Parking', 'Configuration', text, { sample: '' }),

  // Pricing
  field('totalAskPrice', 'Total Ask Price', 'Pricing', price, { aliases: ['ask price', 'sale price'], sample: '17600000' }),
  field('pricePerSqft', 'Price / sq ft', 'Pricing', number('₹ per sq ft'), { sample: '12689' }),
  field('commissionType', 'Commission Type', 'Pricing', text, { sample: '' }),
  field('maintenance', 'Maintenance', 'Pricing', text, { sample: '' }),
  field('maintenanceAmount', 'Maintenance Amount', 'Pricing', price, { sample: '' }),
  field('extraDetails', 'Extra Details', 'Pricing', text, { sample: '' }),

  // Rental Terms
  field('rent', 'Rent', 'Rental Terms', price, { sample: '' }),
  field('deposit', 'Deposit', 'Rental Terms', price, { sample: '' }),
];

export const FIELDS_BY_KEY = Object.fromEntries(PROPERTY_FIELDS.map((entry) => [entry.key, entry]));

export const REQUIRED_FIELD_KEYS = PROPERTY_FIELDS.filter((entry) => entry.required).map((entry) => entry.key);

/** Columns shown in the compact preview and post-upload tables. */
export const KEY_COLUMN_KEYS = [
  'propertyId',
  'propertyName',
  'assetType',
  'noOfBedrooms',
  'sbua',
  'totalAskPrice',
  'micromarket',
  'agentName',
];

const isBlank = (value) => value === undefined || value.trim() === '';

/** Checks that only make sense once the whole row is known. */
export const CROSS_FIELD_RULES = [
  {
    field: 'totalAskPrice',
    severity: 'warning',
    message: 'Resale listings normally have a total ask price',
    applies: (values) => values.listingType.toLowerCase() === 'resale' && isBlank(values.totalAskPrice),
  },
  {
    field: 'rent',
    severity: 'warning',
    message: 'Rental listings normally have a rent',
    applies: (values) => values.listingType.toLowerCase() === 'rental' && isBlank(values.rent),
  },
  {
    field: 'handOverDate',
    severity: 'warning',
    message: 'Under-construction properties normally have a handover date',
    applies: (values) => values.readyToMove === 'FALSE' && isBlank(values.handOverDate),
  },
];

const normalizeHeader = (header) => header.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Best-effort CSV header -> field key map, keyed by column index. */
export const autoMapHeaders = (headers) =>
  headers.reduce(
    (state, header, index) => {
      const normalized = normalizeHeader(header);
      const match = PROPERTY_FIELDS.find(
        (entry) =>
          !state.taken.has(entry.key) &&
          (normalizeHeader(entry.key) === normalized ||
            normalizeHeader(entry.label) === normalized ||
            entry.aliases.some((alias) => normalizeHeader(alias) === normalized)),
      );

      return {
        taken: match ? new Set([...state.taken, match.key]) : state.taken,
        mapping: { ...state.mapping, [index]: match ? match.key : IGNORE_FIELD },
      };
    },
    { taken: new Set(), mapping: {} },
  ).mapping;

export const TEMPLATE_HEADERS = PROPERTY_FIELDS.map((entry) => entry.key);

export const TEMPLATE_ROWS = [PROPERTY_FIELDS.map((entry) => entry.sample ?? '')];

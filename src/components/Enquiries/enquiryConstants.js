export const TODAY_PRESET = 'Today';

export const DATE_PRESETS = [TODAY_PRESET, 'Last 7 days', 'Last 30 days', 'This year'];

export const DEFAULT_FILTERS = { dealType: 'Resale', selected: {}, date: null };

export const STATUS_OPTIONS = ['Site Visit Done', 'Pending', 'Not Interested'];

export const FALLBACK_STATUS_STYLE = {
  trigger: 'bg-gray-100 text-gray-900',
  option: 'bg-gray-50 hover:bg-gray-100',
};

export const STATUS_STYLES = {
  'Site Visit Done': { trigger: 'bg-green-100 text-green-900', option: 'bg-green-50 hover:bg-green-100' },
  'Pending': { trigger: 'bg-yellow-100 text-yellow-900', option: 'bg-yellow-50 hover:bg-yellow-100' },
  'Not Interested': { trigger: 'bg-red-100 text-red-900', option: 'bg-red-50 hover:bg-red-100' },
};

export const PROPERTY_STATUS_OPTIONS = ['Available', 'Hold', 'Sold'];

export const PROPERTY_STATUS_STYLES = {
  'Available': { trigger: 'bg-green-100 text-green-900', option: 'bg-green-50 hover:bg-green-100' },
  'Hold': { trigger: 'bg-yellow-100 text-yellow-900', option: 'bg-yellow-50 hover:bg-yellow-100' },
  'Sold': { trigger: 'bg-red-100 text-red-900', option: 'bg-red-50 hover:bg-red-100' },
};

export const SOLD_STATUS = 'Sold';

export const SELLING_PLATFORMS = [
  'TruEstate',
  'Housing.com',
  'MagicBricks',
  '99acres',
  'NoBroker',
  'Direct / Walk-in',
  'Referral',
  'Other',
];

export const KAM_OPTIONS = ['Sandeep', 'Rasranjan', 'Siddharth', 'Surendra', 'Qalandar'];

export const CONNECTION_STATUSES = ['Connected', 'Not Connected', 'Call Back'];

// Both parties on an enquiry can be called, each with its own call result
export const CALL_PARTIES = [
  { key: 'buyer', label: 'Buyer', nameField: 'buyerName', numberField: 'buyerNumber' },
  { key: 'seller', label: 'Seller', nameField: 'sellerName', numberField: 'sellerNumber' },
];

export const EMPTY_CALL_RESULT = { status: null, notes: '' };

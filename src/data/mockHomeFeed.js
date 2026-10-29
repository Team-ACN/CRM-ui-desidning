// Automated Home Feed (PRD v2) — CMS-side mock data. The engine itself is server-side;
// the CMS only switches section types, edits guardrails/copy and adds overrides.

export const SECTION_FAMILIES = [
  { key: 'search', label: 'From agent searches' },
  { key: 'picks', label: 'From agent picks' },
  { key: 'market', label: 'From agent market' },
  { key: 'group', label: 'Group-specific (plots & commercial)' },
  { key: 'fill', label: 'Fill only' },
];

export const SECTION_TYPES = [
  { id: 1, name: 'New since your last search', family: 'search', status: 'Ready', enabled: true },
  { id: 2, name: 'Same budget, different home type', family: 'search', status: 'Ready', enabled: true },
  { id: 3, name: 'Same home, nearby micromarkets', family: 'search', status: 'Ready', enabled: true },
  { id: 4, name: 'A size up for a little more', family: 'search', status: 'Ready', enabled: true },
  { id: 5, name: 'Closest matches', family: 'search', status: 'Ready', enabled: true },
  { id: 6, name: 'Similar to listings you shared', family: 'picks', status: 'Ready', enabled: true },
  { id: 7, name: 'Often enquired alongside your picks', family: 'picks', status: 'Ready', enabled: true },
  { id: 8, name: 'Most enquired this week', family: 'market', status: 'Ready', enabled: true },
  { id: 9, name: 'Priced below market', family: 'market', status: 'Ready', enabled: true },
  { id: 10, name: 'Competing with your listing', family: 'market', status: 'Ready', enabled: true },
  { id: 11, name: 'Large floor plates', family: 'group', group: 'Commercial', status: 'Ready', enabled: true },
  { id: 12, name: 'Pre-leased investments', family: 'group', group: 'Commercial', status: 'Gated', gateField: 'Tenanted flag, current rent', fillRate: 41, enabled: false },
  { id: 13, name: 'Ready to move in', family: 'group', group: 'Commercial', status: 'Gated', gateField: 'Furnishing status', fillRate: 55, enabled: false },
  { id: 14, name: 'Ground-floor retail', family: 'group', group: 'Commercial', status: 'Gated', gateField: 'Floor number', fillRate: 62, enabled: false },
  { id: 15, name: 'Plots in your size', family: 'group', group: 'Plots', status: 'Ready', enabled: true },
  { id: 16, name: 'Approved layouts', family: 'group', group: 'Plots', status: 'Gated', gateField: 'Approval / khata', fillRate: 34, enabled: false },
  { id: 17, name: 'East-facing and corner plots', family: 'group', group: 'Plots', status: 'Gated', gateField: 'Facing, corner flag', fillRate: 18, enabled: false },
  { id: 18, name: 'New in your area', family: 'fill', status: 'Ready', enabled: true },
];

// Share of home loads that currently need #18 to reach 10 sections.
export const FILL_NEEDED_PCT = 3.2;

export const THRESHOLD_FIELDS = [
  { key: 'minListings', label: 'Min listings per section', hint: 'Section dropped below this after exclusions', min: 1, max: 10, step: 1 },
  { key: 'maxListings', label: 'Max listings per section', min: 4, max: 20, step: 1 },
  { key: 'belowMarketPct', label: 'Below-market threshold (%)', hint: '#9: rate ≤ (100 − x)% of median', min: 5, max: 30, step: 1 },
  { key: 'minComparables', label: 'Min comparables for a median', min: 5, max: 50, step: 1 },
  { key: 'groupMixPct', label: 'Second-group mix (%)', hint: 'Group share of active days to get its market sections', min: 5, max: 50, step: 1 },
  { key: 'fatigueDays', label: 'Fatigue: impressed days', hint: 'Hidden after this many distinct days with no click', min: 1, max: 10, step: 1 },
  { key: 'fatigueWindowDays', label: 'Fatigue window (days)', min: 7, max: 30, step: 1 },
  { key: 'groupScoreFloor', label: '#11 / #12 score floor', min: 0, max: 1, step: 0.05 },
  { key: 'yieldMin', label: 'Yield band min (%)', min: 0, max: 10, step: 0.5 },
  { key: 'yieldMax', label: 'Yield band max (%)', min: 5, max: 20, step: 0.5 },
];

export const DEFAULT_THRESHOLDS = {
  version: 3,
  status: 'Approved',
  updatedAt: '2026-10-14',
  values: {
    minListings: 4,
    maxListings: 10,
    belowMarketPct: 10,
    minComparables: 10,
    groupMixPct: 20,
    fatigueDays: 3,
    fatigueWindowDays: 14,
    groupScoreFloor: 0.4,
    yieldMin: 2,
    yieldMax: 12,
  },
};

// Longest realistic value per token, used by the CMS save check (PRD §10/§11).
export const TOKEN_WORST_CASE = {
  config: '2–3 BHK',
  'config + 1': '4 BHK',
  asset: 'independent buildings',
  'asset, singular': 'commercial space',
  'substitute assets': 'villas & row houses',
  'searched asset': 'apartment',
  listing: 'for rent',
  location: 'Electronic City +2',
  'searched location': 'Electronic City +2',
  'adjacent locations': 'Bommasandra, Hosur +2',
  budget: '₹85L–1.2Cr',
  size: '5,000–10,000 sq ft',
  'next bucket': '40×60',
  price: '₹12.5Cr',
  time: 'since Wednesday',
  n: '12',
  x: '45',
  area: '12,500 sq ft',
  yield: '11.5',
  differs: '₹20L over budget',
  'price gap': '₹5K higher/mo',
  approval: 'BIAAPA approved',
  facing: 'East-facing',
  furnishing: 'Warm shell',
};

export const COPY_LIMITS = { title: 34, context: 38, tag: 20 };

export const DEFAULT_TEMPLATE_COPY = {
  1: { title: 'New {config} {asset} in {location}', context: '{budget} · {n} added {time}', tag: 'New' },
  2: { title: '{substitute assets} in {location}', context: 'At your {budget} {searched asset} budget', tag: '{asset, singular}' },
  3: { title: '{config} {asset} near {searched location}', context: 'In {adjacent locations} · {budget}', tag: '{location}' },
  4: { title: '{config + 1} {asset} in {location}', context: 'One size up · Up to {price}', tag: '+{n} sq ft' },
  5: { title: 'Close matches: {config} {asset} in {location}', context: '{n} results · Nearest options', tag: '{differs}' },
  6: { title: 'Similar to your {location} {config}', context: 'Same size, zone and budget range', tag: '' },
  7: { title: 'Also enquired with your picks', context: 'From agents with similar enquiries', tag: '' },
  8: { title: 'Most enquired in {location}', context: '{config} {asset} · Last 7 days', tag: '{n} agents enquired' },
  9: { title: 'Below market in {location}', context: 'At least 10% below area avg rate', tag: '{x}% below area avg' },
  10: { title: 'Competing with your {config}', context: '{location} · Within 10% of your price', tag: '{price gap}' },
  11: { title: 'Large offices {listing} in {location}', context: '10,000 sq ft and above', tag: '{area}' },
  12: { title: 'Pre-leased assets in {location}', context: 'Tenanted, for sale, by yield', tag: '{yield}% yield' },
  13: { title: 'Ready offices {listing} in {location}', context: 'Furnished and warm-shell spaces', tag: '{furnishing}' },
  14: { title: 'Ground-floor retail {listing} in {location}', context: 'Street-level, walk-in friendly', tag: 'Ground floor' },
  15: { title: '{size} plots in {location}', context: 'Your most-searched plot size', tag: '{next bucket}' },
  16: { title: 'Approved plots in {location}', context: 'BDA, BMRDA, BIAAPA or A-khata', tag: '{approval}' },
  17: { title: 'East & corner plots in {location}', context: 'High-demand plot orientations', tag: '{facing}' },
  18: { title: 'Just listed in {location}', context: '{config} {asset} · Last 7 days', tag: 'New' },
};

export const ASSET_TYPES = ['Apartment', 'Villa', 'Villament', 'Row House', 'Independent Building', 'Plot', 'Commercial Space', 'Office Space', 'Retail Space'];
export const LISTING_TYPES = ['Sale', 'Rent'];
export const FEED_LOCATIONS = ['Whitefield', 'Brookefield', 'Hoodi', 'Bellandur', 'HSR Layout', 'Outer Ring Road', 'Anekal', 'East Bengaluru', 'North Bengaluru', 'South Bengaluru'];

export const mockPins = [
  { id: 'PIN001', listingId: 'PB4201', sectionTypeId: 9, startDate: '2026-10-20', endDate: '2026-10-31', reason: 'Editorial' },
];

export const mockBlockRules = [
  { id: 'BLK001', location: 'Anekal', assetType: 'Commercial Space', listingType: 'Rent' },
];

// Position-normalised CTR per type over the last 14 days (PRD §9 retirement rule).
export const mockTypePerformance = {
  1: { ctr: 1.32, impressions: 48210, daysBelow: 0 },
  2: { ctr: 0.91, impressions: 31044, daysBelow: 0 },
  3: { ctr: 0.84, impressions: 29810, daysBelow: 0 },
  4: { ctr: 0.62, impressions: 22105, daysBelow: 3 },
  5: { ctr: 1.08, impressions: 9230, daysBelow: 0 },
  6: { ctr: 1.12, impressions: 14320, daysBelow: 0 },
  7: { ctr: 0.44, impressions: 12880, daysBelow: 16 },
  8: { ctr: 1.21, impressions: 40118, daysBelow: 0 },
  9: { ctr: 1.04, impressions: 35202, daysBelow: 0 },
  10: { ctr: 0.97, impressions: 18440, daysBelow: 0 },
  11: { ctr: 0.48, impressions: 3920, daysBelow: 15 },
  15: { ctr: 0.71, impressions: 6110, daysBelow: 0 },
  18: { ctr: 0.88, impressions: 26300, daysBelow: 0 },
};

// PRD §12 worked example: Agent R.
export const mockPreviewAgents = [
  {
    id: 'AGT1042',
    name: 'Agent R',
    summary: 'Homes sale 75% · Commercial 25% · Cohort zone East',
    feed: [
      { type: 1, title: 'New 3 BHK apartments in Whitefield', context: '₹1.5–2Cr · 4 added since Tuesday', score: 0.92, rule: 'Position 1: highest search section', anchor: 'S1' },
      { type: 2, title: 'Villas & row houses in Whitefield', context: 'At your ₹1.5–2Cr apartment budget', score: 0.81, rule: 'Score order', anchor: 'S1' },
      { type: 6, title: 'Similar to your Bellandur 3 BHK', context: 'Same size, zone and budget range', score: 0.78, rule: 'Score order', anchor: 'Picks' },
      { type: 5, title: 'Close matches: offices for rent', context: 'ORR · 2 results · Nearest options', score: 0.71, rule: 'Score order · title overflow moved location', anchor: 'S2' },
      { type: 3, title: '3 BHK apartments near Whitefield', context: 'In Brookefield & Hoodi · ₹1.5–2Cr', score: 0.69, rule: 'Score order', anchor: 'S1' },
      { type: 8, title: 'Most enquired in Whitefield', context: '3 BHK apartments · Last 7 days', score: 0.55, rule: 'Market reserve (≥ 3)', anchor: 'Scope: Whitefield, homes, Sale' },
      { type: 4, title: '4 BHK apartments in Whitefield', context: 'One size up · Up to ₹2.3Cr', score: 0.52, rule: 'Score order', anchor: 'S1' },
      { type: 10, title: 'Competing with your 3 BHK', context: 'Whitefield · Within 10% of your price', score: 0.5, rule: 'Score order', anchor: 'Own listing' },
      { type: 7, title: 'Also enquired with your picks', context: 'From agents with similar enquiries', score: 0.47, rule: 'Search + picks cap (7)', anchor: 'Enquiries' },
      { type: 9, title: 'Below market in Whitefield', context: 'At least 10% below area avg rate', score: 0.45, rule: 'Market reserve (≥ 3)', anchor: 'Scope: Whitefield, homes, Sale' },
      { type: 11, title: 'Large offices for rent in ORR', context: '10,000 sq ft and above', score: 0.41, rule: 'Second group ≥ 20% · score ≥ 0.4', anchor: 'Scope: ORR, commercial, Rent' },
    ],
  },
  {
    id: 'AGT2210',
    name: 'Agent N (new, no searches)',
    summary: 'Onboarding: HSR Layout · Homes · Sale',
    feed: [
      { type: 8, title: 'Most enquired in HSR Layout', context: 'Apartments · Last 7 days', score: 0.5, rule: 'Score order', anchor: 'Scope: onboarding' },
      { type: 9, title: 'Below market in HSR Layout', context: 'At least 10% below area avg rate', score: 0.48, rule: 'Score order', anchor: 'Scope: onboarding' },
      { type: 18, title: 'Just listed in HSR Layout', context: 'Homes · Last 7 days', score: null, rule: 'Fill 1: #18 in primary scope', anchor: 'Fill' },
      { type: 8, title: 'Most enquired in South Bengaluru', context: 'Homes · Last 7 days', score: null, rule: 'Fill 2: other cohort zones', anchor: 'Fill' },
      { type: 9, title: 'Below market in Bengaluru', context: 'At least 10% below area avg rate', score: null, rule: 'Fill 4: city-wide', anchor: 'Fill' },
    ],
  },
];

// Live Home banners/ads with slot rules, interleaved in preview (they don't count toward the 10).
export const mockPreviewSlots = [
  { afterSection: 2, label: 'Banner · Diwali Festive Banner' },
  { everyN: 4, label: 'Ad · Flash Sale Ad' },
];

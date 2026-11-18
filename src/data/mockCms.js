// ACN CMS mock data — Cohorts, Components, Templates (per surface, matrix) and Popups, all held
// as plain in-memory arrays mutated by the functions below, same pattern as mockLoan.js/mockEdge.js.

export const COHORT_AREAS = ['North', 'South', 'East', 'West', 'Central'];
export const COHORT_PLAN_TYPES = ['Basic', 'Premium', 'Trial'];
export const COHORT_RESALE_RENTAL = ['Resale', 'Rental', 'Both'];
export const COHORT_PRICING = ['25L–1.5Cr', '1.5–3Cr', '3–4.5Cr', '4.5Cr+'];

export const INVENTORY_ASSET_TYPES = ['Apartment', 'Villa', 'Villament', 'Row House', 'Plot', 'Independent Building', 'Commercial Space', 'Office Space', 'Retail Space'];
export const INVENTORY_CONFIGS = ['Studio', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
export const INVENTORY_ZONES = ['North', 'South', 'East', 'West', 'Central'];

export const SURFACES = [
  { value: 'home', label: 'Home' },
  { value: 'properties', label: 'Properties' },
  { value: 'services', label: 'Services' },
];

// App-only. Each maps to one app widget: TOP_BANNER, SINGLE_BANNER, BANNER_CAROUSEL,
// ADVERTISEMENT_BANNER (4:5), INVENTORY_DISCOVERY. Ratios are what the app renders.
export const COMPONENT_TYPES = {
  mobile_top_banner: { label: 'Top Banner', name: 'Top banner', appWidget: 'TOP_BANNER', ratio: '390:132', minItems: 1, platform: 'app' },
  mobile_banner: { label: 'Banner', name: 'Banner', appWidget: 'SINGLE_BANNER', ratio: '358:136', minItems: 1, platform: 'app' },
  feed_carousel: { label: 'Carousel', name: 'Carousel', appWidget: 'BANNER_CAROUSEL', ratio: '358:176', minItems: 3, platform: 'both', carousel: true },
  feed_vertical_carousel: { label: '4:5 Carousel', name: '4:5 Carousel', appWidget: 'ADVERTISEMENT_BANNER', ratio: '4:5', minItems: 3, platform: 'both', carousel: true },
  desktop_top_banner: { label: 'Top Banner Desktop', name: 'Top banner', appWidget: null, ratio: '1440:378', minItems: 1, platform: 'web' },
  desktop_banner: { label: 'Banner Desktop', name: 'Banner', appWidget: null, ratio: '45:11', minItems: 1, platform: 'web' },
  inventory: { label: 'Inventory', name: 'Inventory', appWidget: 'INVENTORY_DISCOVERY', minItems: 0, platform: 'both', inventory: true },
};

// Deterministic placeholder photo for the demo — same seed always returns the same image, so
// thumbnails don't flicker between renders.
export function placeholderImage(seed, width = 400, height = 200) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export const NATIVE_WIDGETS = ['Recommended properties', 'Recently viewed', 'Agent spotlight', 'Lead capture form'];

// Small searchable directory for the cohort "Add specific users" picker — search by name or
// phone number, pick the real CPID instead of pasting one in blind.
const DIRECTORY_FIRST = ['Ramesh', 'Deepika', 'Arjun', 'Priya', 'Vikram', 'Sneha', 'Rahul', 'Kavya', 'Manoj', 'Anita', 'Suresh', 'Divya', 'Karthik', 'Pooja', 'Rohit', 'Meera'];
const DIRECTORY_LAST = ['Gowda', 'Nair', 'Shetty', 'Reddy', 'Iyer', 'Menon', 'Rao', 'Kumar', 'Pillai', 'Shah'];
export const MOCK_DIRECTORY = Array.from({ length: 60 }, (_, i) => {
  const name = `${DIRECTORY_FIRST[i % DIRECTORY_FIRST.length]} ${DIRECTORY_LAST[i % DIRECTORY_LAST.length]}`;
  return { cpid: `CPC${String(500 + i).padStart(3, '0')}`, name, phone: `+91 9${String(8000000000 + i * 137).slice(0, 9)}` };
});

function hashSeed(str) {
  let seed = 0;
  for (let i = 0; i < str.length; i++) seed = (seed * 31 + str.charCodeAt(i)) % 100000;
  return seed;
}

// Deterministic pseudo-count for a single rule option — how many users this one chip alone
// would match, for the "North 1,204" style hint shown next to each chip.
export function optionUserCount(groupKey, value) {
  const seed = hashSeed(`${groupKey}:${value}`);
  return 400 + (seed % 2600);
}

function now() {
  return Date.now();
}

function nextId(list, field, prefix) {
  const nums = list.map((x) => Number(String(x[field]).replace(prefix, '')) || 0);
  return `${prefix}${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
}

function pushHistory(entity, action, user = 'Samarth') {
  entity.history = entity.history || [];
  entity.history.push({ action, user, time: now() });
}

// ─── Cohorts ──────────────────────────────────────────────────────────────

export function ruleSummary(cohort) {
  const r = cohort.rules || {};
  const parts = [
    r.areas?.length ? r.areas.join(', ') : null,
    r.planTypes?.length ? r.planTypes.join(', ') : null,
    r.resaleRental || null,
    r.pricing?.length ? r.pricing.join(', ') : null,
  ].filter(Boolean);
  if (cohort.manualCpids?.length) parts.push(`+${cohort.manualCpids.length} manual`);
  return parts.length ? parts.join(' · ') : 'No rules set';
}

// Same rule content as ruleSummary, but as individual tags (Area, Plan, Resale/Rental, Pricing,
// Manual) instead of one joined string — for rendering a row of small chips per cohort.
export function ruleTags(cohort) {
  const r = cohort.rules || {};
  const tags = [...(r.areas || []), ...(r.planTypes || [])];
  if (r.resaleRental && r.resaleRental !== 'Both') tags.push(r.resaleRental);
  tags.push(...(r.pricing || []));
  if (cohort.manualCpids?.length) tags.push(`+${cohort.manualCpids.length} manual`);
  return tags;
}

export const mockCohorts = [
  {
    id: 'COH001',
    name: 'Premium East',
    status: 'live',
    priority: 1,
    rules: { areas: ['East', 'North'], planTypes: ['Premium'], resaleRental: 'Resale', pricing: ['1.5–3Cr'] },
    manualCpids: [],
    userCount: 3240,
    lastRefreshed: now() - 2 * 86400000,
    templateMappings: { home: 'Template B' },
    members: Array.from({ length: 12 }, (_, i) => ({ cpid: `CPC${980 + i}`, name: `Agent ${i + 1}`, source: i % 4 === 0 ? 'manual' : 'rule' })),
    excludedMembers: [],
    history: [{ action: 'Cohort created', user: 'Samarth', time: now() - 20 * 86400000 }],
  },
  {
    id: 'COH002',
    name: 'Trial All',
    status: 'live',
    priority: 2,
    rules: { areas: [], planTypes: ['Trial'], resaleRental: 'Both', pricing: [] },
    manualCpids: [],
    userCount: 845,
    lastRefreshed: now() - 86400000,
    templateMappings: { home: 'Template B', services: 'S2' },
    members: Array.from({ length: 8 }, (_, i) => ({ cpid: `CPC${400 + i}`, name: `Trial Agent ${i + 1}`, source: 'rule' })),
    excludedMembers: [{ cpid: 'CPC411', name: 'Removed Agent', source: 'rule' }],
    history: [{ action: 'Cohort created', user: 'Sandeep', time: now() - 15 * 86400000 }],
  },
  {
    id: 'COH003',
    name: 'Rental Focus — Bangalore',
    status: 'paused',
    priority: 3,
    rules: { areas: ['South', 'West'], planTypes: [], resaleRental: 'Rental', pricing: [] },
    manualCpids: ['CPC700', 'CPC701'],
    userCount: 612,
    lastRefreshed: now() - 6 * 86400000,
    templateMappings: {},
    members: Array.from({ length: 6 }, (_, i) => ({ cpid: `CPC${700 + i}`, name: `Rental Agent ${i + 1}`, source: i < 2 ? 'manual' : 'rule' })),
    excludedMembers: [],
    history: [{ action: 'Cohort created', user: 'Samarth', time: now() - 30 * 86400000 }, { action: 'Paused', user: 'Samarth', time: now() - 6 * 86400000 }],
  },
  {
    id: 'COH004',
    name: 'Low Pricing Behaviour',
    status: 'live',
    priority: 4,
    rules: { areas: [], planTypes: [], resaleRental: 'Both', pricing: ['25L–1.5Cr'] },
    manualCpids: [],
    userCount: 152,
    lastRefreshed: now() - 10 * 86400000,
    templateMappings: {},
    members: [],
    excludedMembers: [],
    history: [{ action: 'Cohort created', user: 'Qalandar', time: now() - 40 * 86400000 }],
  },
  {
    id: 'COH005',
    name: 'High Value Central',
    status: 'archived',
    priority: 5,
    rules: { areas: ['Central'], planTypes: ['Premium'], resaleRental: 'Resale', pricing: ['4.5Cr+'] },
    manualCpids: [],
    userCount: 88,
    lastRefreshed: now() - 60 * 86400000,
    templateMappings: {},
    members: [],
    excludedMembers: [],
    history: [{ action: 'Cohort created', user: 'Samarth', time: now() - 90 * 86400000 }, { action: 'Archived', user: 'Samarth', time: now() - 60 * 86400000 }],
  },
];

// More sample cohorts so template cohort-picking has something to choose from.
[
  ['COH006', 'New Joiners — 30 days', 'live', { areas: [], planTypes: ['Trial'], resaleRental: 'Both', pricing: [] }, 410],
  ['COH007', 'Top Resale Performers', 'live', { areas: ['North'], planTypes: ['Premium'], resaleRental: 'Resale', pricing: ['3Cr+'] }, 275],
  ['COH008', 'Hyderabad Agents', 'live', { areas: ['Hyderabad'], planTypes: [], resaleRental: 'Both', pricing: [] }, 1180],
  ['COH009', 'Inactive 60+ days', 'live', { areas: [], planTypes: [], resaleRental: 'Both', pricing: [] }, 934],
  ['COH010', 'Rental Specialists', 'live', { areas: ['South'], planTypes: [], resaleRental: 'Rental', pricing: ['25L–1.5Cr'] }, 520],
].forEach(([id, name, status, rules, userCount], i) =>
  mockCohorts.push({
    id, name, status, priority: 6 + i, rules, manualCpids: [], userCount, lastRefreshed: now() - (i + 1) * 86400000, templateMappings: {},
    members: Array.from({ length: 6 }, (_, k) => ({ cpid: `CPC${1100 + i * 10 + k}`, name: `Agent ${k + 1}`, source: 'rule' })),
    excludedMembers: [], history: [{ action: 'Cohort created', user: 'Samarth', time: now() - (i + 5) * 86400000 }],
  })
);

export function getCohorts() {
  return mockCohorts;
}

export function getCohort(id) {
  return mockCohorts.find((c) => c.id === id) || null;
}

export function createCohort(data) {
  const cohort = {
    id: nextId(mockCohorts, 'id', 'COH'),
    name: data.name || 'Untitled cohort',
    status: 'live',
    rules: data.rules || { areas: [], planTypes: [], resaleRental: 'Both', pricing: [] },
    manualCpids: data.manualCpids || [],
    priority: data.priority ?? Math.max(0, ...mockCohorts.map((c) => c.priority || 0)) + 1,
    userCount: 0,
    lastRefreshed: now(),
    templateMappings: {},
    members: [],
    excludedMembers: [],
    history: [],
  };
  pushHistory(cohort, 'Cohort created');
  mockCohorts.push(cohort);
  return cohort;
}

export function updateCohort(id, patch) {
  const cohort = getCohort(id);
  if (!cohort) return null;
  Object.assign(cohort, patch);
  pushHistory(cohort, 'Rules updated');
  return cohort;
}

export function setCohortStatus(id, status) {
  const cohort = getCohort(id);
  if (!cohort) return null;
  cohort.status = status;
  pushHistory(cohort, status === 'paused' ? 'Paused' : status === 'archived' ? 'Archived' : 'Resumed');
  return cohort;
}

export function refreshCohort(id) {
  const cohort = getCohort(id);
  if (!cohort) return null;
  const before = cohort.userCount;
  const delta = Math.round(before * (Math.random() * 0.06 - 0.01));
  cohort.userCount = Math.max(0, before + delta);
  cohort.lastRefreshed = now();
  pushHistory(cohort, `Refreshed (${before} → ${cohort.userCount})`);
  return { cohort, before, after: cohort.userCount };
}

export function removeCohortMember(id, cpid) {
  const cohort = getCohort(id);
  if (!cohort) return null;
  const member = cohort.members.find((m) => m.cpid === cpid);
  if (!member) return null;
  cohort.members = cohort.members.filter((m) => m.cpid !== cpid);
  cohort.excludedMembers = [...cohort.excludedMembers, member];
  return cohort;
}

export function restoreCohortMember(id, cpid) {
  const cohort = getCohort(id);
  if (!cohort) return null;
  const member = cohort.excludedMembers.find((m) => m.cpid === cpid);
  if (!member) return null;
  cohort.excludedMembers = cohort.excludedMembers.filter((m) => m.cpid !== cpid);
  cohort.members = [...cohort.members, member];
  return cohort;
}

// ─── Components ───────────────────────────────────────────────────────────

export const mockComponents = [
  {
    id: 'CMP001',
    internalName: 'Diwali carousel',
    type: 'feed_carousel',
    surfaces: ['home'],
    platform: 'both',
    status: 'live',
    tags: ['festive'],
    items: [
      { id: 'itm1', imageUrl: { url: placeholderImage('cmp1-a') }, linkUrl: 'https://acn.app/offers/diwali', appendCpid: true, description: 'Diwali offer', startDate: '', endDate: '' },
      { id: 'itm2', imageUrl: { url: placeholderImage('cmp1-b') }, linkUrl: 'https://acn.app/offers/diwali-2', appendCpid: false, description: 'Diwali offer 2', startDate: '', endDate: '' },
      { id: 'itm3', imageUrl: { url: placeholderImage('cmp1-c') }, linkUrl: 'https://acn.app/offers/diwali-3', appendCpid: true, description: 'Diwali offer 3', startDate: '', endDate: '' },
    ],
    history: [{ action: 'Component created', user: 'Samarth', time: now() - 18 * 86400000 }],
  },
  {
    id: 'CMP006',
    internalName: 'New launches carousel',
    type: 'feed_carousel',
    surfaces: ['home', 'properties'],
    platform: 'both',
    status: 'live',
    tags: ['properties'],
    items: [
      { id: 'itm16', imageUrl: { url: placeholderImage('cmp6-a') }, linkUrl: 'https://acn.app/new-launches', appendCpid: false, description: 'New launches', startDate: '', endDate: '' },
      { id: 'itm17', imageUrl: { url: placeholderImage('cmp6-b') }, linkUrl: 'https://acn.app/new-launches-2', appendCpid: false, description: 'New launches 2', startDate: '', endDate: '' },
      { id: 'itm18', imageUrl: { url: placeholderImage('cmp6-c') }, linkUrl: 'https://acn.app/new-launches-3', appendCpid: true, description: 'New launches 3', startDate: '', endDate: '' },
    ],
    history: [{ action: 'Component created', user: 'Qalandar', time: now() - 6 * 86400000 }],
  },
  {
    id: 'CMP003',
    internalName: 'Top strip — verification',
    type: 'mobile_top_banner',
    surfaces: ['home', 'properties'],
    platform: 'app',
    status: 'live',
    tags: [],
    items: [
      { id: 'itm5', imageUrl: { url: placeholderImage('cmp3-a', 356, 132) }, linkUrl: 'https://acn.app/verify', appendCpid: false, description: 'Verify now', startDate: '', endDate: '' },
    ],
    history: [{ action: 'Component created', user: 'Samarth', time: now() - 25 * 86400000 }],
  },
  {
    id: 'CMP008',
    color: '#BBF7D0',
    internalName: 'Top strip — KYC reminder',
    type: 'mobile_top_banner',
    surfaces: ['home'],
    platform: 'app',
    status: 'live',
    tags: ['kyc'],
    items: [
      { id: 'itm20', imageUrl: { url: placeholderImage('cmp8-a', 356, 132) }, linkUrl: 'https://acn.app/kyc', appendCpid: true, description: 'Complete your KYC', startDate: '', endDate: '' },
    ],
    history: [{ action: 'Component created', user: 'Siddharth', time: now() - 3 * 86400000 }],
  },
  {
    id: 'CMP004',
    internalName: 'Legal services ad',
    type: 'feed_vertical_carousel',
    surfaces: ['services'],
    platform: 'both',
    status: 'live',
    tags: ['legal'],
    items: [
      { id: 'itm6', imageUrl: { url: placeholderImage('cmp4-a') }, linkUrl: 'https://acn.app/legal', appendCpid: true, description: 'Legal services', startDate: '', endDate: '' },
      { id: 'itm21', imageUrl: { url: placeholderImage('cmp4-b') }, linkUrl: 'https://acn.app/legal-2', appendCpid: true, description: 'Legal services 2', startDate: '', endDate: '' },
    ],
    history: [{ action: 'Component created', user: 'Qalandar', time: now() - 8 * 86400000 }],
  },
  {
    id: 'CMP009',
    internalName: 'Home loan ad',
    type: 'feed_vertical_carousel',
    surfaces: ['home'],
    platform: 'app',
    status: 'live',
    tags: ['loan'],
    items: [
      { id: 'itm22', imageUrl: { url: placeholderImage('cmp9-a') }, linkUrl: 'https://acn.app/home-loan-ad', appendCpid: false, description: 'Home loan ad', startDate: '', endDate: '' },
    ],
    history: [{ action: 'Component created', user: 'Sandeep', time: now() - 2 * 86400000 }],
  },
  {
    id: 'CMP005',
    internalName: 'App update single banner',
    type: 'mobile_banner',
    surfaces: ['home'],
    platform: 'app',
    status: 'archived',
    tags: [],
    items: [
      { id: 'itm7', imageUrl: { url: placeholderImage('cmp5-mob') }, linkUrl: 'https://acn.app/update', appendCpid: false, description: 'Update the app', startDate: '', endDate: '' },
    ],
    history: [{ action: 'Component created', user: 'Samarth', time: now() - 50 * 86400000 }, { action: 'Archived', user: 'Samarth', time: now() - 5 * 86400000 }],
  },
  {
    id: 'CMP010',
    internalName: 'Monsoon offer single banner',
    type: 'mobile_banner',
    surfaces: ['properties'],
    platform: 'app',
    status: 'live',
    tags: ['festive'],
    items: [
      { id: 'itm23', imageUrl: { url: placeholderImage('cmp10-mob') }, linkUrl: 'https://acn.app/offers/monsoon', appendCpid: true, description: 'Monsoon offer', startDate: '', endDate: '' },
    ],
    history: [{ action: 'Component created', user: 'Rasranjan', time: now() - 4 * 86400000 }],
  },
];

function seedItems(prefix, labels, w = 400, h = 200) {
  return labels.map((label, i) => ({
    id: `${prefix}_${i + 1}`,
    imageUrl: { url: placeholderImage(`${prefix}-${i + 1}`, w, h) },
    linkUrl: `https://acn.app/${prefix}/${i + 1}`,
    appendCpid: i % 2 === 0,
    description: label,
    startDate: '',
    endDate: '',
  }));
}

[
  { id: 'CMP012', internalName: 'Weekend site visits', type: 'feed_carousel', surfaces: ['home'], platform: 'both', status: 'live', tags: ['visits'], items: seedItems('visits', ['Book a site visit', 'Free pickup & drop', 'Visit 3 projects in a day', 'Weekend slots open', 'Bring your family']) },
  { id: 'CMP013', internalName: 'Agent success stories', type: 'feed_carousel', surfaces: ['home', 'services'], platform: 'both', status: 'live', tags: ['stories'], items: seedItems('stories', ['Closed 12 deals in a month', 'From 0 to 50 leads', 'Top agent of the quarter', 'How Ramesh grew 3x']) },
  { id: 'CMP014', internalName: 'Premium projects', type: 'feed_vertical_carousel', surfaces: ['properties'], platform: 'both', status: 'live', tags: ['premium'], items: seedItems('premium', ['Skyline Residency', 'Palm Meadows', 'Lakeview Towers', 'Green Acres', 'Urban Nest'], 320, 400) },
  { id: 'CMP015', internalName: 'Loan partners', type: 'feed_vertical_carousel', surfaces: ['services'], platform: 'app', status: 'live', tags: ['loan'], items: seedItems('loanp', ['HDFC pre-approved', 'SBI low rate', 'ICICI fast track'], 320, 400) },
  { id: 'CMP016', internalName: 'Refer & earn', type: 'mobile_banner', surfaces: ['home'], platform: 'app', status: 'live', tags: ['referral'], items: seedItems('refer', ['Refer an agent and earn'], 358, 136) },
  { id: 'CMP017', internalName: 'Webinar this Friday', type: 'mobile_banner', surfaces: ['services'], platform: 'app', status: 'live', tags: ['webinar'], items: seedItems('webinar', ['Join the webinar'], 358, 136) },
  { id: 'CMP020', internalName: 'Top strip — new launches', type: 'mobile_top_banner', surfaces: ['properties'], platform: 'app', status: 'live', tags: ['launch'], items: seedItems('tsl', ['New launches this week'], 356, 132) },
  { id: 'CMP021', internalName: 'Top strip — app update', type: 'mobile_top_banner', surfaces: ['home'], platform: 'app', status: 'live', tags: [], items: seedItems('tsu', ['Update to the latest app'], 356, 132) },
  { id: 'CMP024', internalName: 'Festive deals', type: 'feed_carousel', surfaces: ['home', 'properties'], platform: 'both', status: 'live', tags: ['festive'], items: seedItems('fd', ['Diwali booking offer', 'Zero brokerage week', 'Gold coin on booking', 'Festive EMI plans', 'Limited-time price drop', 'Refer and win']) },
  { id: 'CMP025', internalName: 'Investor corner', type: 'feed_carousel', surfaces: ['properties'], platform: 'both', status: 'live', tags: ['invest'], items: seedItems('inv', ['Rental yield guide', 'Top 5 micro-markets', 'Pre-launch deals', 'NRI investment desk']) },
  { id: 'CMP026', internalName: 'Training & academy', type: 'feed_carousel', surfaces: ['services'], platform: 'app', status: 'live', tags: ['training'], items: seedItems('acad', ['Sales masterclass', 'CRM walkthrough', 'Negotiation tips']) },
  { id: 'CMP027', internalName: 'Ready to move', type: 'feed_carousel', surfaces: ['home'], platform: 'both', status: 'live', tags: ['rtm'], items: seedItems('rtm', ['2 BHK ready homes', '3 BHK ready homes', 'Villas ready to move', 'Studio apartments', 'Plots with approval']) },
  { id: 'CMP028', internalName: 'Luxury picks', type: 'feed_vertical_carousel', surfaces: ['home'], platform: 'both', status: 'live', tags: ['luxury'], items: seedItems('lux', ['Sky Villas', 'Riverside Estate', 'The Crest', 'Marina Heights', 'Orchid Park', 'Aurum Towers'], 320, 400) },
  { id: 'CMP029', internalName: 'Budget homes', type: 'feed_vertical_carousel', surfaces: ['properties'], platform: 'both', status: 'live', tags: ['budget'], items: seedItems('bud', ['Under 40L', 'Under 60L', 'Under 80L', 'Starter 1 BHK'], 320, 400) },
  { id: 'CMP030', internalName: 'Legal help ads', type: 'feed_vertical_carousel', surfaces: ['services'], platform: 'both', status: 'live', tags: ['legal'], items: seedItems('leg', ['Sale deed drafting', 'Title verification', 'Rental agreements'], 320, 400) },
  { id: 'CMP031', internalName: 'Download the app', type: 'mobile_banner', surfaces: ['home'], platform: 'app', status: 'live', tags: ['app'], items: seedItems('dl', ['Get the ACN app'], 358, 136) },
  { id: 'CMP032', internalName: 'Home loan EMI', type: 'mobile_banner', surfaces: ['services'], platform: 'app', status: 'live', tags: ['loan'], items: seedItems('emi', ['Check your EMI'], 358, 136) },
  { id: 'CMP033', internalName: 'Site visit reminder', type: 'mobile_banner', surfaces: ['properties'], platform: 'app', status: 'live', tags: ['visits'], items: seedItems('svr', ['Your visit is tomorrow'], 358, 136) },
  { id: 'CMP034', internalName: 'Plan renewal', type: 'mobile_banner', surfaces: ['home'], platform: 'app', status: 'live', tags: ['plans'], items: seedItems('ren', ['Renew your plan'], 358, 136) },
  { id: 'CMP037', internalName: 'New project alert', type: 'mobile_top_banner', surfaces: ['home'], platform: 'app', status: 'live', tags: ['launch'], color: '#FED7AA', items: seedItems('npa', ['New project live in Whitefield'], 356, 132) },
  { id: 'CMP090', internalName: 'Desktop festive hero', type: 'desktop_top_banner', surfaces: ['home'], platform: 'web', status: 'inactive', tags: ['festive'], items: seedItems('dfh', ['Festive offers on all projects'], 1440, 378) },
  { id: 'CMP091', internalName: 'Desktop launch hero', type: 'desktop_top_banner', surfaces: ['home'], platform: 'web', status: 'inactive', tags: ['launch'], items: seedItems('dlh', ['New launch this week'], 1440, 378) },
  { id: 'CMP092', internalName: 'Desktop loan banner', type: 'desktop_banner', surfaces: ['home'], platform: 'web', status: 'inactive', tags: ['loan'], items: seedItems('dlb', ['Home loans from 8.5%'], 900, 220) },
  { id: 'CMP093', internalName: 'Desktop refer banner', type: 'desktop_banner', surfaces: ['home'], platform: 'web', status: 'inactive', tags: ['refer'], items: seedItems('drb', ['Refer & earn'], 900, 220) },
  { id: 'CMP038', internalName: 'Maintenance notice', type: 'mobile_top_banner', surfaces: ['home', 'services'], platform: 'app', status: 'live', tags: ['notice'], items: seedItems('mnt', ['Scheduled maintenance tonight'], 356, 132) },
  { id: 'CMP041', internalName: 'Summer sale carousel', type: 'feed_carousel', surfaces: ['home'], platform: 'both', status: 'archived', tags: ['summer'], items: seedItems('sum', ['Summer price drop', 'Cool deals on 2 BHK', 'Pool-facing homes']) },
  { id: 'CMP042', internalName: 'Holi offers', type: 'feed_carousel', surfaces: ['home', 'properties'], platform: 'both', status: 'archived', tags: ['festive'], items: seedItems('holi', ['Colours of savings', 'Holi booking bonus', 'Free interiors consult', 'Gifts on site visit']) },
  { id: 'CMP043', internalName: 'Old launch picks', type: 'feed_vertical_carousel', surfaces: ['properties'], platform: 'both', status: 'archived', tags: ['launch'], items: seedItems('olp', ['Sunrise Villas', 'Maple Residency', 'Blue Orchid'], 320, 400) },
  { id: 'CMP044', internalName: 'Tax saving homes', type: 'feed_vertical_carousel', surfaces: ['services'], platform: 'both', status: 'archived', tags: ['tax'], items: seedItems('tax', ['80C benefits', 'Home loan interest', 'Capital gains guide', 'Stamp duty tips'], 320, 400) },
  { id: 'CMP045', internalName: 'Republic day offer', type: 'mobile_banner', surfaces: ['home'], platform: 'app', status: 'archived', tags: ['festive'], items: seedItems('rep', ['Republic day offer'], 358, 136) },
  { id: 'CMP046', internalName: 'Beta app invite', type: 'mobile_banner', surfaces: ['services'], platform: 'app', status: 'archived', tags: ['app'], items: seedItems('beta', ['Join the beta'], 358, 136) },
  { id: 'CMP049', internalName: 'Top strip — monsoon', type: 'mobile_top_banner', surfaces: ['home'], platform: 'app', status: 'archived', tags: ['monsoon'], items: seedItems('tsm', ['Monsoon offers are live'], 356, 132) },
  { id: 'CMP050', internalName: 'Top strip — outage notice', type: 'mobile_top_banner', surfaces: ['home', 'services'], platform: 'app', status: 'archived', tags: ['notice'], items: seedItems('tso', ['Service restored'], 356, 132) },
  { id: 'CMP053', internalName: 'Big city property fair — registrations open for all agents and partners', type: 'feed_carousel', surfaces: ['home'], platform: 'both', status: 'live', tags: ['event'], items: seedItems('fair', ['Day 1 highlights', 'Day 2 highlights', 'Speaker lineup', 'Venue map', 'Register now', 'Early-bird passes', 'Partner stalls', 'Agenda']) },
  { id: 'CMP054', internalName: 'Teaser (needs more posts)', type: 'feed_carousel', surfaces: ['home'], platform: 'both', status: 'live', tags: [], items: seedItems('tz', ['Coming soon']) },
  { id: 'CMP055', internalName: 'Spotlight projects', type: 'feed_vertical_carousel', surfaces: ['home'], platform: 'both', status: 'live', tags: ['spot'], items: seedItems('spp', ['Phase 1', 'Phase 2'], 320, 400) },
  { id: 'CMP056', internalName: 'Q', type: 'mobile_banner', surfaces: ['home'], platform: 'app', status: 'live', tags: [], items: seedItems('q', ['Short name test'], 358, 136) },
  { id: 'CMP057', internalName: 'Featured Properties', type: 'inventory', surfaces: [], platform: 'both', status: 'live', tags: [], items: [], config: { heading: 'Featured Properties', assetType: 'Apartment', configs: ['3 BHK', '4 BHK'], zone: 'North', priceMin: '5000000', priceMax: '20000000', sbuaMin: '1000', plotAreaMin: '', plotAreaMax: '', sbuaMax: '3000', mustHaveMedia: true, propertyIds: [] } },
  { id: 'CMP058', internalName: 'Rentals near you', type: 'inventory', surfaces: [], platform: 'both', status: 'live', tags: [], items: [], config: { heading: 'Rentals near you', assetType: 'Apartment', configs: ['1 BHK', '2 BHK'], zone: 'South', priceMin: '', priceMax: '60000', sbuaMin: '', plotAreaMin: '', plotAreaMax: '', sbuaMax: '', mustHaveMedia: false, propertyIds: [] } },
  { id: 'CMP059', internalName: 'New launches', type: 'inventory', surfaces: [], platform: 'both', status: 'live', tags: [], items: [], config: { heading: 'New launches', assetType: 'Apartment', configs: [], zone: 'West', priceMin: '8000000', priceMax: '', sbuaMin: '', plotAreaMin: '', plotAreaMax: '', sbuaMax: '', mustHaveMedia: true, propertyIds: [] } },
  { id: 'CMP060', internalName: 'Commercial spaces', type: 'inventory', surfaces: [], platform: 'both', status: 'live', tags: [], items: [], config: { heading: 'Commercial spaces', assetType: 'Commercial Space', configs: [], zone: 'Central', priceMin: '', priceMax: '', sbuaMin: '500', plotAreaMin: '', plotAreaMax: '', sbuaMax: '5000', mustHaveMedia: false, propertyIds: [] } },
  { id: 'CMP061', internalName: 'Hand-picked by team', type: 'inventory', surfaces: [], platform: 'both', status: 'live', tags: [], items: [], config: { heading: 'Hand-picked by team', assetType: '', configs: [], zone: '', priceMin: '', priceMax: '', sbuaMin: '', plotAreaMin: '', plotAreaMax: '', sbuaMax: '', mustHaveMedia: false, propertyIds: ['PB3864', 'PB4102', 'PB2719', 'PB5530'] } },
  { id: 'CMP062', internalName: 'Plots under 50L', type: 'inventory', surfaces: [], platform: 'both', status: 'archived', tags: [], items: [], config: { heading: 'Plots under 50L', assetType: 'Plot', configs: [], zone: 'East', priceMin: '', priceMax: '5000000', sbuaMin: '', plotAreaMin: '', plotAreaMax: '', sbuaMax: '', mustHaveMedia: false, propertyIds: [] } },
  { id: 'CMP063', internalName: 'Luxury villas', type: 'inventory', surfaces: [], platform: 'both', status: 'archived', tags: [], items: [], config: { heading: 'Luxury villas', assetType: 'Villa', configs: ['4 BHK', '5+ BHK'], zone: 'North', priceMin: '30000000', priceMax: '', sbuaMin: '3500', plotAreaMin: '', plotAreaMax: '', sbuaMax: '', mustHaveMedia: true, propertyIds: [] } },
].forEach((c) => mockComponents.push({ ...c, history: [{ action: 'Component created', user: 'Samarth', time: now() - 7 * 86400000 }] }));

// Seed deterministic view/click analytics for every component — overall counts plus the subset
// of unique CPIDs that saw/clicked, so "Unique" vs "Overall" and the copy-CPIDs actions have real
// (if fake) data behind them instead of just a headline number.
mockComponents.forEach((c) => {
  const seed = hashSeed(c.id);
  // Spread of realistic cases: brand-new (no data yet), low, typical and very high traffic.
  const bucket = seed % 6;
  const viewsOverall = bucket === 0 ? 0 : bucket === 1 ? 40 + (seed % 120) : bucket === 5 ? 18000 + (seed % 42000) : 800 + (seed % 4200);
  const viewsUnique = Math.round(viewsOverall * (0.55 + (seed % 20) / 100));
  const clickRate = 0.02 + ((seed % 11) / 100);
  const clicksOverall = viewsOverall === 0 ? 0 : Math.max(1, Math.round(viewsOverall * clickRate));
  const clicksUnique = clicksOverall === 0 ? 0 : Math.max(1, Math.round(clicksOverall * (0.8 + (seed % 15) / 100)));
  const viewerCpids = Array.from({ length: Math.min(viewsUnique, MOCK_DIRECTORY.length) }, (_, j) => MOCK_DIRECTORY[(seed + j) % MOCK_DIRECTORY.length].cpid);
  const clickerCpids = viewerCpids.slice(0, Math.min(clicksUnique, viewerCpids.length));
  c.analytics = { viewsUnique, viewsOverall, clicksUnique, clicksOverall, viewerCpids: [...new Set(viewerCpids)], clickerCpids: [...new Set(clickerCpids)] };
  c.items.forEach((it, idx) => {
    it.name = it.name || it.description || `Post ${idx + 1}`;
    const itemSeed = hashSeed(it.id);
    if (COMPONENT_TYPES[c.type]?.carousel && c.items.length > 2 && it.hidden === undefined) it.hidden = itemSeed % 5 === 0;
    const views = viewsOverall === 0 ? 0 : Math.max(5, Math.round((viewsOverall / c.items.length) * (0.4 + (itemSeed % 17) / 10)));
    const clicks = views === 0 ? 0 : Math.max(1, Math.round(views * (0.01 + (itemSeed % 13) / 100)));
    const cpidAt = (j) => MOCK_DIRECTORY[(itemSeed + j) % MOCK_DIRECTORY.length].cpid;
    const viewerCpids = [...new Set(Array.from({ length: Math.min(views, 25) }, (_, j) => cpidAt(j)))];
    it.analytics = { views, clicks, viewerCpids, clickerCpids: viewerCpids.slice(0, Math.min(clicks, viewerCpids.length)) };
  });
});

// Click insights for a date range. The mock analytics are treated as spread evenly over the last
// INSIGHT_WINDOW_DAYS days, so a narrower range returns proportionally fewer clicks. Inventory
// components are excluded on purpose — only posters/banners/carousels are counted.
export const INSIGHT_WINDOW_DAYS = 60;

function overlapDays(start, end) {
  const day = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowStart = today.getTime() - (INSIGHT_WINDOW_DAYS - 1) * day;
  const from = Math.max(new Date(`${start}T00:00:00`).getTime(), windowStart);
  const to = Math.min(new Date(`${end}T00:00:00`).getTime(), today.getTime());
  return to < from ? 0 : Math.round((to - from) / day) + 1;
}

export function getClickInsights(start, end) {
  const days = start && end ? overlapDays(start, end) : 0;
  const share = days / INSIGHT_WINDOW_DAYS;
  const scale = (n) => Math.round(n * share);
  const take = (list) => list.slice(0, Math.ceil(list.length * share));
  const rows = [];
  const allCpids = new Set();
  const allViewers = new Set();
  mockComponents
    .filter((c) => !COMPONENT_TYPES[c.type]?.inventory)
    .forEach((c) => {
      const posts = c.items.map((it) => {
        const cpids = take(it.analytics?.clickerCpids || []);
        const viewers = take(it.analytics?.viewerCpids || []);
        return { id: it.id, name: it.name, views: scale(it.analytics?.views || 0), clicks: scale(it.analytics?.clicks || 0), cpids, viewers };
      });
      const type = COMPONENT_TYPES[c.type].label;
      const entries = COMPONENT_TYPES[c.type].carousel
        ? posts.map((p) => ({ id: p.id, name: p.name, views: p.views, clicks: p.clicks, cpids: p.cpids, viewers: p.viewers }))
        : [
            {
              id: c.id,
              name: c.internalName,
              views: posts.reduce((sum, p) => sum + p.views, 0),
              clicks: posts.reduce((sum, p) => sum + p.clicks, 0),
              cpids: [...new Set(posts.flatMap((p) => p.cpids))],
              viewers: [...new Set(posts.flatMap((p) => p.viewers))],
            },
          ];
      entries.forEach((e) => {
        e.cpids.forEach((id) => allCpids.add(id));
        e.viewers.forEach((id) => allViewers.add(id));
        if (e.views > 0 || e.clicks > 0) rows.push({ ...e, type, status: c.status });
      });
    });
  rows.sort((a, b) => b.clicks - a.clicks);
  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  const totalClicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  return { days, totalViews, totalClicks, cpids: [...allCpids], viewers: [...allViewers], rows };
}

// ─── Carousel cards ───────────────────────────────────────────────────────
// A card is one reusable post. Carousels are built by picking cards; editing a card updates every
// carousel that uses it (items carry `cardId`).
const CARD_FIELDS = ['name', 'imageUrl', 'linkUrl', 'appendCpid', 'description', 'startDate', 'endDate'];
export const mockCards = [];
mockComponents.forEach((c) => {
  if (!COMPONENT_TYPES[c.type]?.carousel) return;
  c.items.forEach((it) => {
    const id = `CARD${String(mockCards.length + 1).padStart(3, '0')}`;
    mockCards.push({ id, type: c.type, name: it.name || it.description || 'Untitled card', imageUrl: it.imageUrl, linkUrl: it.linkUrl || '', appendCpid: !!it.appendCpid, description: it.description || '', startDate: it.startDate || '', endDate: it.endDate || '' });
    it.cardId = id;
    it.name = it.name || it.description || 'Untitled card';
  });
});

// Each card gets its own (hidden) single-card component so it can be dropped on a template page.
function makeCardComponent(card) {
  const comp = {
    id: nextId(mockComponents, 'id', 'CMP'),
    internalName: card.name,
    type: card.type,
    surfaces: [],
    platform: 'both',
    status: 'inactive',
    tags: [],
    cardComponent: true,
    items: [],
    history: [],
    analytics: { viewsUnique: 0, viewsOverall: 0, clicksUnique: 0, clicksOverall: 0, viewerCpids: [], clickerCpids: [] },
  };
  comp.items = [itemFromCard(card)];
  mockComponents.push(comp);
  card.componentId = comp.id;
  return comp;
}
mockCards.forEach((card) => makeCardComponent(card));

// A page row made of several chosen cards, in order (a carousel the user never has to manage separately).
export function createCardRow(cardIds) {
  const cards = cardIds.map(getCard).filter(Boolean);
  const comp = {
    id: nextId(mockComponents, 'id', 'CMP'),
    internalName: cards[0]?.name || 'Cards',
    type: cards[0].type,
    surfaces: [],
    platform: 'both',
    status: 'inactive',
    tags: [],
    cardComponent: true,
    items: cards.map(itemFromCard),
    history: [],
    analytics: { viewsUnique: 0, viewsOverall: 0, clicksUnique: 0, clicksOverall: 0, viewerCpids: [], clickerCpids: [] },
  };
  mockComponents.push(comp);
  return comp;
}

export function getCards(type) {
  return mockCards.filter((c) => !type || c.type === type);
}
export function getCard(id) {
  return mockCards.find((c) => c.id === id) || null;
}
export function cardStats(cardId) {
  for (const c of mockComponents) {
    const it = c.items.find((i) => i.cardId === cardId && i.analytics);
    if (it) return { views: it.analytics.views || 0, clicks: it.analytics.clicks || 0, viewerCpids: it.analytics.viewerCpids || [], clickerCpids: it.analytics.clickerCpids || [] };
  }
  return { views: 0, clicks: 0, viewerCpids: [], clickerCpids: [] };
}
export function cardUsage(cardId) {
  return mockComponents.filter((c) => c.status !== 'archived' && c.items.some((it) => it.cardId === cardId)).length;
}
export function createCard(type, data) {
  const card = { id: `CARD${String(Date.now()).slice(-6)}`, type, name: '', imageUrl: null, linkUrl: '', appendCpid: false, description: '', startDate: '', endDate: '', ...data };
  mockCards.push(card);
  makeCardComponent(card);
  return card;
}
export function updateCard(id, patch) {
  const card = getCard(id);
  if (!card) return null;
  Object.assign(card, patch);
  const fields = Object.fromEntries(CARD_FIELDS.map((f) => [f, card[f]]));
  mockComponents.forEach((c) => {
    if (!c.items.some((it) => it.cardId === id)) return;
    c.items = c.items.map((it) => (it.cardId === id ? { ...it, ...fields } : it));
    if (COMPONENT_TYPES[c.type]?.carousel) c.internalName = c.items[0]?.name || c.internalName;
  });
  return card;
}
// A carousel post made from a card (keeps the card's current content).
export function itemFromCard(card) {
  return { id: `itm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, cardId: card.id, ...Object.fromEntries(CARD_FIELDS.map((f) => [f, card[f]])) };
}

export function getComponents() {
  return mockComponents;
}

export function getComponent(id) {
  return mockComponents.find((c) => c.id === id) || null;
}

export function createComponent(data) {
  const component = {
    id: nextId(mockComponents, 'id', 'CMP'),
    internalName: data.internalName || 'Untitled component',
    type: data.type,
    surfaces: data.surfaces || [],
    platform: COMPONENT_TYPES[data.type]?.platform !== 'both' ? COMPONENT_TYPES[data.type]?.platform : data.platform || 'both',
    status: 'inactive',
    tags: [],
    items: [],
    history: [],
    analytics: { viewsUnique: 0, viewsOverall: 0, clicksUnique: 0, clicksOverall: 0, viewerCpids: [], clickerCpids: [] },
  };
  pushHistory(component, 'Component created');
  mockComponents.push(component);
  return component;
}

export function updateComponent(id, patch) {
  const component = getComponent(id);
  if (!component) return null;
  Object.assign(component, patch);
  return component;
}

export function setComponentStatus(id, status) {
  const component = getComponent(id);
  if (!component) return null;
  component.status = status;
  pushHistory(component, status === 'archived' ? 'Archived' : 'Resumed');
  return component;
}

export function addComponentItem(id, item) {
  const component = getComponent(id);
  if (!component) return null;
  const newItem = { id: `itm_${Date.now()}`, imageUrl: null, linkUrl: '', appendCpid: false, description: '', startDate: '', endDate: '', ...item };
  component.items = [...component.items, newItem];
  pushHistory(component, 'Added 1 item');
  return newItem;
}

export function updateComponentItem(id, itemId, patch) {
  const component = getComponent(id);
  if (!component) return null;
  component.items = component.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it));
  return component;
}

export function removeComponentItem(id, itemId) {
  const component = getComponent(id);
  if (!component) return null;
  component.items = component.items.filter((it) => it.id !== itemId);
  pushHistory(component, 'Removed 1 item');
  return component;
}

export function reorderComponentItems(id, orderedIds) {
  const component = getComponent(id);
  if (!component) return null;
  component.items = orderedIds.map((itemId) => component.items.find((it) => it.id === itemId)).filter(Boolean);
  return component;
}

// ─── Pages & templates ────────────────────────────────────────────────────
// App only. Each page (Home, Properties, Services) is an ordered list of widgets from one
// template, exactly like the app's `/app/page-layout`. Rows = widgets, columns = templates.
// A row is one of: the page's single top banner, a system widget,
// or a CMS component. Nothing is "fixed": every widget is just template content.

// The system widgets the app registers. They are switched on or off per template, not edited.
// Carousels have no name of their own (each post does): show the first post's name + post count.
export function componentTitle(c) {
  if (!c) return '';
  if (COMPONENT_TYPES[c.type]?.carousel) {
    const first = c.items[0]?.name || c.items[0]?.description || c.internalName || 'Carousel';
    return `${first} · ${c.items.length} posts`;
  }
  return c.internalName;
}

export const SYSTEM_WIDGETS = {
  DELIST_INVENTORIES: { label: 'Delist Inventories', description: 'Quickly delist inventories' },
  PROPERTY_EDGE_CARDS: { label: 'Property & Edge Cards', description: 'Stat cards for Property and Edge' },
  ENQUIRY_RECEIVED: { label: 'Enquiry Received', description: 'Summary of incoming enquiries' },
  ENQUIRY_FEEDBACK: { label: 'Enquiry Feedback', description: 'Review the enquiries you made' },
  RESALE_INVENTORY: { label: 'Resale Inventory', description: 'New resale properties' },
  RENTAL_INVENTORY: { label: 'Rental Inventory', description: 'New rental properties' },
  EDGE_WIDGET: { label: 'Edge Widget', description: 'Latest Edge posts' },
  SEARCH: { label: 'Search', description: 'Property search bar' },
  // Edge page sections
  EDGE_HERO: { label: 'Hero Section', description: 'Edge hero banner' },
  EDGE_VISUAL_STORIES: { label: 'Visual Stories', description: 'Story reels' },
  EDGE_PROJECT_UPDATES: { label: 'Latest Project Updates', description: 'Newest project updates' },
  EDGE_LAST_48: { label: 'Last 48 Hours', description: 'Posts from the last 48 hours' },
  EDGE_LOCATION_SORT: { label: 'Location wise sort', description: 'Posts grouped by location' },
  // Fixed sections: always on the page (not in the library, can't be removed), content comes later.
  ...Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [
      `PROPERTY_SECTION_${i + 1}`,
      { label: `Property section ${i + 1}`, description: 'Fixed section', fixed: true },
    ])
  ),
};

export const PAGES = [
  { key: 'home', label: 'Home', platform: 'app', topType: 'mobile_top_banner' },
  { key: 'home_desktop', label: 'Home', platform: 'web', topType: 'desktop_top_banner' },
  // Properties only has the Resale and Rental widgets; everything else on it is CMS components.
  { key: 'properties', label: 'Properties', platform: 'app', topType: 'mobile_top_banner', widgets: ['RESALE_INVENTORY', 'RENTAL_INVENTORY'] },
  { key: 'services', label: 'Services', platform: 'app', topType: 'mobile_top_banner', widgets: [] },
  // Edge has its own feed widget; everything else is CMS components.
  { key: 'edge', label: 'Edge', platform: 'app', topType: 'mobile_top_banner', widgets: ['EDGE_HERO', 'EDGE_VISUAL_STORIES', 'EDGE_PROJECT_UPDATES', 'EDGE_LAST_48', 'EDGE_LOCATION_SORT'] },
  { key: 'edge_desktop', label: 'Edge', platform: 'web', topType: 'desktop_top_banner', widgets: ['EDGE_HERO', 'EDGE_VISUAL_STORIES', 'EDGE_PROJECT_UPDATES', 'EDGE_LAST_48', 'EDGE_LOCATION_SORT'] },
];

export function getPage(key) {
  return PAGES.find((p) => p.key === key) || null;
}

const topRow = (componentId) => ({ id: 'top', kind: 'top', componentId });
const sysRow = (widget, heading = '') => ({ id: `s_${widget}`, kind: 'system', widget, heading });
const cmsRow = (componentId) => ({ id: `r_${componentId}`, kind: 'cms', componentId });

function buildMatrix(templates, rows, cellMap = {}) {
  const cells = {};
  templates.forEach((t) => {
    cells[t.id] = {};
    rows.forEach((r) => {
      cells[t.id][r.id] = cellMap[`${t.id}:${r.id}`] || { state: t.isBase ? 'base' : 'inherit' };
    });
  });
  return { templates, rows, cells };
}

const base = () => ({ id: 'TPLB', name: 'Base', cohorts: [], status: 'live', isBase: true });

export const mockPages = {
  home: buildMatrix(
    [
      base(),
      { id: 'TPL001', name: 'Template B', cohorts: ['COH001', 'COH002'], status: 'live', isBase: false },
      { id: 'TPL002', name: 'Template D', cohorts: [], status: 'disabled', isBase: false },
      { id: 'TPL003', name: 'Template C', cohorts: ['COH006', 'COH009'], status: 'live', isBase: false },
      { id: 'TPL004', name: 'Template E', cohorts: ['COH007'], status: 'disabled', isBase: false },
    ],
    [
      topRow('CMP003'),
      sysRow('DELIST_INVENTORIES'),
      sysRow('PROPERTY_EDGE_CARDS'),
      sysRow('ENQUIRY_RECEIVED'),
      cmsRow('CMP001'),
      sysRow('ENQUIRY_FEEDBACK'),
      cmsRow('CMP016'),
      sysRow('RESALE_INVENTORY', 'New resale properties'),
      cmsRow('CMP057'),
      sysRow('RENTAL_INVENTORY'),
      cmsRow('CMP014'),
      sysRow('EDGE_WIDGET'),
      ...Array.from({ length: 10 }, (_, i) => sysRow(`PROPERTY_SECTION_${i + 1}`)),
    ],
    {
      'TPL001:top': { state: 'override', override: { componentId: 'CMP008' } },
      'TPL001:r_CMP001': { state: 'override', override: { maxCount: 2 } },
      'TPL001:r_CMP057': { state: 'hide' },
      'TPL001:s_DELIST_INVENTORIES': { state: 'hide' },
      'TPL001:s_RESALE_INVENTORY': { state: 'override', override: { heading: 'Premium resale picks' } },
    }
  ),
  properties: buildMatrix(
    [base(), { id: 'TPL201', name: 'Template P', cohorts: ['COH008'], status: 'live', isBase: false }, { id: 'TPL202', name: 'Template Q', cohorts: ['COH010'], status: 'disabled', isBase: false }],
    [topRow('CMP020'), sysRow('RESALE_INVENTORY'), cmsRow('CMP010'), sysRow('RENTAL_INVENTORY'), cmsRow('CMP006')],
    { 'TPL201:r_CMP010': { state: 'hide' } }
  ),
  home_desktop: buildMatrix(
    [base(), { id: 'TPLD1', name: 'Desktop B', cohorts: [], status: 'disabled', isBase: false }],
    [
      topRow('CMP090'),
      sysRow('SEARCH'),
      sysRow('RESALE_INVENTORY', 'North Bangalore Properties'),
      cmsRow('CMP092'),
      sysRow('RENTAL_INVENTORY'),
      cmsRow('CMP012'),
      cmsRow('CMP093'),
      ...Array.from({ length: 10 }, (_, i) => sysRow(`PROPERTY_SECTION_${i + 1}`)),
    ],
    { 'TPLD1:top': { state: 'override', override: { componentId: 'CMP091' } }, 'TPLD1:r_CMP093': { state: 'hide' } }
  ),
  services: buildMatrix(
    [base(), { id: 'S2', name: 'S2', cohorts: ['COH002'], status: 'live', isBase: false }],
    [topRow('CMP037'), cmsRow('CMP015'), cmsRow('CMP032')],
    { 'S2:top': { state: 'override', override: { componentId: 'CMP038' } } }
  ),
};

mockPages.edge = buildMatrix(
  [base(), { id: 'TPLE1', name: 'Edge B', cohorts: ['COH007'], status: 'live', isBase: false }],
  [topRow('CMP037'), sysRow('EDGE_HERO'), sysRow('EDGE_VISUAL_STORIES'), sysRow('EDGE_PROJECT_UPDATES'), sysRow('EDGE_LAST_48'), sysRow('EDGE_LOCATION_SORT'), cmsRow('CMP031'), cmsRow('CMP034')],
  { 'TPLE1:r_CMP034': { state: 'hide' } }
);
mockPages.edge_desktop = buildMatrix(
  [base(), { id: 'TPLE2', name: 'Edge Desktop B', cohorts: [], status: 'disabled', isBase: false }],
  [topRow('CMP090'), sysRow('EDGE_HERO'), sysRow('EDGE_VISUAL_STORIES'), sysRow('EDGE_PROJECT_UPDATES'), sysRow('EDGE_LAST_48'), sysRow('EDGE_LOCATION_SORT'), cmsRow('CMP092')],
  { 'TPLE2:top': { state: 'override', override: { componentId: 'CMP091' } } }
);

// Carousel rows are built from cards, like the ones added in the editor: turn every carousel that
// was seeded as a standalone component into a row made of its cards (same order, same cards).
Object.values(mockPages).forEach((matrix) => {
  matrix.rows.forEach((row) => {
    const old = row.kind === 'cms' ? mockComponents.find((c) => c.id === row.componentId) : null;
    if (!old || old.cardComponent || !COMPONENT_TYPES[old.type]?.carousel) return;
    const cardIds = old.items.map((it) => it.cardId).filter(Boolean);
    if (!cardIds.length) return;
    const made = createCardRow(cardIds);
    made.status = old.status;
    row.componentId = made.id;
  });
});

export function getPageMatrix(pageKey) {
  return mockPages[pageKey];
}

// Which components can sit on a page: any non-archived CMS component (the app is the only target).
// With a page key it also checks the device: app pages take app/both types, web pages web/both.
export function componentFitsPage(component, pageKey) {
  const meta = COMPONENT_TYPES[component.type];
  if (!meta || component.status === 'archived') return false;
  const platform = PAGES.find((p) => p.key === pageKey)?.platform;
  return platform ? meta.platform === 'both' || meta.platform === platform : meta.platform !== 'web';
}

// What one template actually shows for one row, after inherit / hide / override.
export function resolveCell(pageKey, templateId, row) {
  const cell = getPageMatrix(pageKey).cells[templateId]?.[row.id] || { state: 'inherit' };
  const heading = row.heading || '';
  if (cell.state === 'hide') return { state: 'hide', hidden: true, componentId: row.componentId, heading };
  if (cell.state === 'override') {
    return { state: 'override', hidden: false, componentId: cell.override?.componentId || row.componentId, maxCount: cell.override?.maxCount, heading: cell.override?.heading ?? heading };
  }
  return { state: cell.state, hidden: false, componentId: row.componentId, heading };
}

export function resolvePage(pageKey, templateId) {
  return getPageMatrix(pageKey)
    .rows.filter((row) => !row.onlyFor || row.onlyFor === templateId)
    .map((row) => ({ row, ...resolveCell(pageKey, templateId, row) }));
}

// Where a component is placed across every page — as a Base row, or as an override in a template.
export function whereComponentUsed(componentId) {
  const results = [];
  PAGES.forEach((page) => {
    const matrix = getPageMatrix(page.key);
    matrix.rows.forEach((row) => {
      matrix.templates.forEach((t) => {
        const cell = matrix.cells[t.id]?.[row.id];
        const shown = cell && cell.state !== 'hide' && (cell.state === 'override' ? (cell.override?.componentId || row.componentId) : row.componentId) === componentId;
        if (shown) results.push({ page: page.key, templateId: t.id, templateName: t.name, state: cell.state });
      });
    });
  });
  return results;
}

// "3/5": in how many templates (across all pages, archived ones excluded) a component shows.
export function templateUsage(componentId) {
  const total = PAGES.reduce((n, p) => n + getPageMatrix(p.key).templates.filter((t) => t.status !== 'archived').length, 0);
  const used = new Set(whereComponentUsed(componentId).map((u) => `${u.page}:${u.templateId}`)).size;
  return { used, total };
}

// Component status follows the templates: placed in any template → live, otherwise inactive.
// Archived components stay archived.
export function syncComponentStatuses() {
  mockComponents.forEach((c) => {
    if (c.status === 'archived') return;
    c.status = whereComponentUsed(c.id).length > 0 ? 'live' : 'inactive';
  });
}

// A cohort's per-page template mapping is derived from the live templates that include it.
export function syncCohortMappings() {
  mockCohorts.forEach((c) => {
    c.templateMappings = {};
  });
  PAGES.forEach((page) => {
    getPageMatrix(page.key).templates.forEach((t) => {
      if (t.status !== 'live' || t.isBase) return;
      t.cohorts.forEach((id) => {
        const cohort = getCohort(id);
        // A cohort can be in several templates: the one higher in the list (priority) wins.
        if (cohort && !cohort.templateMappings[page.key]) cohort.templateMappings[page.key] = t.name;
      });
    });
  });
}

function syncAll() {
  syncComponentStatuses();
  syncCohortMappings();
}

export function createTemplate(pageKey, data) {
  const matrix = getPageMatrix(pageKey);
  const template = {
    id: `TPL_${Date.now()}`,
    name: data.name.trim(),
    description: data.description?.trim() || '',
    cohorts: data.cohorts || [],
    status: data.status || 'live',
    isBase: false,
  };
  matrix.templates.push(template);
  matrix.cells[template.id] = Object.fromEntries(matrix.rows.map((r) => [r.id, { state: 'inherit' }]));
  syncAll();
  return template;
}

// Priority: move a non-base template up (-1) or down (+1) among the other non-base templates.
export function moveTemplate(pageKey, id, dir) {
  const list = getPageMatrix(pageKey).templates;
  const idx = list.findIndex((t) => t.id === id);
  let j = idx + dir;
  while (list[j] && list[j].isBase) j += dir;
  if (idx < 0 || !list[j]) return;
  [list[idx], list[j]] = [list[j], list[idx]];
  syncAll();
}

// Drag-reorder priority: `orderedIds` is the new order of (some of) the non-base templates.
export function reorderTemplates(pageKey, orderedIds) {
  const matrix = getPageMatrix(pageKey);
  const base = matrix.templates.filter((t) => t.isBase);
  const byId = Object.fromEntries(matrix.templates.map((t) => [t.id, t]));
  const first = orderedIds.map((id) => byId[id]).filter((t) => t && !t.isBase);
  const rest = matrix.templates.filter((t) => !t.isBase && !orderedIds.includes(t.id));
  matrix.templates = [...base, ...first, ...rest];
  syncAll();
}

export function updateTemplate(pageKey, id, patch) {
  const template = getPageMatrix(pageKey).templates.find((t) => t.id === id);
  if (!template) return null;
  Object.assign(template, patch);
  syncAll();
  return template;
}

export function setCellState(pageKey, templateId, rowId, state, override) {
  const matrix = getPageMatrix(pageKey);
  matrix.cells[templateId] = matrix.cells[templateId] || {};
  matrix.cells[templateId][rowId] = state === 'override' ? { state, override: override || {} } : { state };
  syncAll();
  return matrix.cells[templateId][rowId];
}

// Insert a CMS component as a new row after `afterRowId`. `templateIds` = which templates show it
// (null = all); the rest get the cell auto-hidden.
export function addMatrixRow(pageKey, item, afterRowId, templateIds = null) {
  const matrix = getPageMatrix(pageKey);
  const row = item.widget
    ? { id: `s_${item.widget}_${Date.now()}`, kind: 'system', widget: item.widget, heading: item.heading || '' }
    : { id: `r_${item.componentId}_${Date.now()}`, kind: 'cms', componentId: item.componentId };
  // item.only = a section that exists for just one template (hidden for Base and the others).
  if (item.only) row.onlyFor = item.only;
  const at = matrix.rows.findIndex((r) => r.id === afterRowId);
  matrix.rows.splice(at < 0 ? matrix.rows.length : at + 1, 0, row);
  matrix.templates.forEach((t) => {
    if (item.only) {
      matrix.cells[t.id][row.id] = { state: t.id === item.only ? 'inherit' : 'hide' };
      return;
    }
    const shown = t.isBase || !templateIds || templateIds.includes(t.id);
    matrix.cells[t.id][row.id] = { state: t.isBase ? 'base' : shown ? 'inherit' : 'hide' };
  });
  syncAll();
  return row;
}

export function removeMatrixRow(pageKey, rowId) {
  const matrix = getPageMatrix(pageKey);
  const row = matrix.rows.find((r) => r.id === rowId);
  if (!row || SYSTEM_WIDGETS[row.widget]?.fixed) return;
  matrix.rows = matrix.rows.filter((r) => r.id !== rowId);
  matrix.templates.forEach((t) => delete matrix.cells[t.id][rowId]);
  mockPages[pageKey] = matrix;
  syncAll();
}

// Reorder a CMS row (Base order = page order). The top banner stays pinned at the top.
export function moveMatrixRow(pageKey, rowId, delta) {
  const matrix = getPageMatrix(pageKey);
  const from = matrix.rows.findIndex((r) => r.id === rowId);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= matrix.rows.length) return;
  [matrix.rows[from], matrix.rows[to]] = [matrix.rows[to], matrix.rows[from]];
}

// Drag-reorder: put a row right after another row (the top banner stays first).
export function moveMatrixRowTo(pageKey, rowId, afterRowId) {
  const matrix = getPageMatrix(pageKey);
  const row = matrix.rows.find((r) => r.id === rowId);
  if (!row || rowId === afterRowId) return;
  matrix.rows = matrix.rows.filter((r) => r.id !== rowId);
  const idx = matrix.rows.findIndex((r) => r.id === afterRowId);
  matrix.rows.splice(idx + 1, 0, row);
  mockPages[pageKey] = matrix;
}

// "2/5": in how many of this page's templates (Base not counted) a section is shown.
export function rowTemplateUsage(pageKey, rowId) {
  const matrix = getPageMatrix(pageKey);
  const list = matrix.templates.filter((t) => t.status !== 'archived' && !t.isBase);
  const shown = list.filter((t) => matrix.cells[t.id]?.[rowId]?.state !== 'hide').length;
  return { shown, total: list.length };
}

// Swap the component in a row for another one; position and the other templates' hide/override stay.
export function replaceRowComponent(pageKey, rowId, componentId) {
  const row = getPageMatrix(pageKey).rows.find((r) => r.id === rowId);
  if (!row || row.kind === 'system') return;
  row.componentId = componentId;
  syncAll();
}

export function setRowHeading(pageKey, rowId, heading) {
  const row = getPageMatrix(pageKey).rows.find((r) => r.id === rowId);
  if (row) row.heading = heading;
}

// Top banner for one template: override Base's top banner, or — when Base has none — add a top row that exists only for this template.
export function setTemplateTopBanner(pageKey, templateId, componentId) {
  const matrix = getPageMatrix(pageKey);
  const mine = matrix.rows.find((r) => r.kind === 'top' && r.onlyFor === templateId);
  const baseTop = matrix.rows.find((r) => r.kind === 'top' && !r.onlyFor);
  if (baseTop) {
    if (mine) {
      matrix.rows = matrix.rows.filter((r) => r.id !== mine.id);
      matrix.templates.forEach((t) => delete matrix.cells[t.id][mine.id]);
    }
    setCellState(pageKey, templateId, baseTop.id, 'override', { componentId });
    return;
  }
  if (mine) {
    mine.componentId = componentId;
  } else {
    const row = { id: `top_${templateId}`, kind: 'top', componentId, onlyFor: templateId };
    matrix.rows.unshift(row);
    matrix.templates.forEach((t) => {
      matrix.cells[t.id][row.id] = { state: t.id === templateId ? 'inherit' : 'hide' };
    });
  }
  syncAll();
}

export function setTopBanner(pageKey, componentId) {
  const matrix = getPageMatrix(pageKey);
  const top = matrix.rows.find((r) => r.kind === 'top' && !r.onlyFor);
  if (!componentId) {
    if (top) removeMatrixRow(pageKey, top.id);
    return;
  }
  if (top) {
    top.componentId = componentId;
  } else {
    matrix.rows.unshift(topRow(componentId));
    matrix.templates.forEach((t) => {
      matrix.cells[t.id].top = { state: t.isBase ? 'base' : 'inherit' };
    });
  }
  syncAll();
}

syncAll();

// ─── Popups ───────────────────────────────────────────────────────────────

export const mockPopups = [
  {
    id: 'POP001',
    internalName: 'Diwali festive offer',
    creative: { app: null, web: null },
    linkUrl: 'https://acn.app/offers/diwali',
    appendCpid: true,
    audience: 'all',
    startDate: '2026-11-10',
    endDate: '2026-11-30',
    frequency: 'once',
    priority: 2,
    status: 'live',
    history: [{ action: 'Popup created', user: 'Samarth', time: now() - 5 * 86400000 }],
  },
  {
    id: 'POP002',
    internalName: 'Loan festive offer',
    creative: { app: null, web: null },
    linkUrl: 'https://acn.app/home-loan',
    appendCpid: true,
    audience: ['COH001'],
    startDate: '2026-11-05',
    endDate: '2026-11-25',
    frequency: 'daily',
    priority: 2,
    status: 'live',
    history: [{ action: 'Popup created', user: 'Sandeep', time: now() - 10 * 86400000 }],
  },
  {
    id: 'POP003',
    internalName: 'App rating prompt',
    creative: { app: null, web: null },
    linkUrl: '',
    appendCpid: false,
    audience: 'all',
    startDate: '2026-11-20',
    endDate: '',
    frequency: 'every session',
    priority: 1,
    status: 'scheduled',
    history: [{ action: 'Popup created', user: 'Qalandar', time: now() - 2 * 86400000 }],
  },
  {
    id: 'POP004',
    internalName: 'Monsoon campaign (ended)',
    creative: { app: null, web: null },
    linkUrl: 'https://acn.app/offers/monsoon',
    appendCpid: false,
    audience: 'all',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    frequency: 'once',
    priority: 1,
    status: 'archived',
    history: [{ action: 'Popup created', user: 'Samarth', time: now() - 150 * 86400000 }],
  },
];

export function getPopups() {
  return mockPopups;
}

export function getPopup(id) {
  return mockPopups.find((p) => p.id === id) || null;
}

export function createPopup(data) {
  const popup = {
    id: nextId(mockPopups, 'id', 'POP'),
    internalName: data.internalName || 'Untitled popup',
    creative: data.creative || { app: null, web: null },
    linkUrl: data.linkUrl || '',
    appendCpid: !!data.appendCpid,
    audience: data.audience || 'all',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    frequency: data.frequency || 'once',
    priority: data.priority ?? 1,
    status: 'live',
    history: [],
  };
  pushHistory(popup, 'Popup created');
  mockPopups.push(popup);
  return popup;
}

export function updatePopup(id, patch) {
  const popup = getPopup(id);
  if (!popup) return null;
  Object.assign(popup, patch);
  pushHistory(popup, 'Updated');
  return popup;
}

export function setPopupStatus(id, status) {
  const popup = getPopup(id);
  if (!popup) return null;
  popup.status = status;
  pushHistory(popup, status === 'paused' ? 'Paused' : status === 'archived' ? 'Archived' : 'Resumed');
  return popup;
}

export function findPopupClash(popupId, audience, startDate, endDate) {
  if (audience === 'all' || !Array.isArray(audience)) return null;
  return mockPopups.find((p) => {
    if (p.id === popupId || p.status !== 'live' || !Array.isArray(p.audience)) return false;
    const sharesCohort = p.audience.some((c) => audience.includes(c));
    if (!sharesCohort) return false;
    const overlaps = (!endDate || !p.startDate || p.startDate <= endDate) && (!startDate || !p.endDate || p.endDate >= startDate);
    return overlaps;
  }) || null;
}

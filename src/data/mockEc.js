// Fake in-memory "backend" for the EC (Environmental Clearance) pipeline feature.
// See docs/ec-pipeline-prd.md for the full schema + pipeline write-up this mirrors.
// Every automated stage here is deliberately manual-triggered (a button in the UI calls the
// matching classify*/run* helper below) so the funnel is explorable without a live scraper.

import { getBuilders, createProject } from './mockEdge';

export const EC_SOURCES = ['EC', 'ToR'];

export const DEVELOPER_STATUS_OPTIONS = [
  { value: 'found', label: 'Found' },
  { value: 'not-found', label: 'Not found' },
];
export const PROJECT_STATUS_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
export const KML_STATUS_OPTIONS = [
  { value: 'clear', label: 'Clear' },
  { value: 'overlap', label: 'Overlap' },
  { value: 'missing', label: 'Missing' },
  { value: 'error', label: 'Error' },
];
export const SITE_PLAN_STATUS_OPTIONS = [
  { value: 'extracted', label: 'Extracted' },
  { value: 'manual', label: 'Manual' },
  { value: 'partial', label: 'Partial' },
  { value: 'missing', label: 'Missing' },
  { value: 'error', label: 'Error' },
];
// The manual-check status, set by a human from the list/detail view — not automated.
export const OVERALL_STATUS_OPTIONS = [
  { value: 'live', label: 'Live' },
  { value: 'new', label: 'Removed' },
  { value: 'hold', label: 'Hold' },
  { value: 'reject', label: 'Reject' },
];

export const LAYOUT_TYPES = ['Apartment', 'Villa', 'Villament', 'Row House', 'Plot', 'Commercial', 'Offices'];
export const CONFIGURATIONS = ['Studio', '1BHK', '1.5BHK', '2BHK', '2.5BHK', '3BHK', '3.5BHK', '4BHK', '4.5BHK', '5BHK', '5.5BHK', '6BHK', '6.5BHK', '7BHK', '7.5BHK'];

// Placeholder keyword lists — refine once we're looking at real EC listings. See docs/ec-pipeline-prd.md §5.
export const KEYWORDS = {
  projectRelevance: {
    include: ['residential', 'apartment', 'township', 'villa', 'group housing', 'commercial complex', 'it park', 'mixed use', 'row house', 'plotted development'],
    exclude: ['highway', 'mining', 'thermal power', 'effluent treatment', 'cement plant', 'quarry', 'irrigation', 'industrial estate', 'phase 2', 'phase-2', 'phase ii', 'phase iii', 'extension', 'expansion', 'renewal', 'amendment', 'addendum'],
  },
  sitePlan: {
    include: ['site plan', 'layout plan', 'master plan', 'site layout', 'general layout plan'],
  },
};

function blankJsonData() {
  return {
    codename: null,
    units: null,
    floor: null,
    land_area_acres: null,
    layout: [],
    config: [],
    description: null,
    developer_name: null,
  };
}

function blankStatus() {
  return {
    developer: 'not-found',
    project: 'no',
    kml: 'missing',
    site_plan: 'missing',
    overall: 'pending',
  };
}

// ---- Pure classification helpers — what the "Run" buttons in the UI call ----

function normalizeBuilderName(s) {
  return s.toLowerCase().replace(/\b(pvt\.?|ltd\.?|limited|llp|group|properties|developers?|constructions?)\b/g, '').replace(/[^a-z0-9]/g, '').trim();
}

export function matchDeveloper(proponent) {
  const target = normalizeBuilderName(proponent || '');
  if (!target) return null;
  return getBuilders().find(b => {
    const name = normalizeBuilderName(b.builderName);
    return name && (target.includes(name) || name.includes(target));
  }) || null;
}

// Merges the "is this real estate" and "is this a fresh filing" checks into one relevance call.
export function classifyProjectRelevance(name) {
  const n = (name || '').toLowerCase();
  if (KEYWORDS.projectRelevance.exclude.some(k => n.includes(k))) return 'no';
  return 'yes';
}

// ---- Seed data ----
// `_demo` on each record is UI-simulation scaffolding only — it stands in for what a real KML/
// geometry match or PDF search would come back with. It is not part of the ec_scrapes schema.
// `pushed_project_id` is likewise implementation-only, tracking the live Project a "Push to Live"
// created — not part of the documented schema.

let ecScrapes = [
  {
    id: 'EC0001',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12451/2026',
    name: 'Prestige Aerie',
    proponent: 'Prestige Estates Projects Ltd',
    date_of_submission: '2026-08-20',
    kml_file: '/mock/kml/ec0001.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-08-21T09:00:00.000Z',
    json_data: {
      codename: 'PAE',
      units: 1450,
      floor: 'G+32',
      land_area_acres: 6.8,
      layout: ['Apartment'],
      config: ['2BHK', '3BHK', '3.5BHK'],
      description: 'High-rise residential development off Hennur Road with retail podium.',
      developer_name: 'Prestige Group',
    },
    status: { developer: 'found', project: 'yes', kml: 'clear', site_plan: 'extracted', overall: 'live' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0002',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12488/2026',
    name: 'Sobha Windsor Phase 1',
    proponent: 'Sobha Limited',
    date_of_submission: '2026-09-01',
    kml_file: '/mock/kml/ec0002.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-09-02T09:00:00.000Z',
    json_data: {
      codename: null,
      units: 980,
      floor: 'G+28',
      land_area_acres: 5.1,
      layout: ['Apartment', 'Villament'],
      config: ['3BHK', '4BHK'],
      description: 'Waterfront-themed towers near Panathur with a private clubhouse.',
      developer_name: 'Sobha Limited',
    },
    status: { developer: 'found', project: 'yes', kml: 'clear', site_plan: 'extracted', overall: 'new' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0003',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12502/2026',
    name: 'Zenith Meadows',
    proponent: 'Zenith Meadows Developers LLP',
    date_of_submission: '2026-09-03',
    kml_file: null,
    site_plan: null,
    added_date: '2026-09-04T09:00:00.000Z',
    json_data: blankJsonData(),
    status: { ...blankStatus(), project: 'yes' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0004',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/11980/2025',
    name: 'Brigade Xanadu Phase 2',
    proponent: 'Brigade Group',
    date_of_submission: '2026-08-28',
    kml_file: null,
    site_plan: null,
    added_date: '2026-08-29T09:00:00.000Z',
    json_data: blankJsonData(),
    status: { ...blankStatus(), developer: 'found' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0005',
    source: 'ToR',
    sia_id: 'SIA/KA/IND/09215/2026',
    name: 'Bidadi Effluent Treatment Plant Expansion',
    proponent: 'Karnataka Industrial Areas Development Board',
    date_of_submission: '2026-08-15',
    kml_file: null,
    site_plan: null,
    added_date: '2026-08-16T09:00:00.000Z',
    json_data: blankJsonData(),
    status: blankStatus(),
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'missing' },
  },
  {
    id: 'EC0006',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12490/2026',
    name: 'Puravankara Silversands East Block',
    proponent: 'Puravankara Limited',
    date_of_submission: '2026-09-02',
    kml_file: '/mock/kml/ec0006.kml',
    site_plan: null,
    added_date: '2026-09-03T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Puravankara' },
    status: { developer: 'found', project: 'yes', kml: 'overlap', site_plan: 'missing', overall: 'hold' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'overlap', overlapWith: ['Sobha Neopolis (P0002)'], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0007',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12511/2026',
    name: 'Adarsh Palm Retreat II',
    proponent: 'Adarsh Developers',
    date_of_submission: '2026-09-05',
    kml_file: null,
    site_plan: null,
    added_date: '2026-09-06T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Adarsh Group' },
    status: { ...blankStatus(), developer: 'found', project: 'yes' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'missing', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0008',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12470/2026',
    name: 'Century Ethos Extension',
    proponent: 'Century Real Estate Holdings',
    date_of_submission: '2026-08-30',
    kml_file: '/mock/kml/ec0008.kml',
    site_plan: null,
    added_date: '2026-08-31T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Century Real Estate' },
    status: { developer: 'found', project: 'no', kml: 'clear', site_plan: 'missing', overall: 'hold' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'missing' },
  },
  {
    id: 'EC0009',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12300/2026',
    name: 'Salarpuria Sattva Magnus',
    proponent: 'Salarpuria Sattva Group',
    date_of_submission: '2026-08-10',
    kml_file: '/mock/kml/ec0009.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-08-11T09:00:00.000Z',
    json_data: {
      codename: null,
      units: 640,
      floor: 'G+24',
      land_area_acres: 3.4,
      layout: ['Apartment', 'Offices'],
      config: ['2BHK', '3BHK'],
      description: 'Commercial-residential mixed-use tower on Bannerghatta Road.',
      developer_name: 'Salarpuria Sattva',
    },
    // Pipeline looks clean, but a human still flagged it a fail (e.g. legal hold) — the tick/cross
    // is the final say regardless of how the automated stages read.
    status: { developer: 'found', project: 'yes', kml: 'clear', site_plan: 'extracted', overall: 'reject' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0010',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12530/2026',
    name: 'Shriram 122 West Block C',
    proponent: 'Shriram Properties Ltd',
    date_of_submission: '2026-09-10',
    kml_file: null,
    site_plan: null,
    added_date: '2026-09-11T09:00:00.000Z',
    json_data: blankJsonData(),
    status: blankStatus(),
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0011',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12580/2026',
    name: 'Adarsh Ivy County',
    proponent: 'Adarsh Developers',
    date_of_submission: '2026-09-08',
    kml_file: '/mock/kml/ec0011.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-09-09T09:00:00.000Z',
    json_data: {
      codename: null,
      units: 720,
      floor: 'G+18',
      land_area_acres: 4.2,
      layout: ['Apartment'],
      config: ['2BHK', '2.5BHK', '3BHK'],
      description: 'Mid-rise gated community off Bannerghatta Road with a central courtyard.',
      developer_name: 'Adarsh Group',
    },
    status: { developer: 'found', project: 'yes', kml: 'clear', site_plan: 'extracted', overall: 'pending' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0012',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12591/2026',
    name: 'Century Breeze',
    proponent: 'Century Real Estate Holdings',
    date_of_submission: '2026-09-07',
    kml_file: null,
    site_plan: null,
    added_date: '2026-09-08T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Century Real Estate' },
    status: { developer: 'found', project: 'yes', kml: 'error', site_plan: 'missing', overall: 'new' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'missing', overlapWith: [], sitePlanOutcome: 'missing' },
  },
  {
    id: 'EC0013',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12603/2026',
    name: 'Salarpuria Sattva Cadenza',
    proponent: 'Salarpuria Sattva Group',
    date_of_submission: '2026-09-06',
    kml_file: '/mock/kml/ec0013.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-09-07T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Salarpuria Sattva' },
    status: { developer: 'found', project: 'yes', kml: 'overlap', site_plan: 'extracted', overall: 'hold' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'overlap', overlapWith: ['Brigade Xanadu (P0003)'], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0014',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12310/2025',
    name: 'Shriram Grand City Extension',
    proponent: 'Shriram Properties Ltd',
    date_of_submission: '2026-08-25',
    kml_file: null,
    site_plan: null,
    added_date: '2026-08-26T09:00:00.000Z',
    json_data: blankJsonData(),
    status: { ...blankStatus(), developer: 'found' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0015',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12615/2026',
    name: 'Horizon Meadows',
    proponent: 'Horizon Realty Ventures Pvt Ltd',
    date_of_submission: '2026-09-12',
    kml_file: null,
    site_plan: null,
    added_date: '2026-09-13T09:00:00.000Z',
    json_data: blankJsonData(),
    status: { ...blankStatus(), project: 'yes' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0016',
    source: 'ToR',
    sia_id: 'SIA/KA/IND/09340/2026',
    name: 'Devanahalli Cement Plant Capacity Expansion',
    proponent: 'Karnataka Cement Industries Ltd',
    date_of_submission: '2026-08-22',
    kml_file: null,
    site_plan: null,
    added_date: '2026-08-23T09:00:00.000Z',
    json_data: blankJsonData(),
    status: blankStatus(),
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'missing' },
  },
  {
    id: 'EC0017',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12622/2026',
    name: 'Prestige Sunrise Park',
    proponent: 'Prestige Estates Projects Ltd',
    date_of_submission: '2026-09-14',
    kml_file: '/mock/kml/ec0017.kml',
    site_plan: null,
    added_date: '2026-09-15T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Prestige Group' },
    status: { developer: 'found', project: 'yes', kml: 'clear', site_plan: 'missing', overall: 'new' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'missing' },
  },
  {
    id: 'EC0018',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12180/2025',
    name: 'Sobha Dream Acres Phase 2',
    proponent: 'Sobha Limited',
    date_of_submission: '2026-08-18',
    kml_file: null,
    site_plan: null,
    added_date: '2026-08-19T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Sobha Limited' },
    status: { developer: 'found', project: 'no', kml: 'missing', site_plan: 'missing', overall: 'reject' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0019',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12633/2026',
    name: 'Brigade Etrium',
    proponent: 'Brigade Group',
    date_of_submission: '2026-09-16',
    kml_file: '/mock/kml/ec0019.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-09-17T09:00:00.000Z',
    json_data: {
      codename: 'BET',
      units: 540,
      floor: 'G+16',
      land_area_acres: 2.9,
      layout: ['Commercial', 'Offices'],
      config: ['Studio', '1BHK'],
      description: 'Compact-format commercial-residential tower on Hosur Road, aimed at the co-living segment.',
      developer_name: 'Brigade Group',
    },
    status: { developer: 'found', project: 'yes', kml: 'clear', site_plan: 'extracted', overall: 'pending' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0020',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12645/2026',
    name: 'Purva Zenium',
    proponent: 'Puravankara Limited',
    date_of_submission: '2026-09-18',
    kml_file: '/mock/kml/ec0020.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-09-19T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Puravankara' },
    status: { developer: 'found', project: 'yes', kml: 'clear', site_plan: 'extracted', overall: 'new' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0021',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12290/2025',
    name: 'Adarsh Greens Extension',
    proponent: 'Adarsh Developers',
    date_of_submission: '2026-08-12',
    kml_file: null,
    site_plan: null,
    added_date: '2026-08-13T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Adarsh Group' },
    status: { developer: 'found', project: 'no', kml: 'missing', site_plan: 'missing', overall: 'reject' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0022',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12656/2026',
    name: 'Skyline Meridian',
    proponent: 'Skyline Infra Developers LLP',
    date_of_submission: '2026-09-20',
    kml_file: '/mock/kml/ec0022.kml',
    site_plan: null,
    added_date: '2026-09-21T09:00:00.000Z',
    json_data: blankJsonData(),
    status: { developer: 'not-found', project: 'yes', kml: 'overlap', site_plan: 'missing', overall: 'hold' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'overlap', overlapWith: ['Godrej Air NXT (P0004)'], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0023',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12667/2026',
    name: 'Century Regalia',
    proponent: 'Century Real Estate Holdings',
    date_of_submission: '2026-09-19',
    kml_file: '/mock/kml/ec0023.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-09-20T09:00:00.000Z',
    json_data: { ...blankJsonData(), developer_name: 'Century Real Estate' },
    status: { developer: 'found', project: 'yes', kml: 'overlap', site_plan: 'extracted', overall: 'hold' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'overlap', overlapWith: ['Adarsh Group Heights (P0011)'], sitePlanOutcome: 'extracted' },
  },
  {
    id: 'EC0024',
    source: 'ToR',
    sia_id: 'SIA/KA/IND/09355/2026',
    name: 'Ramanagara Granite Quarry Expansion',
    proponent: 'Deccan Minerals & Aggregates Pvt Ltd',
    date_of_submission: '2026-08-05',
    kml_file: null,
    site_plan: null,
    added_date: '2026-08-06T09:00:00.000Z',
    json_data: blankJsonData(),
    status: blankStatus(),
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'missing' },
  },
  {
    id: 'EC0025',
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12678/2026',
    name: 'Shriram Divine City',
    proponent: 'Shriram Properties Ltd',
    date_of_submission: '2026-09-21',
    kml_file: '/mock/kml/ec0025.kml',
    site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
    added_date: '2026-09-22T09:00:00.000Z',
    json_data: {
      codename: null,
      units: 1120,
      floor: 'G+14',
      land_area_acres: 8.5,
      layout: ['Apartment', 'Row House'],
      config: ['2BHK', '3BHK', '4BHK'],
      description: 'Integrated township on Kanakapura Road with a dedicated retail street and school site.',
      developer_name: 'Shriram Properties',
    },
    status: { developer: 'found', project: 'yes', kml: 'clear', site_plan: 'extracted', overall: 'live' },
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  },
];

// Real EC/ToR filings pulled from the Karnataka SEIAA portal — added as test data to exercise the
// pipeline against genuine proponent names and filing patterns. Left fully unprocessed (blank
// json_data/status) since none of the 4 stages have actually run on them yet — use the "Run"
// buttons in the detail view to process them. Developer matching will correctly resolve
// Puravankara / Brigade / Prestige / Godrej-style proponents against the builder database;
// everything else demonstrates the "not found" / manual-override path.
// [sia_id, name, proponent, date_of_submission, source]
const REAL_TEST_LISTINGS = [
  ['SIA/KA/INFRA2/589567/2026', 'Construction of Residential Apartment', 'Sri Balaji Builders', '2026-09-18', 'EC'],
  ['SIA/KA/INFRA2/591998/2026', 'Expansion of Residential Development with Recreation Center (Club House)', 'NVT Quality Lifestyle Estate LLP', '2026-09-18', 'EC'],
  ['SIA/KA/INFRA2/589985/2026', 'Residential Apartment by Puravankara at Geddalahalli Village', 'Puravankara Limited', '2026-09-18', 'EC'],
  ['SIA/KA/INFRA2/590407/2026', 'Integrated Solid Waste Management, Processing and Disposal Facility — Town Municipal Council, Malur', 'Pradeep Kumar A B', '2026-09-17', 'EC'],
  ['SIA/KA/INFRA2/592421/2026', 'Greenfield Project for Silicon Components for Semiconductor Application Manufacturing', 'Silfex India Mfg Private Limited', '2026-09-17', 'EC'],
  ['SIA/KA/INFRA2/590607/2026', 'Proposed Residential Apartment Development', '21st Castle Developers LLP', '2026-09-17', 'EC'],
  ['SIA/KA/INFRA2/589372/2026', 'Residential Apartment with Clubhouse Project', 'Goyal Hariyana Developers', '2026-09-17', 'EC'],
  ['SIA/KA/INFRA2/592417/2026', 'Residential Villa with Club House', 'Vainavi Developers LLP', '2026-09-17', 'EC'],
  ['SIA/KA/INFRA2/592379/2026', 'GM University — Educational Institutions, Medical College & 900-Bedded Hospital', 'Srishyla Educational Trust', '2026-09-17', 'EC'],
  ['SIA/KA/INFRA2/586654/2026', 'Proposed Industrial Expansion', 'Bansal Aradhya Steel Private Limited', '2026-09-16', 'EC'],
  ['SIA/KA/INFRA2/591648/2026', 'Residential Development Project', 'Embassy Developments Limited', '2026-09-15', 'EC'],
  ['SIA/KA/INFRA2/589361/2026', 'Residential Apartment with Amenity Project', 'Goyal Hariyana Developers', '2026-09-12', 'EC'],
  ['SIA/KA/INFRA2/571022/2026', 'Mega Dairy', 'Hassan Co-operative Milk Producers Societies Union Ltd', '2026-09-12', 'EC'],
  ['SIA/KA/INFRA2/590374/2026', 'Mixed Development of Commercial (Office) and Residential Apartment with Club House', 'Sai Purvi Developers', '2026-09-11', 'ToR'],
  ['SIA/KA/INFRA2/587121/2026', 'Proposed Residential Development with Amenity Block', 'Sattva Resi Private Limited', '2026-09-11', 'EC'],
  ['SIA/KA/INFRA2/591127/2026', 'Proposed Residential Development Plan', 'Maruti Ventures', '2026-09-11', 'EC'],
  ['SIA/KA/INFRA2/591677/2026', 'The Prestige City — Expansion and Modification of Residential and Commercial/Retail Development with Club Houses', 'Prestige Projects Private Limited', '2026-09-10', 'ToR'],
  ['SIA/KA/INFRA2/518257/2026', 'Industrial Buildings for Manufacturing and Repair of Laptops and Other Electronic Products', 'ICT Service Management Solutions (India) Private Limited', '2026-09-10', 'EC'],
  ['SIA/KA/INFRA2/591597/2026', 'Kingston Projects', 'Kingston Projects', '2026-09-10', 'EC'],
  ['SIA/KA/INFRA2/590011/2026', 'Proposed Construction of Residential Villas', 'Vaishnavi Infrastructure and Properties LLP', '2026-09-10', 'EC'],
  ['SIA/KA/INFRA2/585306/2026', 'Residential Apartment with Club House and Amenities', 'Asian Fab Tec Limited', '2026-09-10', 'EC'],
  ['SIA/KA/INFRA2/591721/2026', 'Expansion for Development of Residential Apartment', 'Merushikhar Infra LLP', '2026-09-10', 'EC'],
  ['SIA/KA/INFRA2/590931/2026', 'Proposed Residential Building Plan', 'MSR Royal Park', '2026-09-09', 'EC'],
  ['SIA/KA/INFRA2/587422/2026', 'Proposed Construction of Residential Development', 'L&T Realty Developers Limited', '2026-09-09', 'EC'],
  ['SIA/KA/INFRA2/591566/2026', 'Proposed Design & Build of Office and Data Centre', 'Sify Infinit Spaces Limited', '2026-09-09', 'EC'],
  ['SIA/KA/INFRA2/591489/2026', 'Residential Apartment with Club House', 'Pradeep Kumar H K', '2026-09-08', 'EC'],
  ['SIA/KA/INFRA2/591444/2026', 'Construction of Residential Apartment Project', 'Brigade Properties Private Limited', '2026-09-08', 'ToR'],
  ['SIA/KA/INFRA2/585646/2026', 'Mixed Development of Residential and Commercial (Retail) Building', 'Collab Projects LLP', '2026-09-07', 'ToR'],
  ['SIA/KA/INFRA2/579423/2026', 'JSS Medical Institution Campus', 'JSS Academy of Higher Education & Research', '2026-09-07', 'EC'],
  ['SIA/KA/INFRA2/580925/2026', 'Residential Development with Clubhouse — Prestige Southern Star Phase 2', 'Prestige Acres Private Limited', '2026-09-07', 'ToR'],
  ['SIA/KA/INFRA2/591165/2026', 'Construction of Residential Building Project (Phase I & Phase II)', 'Pushpa Family Trust', '2026-09-07', 'EC'],
  ['SIA/KA/INFRA2/591295/2026', 'Residential Apartment with Club House Project', 'Ms Urban Oasis', '2026-09-07', 'EC'],
  ['SIA/KA/INFRA2/591356/2026', 'Proposed Expansion of Residential Row Housing Project', 'Godrej Properties Limited', '2026-09-07', 'EC'],
  ['SIA/KA/INFRA2/584202/2026', 'Revent Residential Development', 'Revent Invesco LLP', '2026-09-04', 'EC'],
  ['SIA/KA/INFRA2/588065/2026', 'Proposed Villas and Apartments', 'Summit Developments Limited', '2026-09-04', 'ToR'],
  ['SIA/KA/INFRA2/586501/2026', 'Residential Apartment and Club House', 'Prestige Estates Projects Limited', '2026-09-04', 'EC'],
  ['SIA/KA/INFRA2/587526/2026', 'Proposed Commercial Development', 'Genisys Integrating Systems India Private Limited', '2026-09-04', 'ToR'],
  ['SIA/KA/INFRA2/586120/2026', 'Proposed Residential and Commercial Building', 'Sanjeev Pujar', '2026-09-04', 'EC'],
  ['SIA/KA/INFRA2/589541/2026', 'Office Building', 'Jawahar Gopal', '2026-09-04', 'EC'],
  ['SIA/KA/INFRA2/580240/2026', 'Expansion of Educational Institute Comprising Academic & Hostel', 'Vellore Educational and Charitable Trust', '2026-09-04', 'EC'],
];

// Cycled across the real listings below so the default view — sorted newest first — actually
// shows the full green/amber/red/gray spread instead of a wall of "not processed yet" gray.
// developer is left null here and resolved for real via matchDeveloper() per record, since a good
// few of these proponents (Puravankara, Brigade, Prestige, Godrej...) genuinely match the builder DB.
const STATUS_PROFILES = [
  { project: 'yes', kml: 'clear', site_plan: 'extracted', overall: 'live' },
  { project: 'yes', kml: 'overlap', site_plan: 'extracted', overall: 'hold', overlapWith: ['Sobha Neopolis (P0002)'] },
  { project: 'yes', kml: 'missing', site_plan: 'missing', overall: 'new' },
  { project: 'no', kml: 'missing', site_plan: 'missing', overall: 'reject' },
  { project: 'yes', kml: 'clear', site_plan: 'partial', overall: 'pending' },
  { project: 'no', kml: 'missing', site_plan: 'missing', overall: 'new' },
  { project: 'yes', kml: 'error', site_plan: 'error', overall: 'hold' },
  { project: 'yes', kml: 'missing', site_plan: 'missing', overall: 'pending' },
];

ecScrapes = [
  ...ecScrapes,
  ...REAL_TEST_LISTINGS.map(([sia_id, name, proponent, date_of_submission, source], index) => {
    const added = new Date(`${date_of_submission}T09:00:00.000Z`);
    added.setUTCDate(added.getUTCDate() + 1);
    const id = `EC${String(26 + index).padStart(4, '0')}`;
    const profile = STATUS_PROFILES[index % STATUS_PROFILES.length];
    const match = matchDeveloper(proponent);
    const developer = match ? 'found' : 'not-found';
    return {
      id,
      source,
      sia_id,
      name,
      proponent,
      date_of_submission,
      kml_file: profile.kml === 'clear' || profile.kml === 'overlap' ? `/mock/kml/${id.toLowerCase()}.kml` : null,
      site_plan: profile.site_plan === 'extracted' || profile.site_plan === 'partial' ? '/site-plans/goyal-hariyana-orchid-greens.pdf' : null,
      added_date: added.toISOString(),
      json_data: { ...blankJsonData(), developer_name: developer === 'found' ? match.builderName : null },
      status: { developer, project: profile.project, kml: profile.kml, site_plan: profile.site_plan, overall: profile.overall },
      pushed_project_id: null,
      _demo: { kmlOutcome: profile.kml, overlapWith: profile.overlapWith || [], sitePlanOutcome: profile.site_plan },
    };
  }),
];

// EC0032 (Goyal Hariyana Developers — Residential Apartment with Clubhouse Project) has a real
// MOEF sanction site plan on file, unlike the rest of this generated batch — patched in here as a
// concrete example of what a resolved site plan actually looks like once one exists.
ecScrapes = ecScrapes.map(rec => rec.id !== 'EC0032' ? rec : {
  ...rec,
  site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf',
  status: { ...rec.status, site_plan: 'extracted' },
  json_data: {
    ...rec.json_data,
    codename: 'Orchid Greens',
    floor: '2B+G+27',
    layout: ['Apartment'],
    description: 'Proposed residential development (4 towers, 2B+G+25/27 floors) with civic amenity blocks and a clubhouse, on Hennur Bagalur Main Road, Kannur Village, Bidarahalli Hobli, Bangalore East — per the MOEF sanction site plan.',
  },
});

// Queue of "incoming" filings that Run Scraper pulls from, one at a time — stands in for the
// real cron job so the ingest step is demonstrable without a live source.
let incomingQueue = [
  {
    source: 'EC',
    sia_id: 'SIA/KA/INFRA2/12560/2026',
    name: 'Godrej Aqua Phase 1',
    proponent: 'Godrej Properties Limited',
    date_of_submission: new Date().toISOString().slice(0, 10),
  },
  {
    source: 'ToR',
    sia_id: 'SIA/KA/INFRA2/12561/2026',
    name: 'NH-44 Bypass Widening — Package 3',
    proponent: 'National Highways Authority of India',
    date_of_submission: new Date().toISOString().slice(0, 10),
  },
];

function nextEcId() {
  const nums = ecScrapes.map(e => parseInt(e.id.slice(2), 10)).filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `EC${String(next).padStart(4, '0')}`;
}

export function getEcScrapes() {
  return [...ecScrapes].sort((a, b) => new Date(b.added_date) - new Date(a.added_date));
}

export function getEcScrape(id) {
  return ecScrapes.find(e => e.id === id);
}

export function updateEcScrape(id, patch) {
  ecScrapes = ecScrapes.map(e => {
    if (e.id !== id) return e;
    const next = { ...e, ...patch };
    if (patch.status) next.status = { ...e.status, ...patch.status };
    if (patch.json_data) next.json_data = { ...e.json_data, ...patch.json_data };
    if (patch._demo) next._demo = { ...e._demo, ...patch._demo };
    return next;
  });
  return getEcScrape(id);
}

// Simulates the scraper cron pulling the next batch of raw filings into the queue.
export function runScraper() {
  const incoming = incomingQueue.shift();
  if (!incoming) return null;
  const record = {
    id: nextEcId(),
    ...incoming,
    kml_file: null,
    site_plan: null,
    added_date: new Date().toISOString(),
    json_data: blankJsonData(),
    status: blankStatus(),
    pushed_project_id: null,
    _demo: { kmlOutcome: 'clear', overlapWith: [], sitePlanOutcome: 'extracted' },
  };
  ecScrapes = [record, ...ecScrapes];
  return record;
}

export function hasMoreIncoming() {
  return incomingQueue.length > 0;
}

// Maps a passed EC record into the shape Edge → Projects expects, and creates it there.
// Returns the newly created project.
export function pushEcScrapeToProjects(id) {
  const e = getEcScrape(id);
  if (!e) return null;
  const jd = e.json_data;
  const project = {
    name: e.name,
    codename: jd.codename || null,
    description: jd.description || null,
    launch_status: 'Prelaunch',
    total_units: jd.units || null,
    floor: jd.floor || null,
    land_area_acres: jd.land_area_acres || null,
    layouts: jd.config || [],
    configurations: jd.layout || [],
    kml_file_url: e.kml_file,
    rawBuilderName: jd.developer_name || e.proponent,
    status: 'drafted',
  };
  const created = createProject(project);
  updateEcScrape(id, { pushed_project_id: created.id });
  return created;
}

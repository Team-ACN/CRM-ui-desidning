// Popups: App and Web are separate lists, ranked by list order — only one shows per view, the highest rank wins.

// Creative size per surface (the surface decides the creative).
export const POPUP_CREATIVE = {
  app: { ratio: '39:50', label: 'App poster', size: '780×1000' },
  web: { ratio: '910:436', label: 'Web creative', size: '1820×872' },
};

const img = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const base = (o) => ({
  status: 'paused',
  appManaged: false,
  audience: [], // cohort ids; empty = all users
  audienceLabel: 'All users',
  maxShows: 1,
  minGapH: '',
  startDate: '',
  endDate: '',
  layout: 'one', // none | one | two
  dividerLabel: '',
  colorMode: 'manual', // matched | manual
  bg: '#0F766E',
  text: '#FAFAFA',
  ctas: [{ label: 'Know more', url: 'https://acnonline.in' }],
  destination: 'https://acnonline.in', // the whole creative is a link
  triggerEvent: 'add_inventory_success', // event the app raises to fire this popup
  appendCpid: true,
  closeCorner: 'top_right', // top_right | top_left
  hideAfterClick: false, // don't show again to a user who already clicked
  toast: '',
  impressions: 0,
  ctr: 0,
  dismiss: 0,
  ...o,
});

const app = (id, page, name, o) => base({ id, surface: 'app', page, name, creative: { url: img(id, 780, 1000) }, ...o });
const web = (id, page, name, o) => base({ id, surface: 'web', page, name, creative: { url: img(id, 1820, 872) }, ...o });

export const mockPopupList = [
  app('PA01', 'home', 'Demante Event', { status: 'live', maxShows: 3, impressions: 180, ctr: 8.9, dismiss: 61, dividerLabel: 'TRY IT YOURSELF', ctas: [{ label: 'Book a demo', url: 'https://acnonline.in/demo' }] }),
  app('PA02', 'home', 'e-khata', { maxShows: 2, impressions: 675, ctr: 2.8, dismiss: 74 }),
  app('PA03', 'home', 'Registration case referal', { maxShows: 2, impressions: 461, ctr: 2.6, dismiss: 80 }),
  app('PA04', 'home', 'Primary Orlean', { maxShows: 5, impressions: 648, ctr: 3.4, dismiss: 68 }),
  app('PA05', 'home', 'Client sharing 2', { maxShows: 5, impressions: 134, ctr: 3.7, dismiss: 72 }),
  app('PA06', 'home', 'client sharing', { maxShows: 5, impressions: 359, ctr: 10.9, dismiss: 66 }),
  app('PA07', 'home', 'Delist inventory popup', { appManaged: true, creative: null }),
  app('PA08', 'home', 'Masal prompt', { appManaged: true, creative: null }),
  app('PA09', 'home', 'Ruchira', { audienceLabel: 'All Agents', maxShows: 5, impressions: 109, ctr: 8.3, dismiss: 58 }),
  app('PA10', 'properties', 'Whatsapp Bot', { maxShows: 5, impressions: 232, ctr: 5.6, dismiss: 63 }),
  app('PA11', 'services', 'Test POP UP', { audienceLabel: 'Yash', maxShows: 100000, impressions: 7, ctr: 85.7, dismiss: 14 }),
  web('PW01', 'home', 'Web demo banner', { maxShows: 3, impressions: 300, ctr: 4.0, dismiss: 88 }),
  web('PW02', 'home', 'App download nudge', { maxShows: 2, impressions: 117, ctr: 5.1, dismiss: 95 }),
  web('PW03', 'home', 'Agent meetup invite', { status: 'live', maxShows: 3, impressions: 412, ctr: 6.2, dismiss: 71 }),
  web('PW04', 'properties', 'List your property', { status: 'live', maxShows: 2, impressions: 268, ctr: 4.7, dismiss: 83 }),
  web('PW05', 'services', 'Legal desk offer', { maxShows: 2, impressions: 96, ctr: 3.1, dismiss: 90 }),
  web('PW06', 'home', 'Festive brokerage offer', { maxShows: 4, impressions: 189, ctr: 7.4, dismiss: 64 }),
];

import { MOCK_DIRECTORY } from './mockCms';

// Fake but stable CPID lists for who saw / clicked a popup (real data comes from the backend).
export function popupCpids(p) {
  let seed = 0;
  for (const ch of p.id) seed = (seed * 31 + ch.charCodeAt(0)) % 100003;
  const clicks = Math.round((p.impressions * p.ctr) / 100);
  const pick = (n) => [...new Set(Array.from({ length: Math.min(n, MOCK_DIRECTORY.length) }, (_, j) => MOCK_DIRECTORY[(seed + j) % MOCK_DIRECTORY.length].cpid))];
  const viewers = pick(p.impressions);
  return { viewers, clickers: viewers.slice(0, Math.min(clicks, viewers.length)) };
}

// CPIDs behind one button's clicks: the clickers are split across the buttons.
export function popupButtonCpids(p, i, n) {
  return popupCpids(p).clickers.filter((_, k) => k % Math.max(n, 1) === i);
}

export function getPopups(surface) {
  return mockPopupList.filter((p) => p.surface === surface);
}

export function getPopup(id) {
  return mockPopupList.find((p) => p.id === id) || null;
}

export function createPopup(data) {
  const popup = base({ ...data, id: `PX${Date.now()}` });
  mockPopupList.push(popup);
  return popup;
}

export function updatePopup(id, patch) {
  const popup = getPopup(id);
  if (popup) Object.assign(popup, patch);
  return popup;
}

export function setPopupStatus(id, status) {
  return updatePopup(id, { status });
}

// Priority = order on the surface. `ids` is the new order; anything not listed keeps its place after.
export function reorderSurfacePopups(surface, ids) {
  const group = mockPopupList.filter((p) => p.surface === surface);
  const rest = mockPopupList.filter((p) => p.surface !== surface);
  const ordered = ids.map((id) => group.find((p) => p.id === id)).filter(Boolean);
  const leftover = group.filter((p) => !ids.includes(p.id));
  mockPopupList.length = 0;
  mockPopupList.push(...rest, ...ordered, ...leftover);
}

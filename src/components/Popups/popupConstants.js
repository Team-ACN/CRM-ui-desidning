// Shared enums + style maps for the popup system.
// Mirrors the pattern used in src/components/Enquiries/enquiryConstants.js.

// A popup belongs to exactly one surface. Web and app never share a popup:
// different creatives, different competition, different priority list.
// App leads: it carries most of the popup traffic.
export const SURFACES = [
  { id: 'app', label: 'App', description: 'ACN app' },
  { id: 'web', label: 'Web', description: 'ACN web' },
];

export const PAGE_KEYS = [
  { id: 'home', label: 'Home' },
  { id: 'properties', label: 'Properties' },
  { id: 'my_business', label: 'My Business' },
  { id: 'service', label: 'Service' },
];

export const TRIGGER_TYPES = [
  {
    id: 'session',
    label: 'Session start',
    description: 'First authenticated load of a session',
    needsPageKey: false,
  },
  {
    id: 'page',
    label: 'Page context',
    description: 'On landing on a specific page',
    needsPageKey: true,
  },
  {
    id: 'scroll',
    label: 'Scroll depth',
    description: 'After the user scrolls past a threshold on a page',
    needsPageKey: true,
  },
  {
    id: 'event',
    label: 'Event',
    description: 'After a user action succeeds',
    needsPageKey: false,
  },
];

// Seeded from the PRD. Extend as the client exposes more success callbacks.
export const EVENT_KEYS = [
  { id: 'add_inventory_success', label: 'Inventory added' },
  { id: 'enquiry_submitted', label: 'Enquiry submitted' },
  { id: 'profile_completed', label: 'Profile completed' },
];

export const STATUSES = ['Draft', 'Not Live', 'Live', 'Off'];

export const STATUS_STYLES = {
  Live: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'Not Live': 'text-amber-600 bg-amber-50 border-amber-200',
  Draft: 'text-gray-500 bg-gray-50 border-gray-200',
  Off: 'text-red-600 bg-red-50 border-red-200',
};

export const CLOSE_CORNERS = [
  { id: 'top_right', label: 'Top right' },
  { id: 'top_left', label: 'Top left' },
];

export const IMAGE_CONSTRAINTS = {
  acceptedTypes: ['image/png', 'image/jpeg', 'image/webp'],
  acceptAttr: 'image/png,image/jpeg,image/webp',
  maxBytes: 2 * 1024 * 1024,
  // App poster — 390x500 @2x, per the mobile spec
  minWidth: 780,
  minHeight: 1000,
  // Landscape creative — web on a desktop
  desktopMinWidth: 1440,
  desktopMinHeight: 1080,
};

export const isApp = (popup) => popup?.surface === 'app';

export const DEFAULT_BACKDROP_OPACITY = 0.6;

// App sheet: the poster is a fixed 39:50 block, with a solid action area under it.
export const POSTER_ASPECT = 39 / 50;
export const DEFAULT_ACTION_BAR_COLOR = '#111111';
export const DEFAULT_DIVIDER_LABEL = 'TRY IT YOURSELF';

export const DEFAULT_FREQUENCY = {
  maxImpressions: 1,
  cooldownHours: null,
  minGapHours: null,
};

export const surfaceLabel = (surface) =>
  SURFACES.find((s) => s.id === surface)?.label || surface;

export const pageLabel = (pageKey) =>
  PAGE_KEYS.find((p) => p.id === pageKey)?.label || pageKey;

export const triggerLabel = (type) =>
  TRIGGER_TYPES.find((t) => t.id === type)?.label || type;

export const eventLabel = (eventKey) =>
  EVENT_KEYS.find((e) => e.id === eventKey)?.label || eventKey;

// Short label for a popup's trigger context — used as the grouping header.
export const triggerScopeLabel = (popup) => {
  const trigger = popup?.trigger || {};
  switch (trigger.type) {
    case 'session':
      return 'Session start';
    case 'page':
      return `${pageLabel(trigger.pageKey)} page`;
    case 'scroll':
      return `${pageLabel(trigger.pageKey)} page · ${trigger.scrollDepthPct || 0}% scroll`;
    case 'event':
      return `After ${eventLabel(trigger.eventKey)?.toLowerCase()}`;
    default:
      return 'No trigger';
  }
};

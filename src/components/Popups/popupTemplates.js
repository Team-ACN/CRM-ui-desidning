// Code-level template registry: layout geometry lives here, never in the popup record.
//
// App (per the mobile spec): the popup is a bottom sheet — a 39:50 poster with a solid
// action area beneath it that holds the buttons. `buttonCount` drives that stack.
// Web: the popup is still a centred card with the buttons drawn over the artwork's
// empty well, so `slots` carries the % geometry for that case.
// Slot geometry is expressed as a % of the card so a button sits in the artwork's
// empty well at every screen size. Adding a layout = one entry here + one design template.

// Reserved zone for the system close button, as a % of the card. `full_tap` uses it to
// punch a hole in the whole-card tap target so the close button stays reachable.
export const CLOSE_ZONE_PCT = { wPct: 14, hPct: 11 };

export const POPUP_TEMPLATES = [
  {
    key: 'full_tap',
    label: 'No button',
    description: 'The poster itself is the link',
    aspect: { mobile: 39 / 50, desktop: 4 / 3 },
    wholeCardTap: true,
    buttonCount: 0,
    slots: [],
  },
  {
    key: 'single_button',
    label: 'One button',
    description: 'One CTA in the action area under the poster',
    aspect: { mobile: 39 / 50, desktop: 4 / 3 },
    wholeCardTap: false,
    buttonCount: 1,
    slots: [{ index: 0, xPct: 8, yPct: 78, wPct: 84, hPct: 9 }],
  },
  {
    key: 'two_button',
    label: 'Two buttons',
    description: 'Two CTAs stacked in the action area',
    aspect: { mobile: 39 / 50, desktop: 4 / 3 },
    wholeCardTap: false,
    buttonCount: 2,
    slots: [
      { index: 0, xPct: 8, yPct: 78, wPct: 40.5, hPct: 9 },
      { index: 1, xPct: 51.5, yPct: 78, wPct: 40.5, hPct: 9 },
    ],
  },
];

export const getTemplate = (templateKey) =>
  POPUP_TEMPLATES.find((t) => t.key === templateKey) || POPUP_TEMPLATES[0];

export const getSlots = (templateKey) => getTemplate(templateKey).slots;

export const slotCount = (templateKey) => getSlots(templateKey).length;

// Card aspect ratio for a device. `full_tap` and the button layouts share the same
// ratios today, but the registry keeps them per-template so a new layout can differ.
export const getAspect = (templateKey, device = 'mobile') =>
  getTemplate(templateKey).aspect[device] ?? getTemplate(templateKey).aspect.mobile;

// Default button config for a freshly picked template.
export const buttonCount = (templateKey) => getTemplate(templateKey).buttonCount ?? 0;

export const buildDefaultButtons = (templateKey) =>
  getSlots(templateKey).map((slot) => ({
    id: `btn-${templateKey}-${slot.index}`,
    slotIndex: slot.index,
    label: slot.index === 0 ? 'Book a demo' : 'Learn more',
    bgColor: slot.index === 0 ? '#047857' : '#1F2937',
    textColor: '#FFFFFF',
    redirectUrl: '',
    openInNewTab: false,
    analyticsKey: slot.index === 0 ? 'primary_cta' : 'secondary_cta',
  }));

import { POSTER_ASPECT, WEB_BANNER_ASPECT } from './popupConstants';

// Code-level template registry: layout geometry lives here, never in the popup record.
//
// App (per the mobile spec): a bottom sheet — a 39:50 poster with a solid action area
// beneath it holding the buttons.
// Web (per the desktop template): a 910:436 banner with the divider and buttons drawn
// over the artwork, inside the well the creative leaves clear.
// `buttonCount` drives the button stack on both.
//
// `slots` carries the button indices the settings panel and validation iterate over.
// Adding a layout = one entry here + one design template.

export const POPUP_TEMPLATES = [
  {
    key: 'full_tap',
    label: 'No button',
    description: 'The poster itself is the link',
    aspect: { mobile: POSTER_ASPECT, desktop: WEB_BANNER_ASPECT },
    wholeCardTap: true,
    buttonCount: 0,
    slots: [],
  },
  {
    key: 'single_button',
    label: 'One button',
    description: 'One CTA in the action area under the poster',
    aspect: { mobile: POSTER_ASPECT, desktop: WEB_BANNER_ASPECT },
    wholeCardTap: false,
    buttonCount: 1,
    slots: [{ index: 0 }],
  },
  {
    key: 'two_button',
    label: 'Two buttons',
    description: 'Two CTAs stacked in the action area',
    aspect: { mobile: POSTER_ASPECT, desktop: WEB_BANNER_ASPECT },
    wholeCardTap: false,
    buttonCount: 2,
    slots: [{ index: 0 }, { index: 1 }],
  },
];

export const getTemplate = (templateKey) =>
  POPUP_TEMPLATES.find((t) => t.key === templateKey) || POPUP_TEMPLATES[0];

export const getSlots = (templateKey) => getTemplate(templateKey).slots;

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

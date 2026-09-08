import { triggerScopeLabel } from './popupConstants';

// Web and app are separate products here: an app popup never competes with a web one,
// so the surface is part of the group key and shows in the header.
const contextKey = (popup) => {
  const trigger = popup.trigger || {};
  return `${popup.surface}|${trigger.type}|${trigger.pageKey || trigger.eventKey || 'any'}|${
    trigger.scrollDepthPct || 0
  }`;
};

const SURFACE_ORDER = ['app', 'web'];
const TYPE_ORDER = ['session', 'page', 'scroll', 'event'];

export const groupPopupsByContext = (popups) => {
  const buckets = new Map();

  popups.forEach((popup) => {
    const key = contextKey(popup);
    buckets.set(key, [...(buckets.get(key) || []), popup]);
  });

  return [...buckets.entries()]
    .map(([key, items]) => ({
      key,
      label: triggerScopeLabel(items[0]),
      surface: items[0].surface,
      triggerType: items[0].trigger?.type,
      items: [...items].sort((a, b) => (a.priority || 999) - (b.priority || 999)),
    }))
    .sort((a, b) => {
      const bySurface = SURFACE_ORDER.indexOf(a.surface) - SURFACE_ORDER.indexOf(b.surface);
      if (bySurface !== 0) return bySurface;
      const byType = TYPE_ORDER.indexOf(a.triggerType) - TYPE_ORDER.indexOf(b.triggerType);
      return byType !== 0 ? byType : a.label.localeCompare(b.label);
    });
};

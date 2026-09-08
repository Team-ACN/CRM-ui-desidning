import { useCallback, useState } from 'react';
import { mockPopups } from '../../data/mockPopups';
import { buildDefaultButtons } from './popupTemplates';
import {
  DEFAULT_ACTION_BAR_COLOR,
  DEFAULT_BACKDROP_OPACITY,
  DEFAULT_DIVIDER_LABEL,
  DEFAULT_FREQUENCY,
} from './popupConstants';

export const createEmptyPopup = (surface = 'app') => ({
  id: `POP${String(Date.now()).slice(-6)}`,
  name: '',
  surface,
  imageUrl: '',
  imageUrlDesktop: '',
  templateKey: 'single_button',
  backdropOpacity: DEFAULT_BACKDROP_OPACITY,
  closeCorner: 'top_right',
  actionBarColor: DEFAULT_ACTION_BAR_COLOR,
  matchPosterColor: true,
  dividerLabel: DEFAULT_DIVIDER_LABEL,
  toastMessage: '',
  priority: 999,
  status: 'Draft',
  isActive: false,
  cohortIncludeIds: [],
  cohortExcludeIds: [],
  buttons: buildDefaultButtons('single_button'),
  trigger: { type: 'session', pageKey: null, scrollDepthPct: null, eventKey: null },
  frequency: { ...DEFAULT_FREQUENCY },
  stats: { impressions: 0, closes: 0, buttonClicks: {}, byDevice: {} },
});

// Owns all popup state for the CMS Popups tab so CohortsPage stays a view router.
export const usePopups = () => {
  const [popups, setPopups] = useState(mockPopups);

  const savePopup = useCallback((popup) => {
    setPopups((prev) => {
      const exists = prev.some((p) => p.id === popup.id);
      return exists ? prev.map((p) => (p.id === popup.id ? popup : p)) : [...prev, popup];
    });
  }, []);

  const setStatus = useCallback((popupId, status) => {
    setPopups((prev) =>
      prev.map((p) =>
        p.id === popupId ? { ...p, status, isActive: status === 'Live' } : p
      )
    );
  }, []);

  const toggleLive = useCallback((popupId) => {
    setPopups((prev) =>
      prev.map((p) => {
        if (p.id !== popupId) return p;
        const nextLive = !p.isActive;
        return { ...p, isActive: nextLive, status: nextLive ? 'Live' : 'Off' };
      })
    );
  }, []);

  // Reordered subset comes back from the priority manager; merge it over the master list.
  const reorderPriority = useCallback((reordered) => {
    setPopups((prev) => {
      const byId = new Map(reordered.map((p) => [p.id, p]));
      return prev.map((p) => byId.get(p.id) || p);
    });
  }, []);

  return { popups, savePopup, setStatus, toggleLive, reorderPriority };
};

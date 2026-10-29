import { useCallback, useState } from 'react';
import {
  SECTION_TYPES,
  DEFAULT_THRESHOLDS,
  DEFAULT_TEMPLATE_COPY,
  FILL_NEEDED_PCT,
  mockPins,
  mockBlockRules,
} from '../../data/mockHomeFeed';
import { canDisableType, validateCopy } from './headingRules';

const today = () => new Date().toISOString().slice(0, 10);
const newId = (prefix) => `${prefix}${String(Date.now()).slice(-6)}`;

// Owns all Home Feed CMS state so CohortsPage stays a view router.
export const useHomeFeed = () => {
  const [sectionTypes, setSectionTypes] = useState(SECTION_TYPES);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [copy, setCopy] = useState(DEFAULT_TEMPLATE_COPY);
  const [pins, setPins] = useState(mockPins);
  const [blockRules, setBlockRules] = useState(mockBlockRules);

  const toggleType = useCallback((id) => {
    setSectionTypes((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.status === 'Gated') return t;
        if (t.enabled && !canDisableType(id, FILL_NEEDED_PCT)) return t;
        return { ...t, enabled: !t.enabled };
      })
    );
  }, []);

  // Threshold edits are versioned and wait for PM approval (PRD §11).
  const submitThresholds = useCallback((values) => {
    setThresholds((prev) => ({ version: prev.version + 1, status: 'Pending PM approval', updatedAt: today(), values: { ...values } }));
  }, []);

  // Returns the validation errors; saves only when there are none.
  const saveCopy = useCallback((nextCopy) => {
    const errors = validateCopy(nextCopy, DEFAULT_TEMPLATE_COPY);
    if (Object.keys(errors).length === 0) setCopy(nextCopy);
    return errors;
  }, []);

  const addPin = useCallback((pin) => setPins((prev) => [...prev, { ...pin, id: newId('PIN') }]), []);
  const removePin = useCallback((id) => setPins((prev) => prev.filter((p) => p.id !== id)), []);

  const addBlockRule = useCallback((rule) => setBlockRules((prev) => [...prev, { ...rule, id: newId('BLK') }]), []);
  const removeBlockRule = useCallback((id) => setBlockRules((prev) => prev.filter((r) => r.id !== id)), []);

  return {
    sectionTypes, toggleType,
    thresholds, submitThresholds,
    copy, saveCopy,
    pins, addPin, removePin,
    blockRules, addBlockRule, removeBlockRule,
  };
};

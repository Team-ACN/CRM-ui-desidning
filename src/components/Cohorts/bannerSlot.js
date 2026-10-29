// Slot rules for Home banners/ads between auto feed sections (PRD §11).
export const DEFAULT_SLOT = { mode: 'after', n: 2, cohortIds: [], city: 'Bengaluru', assetGroup: '', startDate: '', endDate: '', capPerDay: 2 };

const isPositiveInt = (v) => Number.isInteger(Number(v)) && Number(v) >= 1;

export const slotErrors = (slot) => ({
  ...(!isPositiveInt(slot.n) || Number(slot.n) > 12 ? { n: 'Whole number from 1 to 12' } : {}),
  ...(!isPositiveInt(slot.capPerDay) ? { capPerDay: 'At least 1' } : {}),
  ...(slot.startDate && slot.endDate && slot.endDate < slot.startDate ? { endDate: 'End is before start' } : {}),
});

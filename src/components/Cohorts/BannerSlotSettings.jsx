import React from 'react';
import { SegmentedControl, fieldClass, labelClass, hintClass } from '../cms-ui';
import CohortSelect from '../Popups/CohortSelect';
import { DEFAULT_SLOT, slotErrors } from './bannerSlot';

const MODES = [
  { value: 'after', label: 'After section N' },
  { value: 'every', label: 'Every N sections' },
];

const ASSET_GROUPS = ['Homes', 'Plots', 'Commercial'];

const FieldError = ({ text }) => (text ? <p className="text-[12px] text-danger mt-1">{text}</p> : null);

// Home banners/ads are placed between engine sections by these slot rules (PRD §11).
const BannerSlotSettings = ({ slot: savedSlot, cohorts, onChange }) => {
  const slot = { ...DEFAULT_SLOT, ...savedSlot };
  const errors = slotErrors(slot);
  const set = (key) => (value) => onChange({ ...slot, [key]: value });

  return (
    <div className="space-y-4 pt-4 mt-2 border-t border-separator">
      <div>
        <h4 className="text-[15px] font-semibold text-label">Slot rules</h4>
        <p className={`${hintClass} mt-0.5`}>Where this sits in the auto home feed. Banners and ads don't count toward the 10 sections.</p>
      </div>

      <div className="flex items-end gap-3">
        <SegmentedControl options={MODES} value={slot.mode} onChange={set('mode')} size="sm" />
        <div className="w-20">
          <label className={labelClass} htmlFor="slot-n">N</label>
          <input id="slot-n" type="number" min={1} max={12} value={slot.n} onChange={(e) => set('n')(e.target.value)} className={`${fieldClass} tabular-nums`} />
        </div>
      </div>
      <FieldError text={errors.n} />

      <div>
        <label className={labelClass}>Cohort</label>
        <CohortSelect cohorts={cohorts} selectedIds={slot.cohortIds} onChange={set('cohortIds')} />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass} htmlFor="slot-city">City</label>
          <select id="slot-city" value={slot.city} onChange={(e) => set('city')(e.target.value)} className={fieldClass}>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>
        <div className="flex-1">
          <label className={labelClass} htmlFor="slot-group">Asset group</label>
          <select id="slot-group" value={slot.assetGroup} onChange={(e) => set('assetGroup')(e.target.value)} className={fieldClass}>
            <option value="">All groups</option>
            {ASSET_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass} htmlFor="slot-start">Start</label>
          <input id="slot-start" type="date" value={slot.startDate} onChange={(e) => set('startDate')(e.target.value)} className={fieldClass} />
        </div>
        <div className="flex-1">
          <label className={labelClass} htmlFor="slot-end">End</label>
          <input id="slot-end" type="date" value={slot.endDate} onChange={(e) => set('endDate')(e.target.value)} className={fieldClass} />
          <FieldError text={errors.endDate} />
        </div>
      </div>

      <div className="w-40">
        <label className={labelClass} htmlFor="slot-cap">Frequency cap / day</label>
        <input id="slot-cap" type="number" min={1} value={slot.capPerDay} onChange={(e) => set('capPerDay')(e.target.value)} className={`${fieldClass} tabular-nums`} />
        <FieldError text={errors.capPerDay} />
      </div>
    </div>
  );
};

export default BannerSlotSettings;

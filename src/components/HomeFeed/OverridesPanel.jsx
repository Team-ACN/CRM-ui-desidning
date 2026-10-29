import React, { useState } from 'react';
import { Plus, Trash2, Pin, Ban } from 'lucide-react';
import { Button, IconButton, ListGroup, ListRow, cardClass, fieldClass, labelClass, hintClass } from '../cms-ui';
import { ASSET_TYPES, LISTING_TYPES, FEED_LOCATIONS } from '../../data/mockHomeFeed';

const LISTING_ID_RE = /^PB\d{3,}$/;

const EMPTY_PIN = { listingId: '', sectionTypeId: '', startDate: '', endDate: '', reason: 'Editorial' };
const EMPTY_BLOCK = { location: '', assetType: '', listingType: '' };

const pinError = (pin, pins) => {
  if (!LISTING_ID_RE.test(pin.listingId.trim())) return 'Listing ID like PB4201';
  if (!pin.sectionTypeId) return 'Pick a section type';
  if (!pin.startDate || !pin.endDate) return 'Pick a date range';
  if (pin.endDate < pin.startDate) return 'End date is before start date';
  const clash = pins.some((p) => String(p.sectionTypeId) === String(pin.sectionTypeId) && p.startDate <= pin.endDate && pin.startDate <= p.endDate);
  return clash ? 'Another pin holds position 1 of this section type in that range' : null;
};

const Select = ({ id, value, onChange, placeholder, options }) => (
  <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const asOptions = (list) => list.map((v) => ({ value: v, label: v }));

const PinForm = ({ sectionTypes, pins, onAdd }) => {
  const [pin, setPin] = useState(EMPTY_PIN);
  const [touched, setTouched] = useState(false);
  const error = pinError(pin, pins);
  const set = (key) => (value) => setPin((prev) => ({ ...prev, [key]: value }));

  const add = () => {
    setTouched(true);
    if (error) return;
    onAdd({ ...pin, listingId: pin.listingId.trim(), sectionTypeId: Number(pin.sectionTypeId) });
    setPin(EMPTY_PIN);
    setTouched(false);
  };

  return (
    <div className={`${cardClass} p-4 space-y-3`}>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className={labelClass} htmlFor="pin-listing">Listing ID</label>
          <input id="pin-listing" value={pin.listingId} onChange={(e) => set('listingId')(e.target.value)} placeholder="PB4201" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="pin-type">Section type</label>
          <Select id="pin-type" value={pin.sectionTypeId} onChange={set('sectionTypeId')} placeholder="Select…"
            options={sectionTypes.filter((t) => t.enabled).map((t) => ({ value: t.id, label: `#${t.id} ${t.name}` }))} />
        </div>
        <div>
          <label className={labelClass} htmlFor="pin-start">Start</label>
          <input id="pin-start" type="date" value={pin.startDate} onChange={(e) => set('startDate')(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="pin-end">End</label>
          <input id="pin-end" type="date" value={pin.endDate} onChange={(e) => set('endDate')(e.target.value)} className={fieldClass} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className={touched && error ? 'text-[12px] text-danger' : hintClass}>
          {touched && error ? error : 'Pin is skipped for any agent where the listing fails the section criteria or exclusions. A pin never creates a section.'}
        </p>
        <Button icon={Plus} onClick={add}>Add pin</Button>
      </div>
    </div>
  );
};

const BlockForm = ({ blockRules, onAdd }) => {
  const [rule, setRule] = useState(EMPTY_BLOCK);
  const set = (key) => (value) => setRule((prev) => ({ ...prev, [key]: value }));
  const complete = rule.location && rule.assetType && rule.listingType;
  const duplicate = blockRules.some((r) => r.location === rule.location && r.assetType === rule.assetType && r.listingType === rule.listingType);

  return (
    <div className={`${cardClass} p-4 flex items-end gap-3`}>
      <div className="flex-1">
        <label className={labelClass} htmlFor="blk-loc">Location</label>
        <Select id="blk-loc" value={rule.location} onChange={set('location')} placeholder="Micromarket or zone" options={asOptions(FEED_LOCATIONS)} />
      </div>
      <div className="flex-1">
        <label className={labelClass} htmlFor="blk-asset">Asset type</label>
        <Select id="blk-asset" value={rule.assetType} onChange={set('assetType')} placeholder="Select…" options={asOptions(ASSET_TYPES)} />
      </div>
      <div className="w-36">
        <label className={labelClass} htmlFor="blk-listing">Listing type</label>
        <Select id="blk-listing" value={rule.listingType} onChange={set('listingType')} placeholder="Select…" options={asOptions(LISTING_TYPES)} />
      </div>
      <Button icon={Plus} disabled={!complete || duplicate} onClick={() => { onAdd(rule); setRule(EMPTY_BLOCK); }}>
        {duplicate ? 'Exists' : 'Add rule'}
      </Button>
    </div>
  );
};

const OverridesPanel = ({ sectionTypes, pins, blockRules, onAddPin, onRemovePin, onAddBlockRule, onRemoveBlockRule }) => {
  const typeName = (id) => sectionTypes.find((t) => t.id === id)?.name ?? 'Unknown';

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-label"><Pin size={15} strokeWidth={1.75} /> Pinned listings</h3>
        <PinForm sectionTypes={sectionTypes} pins={pins} onAdd={onAddPin} />
        {pins.length > 0 && (
          <ListGroup>
            {pins.map((p) => (
              <ListRow key={p.id}>
                <span className="text-[14px] font-medium text-label tabular-nums w-20">{p.listingId}</span>
                <span className="flex-1 text-[13px] text-secondary">Position 1 of #{p.sectionTypeId} {typeName(p.sectionTypeId)} · {p.startDate} → {p.endDate}</span>
                <IconButton icon={Trash2} label={`Remove pin ${p.listingId}`} onClick={() => onRemovePin(p.id)} />
              </ListRow>
            ))}
          </ListGroup>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-label"><Ban size={15} strokeWidth={1.75} /> Block rules</h3>
        <p className={hintClass}>The engine never generates a section for a blocked location × asset type × listing type.</p>
        <BlockForm blockRules={blockRules} onAdd={onAddBlockRule} />
        {blockRules.length > 0 && (
          <ListGroup>
            {blockRules.map((r) => (
              <ListRow key={r.id}>
                <span className="flex-1 text-[14px] text-label">{r.location} · {r.assetType} · {r.listingType}</span>
                <IconButton icon={Trash2} label="Remove block rule" onClick={() => onRemoveBlockRule(r.id)} />
              </ListRow>
            ))}
          </ListGroup>
        )}
      </section>
    </div>
  );
};

export default OverridesPanel;

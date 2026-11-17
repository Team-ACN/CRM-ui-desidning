import React, { useState } from 'react';
import { Archive, RotateCcw } from 'lucide-react';
import StatusTag from './StatusTag';
import { Drawer, Button, Chip, Switch, SegmentedControl, useToast } from './index';
import { formatInr } from './formatInr';
import {
  getComponent,
  createComponent,
  updateComponent,
  setComponentStatus,
  INVENTORY_ASSET_TYPES,
  INVENTORY_CONFIGS,
  INVENTORY_ZONES,
} from '../../data/mockCms';

const inputClass =
  'w-full h-9 px-3 rounded-[10px] bg-neutral-100 text-[14px] text-label placeholder:text-tertiary border border-transparent outline-none transition-colors focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100';

const BLANK = {
  heading: '',
  assetType: '',
  configs: [],
  zone: '',
  priceMin: '',
  priceMax: '',
  plotAreaMin: '',
  plotAreaMax: '',
  sbuaMin: '',
  sbuaMax: '',
  mustHaveMedia: false,
  propertyIds: [],
};

const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-label mb-1.5">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder, format }) {
  return (
    <Field label={label}>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
        placeholder={placeholder}
        className={inputClass}
      />
      {format && value && <p className="mt-1 text-[12px] font-medium text-secondary">{format(value)}</p>}
    </Field>
  );
}

const InventoryDrawer = ({ id, onClose, onChanged }) => {
  const isNew = !id;
  const existing = id ? getComponent(id) : null;
  const toast = useToast();

  const [cfg, setCfg] = useState({ ...BLANK, ...(existing?.config || {}) });
  const [mode, setMode] = useState(existing?.config?.propertyIds?.length ? 'manual' : 'rule');
  const [idInput, setIdInput] = useState('');

  const set = (patch) => setCfg((cur) => ({ ...cur, ...patch }));
  const manual = mode === 'manual';

  const invalidReason = !cfg.heading.trim()
    ? 'Section heading is required'
    : manual
    ? cfg.propertyIds.length === 0
      ? 'Add at least one property ID'
      : null
    : !cfg.assetType
    ? 'Pick an asset type'
    : !cfg.zone
    ? 'Pick a zone'
    : cfg.priceMin && cfg.priceMax && Number(cfg.priceMin) > Number(cfg.priceMax)
    ? 'Price min is higher than price max'
    : cfg.sbuaMin && cfg.sbuaMax && Number(cfg.sbuaMin) > Number(cfg.sbuaMax)
    ? 'SBUA min is higher than SBUA max'
    : null;

  function addPropertyId() {
    const value = idInput.trim().toUpperCase();
    if (!value) return;
    set({ propertyIds: [...new Set([...cfg.propertyIds, value])] });
    setIdInput('');
  }

  function handleArchiveToggle() {
    const archiving = existing.status !== 'archived';
    const previous = existing.status;
    setComponentStatus(id, archiving ? 'archived' : 'inactive');
    toast(archiving ? `Archived '${existing.internalName}'` : `Restored '${existing.internalName}'`, {
      undo: () => {
        setComponentStatus(id, previous);
        onChanged();
      },
    });
    onChanged();
    onClose();
  }

  function handleSave() {
    if (invalidReason) return;
    const payload = { internalName: cfg.heading.trim(), config: { ...cfg, propertyIds: manual ? cfg.propertyIds : [] } };
    if (isNew) {
      const created = createComponent({ type: 'inventory', surfaces: [] });
      updateComponent(created.id, payload);
    } else {
      updateComponent(id, payload);
    }
    toast('Saved');
    onChanged();
    onClose();
  }

  // Active components can't be archived; an inactive one can, and an archived one can be restored.
  const archiveBtn =
    isNew || existing.status === 'live' ? null : (
      <button
        type="button"
        onClick={handleArchiveToggle}
        className="h-8 px-3 rounded-full border border-neutral-200 flex items-center gap-1.5 text-[12.5px] font-medium text-neutral-600 hover:bg-neutral-50/40 hover:text-neutral-900"
      >
        {existing.status === 'archived' ? <RotateCcw size={13} /> : <Archive size={13} />}
        {existing.status === 'archived' ? 'Restore' : 'Archive'}
      </button>
    );



  return (
    <Drawer
      title={isNew ? 'New Inventory' : cfg.heading || existing.internalName}
      onClose={onClose}
      status={!isNew && <StatusTag status={existing.status} />}
      headerActions={archiveBtn}
      footer={
        <div className="w-full">
          <Button variant="primary" className="w-full" disabled={!!invalidReason} onClick={handleSave}>
            {isNew ? 'Create' : 'Save'}
          </Button>
          {invalidReason && <p className="mt-1.5 text-[12px] text-danger text-center">{invalidReason}</p>}
        </div>
      }
    >
      <div className="space-y-5">
        <SegmentedControl
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'rule', label: 'Rule' },
            { value: 'manual', label: 'Manual' },
          ]}
        />

        <Field label="Section heading" required>
          <input type="text" value={cfg.heading} onChange={(e) => set({ heading: e.target.value })} placeholder="e.g. Featured Properties" className={inputClass} />
        </Field>

        {manual ? (
          <div>
            <p className="text-[13px] font-medium text-label">Property IDs</p>
            {cfg.propertyIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {cfg.propertyIds.map((pid) => (
                  <Chip key={pid} label={pid} onRemove={() => set({ propertyIds: cfg.propertyIds.filter((v) => v !== pid) })} />
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPropertyId()}
                placeholder="e.g. PB3864"
                className={inputClass}
              />
              <Button size="sm" onClick={addPropertyId} disabled={!idInput.trim()}>
                Add
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <Field label="Asset type" required>
              <div className="flex flex-wrap gap-1.5">
                {INVENTORY_ASSET_TYPES.map((t) => (
                  <Chip key={t} label={t} selected={cfg.assetType === t} onClick={() => set({ assetType: cfg.assetType === t ? '' : t })} />
                ))}
              </div>
            </Field>

            <Field label="Configuration">
              <div className="flex flex-wrap gap-1.5">
                {INVENTORY_CONFIGS.map((t) => (
                  <Chip key={t} label={t} selected={cfg.configs.includes(t)} onClick={() => set({ configs: toggle(cfg.configs, t) })} />
                ))}
              </div>
            </Field>

            <Field label="Zone" required>
              <div className="flex flex-wrap gap-1.5">
                {INVENTORY_ZONES.map((t) => (
                  <Chip key={t} label={t} selected={cfg.zone === t} onClick={() => set({ zone: cfg.zone === t ? '' : t })} />
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Price min (₹)" value={cfg.priceMin} onChange={(v) => set({ priceMin: v })} placeholder="e.g. 5000000" format={formatInr} />
              <NumberField label="Price max (₹)" value={cfg.priceMax} onChange={(v) => set({ priceMax: v })} placeholder="e.g. 20000000" format={formatInr} />
              <NumberField label="Plot area (sq.ft) min" value={cfg.plotAreaMin} onChange={(v) => set({ plotAreaMin: v })} placeholder="e.g. 1200" />
              <NumberField label="Plot area (sq.ft) max" value={cfg.plotAreaMax} onChange={(v) => set({ plotAreaMax: v })} placeholder="e.g. 2400" />
              <NumberField label="SBUA (sq.ft) min" value={cfg.sbuaMin} onChange={(v) => set({ sbuaMin: v })} placeholder="e.g. 1000" />
              <NumberField label="SBUA (sq.ft) max" value={cfg.sbuaMax} onChange={(v) => set({ sbuaMax: v })} placeholder="e.g. 3000" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-label">Must have images / video</span>
              <Switch checked={cfg.mustHaveMedia} onChange={(v) => set({ mustHaveMedia: v })} />
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default InventoryDrawer;

import React, { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, ChevronDown, ChevronUp, X, Image as ImageIcon, Archive, RotateCcw } from 'lucide-react';
import StatusTag from './StatusTag';
import { Drawer, Button, Switch, UploadZone, useToast } from './index';
import { getCards, itemFromCard, getComponent, createComponent, updateComponent, setComponentStatus, COMPONENT_TYPES } from '../../data/mockCms';
import ImageColorPicker from './ImageColorPicker';
import PostStats from './PostStats';

const inputClass =
  'w-full h-9 px-3 rounded-[10px] bg-neutral-100 text-[14px] text-label placeholder:text-tertiary border border-transparent outline-none transition-colors focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100';

const isValidHex = (value) => /^#[0-9A-Fa-f]{6}$/.test(value || '');

function blankItem() {
  return { name: '', id: `itm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, linkUrl: '', appendCpid: false, description: '', startDate: '', endDate: '', imageUrl: null };
}

const ComponentDrawer = ({ id, initialType, onClose, onChanged }) => {
  const isNew = !id;
  const existing = id ? getComponent(id) : null;
  const type = existing?.type || initialType;
  const meta = COMPONENT_TYPES[type];
  const hasColor = type === 'mobile_top_banner';
  const toast = useToast();

  const [internalName, setInternalName] = useState(existing?.internalName || '');
  const [color, setColor] = useState(existing?.color || '');
  const [pickingColor, setPickingColor] = useState(false);
  const [items, setItems] = useState(existing?.items?.length ? existing.items : meta.carousel ? [] : [blankItem()]);
  const [picking, setPicking] = useState(false);
  const availableCards = getCards(type).filter((c) => !items.some((it) => it.cardId === c.id));
  const iconBtnCls = 'w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent shrink-0';

  const invalidReason =
    items.length < meta.minItems
      ? `Needs at least ${meta.minItems} card${meta.minItems === 1 ? '' : 's'} (${items.length} now)`
      : items.some((it) => !it.imageUrl)
      ? 'Every post needs an image'
      : items.some((it) => !it.linkUrl?.trim())
      ? 'Every post needs a link URL'
      : hasColor && color && !isValidHex(color)
      ? 'Colour must be a hex code like #1A2B3C'
      : null;

  function updateItem(itemId, patch) {
    setItems((cur) => cur.map((it) => (it.id === itemId ? { ...it, ...patch } : it)));
  }

  function moveItem(index, delta) {
    setItems((cur) => {
      const next = index + delta;
      return next < 0 || next >= cur.length ? cur : arrayMove(cur, index, next);
    });
  }

  function copyList(list, label) {
    navigator.clipboard?.writeText(list.join('\n')).then(() => toast(`Copied ${list.length} ${label} CPIDs`));
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



  function handleSave() {
    if (invalidReason) return;
    const name = meta.carousel ? items[0].name.trim() : internalName.trim() || 'Untitled component';
    const payload = { internalName: name, items, ...(hasColor ? { color } : {}) };
    if (isNew) {
      const created = createComponent({ type, surfaces: [] });
      updateComponent(created.id, payload);
    } else {
      updateComponent(id, payload);
    }
    toast('Saved');
    onChanged();
    onClose();
  }

  return (
    <Drawer
      title={isNew ? `Make ${meta.label}` : meta.carousel ? existing.internalName : internalName || existing.internalName}
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
        {!meta.carousel && (
          <div>
            <label className="block text-[13px] font-medium text-label mb-1.5">Name</label>
            <input type="text" value={internalName} onChange={(e) => setInternalName(e.target.value)} placeholder={`e.g. ${meta.label}`} className={inputClass} />
          </div>
        )}

        {meta.carousel ? (
          <div>
            {!isNew && (
              <div className="mb-4 pb-4 border-b border-separator">
                <p className="text-[12px] font-medium text-label mb-1.5">Overall</p>
                <PostStats analytics={existing.analytics} onCopy={copyList} />
              </div>
            )}
            <p className={`text-[12px] font-medium mb-2 ${items.length >= meta.minItems ? 'text-positive' : 'text-warning'}`}>
              {items.length} of minimum {meta.minItems} cards
            </p>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2.5 rounded-xl border border-neutral-200 p-2">
                  <div className="w-12 shrink-0 rounded-md overflow-hidden bg-fill flex items-center justify-center" style={{ aspectRatio: meta.ratio.replace(':', ' / ') }}>
                    {item.imageUrl ? <img src={item.imageUrl.url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-tertiary" />}
                  </div>
                  <p className="min-w-0 flex-1 text-[13px] font-medium text-label truncate">{item.name}</p>
                  <button type="button" title="Move up" disabled={index === 0} onClick={() => moveItem(index, -1)} className={iconBtnCls}><ChevronUp size={15} /></button>
                  <button type="button" title="Move down" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)} className={iconBtnCls}><ChevronDown size={15} /></button>
                  <button type="button" title="Remove" onClick={() => setItems((cur) => cur.filter((i) => i.id !== item.id))} className={iconBtnCls}><X size={14} /></button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPicking((v) => !v)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 text-secondary hover:text-label hover:border-neutral-400 text-[13px] font-medium transition-colors"
            >
              <Plus size={14} /> Add card
            </button>
            {picking && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {availableCards.length === 0 && <p className="col-span-3 text-[12px] text-secondary text-center py-3">No more cards.</p>}
                {availableCards.map((c) => (
                  <button key={c.id} type="button" onClick={() => setItems((cur) => [...cur, itemFromCard(c)])} className="text-left rounded-lg border border-neutral-200 overflow-hidden hover:border-neutral-900">
                    <div className="bg-fill" style={{ aspectRatio: meta.ratio.replace(':', ' / ') }}>
                      {c.imageUrl && <img src={c.imageUrl.url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <p className="px-1.5 py-1 text-[11px] font-medium text-label truncate">{c.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <PostStats analytics={items[0].analytics || existing?.analytics} onCopy={copyList} />
            <UploadZone
              label="Image"
              ratio={meta.ratio}
              safe={type === 'desktop_top_banner' ? { left: 720 / 1440, width: 600 / 1440 } : undefined}
              value={items[0].imageUrl} onChange={(v) => updateItem(items[0].id, { imageUrl: v })} />
            {hasColor && (
              <ColorRow
                value={color}
                canSample={!!items[0].imageUrl}
                onChange={setColor}
                onSample={() => setPickingColor(true)}
              />
            )}
            <LinkFields item={items[0]} onChange={(patch) => updateItem(items[0].id, patch)} />
          </>
        )}
      </div>
      {pickingColor && items[0].imageUrl && (
        <ImageColorPicker
          src={items[0].imageUrl.url}
          onClose={() => setPickingColor(false)}
          onPick={(hex) => {
            setColor(hex);
            setPickingColor(false);
          }}
        />
      )}
    </Drawer>
  );
};

export function LinkFields({ item, onChange }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-label mb-1.5">Link URL</label>
      <input type="text" value={item.linkUrl} onChange={(e) => onChange({ linkUrl: e.target.value })} placeholder="https://acn.app/..." className={inputClass} />
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[13px] text-secondary">Append CPID</span>
        <Switch checked={item.appendCpid} onChange={(v) => onChange({ appendCpid: v })} />
      </div>
      {item.appendCpid && item.linkUrl && (
        <p className="mt-1.5 text-[11px] text-tertiary truncate">{`${item.linkUrl}${item.linkUrl.includes('?') ? '&' : '?'}cpid={cpid}`}</p>
      )}
    </div>
  );
}

function ColorRow({ value, canSample, onChange, onSample }) {
  const valid = isValidHex(value);
  return (
    <div>
      <label className="block text-[13px] font-medium text-label mb-1.5">Top card colour</label>
      <div className="flex items-center gap-2">
        <div className={`flex-1 flex items-center gap-2 pl-1.5 pr-3 h-9 rounded-[10px] bg-neutral-100 ${value && !valid ? 'ring-1 ring-danger' : ''}`}>
          <input
            type="color"
            value={valid ? value : '#000000'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent p-0 shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder="#1A2B3C"
            className="flex-1 min-w-0 bg-transparent text-[13px] font-mono text-label placeholder:text-tertiary outline-none"
          />
        </div>
        <Button size="sm" disabled={!canSample} onClick={onSample}>
          Pick from image
        </Button>
      </div>
    </div>
  );
}

export default ComponentDrawer;

import React, { useState } from 'react';
import { Archive, Copy, Eye, MousePointerClick, Pipette, Plus, Search, X } from 'lucide-react';
import { Button, Drawer, SegmentedControl, Switch, UploadZone, useToast } from '../index';
import { getCohorts } from '../../../data/mockCms';
import { POPUP_CREATIVE, createPopup, getPopup, popupButtonCpids, setPopupStatus, updatePopup } from '../../../data/mockPopups';
import ImageColorPicker from '../ImageColorPicker';
import PopupSheetPreview from './PopupSheetPreview';
import { isHex } from './contrast';

const inputClass =
  'w-full h-10 px-3 rounded-[10px] bg-neutral-100 text-[14px] text-label placeholder:text-tertiary border border-transparent outline-none transition-colors focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100';

const BLANK = {
  name: '',
  page: 'home',
  creative: null,
  destination: '',
  triggerEvent: '', // event key the app raises, e.g. enquiry_submitted
  toast: '',
  closeCorner: 'top_right',
  dividerLabel: '',
  bg: '#1E40AF',
  appendCpid: true,
  hideAfterClick: true,
  audience: [],
  maxShows: 1,
  minGapH: '',
};

const TRIGGER_EVENTS = [
  ['add_inventory_success', 'Inventory added'],
  ['enquiry_submitted', 'Enquiry submitted'],
  ['profile_completed', 'Profile completed'],
];

const BTN_DEFAULT = { label: '', url: '', bg: '#E5E5E5', text: '#171717' };

// Readable text on the strip: white on dark colours, near-black on light ones.
function textOn(hex) {
  if (!isHex(hex)) return '#FAFAFA';
  const n = parseInt(hex.slice(1), 16);
  const y = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return y > 0.6 ? '#171717' : '#FAFAFA';
}

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[13px] font-medium text-label mb-1.5">{label}</label>
    {children}
  </div>
);

const Group = ({ title, children }) => (
  <section className="space-y-4 pt-6 mt-6 border-t border-separator first:pt-0 first:mt-0 first:border-0">
    {title && <h3 className="text-[13px] font-semibold text-label">{title}</h3>}
    {children}
  </section>
);

// Swatch + hex text, so a colour can be typed or picked.
function ColorText({ value, onChange, onPick, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input type="color" value={isHex(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} className="w-10 h-10 rounded-[10px] border border-neutral-200 bg-white p-1 cursor-pointer shrink-0" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} placeholder="#FFFFFF" className={`${inputClass} font-mono min-w-0`} />
      {onPick && (
        <button type="button" title="Pick from image" onClick={onPick} className="w-10 h-10 rounded-[10px] bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 shrink-0">
          <Pipette size={15} />
        </button>
      )}
    </div>
  );
}

const PopupEditor = ({ id, surface = 'app', onClose, onChanged }) => {
  const toast = useToast();
  const existing = id ? getPopup(id) : null;
  const [form, setForm] = useState(() => ({ ...BLANK, surface, ...(existing || {}) }));
  const [btns, setBtns] = useState(() => {
    const n = existing ? (existing.layout === 'two' ? 2 : existing.layout === 'one' ? 1 : 0) : 0;
    return (existing?.ctas || []).slice(0, n).map((c) => ({ ...BTN_DEFAULT, ...c }));
  });
  const [active, setActive] = useState(existing ? existing.status === 'live' : true);
  const [picking, setPicking] = useState(null); // where the picked colour goes: 'strip' | { i, k }
  const [evFocus, setEvFocus] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [search, setSearch] = useState('');
  const set = (patch) => setForm((cur) => ({ ...cur, ...patch }));
  const setBtn = (i, patch) => setBtns((cur) => cur.map((b, k) => (k === i ? { ...b, ...patch } : b)));

  const spec = POPUP_CREATIVE[form.surface];
  const cohorts = getCohorts().filter((c) => c.status !== 'archived');
  const q = search.trim().toLowerCase();
  const matches = cohorts.filter((c) => !form.audience.includes(c.id) && c.name.toLowerCase().includes(q));
  const isUrl = (v) => /^https?:\/\/\S+/.test(v);
  const noButtons = btns.length === 0;
  const evQ = form.triggerEvent.trim().toLowerCase();
  const evMatches = TRIGGER_EVENTS.filter(([k, lbl]) => k !== form.triggerEvent && (k.includes(evQ) || lbl.toLowerCase().includes(evQ)));
  const layout = btns.length === 2 ? 'two' : btns.length === 1 ? 'one' : 'none';

  const fixes = [];
  if (!form.name.trim()) fixes.push('Name');
  if (!form.creative) fixes.push('Image');
  if (form.destination && !isUrl(form.destination)) fixes.push('Image link');
  btns.forEach((b, i) => {
    if (!b.label.trim()) fixes.push(`Button ${i + 1} label`);
    if (!isUrl(b.url)) fixes.push(`Button ${i + 1} URL`);
  });
  if (!form.triggerEvent.trim()) fixes.push('Trigger event');
  if (!(Number(form.maxShows) >= 1)) fixes.push('Max shows');

  function save() {
    const payload = {
      ...form,
      name: form.name.trim(),
      triggerEvent: form.triggerEvent.trim(),
      toast: form.toast.trim(),
      destination: noButtons ? form.destination : '',
      maxShows: Number(form.maxShows) || 1,
      layout,
      ctas: btns,
      dividerLabel: btns.length ? form.dividerLabel : '',
      colorMode: 'manual',
      text: textOn(form.bg),
      audienceLabel: form.audience.length ? form.audience.map((cid) => cohorts.find((c) => c.id === cid)?.name || cid).join(', ') : 'All users',
      status: active ? 'live' : 'paused',
    };
    if (existing) updatePopup(existing.id, payload);
    else createPopup(payload);
    toast('Saved');
    onChanged();
    onClose();
  }

  function archive() {
    const prev = existing.status;
    setPopupStatus(existing.id, 'archived');
    toast(`Archived '${existing.name}'`, {
      undo: () => {
        setPopupStatus(existing.id, prev);
        onChanged();
      },
    });
    onChanged();
    onClose();
  }

  function copy(list, label) {
    navigator.clipboard?.writeText(list.join('\n')).then(() => toast(`Copied ${list.length} ${label} CPIDs`));
  }

  return (
    <Drawer
      title={existing ? existing.name : ''}
      onClose={onClose}
      width="max-w-[480px]"
      headerActions={
        <div className="flex items-center gap-2">
          <Button size="sm" icon={Eye} onClick={() => setPreviewing(true)}>
            Preview
          </Button>
          {existing && existing.status !== 'live' && existing.status !== 'archived' && (
            <button type="button" title="Archive" onClick={archive} className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-danger">
              <Archive size={15} />
            </button>
          )}
        </div>
      }
      footer={
        <div className="w-full">
          <Button variant="primary" className="w-full" disabled={fixes.length > 0} onClick={save}>
            {existing ? 'Save' : 'Create'}
          </Button>
          {fixes.length > 0 && <p className="mt-2 text-[12px] text-warning text-center">Needs: {fixes.join(' · ')}</p>}
        </div>
      }
    >
      <Group>
        <Field label="Name">
          <input type="text" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Demante Event" className={inputClass} />
        </Field>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SegmentedControl
            size="sm"
            value={active ? 'active' : 'disabled'}
            onChange={(v) => setActive(v === 'active')}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'disabled', label: 'Disabled' },
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-secondary">Close</span>
            <SegmentedControl
              size="sm"
              value={form.closeCorner}
              onChange={(v) => set({ closeCorner: v })}
              options={[
                { value: 'top_left', label: 'Top left' },
                { value: 'top_right', label: 'Top right' },
              ]}
            />
          </div>
        </div>
        <div className={form.surface === 'app' ? 'w-[45%]' : 'w-full'}>
          <UploadZone label="" ratio={spec.ratio} value={form.creative} onChange={(v) => set({ creative: v })} />
        </div>
        <Field label="Strip colour">
          <div className="flex items-center gap-2">
            <ColorText value={form.bg} onChange={(v) => set({ bg: v })} className="flex-1" />
            <Button size="sm" disabled={!form.creative?.url} onClick={() => setPicking('strip')}>
              From image
            </Button>
          </div>
        </Field>
      </Group>

      <Group title="Buttons">
        {!noButtons && (
          <Field label="Divider text">
            <input type="text" value={form.dividerLabel} onChange={(e) => set({ dividerLabel: e.target.value })} placeholder="TRY IT YOURSELF" className={inputClass} />
          </Field>
        )}
        {btns.map((b, i) => {
          const clickers = existing ? popupButtonCpids(existing, i, btns.length) : [];
          return (
            <div key={i} className="rounded-xl border border-neutral-200 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input type="text" value={b.label} onChange={(e) => setBtn(i, { label: e.target.value })} placeholder={`Button ${i + 1} label`} className={inputClass} />
                <button type="button" title="Remove" onClick={() => setBtns((cur) => cur.filter((_, k) => k !== i))} className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 shrink-0">
                  <X size={15} />
                </button>
              </div>
              <input type="text" value={b.url} onChange={(e) => setBtn(i, { url: e.target.value })} placeholder="https://..." className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[12px] text-secondary mb-1">Background</p>
                  <ColorText value={b.bg} onChange={(v) => setBtn(i, { bg: v })} onPick={form.creative?.url ? () => setPicking({ i, k: 'bg' }) : undefined} />
                </div>
                <div>
                  <p className="text-[12px] text-secondary mb-1">Text</p>
                  <ColorText value={b.text} onChange={(v) => setBtn(i, { text: v })} onPick={form.creative?.url ? () => setPicking({ i, k: 'text' }) : undefined} />
                </div>
              </div>
              {existing && (
                <p className="flex items-center gap-1.5 text-[12px] text-secondary tabular-nums">
                  <MousePointerClick size={12} /> {clickers.length} people · {Math.round(clickers.length * 1.25)} clicks
                  <button type="button" title="Copy CPIDs who clicked" onClick={() => copy(clickers, 'clicker')} className="text-tertiary hover:text-neutral-900">
                    <Copy size={12} />
                  </button>
                </p>
              )}
            </div>
          );
        })}
        {btns.length < 2 && (
          <button
            type="button"
            onClick={() => setBtns((cur) => [...cur, { ...BTN_DEFAULT }])}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 text-secondary hover:text-label hover:border-neutral-400 text-[13px] font-medium transition-colors"
          >
            <Plus size={14} /> Add button
          </button>
        )}
        {noButtons && (
          <Field label="Image link">
            <input type="text" value={form.destination} onChange={(e) => set({ destination: e.target.value })} placeholder="https://..." className={inputClass} />
          </Field>
        )}
        <Field label="Toast">
          <input type="text" value={form.toast} maxLength={80} onChange={(e) => set({ toast: e.target.value })} placeholder="Shown after a tap" className={inputClass} />
        </Field>
      </Group>

      <Group title="Who sees it">
        {form.audience.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.audience.map((cid) => (
              <span key={cid} className="inline-flex items-center gap-1 h-8 pl-3 pr-2 rounded-full bg-neutral-900 text-white text-[13px]">
                {cohorts.find((c) => c.id === cid)?.name || cid}
                <button type="button" onClick={() => set({ audience: form.audience.filter((x) => x !== cid) })} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cohorts" className={`${inputClass} pl-9`} />
          </div>
          {q && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-neutral-200 divide-y divide-separator">
              {matches.length === 0 ? (
                <p className="px-3 py-3 text-[13px] text-tertiary">No cohorts.</p>
              ) : (
                matches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      set({ audience: [...form.audience, c.id] });
                      setSearch('');
                    }}
                    className="w-full text-left px-3 py-2.5 text-[14px] text-label hover:bg-neutral-50"
                  >
                    {c.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </Group>

      <Group title="Trigger">
        <div className="relative">
          <input
            type="text"
            value={form.triggerEvent}
            onChange={(e) => set({ triggerEvent: e.target.value })}
            onFocus={() => setEvFocus(true)}
            onBlur={() => setTimeout(() => setEvFocus(false), 120)}
            placeholder="Search event"
            className={`${inputClass} font-mono`}
          />
          {evFocus && form.triggerEvent.trim() && evMatches.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 rounded-xl border border-neutral-200 bg-white shadow-raised divide-y divide-separator overflow-hidden">
              {evMatches.map(([k, lbl]) => (
                <button key={k} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { set({ triggerEvent: k }); setEvFocus(false); }} className="w-full text-left px-3 py-2.5 hover:bg-neutral-50">
                  <span className="block text-[14px] text-label">{lbl}</span>
                  <span className="block text-[12px] text-tertiary font-mono">{k}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Group>

      <Group title="How often">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Max shows">
            <input type="text" inputMode="numeric" value={form.maxShows} onChange={(e) => set({ maxShows: e.target.value.replace(/[^\d]/g, '') })} className={inputClass} />
          </Field>
          <Field label="Gap (hours)">
            <input type="text" inputMode="numeric" value={form.minGapH} onChange={(e) => set({ minGapH: e.target.value.replace(/[^\d]/g, '') })} placeholder="—" className={inputClass} />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[14px] text-label">Hide after click</span>
          <Switch checked={form.hideAfterClick} onChange={(v) => set({ hideAfterClick: v })} />
        </div>
      </Group>

      {previewing && (
        <PopupSheetPreview
          surface={form.surface}
          ratio={spec.ratio}
          closeCorner={form.closeCorner}
          image={form.creative?.url}
          bg={form.bg}
          text={textOn(form.bg)}
          divider={btns.length ? form.dividerLabel : ''}
          buttons={btns}
          onClose={() => setPreviewing(false)}
        />
      )}

      {picking && form.creative?.url && (
        <ImageColorPicker src={form.creative.url} onClose={() => setPicking(null)} onPick={(hex) => { if (picking === 'strip') set({ bg: hex }); else setBtn(picking.i, { [picking.k]: hex }); setPicking(null); }} />
      )}
    </Drawer>
  );
};

export default PopupEditor;

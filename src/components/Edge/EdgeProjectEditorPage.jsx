import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Check, Clock, HardHat, Loader2, Rocket, ShieldCheck, Trash2, ChevronDown, ChevronUp, Plus, CalendarDays, UploadCloud, FileText
} from 'lucide-react';
import { getProject, createProject, updateProject, deleteProject, blankProject, getBuilders, LAYOUTS } from '../../data/mockEdge';

const CONFIGS = ['Studio', '1BHK', '1.5BHK', '2BHK', '2.5BHK', '3BHK', '3.5BHK', '4BHK', '4.5BHK', '5BHK', '5.5BHK', '6BHK'];

function blank() {
  return projectToForm({ id: '', created_at: '', ...blankProject() });
}

function projectToForm(p) {
  return {
    id: p.id, name: p.name, codename: p.codename ?? '',
    description: p.description ?? '',
    launch_status: p.launch_status ?? '', cover_image_url: p.cover_image_url ?? '',
    notif_image: p.notif_image ?? '',
    zone: p.zone ?? '', micromarket: p.micromarket ?? '',
    corridor: (p.corridor ?? []).join(', '),
    latitude: p.latitude?.toString() ?? '', longitude: p.longitude?.toString() ?? '',
    kml_file_url: p.kml_file_url ?? '', pricing: p.pricing ?? '',
    land_area_acres: p.land_area_acres?.toString() ?? '',
    total_units: p.total_units?.toString() ?? '', floor: p.floor ?? '',
    layouts: p.layouts ?? [], configurations: p.configurations ?? [],
    phase_details: p.phase_details ?? [],
    master_plan_url: p.master_plan_url ?? '', brochure_url: p.brochure_url ?? '',
    images: p.images ?? [],
    builder_id: p.builder_id ?? '',
    rawBuilderName: p.rawBuilderName ?? '',
    restackProjectId: p.restackProjectId ?? '',
    created_at: p.created_at ?? '',
    published_at: p.published_at ? p.published_at.slice(0, 16) : '',
    status: p.status ?? 'drafted',
  };
}

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

const inp = 'w-full bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800 focus:border-neutral-400 focus:shadow-sm outline-none transition-all placeholder:text-stone-300';

// A "tinted" field is one whose current value came from Restack — it stays fully editable,
// the darker background is just a cue, not a lock. Untinted (empty, or not Restack-synced) is
// a normal-looking input.
function fieldCls(tinted, extra = '') {
  return `${inp} ${extra} ${tinted ? 'bg-stone-100 border-stone-300' : ''}`;
}

function FieldLabel({ children }) {
  return (
    <label className="text-sm font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
      {children}
    </label>
  );
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatHourLabel(h) {
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${period}`;
}

function formatTimeLabel(h, m) {
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

// A date-only field styled like every other input in this form — the underlying native
// <input type="date"> is kept (for its picker) but visually hidden behind a normal-looking
// button showing a readable date, instead of the browser's inconsistent raw date input UI.
function DateField({ value, onChange, tinted }) {
  const dateInputRef = useRef(null);
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  const formatted = parsed && !isNaN(parsed.getTime())
    ? parsed.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click())}
        className={`${fieldCls(tinted)} flex items-center justify-between text-left`}
      >
        <span className={formatted ? '' : 'text-stone-300'}>{formatted || 'Select date'}</span>
        <CalendarDays size={16} className="text-stone-400 shrink-0" />
      </button>
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  );
}

// Quick-pick date cards (Today, Tmw, next 5 days) + an 8th "pick any date" card, then hourly
// slots from 8 AM to 8 PM — replaces the plain datetime-local input with something people can
// actually scan and tap through instead of fighting the native picker.
function CustomDateTimePicker({ value, onChange }) {
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);
  const hasTime = !!value && value.includes('T');
  const parsed = value ? new Date(hasTime ? value : `${value}T00:00:00`) : null;
  const selectedDateStr = parsed && !isNaN(parsed.getTime()) ? dateKey(parsed) : '';
  const selectedHour = hasTime && parsed && !isNaN(parsed.getTime()) ? parsed.getHours() : null;
  const selectedMinute = hasTime && parsed && !isNaN(parsed.getTime()) ? parsed.getMinutes() : 0;
  const selectedTimeStr = hasTime ? `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}` : '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const quickDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const isCustomDate = selectedDateStr && !quickDays.some(d => dateKey(d) === selectedDateStr);

  function pickDate(d) {
    // Picking a date should not force a default time — keep it unset until the user
    // explicitly picks an hour, unless one was already chosen (then carry it over).
    const ds = dateKey(d);
    onChange(selectedHour !== null ? `${ds}T${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}` : ds);
  }

  function pickHour(h) {
    const ds = selectedDateStr || dateKey(today);
    onChange(`${ds}T${String(h).padStart(2, '0')}:00`);
  }

  function pickTime(timeStr) {
    const ds = selectedDateStr || dateKey(today);
    onChange(`${ds}T${timeStr}`);
  }

  const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 AM .. 8 PM
  // Anything picked via the custom time input that doesn't land on one of the hourly
  // slots above (an off-hour minute, or outside 8 AM–8 PM) — so people aren't limited to it.
  const isCustomTime = hasTime && (selectedMinute !== 0 || !hours.includes(selectedHour));

  return (
    <div className="border border-stone-200 rounded-2xl p-5 bg-white">
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {quickDays.map((d, i) => {
          const ds = dateKey(d);
          const selected = ds === selectedDateStr;
          const label = i === 0 ? 'Today' : i === 1 ? 'Tmw' : d.toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <button
              key={ds}
              type="button"
              onClick={() => pickDate(d)}
              className={`shrink-0 flex flex-col items-center justify-center gap-0.5 w-20 h-20 rounded-2xl border transition-colors ${selected ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-stone-200 text-stone-700 hover:border-stone-300'}`}
            >
              <span className={`text-[11px] font-semibold uppercase tracking-wide ${selected ? 'text-white/70' : 'text-stone-400'}`}>{label}</span>
              <span className="text-xl font-bold">{d.getDate()}</span>
              <span className={`text-[11px] ${selected ? 'text-white/70' : 'text-stone-400'}`}>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => (dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click())}
          className={`relative shrink-0 flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-2xl border transition-colors ${isCustomDate ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-dashed border-stone-300 text-stone-500 hover:border-stone-400'}`}
        >
          <CalendarDays size={20} />
          <span className="text-[11px] font-medium">{isCustomDate ? `${parsed.getDate()} ${parsed.toLocaleDateString('en-US', { month: 'short' })}` : 'Pick date'}</span>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDateStr}
            onChange={e => e.target.value && pickDate(new Date(`${e.target.value}T00:00:00`))}
            className="sr-only"
          />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {hours.map(h => {
          const selected = h === selectedHour;
          return (
            <button
              key={h}
              type="button"
              onClick={() => pickHour(h)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${selected ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-stone-200 text-stone-700 hover:border-stone-300'}`}
            >
              {formatHourLabel(h)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => (timeInputRef.current?.showPicker ? timeInputRef.current.showPicker() : timeInputRef.current?.click())}
          className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed text-sm font-medium transition-colors ${isCustomTime ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-stone-300 text-stone-500 hover:border-stone-400'}`}
        >
          <Clock size={14} />
          {isCustomTime ? formatTimeLabel(selectedHour, selectedMinute) : 'Custom'}
          <input
            ref={timeInputRef}
            type="time"
            value={selectedTimeStr}
            onChange={e => e.target.value && pickTime(e.target.value)}
            className="sr-only"
          />
        </button>
      </div>
    </div>
  );
}

// Custom dropdown used everywhere in this page instead of a native <select> — optionally
// searchable, always interactive; `tinted` just darkens it as a "from Restack" cue.
function EditorDropdown({ value, onChange, options, placeholder = 'Select…', searchable = false, compact = false, tinted = false, icon = null, colorClass = '' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(''); }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const current = options.find(o => o.value === value);
  const filtered = searchable && query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function pick(o) {
    onChange(o.value);
    setOpen(false);
    setQuery('');
  }

  const list = open && (
    <div className="absolute left-0 right-0 min-w-[160px] mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-30 overflow-hidden">
      <div className="max-h-64 overflow-y-auto py-1">
        {filtered.length === 0 && <div className="px-4 py-3 text-sm text-stone-400">No matches</div>}
        {filtered.map(o => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => pick(o)}
              className={`w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 text-sm transition-colors ${selected ? 'text-stone-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                {o.logo !== undefined && (
                  <span className="w-5 h-5 rounded bg-white border border-stone-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {o.logo ? <img src={o.logo} alt="" className="w-full h-full object-cover" /> : <HardHat size={11} className="text-stone-300" />}
                  </span>
                )}
                <span className="truncate">{o.label}</span>
              </span>
              {selected && <Check size={14} className="text-neutral-900 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Searchable dropdowns are a real combobox — type straight into the field itself to filter,
  // no separate search box inside the popup.
  if (searchable) {
    return (
      <div ref={ref} className="relative">
        <div className="relative">
          {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-white border border-stone-200 flex items-center justify-center shrink-0 overflow-hidden pointer-events-none">{icon}</div>}
          <input
            value={open ? query : (current?.label ?? '')}
            onFocus={() => setOpen(true)}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            placeholder={placeholder}
            className={fieldCls(tinted, `pr-10 ${icon ? 'pl-11' : ''}`)}
          />
          <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
        {list}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={compact
          ? `flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${colorClass || (tinted ? 'bg-stone-100 border-stone-300 text-stone-800' : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800')}`
          : `${fieldCls(tinted)} flex items-center justify-between text-left`}
      >
        <span className={current ? '' : 'text-stone-300'}>{current?.label ?? placeholder}</span>
        <ChevronDown size={compact ? 14 : 16} className={`text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {list}
    </div>
  );
}

// Preview on top, URL input below — used for all four media fields in the same row.
function ImageField({ label, ratio, showRatio = true, value, onChange, tinted }) {
  const inputRef = useRef(null);

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    onChange(URL.createObjectURL(file));
  }

  return (
    <div>
      <FieldLabel tinted={tinted}>
        {label}
        {showRatio && <span className="text-[10px] text-stone-400 font-normal">{ratio === '2/1' ? '2:1' : '4:5'}</span>}
      </FieldLabel>
      <div
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center mb-2 cursor-pointer hover:border-stone-300 transition-colors ${ratio === '2/1' ? 'aspect-[2/1]' : 'aspect-[4/5]'}`}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <UploadCloud size={22} className="text-stone-300" />
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={e => handleFiles(e.target.files)} className="hidden" />
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Image URL…"
        className={fieldCls(tinted, 'text-xs py-2.5')}
      />
    </div>
  );
}

function FileUploadBox({ label, value, onChange, tinted }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    onChange(URL.createObjectURL(file));
  }

  return (
    <div className="h-full flex flex-col">
      <FieldLabel tinted={tinted}>{label}</FieldLabel>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`flex-1 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center px-4 py-6 transition-colors ${
          dragOver ? 'border-neutral-400 bg-stone-100' : tinted ? 'border-stone-300 bg-stone-100 hover:bg-stone-200' : 'border-stone-300 bg-white hover:bg-stone-50'
        }`}
      >
        <UploadCloud size={20} className="text-stone-400" />
        {value ? (
          <span className="text-xs text-stone-600 font-medium">KML file uploaded</span>
        ) : (
          <span className="text-xs text-stone-400">Click or drag KML file to upload</span>
        )}
        <input ref={inputRef} type="file" accept=".kml" onChange={e => handleFiles(e.target.files)} className="hidden" />
      </div>
    </div>
  );
}

export default function EdgeProjectEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank());
  const [statusMsg, setStatusMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [areaInput, setAreaInput] = useState('');
  const [areaUnit, setAreaUnit] = useState('sqmt');
  const [builderOptions, setBuilderOptions] = useState([]);

  const [expandedPhaseIndex, setExpandedPhaseIndex] = useState(0);

  // A project synced from Restack has most of its content refreshed automatically on every
  // sync. Fields still stay fully editable (Restack may not have filled everything in yet, or
  // a value may need a manual correction) — but a field that already carries a Restack-sourced
  // value gets a darker background as a "this came from Restack" cue. A project created
  // manually in Edge (no Restack ID) never shows this tint.
  const isRestackSynced = !!form.restackProjectId;
  const tint = (hasValue) => isRestackSynced && !!hasValue;

  useEffect(() => {
    setLoading(true);
    setBuilderOptions(getBuilders());

    if (isNew) {
      setForm(blank());
    } else {
      const data = getProject(id);
      if (!data) {
        navigate('/edge/projects');
        return;
      }
      setForm(projectToForm(data));
      if (data.land_area_acres) {
        setAreaInput((data.land_area_acres * 4046.85642).toFixed(2));
        setAreaUnit('sqmt');
      }
    }
    setLoading(false);
  }, [isNew, id, navigate]);

  function setF(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setIsDirty(true);
  }

  function handleSave(closeAfter = false) {
    if (!form.published_at) {
      setStatusMsg('Published At is mandatory!');
      return;
    }
    setSaving(true);
    setStatusMsg('Saving…');
    try {
      let finalAcres = null;
      if (areaInput) {
        const val = parseFloat(areaInput);
        if (!isNaN(val)) finalAcres = areaUnit === 'sqmt' ? val / 4046.85642 : val;
      }

      const payload = {
        name: form.name, codename: form.codename || null, description: form.description || null,
        launch_status: form.launch_status || null, cover_image_url: form.cover_image_url || null,
        notif_image: form.notif_image || null, zone: form.zone || null, micromarket: form.micromarket || null,
        corridor: form.corridor.split(',').map(s => s.trim()).filter(Boolean),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        kml_file_url: form.kml_file_url || null, pricing: form.pricing || null,
        land_area_acres: finalAcres, total_units: form.total_units ? parseInt(form.total_units, 10) : null,
        floor: form.floor || null, layouts: form.layouts, configurations: form.configurations,
        phase_details: form.phase_details, master_plan_url: form.master_plan_url || null,
        brochure_url: form.brochure_url || null, images: form.images.filter(Boolean),
        builder_id: form.builder_id || null, rawBuilderName: form.rawBuilderName || null,
        restackProjectId: form.restackProjectId || null,
        published_at: form.published_at || null, status: form.status,
      };

      if (isNew) {
        const created = createProject(payload);
        setForm(f => ({ ...f, id: created.id, created_at: created.created_at }));
        setIsDirty(false);
        setStatusMsg('Saved ✓');
        navigate(`/edge/projects/${created.id}`, { replace: true });
      } else {
        updateProject(form.id, payload);
        setIsDirty(false);
        setStatusMsg('Saved ✓');
        if (closeAfter) navigate('/edge/projects');
      }
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!form.id) return;
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setStatusMsg('Tap delete again to confirm');
      setTimeout(() => { setDeleteConfirm(false); setStatusMsg(''); }, 3000);
      return;
    }
    deleteProject(form.id);
    navigate('/edge/projects');
  }

  const addPhase = () => {
    setF('phase_details', [...form.phase_details, { phase_name: '', rera_id: '', handover_date: '', approval_date: '' }]);
    setExpandedPhaseIndex(form.phase_details.length);
  };

  const updatePhase = (index, field, value) => {
    const newPhases = [...form.phase_details];
    newPhases[index][field] = value;
    setF('phase_details', newPhases);
  };

  const removePhase = (index) => {
    const newPhases = form.phase_details.filter((_, i) => i !== index);
    setF('phase_details', newPhases);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-stone-300 gap-3 bg-white">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-xs font-medium uppercase tracking-widest">Loading Project…</span>
      </div>
    );
  }

  const statusOptions = [
    { value: 'drafted', label: 'Draft' },
    { value: 'live', label: 'Live' },
    { value: 'archive', label: 'Archive' },
    { value: 'resale', label: 'Resale' },
  ];
  const statusColorClass = {
    live: 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200',
    drafted: 'bg-yellow-100 border-yellow-200 text-yellow-700 hover:bg-yellow-200',
    archive: 'bg-transparent border-stone-200 text-stone-600 hover:bg-stone-100',
    resale: 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50',
  }[form.status] || '';
  const developerOptions = builderOptions.map(b => ({ value: b.id, label: b.builderName, logo: b.builderLogo }));
  const selectedBuilder = builderOptions.find(b => b.id === form.builder_id);
  const displayAcres = parseFloat(areaInput)
    ? (areaUnit === 'sqmt' ? parseFloat(areaInput) / 4046.85642 : parseFloat(areaInput)).toFixed(2)
    : '0.00';

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full px-6 md:px-10 pb-32">
        <div className="h-16 flex items-center justify-between mb-6 sticky top-0 bg-stone-50/95 backdrop-blur -mx-6 md:-mx-10 px-6 md:px-10 z-40 border-b border-stone-200">
          <Link to="/edge/projects" className="flex items-center gap-1 px-2 py-1 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors font-medium text-[13px]">
            <ArrowLeft size={15} /><span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            {statusMsg && <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-900 mr-1">{statusMsg}</span>}
            <EditorDropdown compact value={form.status} onChange={v => setF('status', v)} options={statusOptions} colorClass={statusColorClass} />
            <button onClick={() => isDirty ? handleSave(true) : navigate('/edge/projects')} disabled={saving} className={`flex items-center gap-1.5 min-w-[100px] justify-center text-white text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-70 ${saving ? 'bg-stone-800' : 'bg-neutral-900 hover:bg-neutral-950'}`}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : isDirty ? <>Save & Close</> : <><Check size={13} /> Saved</>}
            </button>
          </div>
        </div>

        {!isNew && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-xl font-normal font-mono text-stone-900 bg-white px-3 py-1 rounded-lg border border-stone-200">{form.id}</span>
              <button onClick={handleDelete} className={`p-2.5 bg-white border transition-all rounded-xl ${deleteConfirm ? 'border-red-500 text-red-600 bg-red-50' : 'border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'}`}>
                <Trash2 size={16} />
              </button>
            </div>
            {form.restackProjectId && (
              <span className="text-sm text-stone-400">
                Restack ID <span className="text-stone-500">{form.restackProjectId}</span>
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {['Prelaunch', 'Developer', 'RERA'].map(ls => {
            const selected = form.launch_status === ls;
            const tinted = tint(form.launch_status) && !selected;
            return (
              <button
                key={ls}
                type="button"
                onClick={() => setF('launch_status', ls)}
                className={`group flex flex-col items-center justify-center gap-3 text-stone-700 rounded-2xl p-6 transition-all border bg-white hover:bg-stone-50 ${tinted ? 'bg-stone-100 border-stone-300' : ''} ${selected ? 'border-neutral-500 ring-4 ring-neutral-50' : 'border-stone-200 hover:border-stone-300'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selected ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white'}`}>
                  {ls === 'Prelaunch' ? <Rocket size={28} /> : ls === 'Developer' ? <HardHat size={28} /> : <ShieldCheck size={28} />}
                </div>
                <span className="font-medium text-sm flex items-center gap-1.5">
                  {ls === 'Prelaunch' ? 'Prelaunch' : ls === 'Developer' ? 'Developer' : 'RERA Approved'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl mb-8">
          <h3 className="text-sm font-medium text-stone-500 mb-4">Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:row-span-2">
              <FileUploadBox label="KML File" value={form.kml_file_url} onChange={v => setF('kml_file_url', v)} tinted={tint(form.kml_file_url)} />
            </div>
            <div>
              <FieldLabel tinted={tint(form.latitude)}>Latitude</FieldLabel>
              <input type="number" step="any" value={form.latitude} onChange={e => setF('latitude', e.target.value)} className={fieldCls(tint(form.latitude))} />
            </div>
            <div>
              <FieldLabel tinted={tint(form.longitude)}>Longitude</FieldLabel>
              <input type="number" step="any" value={form.longitude} onChange={e => setF('longitude', e.target.value)} className={fieldCls(tint(form.longitude))} />
            </div>
            <div>
              <FieldLabel tinted={tint(form.zone)}>Zone</FieldLabel>
              <input value={form.zone} onChange={e => setF('zone', e.target.value)} className={fieldCls(tint(form.zone))} />
            </div>
            <div>
              <FieldLabel tinted={tint(form.micromarket)}>Micromarket</FieldLabel>
              <input value={form.micromarket} onChange={e => setF('micromarket', e.target.value)} className={fieldCls(tint(form.micromarket))} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <FieldLabel>Developer</FieldLabel>
            <EditorDropdown
              searchable
              tinted={tint(form.builder_id)}
              value={form.builder_id}
              onChange={v => setF('builder_id', v)}
              options={developerOptions}
              placeholder="Select developer…"
              icon={selectedBuilder && (
                selectedBuilder.builderLogo ? (
                  <img src={selectedBuilder.builderLogo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <HardHat size={11} className="text-stone-300" />
                )
              )}
            />
          </div>
          <div>
            <FieldLabel tinted={tint(form.name)}>Project Name</FieldLabel>
            <input value={form.name} onChange={e => setF('name', e.target.value)} className={fieldCls(tint(form.name))} placeholder="Project Name" />
          </div>
          <div>
            <FieldLabel tinted={tint(form.codename)}>Codename</FieldLabel>
            <input value={form.codename} onChange={e => setF('codename', e.target.value)} className={fieldCls(tint(form.codename))} placeholder="Codename" />
          </div>
        </div>

        <div className="mb-8">
          <FieldLabel tinted={tint(form.description)}>Description</FieldLabel>
          <textarea value={form.description} onChange={e => setF('description', e.target.value)} rows={4} className={fieldCls(tint(form.description), 'resize-none')} placeholder="Detailed project description..." />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div>
            <FieldLabel tinted={tint(form.total_units)}>Total Units</FieldLabel>
            <input type="number" value={form.total_units} onChange={e => setF('total_units', e.target.value)} className={fieldCls(tint(form.total_units))} />
          </div>
          <div>
            <FieldLabel tinted={tint(form.floor)}>Floor / Storeys</FieldLabel>
            <input value={form.floor} onChange={e => setF('floor', e.target.value)} className={fieldCls(tint(form.floor))} />
          </div>
          <div>
            <FieldLabel tinted={tint(form.pricing)}>Pricing</FieldLabel>
            <input value={form.pricing} onChange={e => setF('pricing', e.target.value)} className={fieldCls(tint(form.pricing))} />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-600 mb-1.5 flex items-center justify-between gap-1.5">
              <span>Land Area</span>
              <span className="text-[10px] text-stone-400 font-medium normal-case tracking-wide">
                Saves as: <span className="font-bold text-stone-600">{displayAcres} Acres</span>
              </span>
            </label>
            <div className={`flex bg-white border rounded-xl focus-within:border-neutral-400 focus-within:shadow-sm transition-all overflow-hidden ${tint(areaInput) ? 'bg-stone-100 border-stone-300' : 'border-stone-200'}`}>
              <input
                type="text"
                value={areaInput}
                onChange={e => setAreaInput(e.target.value)}
                className="w-full min-w-0 px-4 py-3.5 text-base text-stone-800 outline-none placeholder:text-stone-300 bg-transparent"
                placeholder="5.5"
              />
              <div className="flex items-center p-1.5 border-l border-stone-200 bg-stone-50 shrink-0">
                <div className="flex bg-stone-200/70 p-1 rounded-xl gap-1">
                  <button type="button" onClick={() => setAreaUnit('sqmt')} className={`px-2.5 py-1.5 flex items-center justify-center text-[10px] font-bold uppercase transition-all leading-tight rounded-lg whitespace-nowrap ${areaUnit === 'sqmt' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    SQ MT
                  </button>
                  <button type="button" onClick={() => setAreaUnit('acres')} className={`px-2.5 py-1.5 flex items-center justify-center text-[10px] font-bold uppercase transition-all rounded-lg ${areaUnit === 'acres' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    ACRES
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              Phase Details (RERA)
            </h3>
            <button onClick={addPhase} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl font-medium text-sm hover:bg-neutral-800 transition-colors">
              <Plus size={16} /> Add Phase
            </button>
          </div>
          <div className="space-y-4">
            {form.phase_details.map((phase, idx) => (
              <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden transition-all">
                <div onClick={() => setExpandedPhaseIndex(expandedPhaseIndex === idx ? -1 : idx)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-100 transition-colors">
                  <span className="font-medium text-stone-800">{phase.phase_name || `Phase ${idx + 1}`}</span>
                  <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); removePhase(idx); }} className="text-stone-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    {expandedPhaseIndex === idx ? <ChevronUp size={20} className="text-stone-500" /> : <ChevronDown size={20} className="text-stone-500" />}
                  </div>
                </div>
                {expandedPhaseIndex === idx && (
                  <div className="p-4 pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 bg-white">
                    <div>
                      <FieldLabel tinted={tint(phase.phase_name)}>Phase Name</FieldLabel>
                      <input value={phase.phase_name} onChange={e => updatePhase(idx, 'phase_name', e.target.value)} className={fieldCls(tint(phase.phase_name))} placeholder="e.g. Tower A & B" />
                    </div>
                    <div>
                      <FieldLabel tinted={tint(phase.rera_id)}>RERA ID</FieldLabel>
                      <input value={phase.rera_id} onChange={e => updatePhase(idx, 'rera_id', e.target.value)} className={fieldCls(tint(phase.rera_id))} placeholder="PRM/KA/RERA/..." />
                    </div>
                    <div>
                      <FieldLabel tinted={tint(phase.approval_date)}>Approval Date</FieldLabel>
                      <DateField value={phase.approval_date} onChange={v => updatePhase(idx, 'approval_date', v)} tinted={tint(phase.approval_date)} />
                    </div>
                    <div>
                      <FieldLabel tinted={tint(phase.handover_date)}>Possession Date</FieldLabel>
                      <DateField value={phase.handover_date} onChange={v => updatePhase(idx, 'handover_date', v)} tinted={tint(phase.handover_date)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {form.phase_details.length === 0 && <div className="p-6 text-center text-stone-400 bg-stone-50 border border-dashed border-stone-300 rounded-2xl">No phase available</div>}
          </div>
        </div>

        <div className="mb-8">
          <FieldLabel tinted={tint(form.layouts.length)}>Layouts</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            {LAYOUTS.map(l => (
              <button key={l} type="button" onClick={() => setF('layouts', toggle(form.layouts, l))} className={`min-w-[92px] px-4 py-2.5 rounded-xl text-sm font-medium text-center transition-all border ${form.layouts.includes(l) ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-stone-600 border-stone-200'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <FieldLabel tinted={tint(form.configurations.length)}>Configurations</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            {CONFIGS.map(c => (
              <button key={c} type="button" onClick={() => setF('configurations', toggle(form.configurations, c))} className={`min-w-[72px] px-4 py-2.5 rounded-xl text-sm font-medium text-center transition-all border ${form.configurations.includes(c) ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-stone-600 border-stone-200'}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
          <ImageField label="Cover Image" ratio="4/5" value={form.cover_image_url} onChange={v => setF('cover_image_url', v)} tinted={tint(form.cover_image_url)} />
          <ImageField label="Notification Image" ratio="2/1" value={form.notif_image} onChange={v => setF('notif_image', v)} tinted={tint(form.notif_image)} />
          <ImageField label="Master Plan" ratio="4/5" showRatio={false} value={form.master_plan_url} onChange={v => setF('master_plan_url', v)} tinted={tint(form.master_plan_url)} />
          <ImageField label="Brochure" ratio="4/5" showRatio={false} value={form.brochure_url} onChange={v => setF('brochure_url', v)} tinted={tint(form.brochure_url)} />
        </div>

        <div className="mb-8">
          <label className="text-sm font-medium text-stone-600 mb-1.5 flex items-center justify-between">
            <span>Published At <span className="text-red-500">*</span></span>
            {form.published_at && (() => {
              const hasTime = form.published_at.includes('T');
              const d = new Date(hasTime ? form.published_at : `${form.published_at}T00:00:00`);
              return !isNaN(d.getTime()) && (
                <span className="text-stone-400 font-normal">
                  {d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}{hasTime ? `, ${d.getMinutes() === 0 ? formatHourLabel(d.getHours()) : formatTimeLabel(d.getHours(), d.getMinutes())}` : ''}
                </span>
              );
            })()}
          </label>
          <CustomDateTimePicker value={form.published_at ?? null} onChange={val => setF('published_at', val ?? '')} />
        </div>
      </div>
    </div>
  );
}

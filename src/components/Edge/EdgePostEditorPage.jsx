import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ImageIcon, Loader2, Eye, EyeOff, Trash2, Check, X,
  Copy, Plus, Scan, Upload, CalendarDays, Clock, ChevronDown,
} from 'lucide-react';
import {
  getPost, getPosts, createPost, updatePost, deletePost, blankPost,
  getProjects, ZONES, TAGS,
} from '../../data/mockEdge';

const lbl = 'text-sm font-medium text-stone-600 mb-1.5 flex items-center justify-between';
const inp = 'w-full bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800 focus:border-neutral-400 focus:shadow-sm outline-none transition-all placeholder:text-stone-300';

// Fixed, city-wide corridor taxonomy — independent of Zone (unlike the old per-zone corridor
// list), grouped under the same two labels the user gave: Rings and Roads.
const CORRIDOR_GROUPS = [
  { label: 'Rings', options: ['ORR', 'IRR', 'NICE + PRR', 'STRR'] },
  { label: 'Roads', options: ['Bellary Road', 'Doddaballapur Road', 'Tumkur Road', 'Magadi Road', 'Mysore Road', 'Kanakapura Road', 'Bannerghatta Road', 'Hosur Road', 'Sarjapur Road', 'Old Madras Road'] },
];

// Summary's default height = Cover Image column height minus this, so it reads a little smaller
// than the image by default (still grows past that floor once content needs more room).
const SUMMARY_HEIGHT_OFFSET = -120;

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

function AutoResizeTextarea(props) {
  const ref = useRef(null);

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    resize();
  }, [props.value]);

  return (
    <textarea
      {...props}
      ref={ref}
      style={{ ...props.style, overflow: 'hidden' }}
      onInput={(e) => {
        resize();
        if (props.onInput) props.onInput(e);
      }}
    />
  );
}

function ProjectSelect({ projects, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = projects.filter(p => {
    const s = search.toLowerCase();
    const builderName = p.builder_name || p.rawBuilderName || '';
    return (
      (p.id?.toLowerCase() || '').includes(s) ||
      (p.name?.toLowerCase() || '').includes(s) ||
      (p.codename?.toLowerCase() || '').includes(s) ||
      builderName.toLowerCase().includes(s) ||
      (p.micromarket?.toLowerCase() || '').includes(s)
    );
  });

  const selectedProj = projects.find(p => p.id === value);
  const displayValue = open ? search : (selectedProj ? selectedProj.id : value ?? '');

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          className={`${inp} pr-10`}
          value={displayValue}
          onChange={e => {
            setSearch(e.target.value);
            setOpen(true);
            onChange(e.target.value || null);
          }}
          onFocus={() => {
            setSearch(value ?? '');
            setOpen(true);
          }}
          placeholder="Search project by name, builder, ID…"
        />
        <ChevronDown size={16} className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto">
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => {
                onChange(p.id);
                setSearch('');
                setOpen(false);
              }}
              className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-neutral-50 border-b border-stone-100 last:border-0 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-base text-stone-900 truncate">
                  {p.name || p.codename || 'Unnamed Project'}
                </div>
                <div className="text-sm text-stone-500 truncate flex items-center gap-2 mt-0.5">
                  {(p.builder_name || p.rawBuilderName) && <span>{p.builder_name || p.rawBuilderName}</span>}
                  {(p.builder_name || p.rawBuilderName) && p.micromarket && <span className="text-stone-300">·</span>}
                  {p.micromarket && <span>{p.micromarket}</span>}
                </div>
              </div>
              <div className="shrink-0 text-sm text-stone-400">
                {p.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Copied verbatim from the Project editor's picker — quick-pick date cards (Today, Tmw, next 5
// days, or a custom date) plus hourly slots 8 AM–8 PM (or a custom time), instead of the old
// full month-grid calendar. `value`/`onChange` use the same short 'YYYY-MM-DD[THH:mm]' form.
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

export default function EdgePostEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get('type') || 'article';

  const [form, setForm] = useState({});
  const [pulseRaw, setPulseRaw] = useState('');
  const [projects, setProjects] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const prevData = useRef('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState(null);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [previewSlide, setPreviewSlide] = useState(0);
  const [previewMode, setPreviewMode] = useState('image');
  const [draggedSlideIndex, setDraggedSlideIndex] = useState(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState(null);
  const [uploadingSlides, setUploadingSlides] = useState(new Set());
  const fileInputRef = useRef(null);
  const uploadTargetIdx = useRef(null);
  const coverUploadRef = useRef(null);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const coverColObserverRef = useRef(null);
  const [summaryMinHeight, setSummaryMinHeight] = useState(null);

  // Summary's default height is measured off the Cover Image column (image box + URL input),
  // not guessed, minus a bit so it reads a little smaller than the image by default — and grows
  // past that floor once typed content actually needs more room. A callback ref (not a useEffect
  // keyed on form.type) because on a brand-new post form.type is briefly undefined on the very
  // first render (blankPost() only lands a tick later, in a passive effect) — the component
  // renders the *other* layout branch first, so the image column's DOM node doesn't exist yet
  // when an effect would look for it. A callback ref fires exactly when the node actually mounts,
  // however many times the branch flips before that.
  const coverColRef = useCallback(node => {
    if (coverColObserverRef.current) {
      coverColObserverRef.current.disconnect();
      coverColObserverRef.current = null;
    }
    if (node) {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) setSummaryMinHeight(Math.max(120, entry.target.offsetHeight + SUMMARY_HEIGHT_OFFSET));
      });
      observer.observe(node);
      coverColObserverRef.current = observer;
    }
  }, []);

  // Paste-only quick-fill — typing/pasting invalid JSON stays silent since it's mid-edit.
  function applyJsonImport(text, clearTarget) {
    if (!text || !text.trim()) return true;
    try {
      const parsed = JSON.parse(text);
      if (parsed.title) setF('title', parsed.title);
      if (parsed.summary) setF('summary', parsed.summary);
      if (parsed.shared_text) setF('shared_text', parsed.shared_text);
      if (parsed.pulse && Array.isArray(parsed.pulse)) {
        setPulseRaw(JSON.stringify(parsed.pulse, null, 2));
      }
      if (clearTarget) clearTarget.value = '';
      setStatusMsg('JSON Applied ✓');
      setTimeout(() => setStatusMsg(''), 2000);
      return true;
    } catch {
      return false;
    }
  }

  // Metadata auto-fill would normally hit a link-preview API; there's no
  // backend here, so this is a no-op placeholder that keeps the field wired up.
  function handleSourceUrlBlur() {
    if (!form.source_url) return;
    setIsFetchingMeta(true);
    setStatusMsg('Auto-fill unavailable in demo');
    setTimeout(() => {
      setIsFetchingMeta(false);
      setStatusMsg('');
    }, 1200);
  }

  useEffect(() => {
    setProjects(getProjects());
    const postsData = getPosts({ type: 'article' });
    const uniqueSources = Array.from(new Set(postsData.map(p => p.source_name).filter(Boolean)));
    setSources(uniqueSources);
  }, []);

  useEffect(() => {
    if (isNew) {
      const bp = blankPost(queryType);
      // Same short 'YYYY-MM-DDTHH:mm' form the Project editor's picker reads/writes, not a
      // full ISO timestamp — sliced once here rather than threading a conversion through
      // every place that touches form.published_at.
      setForm({ ...bp, published_at: bp.published_at ? bp.published_at.slice(0, 16) : '' });
      setLoading(false);
    } else {
      setLoading(true);
      const data = getPost(id);
      if (data) {
        setForm({
          ...data,
          zone: data.zone ?? [],
          micromarket: data.micromarket ?? [],
          corridor: data.corridor ?? [],
          pulse: data.pulse ?? [],
          slides: data.slides ?? [],
          published_at: data.published_at ? data.published_at.slice(0, 16) : '',
        });
        setPulseRaw(data.pulse && data.pulse.length > 0 ? JSON.stringify(data.pulse, null, 2) : '');
      } else {
        setStatusMsg('Error loading post');
      }
      setLoading(false);
    }
  }, [id, isNew, queryType]);

  // Autosave effect
  useEffect(() => {
    if (loading) return;

    // Compare to prevent strict mode or exact same data triggers
    const currentData = JSON.stringify({ form, pulseRaw });
    if (!prevData.current) {
      prevData.current = currentData;
      return;
    }
    if (prevData.current === currentData) return;

    prevData.current = currentData;
    setIsDirty(true);

    const timer = setTimeout(() => {
      handleSave(true);
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, pulseRaw, loading]);

  function setF(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function arrFromStr(s) {
    return s.split(',').map(x => x.trim()).filter(Boolean);
  }

  function uploadSlide(file, idx) {
    setUploadingSlides(s => new Set(s).add(idx));
    const url = URL.createObjectURL(file);
    const slides = [...(form.slides ?? [])];
    slides[idx] = url;
    setF('slides', slides);
    setPreviewSlide(idx);
    setUploadingSlides(s => { const n = new Set(s); n.delete(idx); return n; });
  }

  function handleSave(isAutosave = false) {
    if (!form.title?.trim()) { return; }
    if (form.type === 'article' && !form.cover_image_url?.trim() && !isAutosave) {
      setStatusMsg('Cover Image is mandatory!');
      setIsSaving(false);
      setTimeout(() => setStatusMsg(''), 2500);
      return;
    }
    if (!form.published_at && !isAutosave) {
      setStatusMsg('Published At is mandatory!');
      setIsSaving(false);
      setTimeout(() => setStatusMsg(''), 2500);
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        type: form.type,
        title: form.title?.trim(),
        cover_image_url: form.cover_image_url?.trim() || null,
        is_live: form.is_live ?? false,
        shared_text: form.shared_text?.trim() || null,
        tag: form.tag || null,
        zone: Array.isArray(form.zone) ? form.zone : arrFromStr(form.zone ?? ''),
        micromarket: Array.isArray(form.micromarket) ? form.micromarket : arrFromStr(form.micromarket ?? ''),
        corridor: Array.isArray(form.corridor) ? form.corridor : arrFromStr(form.corridor ?? ''),
        project_id: form.project_id?.trim() || null,
        published_at: form.published_at || null,
        notif_image: form.notif_image?.trim() || null,
        client_shares: form.client_shares ?? 0,
      };
      if (form.type === 'article' || form.type === 'carousel') {
        payload.summary = form.summary?.trim() || null;
        try {
          const parsedPulse = pulseRaw.trim() ? JSON.parse(pulseRaw) : [];
          payload.pulse = Array.isArray(parsedPulse) && parsedPulse.length
            ? parsedPulse.map(p => ({ heading: p.heading?.trim() || '', text: p.text?.trim() || '' }))
            : null;
        } catch {
          if (!isAutosave) throw new Error('Invalid Pulse JSON format. Must be an array of objects.');
          else return; // skip autosave if JSON is invalid
        }
        payload.shareable_name = form.shareable_name?.trim() || null;
        payload.source_url = form.source_url?.trim() || null;
        payload.source_name = form.source_name?.trim() || null;

        if (form.type === 'carousel') {
          payload.slides = (form.slides ?? []).map(s => s?.trim()).filter(Boolean);
          payload.cover_image_url = payload.slides[0] || null;
        }
      } else if (form.type === 'video') {
        payload.video_url = form.video_url?.trim() || null;
      }

      let saved;
      if (!form.id) {
        saved = createPost(payload);
      } else {
        saved = updatePost(form.id, payload);
      }
      setForm(f => ({ ...f, ...saved }));

      setIsDirty(false);

      if (!isAutosave) {
        navigate('/edge/posts');
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  function handleToggleLive() {
    const newLive = !form.is_live;
    // Same short form the picker uses — keeps form.published_at in one consistent shape.
    const published_at = newLive ? new Date().toISOString().slice(0, 16) : (form.published_at || null);
    setStatusMsg(newLive ? 'Going live…' : 'Unpublishing…');
    if (form.id) {
      updatePost(form.id, { is_live: newLive, published_at });
    }
    setF('is_live', newLive);
    setF('published_at', published_at);
    setStatusMsg(newLive ? 'Live ✓' : 'Unpublished ✓');
    setTimeout(() => setStatusMsg(''), 2000);
  }

  function handleDelete() {
    if (!form.id) return;
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setStatusMsg('Tap delete again to confirm');
      setTimeout(() => { setDeleteConfirm(false); setStatusMsg(''); }, 3000);
      return;
    }
    setStatusMsg('Deleting…');
    deletePost(form.id);
    navigate('/edge/posts');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-stone-300 gap-3 bg-white">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-xs font-bold uppercase tracking-widest">Loading Post…</span>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Top bar — same chrome as the Project editor's header, full width regardless of how
          narrow the form column below is */}
      <div className="h-16 flex items-center justify-between sticky top-0 bg-stone-50/95 backdrop-blur px-6 md:px-10 z-40 border-b border-stone-200">
        <Link
          to="/edge/posts"
          className="flex items-center gap-1 px-2 py-1 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors font-medium text-[13px]"
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </Link>

        <div className="flex items-center gap-2">
          {statusMsg && <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-900 mr-1">{statusMsg}</span>}

          {!isNew && (
            <button
              onClick={handleDelete}
              className={`p-2 rounded-lg transition-colors ${deleteConfirm ? 'bg-red-100 text-red-600' : 'text-stone-400 hover:text-red-600 hover:bg-red-50'}`}
            >
              <Trash2 size={15} />
            </button>
          )}

          <button
            onClick={handleToggleLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${form.is_live
              ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700'
              : 'bg-stone-100 text-stone-500 hover:bg-emerald-100 hover:text-emerald-700'
              }`}
          >
            {form.is_live ? <><Eye size={13} /> Live</> : <><EyeOff size={13} /> Draft</>}
          </button>

          <button
            onClick={() => isDirty ? handleSave(false) : navigate('/edge/posts')}
            disabled={isSaving}
            className={`flex items-center gap-1.5 min-w-[100px] justify-center text-white text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-70 ${isSaving ? 'bg-stone-800' : 'bg-neutral-900 hover:bg-neutral-950'}`}
          >
            {isSaving ? (
              <><Loader2 size={13} className="animate-spin" /> Saving…</>
            ) : isDirty ? (
              <>Save & Close</>
            ) : (
              <><Check size={13} /> Saved</>
            )}
          </button>
        </div>
      </div>

      <div className="w-full px-6 md:px-10 pt-6">
        <div className={form.type === 'article' ? "flex flex-col" : "flex flex-col md:flex-row gap-8 items-start"}>
          {/* Left Column: Cover Image (Carousel/Video) */}
          {form.type !== 'article' && (
            <div className="w-full md:w-auto flex-shrink-0 md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] overflow-y-auto hide-scrollbar pb-2">
              <div className="flex flex-col items-center">
                <div
                  className="relative bg-stone-100 border border-stone-200 rounded-3xl overflow-hidden shadow-sm mx-auto flex-shrink-0 group"
                  style={{ height: 'calc(100vh - 8rem)', aspectRatio: '9/16', maxHeight: '920px', minHeight: '500px' }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    if (file.type.startsWith('video/')) {
                      setF('video_url', url);
                      setPreviewMode('video');
                    } else {
                      setF('cover_image_url', url);
                      setPreviewMode('image');
                    }
                    setStatusMsg('Uploaded ✓');
                    setTimeout(() => setStatusMsg(''), 2000);
                  }}
                >
                  {/* Overlay Tools */}
                  {(form.type === 'carousel' || form.type === 'video') && (
                    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowSafeZones(!showSafeZones)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border border-white/20 backdrop-blur-md ${showSafeZones ? 'bg-neutral-900 text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'}`}
                        title="Toggle Safe Zones"
                      >
                        <Scan size={18} />
                      </button>

                      {form.type === 'video' && (
                        <>
                          <button
                            onClick={() => setPreviewMode('image')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border border-white/20 backdrop-blur-md ${previewMode === 'image' ? 'bg-neutral-900 text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'}`}
                            title="Cover Image"
                          >
                            <ImageIcon size={18} />
                          </button>
                          <button
                            onClick={() => setPreviewMode('video')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border border-white/20 backdrop-blur-md ${previewMode === 'video' ? 'bg-neutral-900 text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'}`}
                            title="Video Player"
                          >
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {(() => {
                    const isVideoMode = form.type === 'video' && previewMode === 'video' && form.video_url;
                    if (isVideoMode) {
                      const isIframe = form.video_url.includes('youtube.com') || form.video_url.includes('youtu.be') || form.video_url.includes('vimeo.com');
                      return isIframe ? (
                        <iframe src={form.video_url} className="w-full h-full border-0 pointer-events-auto z-20 relative" allowFullScreen />
                      ) : (
                        <video src={form.video_url} className="w-full h-full object-cover pointer-events-auto z-20 relative" controls playsInline />
                      );
                    }

                    const previewUrl = previewSlide === 'notif' ? form.notif_image : (form.type === 'carousel' ? ((form.slides && form.slides[previewSlide]) || form.cover_image_url) : form.cover_image_url);
                    return previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-contain" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100"><ImageIcon size={40} /></div>
                    );
                  })()}

                  {showSafeZones && (
                    <>
                      {/* 1st Zone: 1080x1528 */}
                      <div
                        className="absolute border-2 border-dashed border-white/70 pointer-events-none"
                        style={{ top: '10.21%', bottom: '10.21%', left: '0%', right: '0%', zIndex: 10 }}
                      />
                      {/* 2nd Zone: 972x1375 */}
                      <div
                        className="absolute border-2 border-dashed border-blue-400/70 pointer-events-none"
                        style={{ top: '14.19%', bottom: '14.19%', left: '5%', right: '5%', zIndex: 10 }}
                      />
                      {/* 3rd Zone: 864x1222 */}
                      <div
                        className="absolute border-2 border-dashed border-red-500/70 pointer-events-none"
                        style={{ top: '18.18%', bottom: '18.18%', left: '10%', right: '10%', zIndex: 10 }}
                      />
                    </>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Right Column (Now Left): Form Fields */}
          <div className="flex-1 min-w-0 w-full pb-4">

            {/* Top ID Bar — same chrome as the Project editor's ID card */}
            {!isNew && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-normal font-mono text-stone-900 bg-white px-3 py-1 rounded-lg border border-stone-200">{form.id}</span>
                  {(form.type === 'article' || form.type === 'carousel') && (
                    <button
                      onClick={() => {
                        const url = form.type === 'carousel'
                          ? `https://acn-edge.vercel.app/?story=${form.id}&s=w`
                          : `https://acn-edge.vercel.app/?article=${form.id}&s=w`;
                        let msg = `*${form.title}*\n\n`;
                        if (form.summary) msg += `${form.summary}\n`;
                        msg += url;
                        navigator.clipboard.writeText(msg);
                        setCopiedCardId('copy-' + form.id);
                        setTimeout(() => setCopiedCardId(null), 2000);
                      }}
                      title="Copy for WhatsApp"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      {copiedCardId === 'copy-' + form.id ? <><Check size={13} /> Copied</> : <><Copy size={13} /> WhatsApp</>}
                    </button>
                  )}
                </div>

                <div className="flex flex-col items-start text-sm text-stone-400 gap-0.5">
                  <span><span className="inline-block w-[72px]">Added:</span><span className="text-stone-500">{form.created_at ? new Date(form.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric' }) : '—'}</span></span>
                  <span><span className="inline-block w-[72px]">Published:</span><span className="text-stone-500">{form.published_at ? new Date(form.published_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric' }) : '—'}</span></span>
                </div>
              </div>
            )}

            {/* ── Auto-Fetch & Sources ── */}
            {form.type === 'article' && (
              <div className="mb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Source URL</label>
                    <div className="relative">
                      <input
                        value={form.source_url ?? ''}
                        onChange={e => setF('source_url', e.target.value || null)}
                        onBlur={handleSourceUrlBlur}
                        className={`${inp} pr-10`}
                        placeholder="https://…"
                      />
                      {isFetchingMeta && <Loader2 className="absolute right-3 top-3.5 animate-spin text-stone-400" size={16} />}
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Source Name</label>
                    <input
                      list="source-options"
                      value={form.source_name ?? ''}
                      onChange={e => setF('source_name', e.target.value || null)}
                      className={inp}
                      placeholder="Select or type source…"
                    />
                    <datalist id="source-options">
                      {sources.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>
              </div>
            )}

            {/* ── JSON Import — paste only ── */}
            {form.type === 'article' && (
              <div className="mb-6">
                <label className={lbl}>Quick-fill from JSON</label>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 focus-within:border-stone-400 focus-within:bg-white transition-all">
                  <AutoResizeTextarea
                    rows={5}
                    className="w-full bg-transparent border-none text-sm font-mono text-stone-700 outline-none resize-none placeholder:text-stone-400"
                    placeholder={`Paste JSON here…\n\n{\n  "title": "...",\n  "summary": "...",\n  "pulse": [...],\n  "shared_text": "..."\n}`}
                    onChange={(e) => applyJsonImport(e.target.value, e.target)}
                  />
                </div>
              </div>
            )}

            {form.type === 'article' ? (
              /* Title/Summary (left half) + Cover Image (right half), grouped together.
                 items-start is load-bearing: default flex stretch would make this column's
                 height track Summary's (via align-items: stretch), which combined with the
                 ResizeObserver below (Summary's min-height tracking this column) created a
                 feedback loop that grew both without bound. */
              <div className="mb-6 flex flex-col md:flex-row items-start gap-4">
                <div className="md:w-1/2 flex flex-col gap-4">
                  <div className="shrink-0">
                    <label className={lbl}>
                      <span>Title *</span>
                      <span className="text-[10px] text-stone-400 font-medium">{(form.title ?? '').length} chars</span>
                    </label>
                    <AutoResizeTextarea
                      value={form.title ?? ''}
                      onChange={e => setF('title', e.target.value)}
                      rows={1}
                      className={`${inp} resize-none text-lg`}
                      placeholder="Post title…"
                    />
                  </div>
                  {/* Height matches the Cover Image column exactly by default (measured via
                      coverColRef, not guessed) — grows past that floor once typed content
                      actually needs more room, instead of clipping/scrolling it away. */}
                  <div>
                    <label className={lbl}>
                      <span>Summary</span>
                      <span className="text-[10px] text-stone-400 font-medium">{(form.summary ?? '').length} chars</span>
                    </label>
                    <AutoResizeTextarea
                      key={summaryMinHeight ?? 'unmeasured'}
                      value={form.summary ?? ''}
                      onChange={e => setF('summary', e.target.value || null)}
                      className={`${inp} resize-none`}
                      style={summaryMinHeight ? { minHeight: summaryMinHeight } : undefined}
                      placeholder="Brief summary…"
                    />
                  </div>
                </div>

                <div className="md:w-1/2" ref={coverColRef}>
                  <label className={lbl}>Cover Image *</label>
                  <div
                    className="relative aspect-[2/1] bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm mb-3 group transition-colors hover:border-neutral-300"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (!file) return;
                      setF('cover_image_url', URL.createObjectURL(file));
                      setStatusMsg('Image uploaded ✓');
                      setTimeout(() => setStatusMsg(''), 2000);
                    }}
                  >
                    {form.cover_image_url ? (
                      <img src={form.cover_image_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Drag & Drop Image</span>
                      </div>
                    )}
                    {/* Manual Upload Button overlay */}
                    <label className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl text-stone-700 shadow hover:bg-white hover:text-stone-900 cursor-pointer transition-all opacity-0 group-hover:opacity-100 z-10 flex items-center gap-1.5 text-xs font-bold">
                      <Upload size={14} /> Upload
                      <input type="file" ref={coverUploadRef} className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setF('cover_image_url', URL.createObjectURL(file));
                        setStatusMsg('Image uploaded ✓');
                        setTimeout(() => setStatusMsg(''), 2000);
                        if (coverUploadRef.current) coverUploadRef.current.value = '';
                      }} />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={form.cover_image_url ?? ''}
                    onChange={e => setF('cover_image_url', e.target.value || null)}
                    placeholder="Cover Image URL…"
                    className={inp}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className={lbl}>
                    <span>Title *</span>
                    <span className="text-[10px] text-stone-400 font-medium">{(form.title ?? '').length} chars</span>
                  </label>
                  <AutoResizeTextarea
                    value={form.title ?? ''}
                    onChange={e => setF('title', e.target.value)}
                    rows={1}
                    className={`${inp} resize-none text-lg`}
                    placeholder="Post title…"
                  />
                </div>

                {/* ── Media (Cover Image, Video) ── */}
                {form.type !== 'carousel' && (
                  <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-3xl">
                    <div className="flex flex-col gap-6">
                      {/* Cover Image (video only here — carousel's cover comes from its first slide) */}
                      <div>
                        <label className={lbl}>Cover Image</label>
                        <input
                          type="text"
                          value={form.cover_image_url ?? ''}
                          onChange={e => setF('cover_image_url', e.target.value || null)}
                          placeholder="Cover Image URL…"
                          className={inp}
                        />
                      </div>

                      {/* Video URL (Optional) */}
                      {form.type === 'video' && (
                        <div>
                          <label className={lbl}>Video URL (Optional)</label>
                          <input
                            type="text"
                            value={form.video_url ?? ''}
                            onChange={e => setF('video_url', e.target.value || null)}
                            placeholder="Video URL…"
                            className={inp}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Carousel Slides ── */}
            {form.type === 'carousel' && (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
                  {/* Notification Image Tile (col-span-3) */}
                  <div className={`col-span-3 relative aspect-[3/1] sm:aspect-[2/1] bg-stone-50 rounded-xl flex flex-col items-center justify-center text-stone-400 transition-colors group overflow-hidden border ${previewSlide === 'notif' ? 'border-neutral-800 shadow-md' : 'border-stone-200 hover:border-neutral-400'}`}>
                    {form.notif_image ? (
                      <>
                        <button type="button" onClick={() => setPreviewSlide('notif')} className="w-full h-full block">
                          <img src={form.notif_image} className="w-full h-full object-cover pointer-events-none" alt="" />
                        </button>
                        <button type="button" className="absolute top-2 right-2 bg-neutral-900/90 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black z-10 shadow-sm" onClick={(e) => { e.stopPropagation(); setF('notif_image', null); if(previewSlide === 'notif') setPreviewSlide(0); }}>
                          <X size={14} />
                        </button>
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none shadow-sm">
                          NOTIF (2:1)
                        </div>
                      </>
                    ) : (
                      <>
                        <Plus size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest text-center">Notification Image<br/><span className="text-[10px] opacity-70">2:1 Size</span></span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setF('notif_image', URL.createObjectURL(file));
                          setStatusMsg('Notif Image uploaded ✓');
                          setTimeout(() => setStatusMsg(''), 2000);
                          e.target.value = '';
                        }} />
                      </>
                    )}
                  </div>

                  {(form.slides ?? []).map((url, i) => (
                    <div key={i} draggable
                      onDragStart={e => {
                        e.dataTransfer.effectAllowed = 'move';
                        // Delay setting state so the drag ghost captures the real element first
                        setTimeout(() => setDraggedSlideIndex(i), 0);
                      }}
                      onDragOver={e => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (draggedSlideIndex !== null && draggedSlideIndex !== i) {
                          const newSlides = [...(form.slides ?? [])];
                          const [dragged] = newSlides.splice(draggedSlideIndex, 1);
                          newSlides.splice(i, 0, dragged);
                          setF('slides', newSlides);
                          
                          if (previewSlide === draggedSlideIndex) setPreviewSlide(i);
                          else if (previewSlide === i) setPreviewSlide(draggedSlideIndex);
                          
                          setDraggedSlideIndex(i);
                        }
                      }}
                      onDragEnd={() => setDraggedSlideIndex(null)}
                      onDrop={e => {
                        e.preventDefault();
                        setDraggedSlideIndex(null);
                      }}
                      className={`relative aspect-[9/16] bg-stone-100 rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing transition-all border-2 ${
                        draggedSlideIndex === i ? 'border-dashed border-stone-300 bg-stone-200 shadow-inner' :
                        previewSlide === i ? 'border-neutral-800 shadow-md scale-100' : 'border-stone-200 hover:border-neutral-400 scale-100'
                      }`}
                    >
                      {draggedSlideIndex === i ? (
                        <div className="w-full h-full bg-stone-200" />
                      ) : (
                        <>
                          <button type="button" onClick={() => setPreviewSlide(i)} className="w-full h-full block">
                            {url ? <img src={url} className="w-full h-full object-cover pointer-events-none" alt="" /> : <div className="w-full h-full flex flex-col items-center justify-center text-stone-300"><ImageIcon size={24} className="mb-2" /><span className="text-[9px] uppercase font-bold text-center px-2">No Image</span></div>}
                          </button>

                          {/* Number Badge */}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none shadow-sm">
                            {i + 1}
                          </div>

                          {/* Remove Button */}
                          <button type="button" onClick={(e) => {
                            e.stopPropagation();
                            const newSlides = (form.slides ?? []).filter((_, idx) => idx !== i);
                            setF('slides', newSlides);
                            if (previewSlide >= newSlides.length) setPreviewSlide(Math.max(0, newSlides.length - 1));
                          }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10">
                            <X size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add New Slide Button Tile */}
                  <button type="button" onClick={() => {
                    fileInputRef.current?.click();
                  }} className="relative aspect-[9/16] bg-stone-50 border border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 transition-colors cursor-pointer group">
                    <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Slide</span>
                  </button>
                </div>

                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    
                    const newUrls = files.map(f => URL.createObjectURL(f));
                    setF('slides', [...(form.slides ?? []), ...newUrls]);
                    setPreviewSlide((form.slides ?? []).length); // Preview the first of the newly added slides
                    e.target.value = '';
                  }} />
              </>
            )}

            {/* ── Content Details ── */}

            {/* Pulse + Client Shareable Text, side by side — Count now lives with Project below */}
            {form.type === 'article' && (
              <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-3xl flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2">
                  <label className={lbl}>
                    <span>Pulse JSON (Raw Copy-Paste)</span>
                    <span className="text-[10px] text-stone-400 font-medium">{pulseRaw.length} chars</span>
                  </label>
                  {/* Same min-h as Client Shareable Text so they match by default; each grows
                      past that independently once its own content actually needs more room. */}
                  <AutoResizeTextarea
                    value={pulseRaw}
                    onChange={e => setPulseRaw(e.target.value)}
                    className={`${inp} font-mono text-[13px] bg-white resize-none min-h-[220px]`}
                    placeholder={`{\n  "heading": "...",\n  "text": "..."\n}`}
                  />
                </div>
                <div className="md:w-1/2">
                  <label className={lbl}>
                    <span>Client Shareable Text</span>
                    <span className="text-[10px] text-stone-400 font-medium">{(form.shared_text ?? '').length} chars</span>
                  </label>
                  <AutoResizeTextarea value={form.shared_text ?? ''} onChange={e => setF('shared_text', e.target.value || null)} className={`${inp} resize-none min-h-[220px]`} placeholder="Client-shareable copy…" />
                </div>
              </div>
            )}

            {/* Client Shareable Text (Carousel) */}
            {form.type === 'carousel' && (
              <div className="mb-6">
                <label className={lbl}>
                  <span>Client Shareable Text</span>
                  <span className="text-[10px] text-stone-400 font-medium">{(form.shared_text ?? '').length} chars</span>
                </label>
                <AutoResizeTextarea value={form.shared_text ?? ''} onChange={e => setF('shared_text', e.target.value || null)} rows={5} className={`${inp} resize-none min-h-[140px]`} placeholder="Client-shareable copy…" />
              </div>
            )}

            {/* Project + Client Shareable Count */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className={lbl}>Project</label>
                <ProjectSelect
                  projects={projects}
                  value={form.project_id ?? null}
                  onChange={val => setF('project_id', val)}
                />
              </div>
              {(form.type === 'article' || form.type === 'carousel') && (
                <div className="w-32 flex-shrink-0">
                  <label className={`${lbl} font-normal`}>Share Count</label>
                  <input
                    type="number"
                    min="0"
                    value={form.client_shares ?? ''}
                    onChange={e => setF('client_shares', e.target.value === '' ? null : parseInt(e.target.value) || 0)}
                    className={`${inp} font-mono text-center`}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className={lbl}>Category</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {TAGS.map(t => {
                  const selected = form.tag === t;
                  return (
                    <label key={t} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold cursor-pointer transition-all ${selected ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm shadow-neutral-900/20' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-neutral-300'}`}>
                      <input
                        type="radio"
                        className="hidden"
                        checked={selected}
                        onChange={() => setF('tag', t)}
                      />
                      {t}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── Client Shareable Text (Video) ── */}
            {form.type === 'video' && (
              <div className="mb-6">
                <label className={lbl}>
                  <span>Client Shareable Text</span>
                  <span className="text-[10px] text-stone-400 font-medium">{(form.shared_text ?? '').length} chars</span>
                </label>
                <AutoResizeTextarea value={form.shared_text ?? ''} onChange={e => setF('shared_text', e.target.value || null)} rows={5} className={`${inp} resize-none min-h-[140px] mb-4`} placeholder="Client-shareable copy…" />

                <label className={lbl}>Client Shareable Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.client_shares ?? ''}
                  onChange={e => setF('client_shares', e.target.value === '' ? null : parseInt(e.target.value) || 0)}
                  className={`${inp} max-w-[150px] font-mono text-lg font-bold text-center`}
                />
              </div>
            )}

            {/* Zone + Corridor, their own section — Corridor's city-wide list (Rings + Roads
                combined into one flat group), last field before Published At */}
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-3xl flex flex-col gap-4">
              <div>
                <label className={lbl}>Zone</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ZONES.map(z => {
                    const selected = (form.zone ?? []).includes(z);
                    return (
                      <label key={z} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold cursor-pointer transition-all ${selected ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm shadow-neutral-900/20' : 'bg-white text-stone-600 border-stone-200 hover:border-neutral-300'}`}>
                        <input type="checkbox" className="hidden" checked={selected}
                          onChange={e => {
                            const curr = new Set(form.zone ?? []);
                            if (e.target.checked) curr.add(z); else curr.delete(z);
                            setF('zone', Array.from(curr));
                          }}
                        />
                        {z}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={lbl}>Corridor</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CORRIDOR_GROUPS.flatMap(group => group.options).map(c => {
                    const selected = (form.corridor ?? []).includes(c);
                    return (
                      <label key={c} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold cursor-pointer transition-all ${selected ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm shadow-neutral-900/20' : 'bg-white text-stone-600 border-stone-200 hover:border-neutral-300'}`}>
                        <input type="checkbox" className="hidden" checked={selected}
                          onChange={e => {
                            const curr = new Set(form.corridor ?? []);
                            if (e.target.checked) curr.add(c);
                            else curr.delete(c);
                            setF('corridor', Array.from(curr));
                          }}
                        />
                        {c}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Published At — same picker + inline preview as the Project editor */}
            <div className="mt-2">
              <label className={lbl}>
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
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ImageIcon, Loader2, Eye, EyeOff, Trash2, Check, X,
  Copy, Plus, Scan, Upload, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  getPost, getPosts, createPost, updatePost, deletePost, blankPost,
  getProjects, ZONES, ZONE_MICROMARKETS, ZONE_CORRIDORS, TAGS,
} from '../../data/mockEdge';

const lbl = 'text-sm font-bold text-stone-600 mb-1.5 flex items-center justify-between';
const inp = 'w-full bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800 focus:border-neutral-400 focus:shadow-sm outline-none transition-all placeholder:text-stone-300';

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
    return (
      (p.id?.toLowerCase() || '').includes(s) ||
      (p.name?.toLowerCase() || '').includes(s) ||
      (p.codename?.toLowerCase() || '').includes(s) ||
      (p.builder?.toLowerCase() || '').includes(s) ||
      (p.micromarket?.toLowerCase() || '').includes(s)
    );
  });

  const selectedProj = projects.find(p => p.id === value);
  const displayValue = open ? search : (selectedProj ? selectedProj.id : value ?? '');

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        className={inp}
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
        placeholder="Search and select a project..."
      />
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
              <div className="w-20 shrink-0 text-sm font-mono font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md text-center">
                {p.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-stone-900 truncate">
                  {p.name || p.codename || 'Unnamed Project'}
                </div>
                <div className="text-sm text-stone-500 truncate flex items-center gap-2 mt-0.5">
                  {p.builder && <span className="font-medium text-stone-600">{p.builder}</span>}
                  {p.builder && p.micromarket && <span className="text-stone-300">•</span>}
                  {p.micromarket && <span>{p.micromarket}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomDateTimePicker({ value, onChange }) {
  const selectedDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleDayClick = (day) => {
    const newD = new Date(selectedDate);
    newD.setFullYear(year, month, day);
    onChange(newD.toISOString());
  };

  const handleTimeChange = (type, val) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) return;
    const newD = new Date(selectedDate);
    if (type === 'h') {
      if (num > 23) num = 23;
      if (num < 0) num = 0;
      newD.setHours(num);
    } else {
      if (num > 59) num = 59;
      if (num < 0) num = 0;
      newD.setMinutes(num);
    }
    onChange(newD.toISOString());
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-white border border-stone-200 rounded-3xl shadow-sm mb-12">
      {/* Calendar Section */}
      <div className="flex-1 w-full max-w-[280px]">
        <div className="flex items-center justify-between mb-4 px-1">
          <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors"><ChevronLeft size={16} /></button>
          <div className="font-bold text-sm text-stone-800">{months[month]} {year}</div>
          <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors"><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-[10px] font-bold text-stone-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="h-8 w-full" />;
            const isSelected = value && selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
            const isToday = new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year;
            return (
              <button
                type="button"
                key={i}
                onClick={() => handleDayClick(d)}
                className={`h-8 w-full rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-neutral-600 text-white shadow-md shadow-neutral-200 scale-105' : isToday ? 'bg-neutral-50 text-neutral-700' : 'hover:bg-stone-100 text-stone-700'}`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-48 bg-stone-100"></div>
      <div className="block md:hidden w-full h-px bg-stone-100"></div>

      {/* Time Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex items-center justify-center gap-4 text-center">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Hour (24h)</label>
            <input type="number" min="0" max="23" value={selectedDate.getHours().toString().padStart(2, '0')} onChange={e => handleTimeChange('h', e.target.value)} className="w-24 text-center text-3xl font-bold bg-stone-50 border border-stone-200 rounded-2xl py-3 outline-none focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-50 transition-all shadow-inner" />
          </div>
          <div className="text-3xl font-bold text-stone-300 mb-[-12px]">:</div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Minute</label>
            <input type="number" min="0" max="59" value={selectedDate.getMinutes().toString().padStart(2, '0')} onChange={e => handleTimeChange('m', e.target.value)} className="w-24 text-center text-3xl font-bold bg-stone-50 border border-stone-200 rounded-2xl py-3 outline-none focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-50 transition-all shadow-inner" />
          </div>
        </div>

        <div className="mt-8 flex gap-2 justify-center w-full max-w-[280px]">
          <button type="button" onClick={() => onChange(new Date().toISOString())} className="flex-1 py-3 bg-neutral-900 text-white font-bold text-sm rounded-xl hover:bg-neutral-950 transition-colors shadow-sm">Set to Now</button>
          <button type="button" onClick={() => onChange(null)} className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold text-sm rounded-xl hover:bg-stone-200 transition-colors">Clear</button>
        </div>
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
  const [uploadingSlides, setUploadingSlides] = useState(new Set());
  const fileInputRef = useRef(null);
  const uploadTargetIdx = useRef(null);
  const coverUploadRef = useRef(null);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

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
      setForm(blankPost(queryType));
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
    const published_at = newLive ? new Date().toISOString() : (form.published_at ?? null);
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
    <div className="bg-white">
      <div className={form.type === 'article' ? "max-w-2xl mx-auto px-6 py-4" : "max-w-5xl mx-auto px-6 py-4"}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/95 backdrop-blur py-4 -mx-6 px-6 z-40 border-b border-stone-200 shadow-sm">
          <Link
            to="/edge/posts"
            className="flex items-center gap-2 px-3 py-2 -ml-3 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors font-bold text-sm"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-3">
            {statusMsg && <span className={`text-xs font-bold uppercase tracking-widest px-2 ${statusMsg.toLowerCase().includes('fail') || statusMsg.toLowerCase().includes('delete') || statusMsg.toLowerCase().includes('error') ? 'text-red-500' : 'text-emerald-600'}`}>{statusMsg}</span>}

            {!isNew && (
              <button
                onClick={handleDelete}
                className={`p-2 rounded-full transition-colors ${deleteConfirm ? 'bg-red-100 text-red-600' : 'hover:bg-stone-100 text-stone-400 hover:text-red-500'}`}
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              onClick={handleToggleLive}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${form.is_live
                ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700'
                : 'bg-stone-100 text-stone-500 hover:bg-emerald-100 hover:text-emerald-700'
                }`}
            >
              {form.is_live ? <><Eye size={16} /> Live</> : <><EyeOff size={16} /> Draft</>}
            </button>

            <button
              onClick={() => isDirty ? handleSave(false) : navigate('/edge/posts')}
              disabled={isSaving}
              className={`flex items-center gap-1.5 min-w-[130px] justify-center text-white text-sm font-bold px-5 py-2 rounded-xl transition-all disabled:opacity-70 ${isSaving ? 'bg-stone-800' : isDirty ? 'bg-neutral-900 hover:bg-neutral-950 shadow-md shadow-neutral-900/20' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {isSaving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving…</>
              ) : isDirty ? (
                <>Save & Close</>
              ) : (
                <><Check size={16} /> Saved (Close)</>
              )}
            </button>
          </div>
        </div>


        <div className={form.type === 'article' ? "flex flex-col" : "flex flex-col md:flex-row gap-8 items-start"}>
          {/* Left Column: Cover Image (Carousel/Video) */}
          {form.type !== 'article' && (
            <div className="w-full md:w-auto flex-shrink-0 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] overflow-y-auto hide-scrollbar pb-4">
              <div className="mb-5 flex flex-col items-center">
                <div
                  className="relative bg-stone-100 border border-stone-200 rounded-3xl overflow-hidden shadow-sm mx-auto flex-shrink-0"
                  style={{ height: 'calc(100vh - 14rem)', aspectRatio: '9/16', maxHeight: '720px', minHeight: '400px' }}
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

                    const previewUrl = form.type === 'carousel' ? ((form.slides && form.slides[previewSlide]) || form.cover_image_url) : form.cover_image_url;
                    return previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100"><ImageIcon size={40} /></div>
                    );
                  })()}

                  {showSafeZones && (
                    <>
                      {/* Safe Zone 1080x1528 -> top/bottom 10.2% */}
                      <div
                        className="absolute border-2 border-dashed border-white/70 pointer-events-none"
                        style={{ top: '10.2%', bottom: '10.2%', left: '0', right: '0', zIndex: 10 }}
                      />
                      {/* Safe Text Zone 864x1222.4 -> top/bottom 18.16%, left/right 10% */}
                      <div
                        className="absolute border-2 border-dashed border-red-500/70 pointer-events-none"
                        style={{ top: '18.16%', bottom: '18.16%', left: '10%', right: '10%', zIndex: 10 }}
                      />
                    </>
                  )}
                </div>

                {/* Thumbnails & Tools for Carousel / Video */}
                {(form.type === 'carousel' || form.type === 'video') && (
                  <div className="flex gap-2 overflow-x-auto mt-4 w-full max-w-[full] pb-2 hide-scrollbar items-center" style={{ maxWidth: 'calc((100vh - 8rem) * 9 / 16)' }}>
                    <button
                      onClick={() => setShowSafeZones(!showSafeZones)}
                      className={`flex-shrink-0 w-12 h-16 rounded-md flex flex-col items-center justify-center text-[9px] font-bold uppercase transition-all border-2 ${showSafeZones ? 'border-neutral-500 bg-neutral-50 text-neutral-600' : 'border-stone-200 bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                    >
                      <Scan size={14} className="mb-1" />
                      Zones
                    </button>

                    {form.type === 'carousel' && (form.slides || []).map((slide, i) => (
                      <button
                        key={i}
                        onClick={() => setPreviewSlide(i)}
                        className={`relative flex-shrink-0 w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${previewSlide === i ? 'border-neutral-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        {slide ? <img src={slide} className="w-full h-full object-cover" alt={`Slide ${i + 1}`} /> : <ImageIcon size={20} className="text-stone-300 mx-auto mt-4" />}
                      </button>
                    ))}

                    {form.type === 'video' && (
                      <>
                        <button
                          onClick={() => setPreviewMode('image')}
                          className={`relative flex-shrink-0 w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${previewMode === 'image' ? 'border-neutral-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          title="Cover Image"
                        >
                          {form.cover_image_url ? <img src={form.cover_image_url} className="w-full h-full object-cover" alt="Cover" /> : <ImageIcon size={20} className="text-stone-300 mx-auto mt-4" />}
                        </button>
                        <button
                          onClick={() => setPreviewMode('video')}
                          className={`relative flex-shrink-0 w-12 h-16 rounded-md overflow-hidden border-2 transition-all flex flex-col items-center justify-center bg-stone-900 text-white ${previewMode === 'video' ? 'border-neutral-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          title="Video Player"
                        >
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                        </button>
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Right Column (Now Left): Form Fields */}
          <div className="flex-1 min-w-0 w-full pb-32">

            {/* Top ID Bar */}
            {!isNew && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                  <span className="text-xl font-bold font-mono text-stone-900 bg-white px-3 py-1 rounded-lg border border-stone-200">{form.id}</span>
                </div>

                <div className="flex flex-col sm:text-right gap-1">
                  {form.created_at && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Added on: <span className="text-stone-900">{new Date(form.created_at).toLocaleDateString()}</span></span>
                  )}
                  {form.published_at ? (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Updated: <span className="text-stone-900">{new Date(form.published_at).toLocaleDateString()}</span></span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Updated: <span className="text-stone-900">-</span></span>
                  )}
                </div>
              </div>
            )}

            {/* Article/Carousel action buttons */}
            {(form.type === 'article' || form.type === 'carousel') && !isNew && (
              <div className="flex gap-2 mb-5 flex-wrap">
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
                >
                  {copiedCardId === 'copy-' + form.id ? <><Check size={14} />Copied!</> : <><Copy size={14} />WhatsApp Copy</>}
                </button>
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

            {/* ── JSON Import ── */}
            {form.type === 'article' && (
              <div className="mb-6">
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 shadow-sm focus-within:border-stone-300 focus-within:ring-4 focus-within:ring-stone-100 focus-within:bg-white transition-all">
                  <AutoResizeTextarea
                    rows={6}
                    className="w-full bg-transparent border-none text-sm font-mono text-stone-700 outline-none resize-none placeholder:text-stone-400"
                    placeholder={`Drop JSON file here or paste text...\n\n{\n  "title": "...",\n  "summary": "...",\n  "pulse": [...],\n  "shared_text": "..."\n}`}
                    onChange={(e) => {
                      try {
                        const val = e.target.value;
                        if (!val.trim()) return;
                        const parsed = JSON.parse(val);
                        if (parsed.title) setF('title', parsed.title);
                        if (parsed.summary) setF('summary', parsed.summary);
                        if (parsed.shared_text) setF('shared_text', parsed.shared_text);
                        if (parsed.pulse && Array.isArray(parsed.pulse)) {
                          setPulseRaw(JSON.stringify(parsed.pulse, null, 2));
                        }
                        e.target.value = ''; // Clear after successful parse
                        setStatusMsg('JSON Applied ✓');
                        setTimeout(() => setStatusMsg(''), 2000);
                      } catch {
                        // Ignore errors while typing
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className={lbl}>
                <span>Title *</span>
                <span className="text-[10px] text-stone-400 font-medium">{(form.title ?? '').length} chars</span>
              </label>
              <AutoResizeTextarea
                value={form.title ?? ''}
                onChange={e => setF('title', e.target.value)}
                rows={1}
                className={`${inp} resize-none font-bold text-lg`}
                placeholder="Post title…"
              />
            </div>

            {/* ── Media (Cover Image, Notification Image, Video) ── */}
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-3xl">
              <div className="flex flex-col gap-6">
                {/* Cover Image */}
                {form.type !== 'carousel' && (
                  <div>
                    <label className={lbl}>Cover Image</label>
                    {form.type === 'article' && (
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
                    )}
                    <input
                      type="text"
                      value={form.cover_image_url ?? ''}
                      onChange={e => setF('cover_image_url', e.target.value || null)}
                      placeholder="Cover Image URL…"
                      className={`${inp} text-xs font-mono text-stone-500 bg-white`}
                    />
                  </div>
                )}

                {/* Notification Image */}
                <div>
                  <label className={lbl}>Notification Image (2:1)</label>
                  <div
                    className="relative aspect-[2/1] bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm mb-3 group transition-colors hover:border-neutral-300"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (!file) return;
                      setF('notif_image', URL.createObjectURL(file));
                      setStatusMsg('Image uploaded ✓');
                      setTimeout(() => setStatusMsg(''), 2000);
                    }}
                  >
                    {form.notif_image ? (
                      <img src={form.notif_image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Drag & Drop Image</span>
                      </div>
                    )}
                    {/* Manual Upload Button overlay */}
                    <label className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl text-stone-700 shadow hover:bg-white hover:text-stone-900 cursor-pointer transition-all opacity-0 group-hover:opacity-100 z-10 flex items-center gap-1.5 text-xs font-bold">
                      <Upload size={14} /> Upload
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setF('notif_image', URL.createObjectURL(file));
                        setStatusMsg('Image uploaded ✓');
                        setTimeout(() => setStatusMsg(''), 2000);
                        e.target.value = '';
                      }} />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={form.notif_image ?? ''}
                    onChange={e => setF('notif_image', e.target.value || null)}
                    placeholder="Notification Image URL…"
                    className={`${inp} text-xs font-mono text-stone-500 bg-white`}
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
                      className={`${inp} text-xs font-mono text-stone-500 bg-white`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Carousel Slides ── */}
            {form.type === 'carousel' && (
              <>
                <div className="flex items-center gap-2 mb-3 text-stone-400 font-bold uppercase tracking-widest text-[10px]">
                  <div className="flex-1 h-px bg-stone-200" /> Slides <div className="flex-1 h-px bg-stone-200" />
                </div>

                {/* Thumbnail scroll */}
                {(form.slides ?? []).some(Boolean) && (
                  <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
                    {(form.slides ?? []).map((url, i) => (
                      <button key={i} type="button" onClick={() => setPreviewSlide(i)}
                        className={`flex-shrink-0 w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${previewSlide === i ? 'border-neutral-500 scale-105 shadow-md' : 'border-stone-200 opacity-60 hover:opacity-100'}`}>
                        {url ? <img src={url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-stone-100 flex items-center justify-center"><ImageIcon size={14} className="text-stone-300" /></div>}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  {(form.slides ?? []).map((url, i) => (
                    <div key={i} draggable
                      onDragStart={e => { setDraggedSlideIndex(i); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                      onDrop={e => {
                        e.preventDefault();
                        if (draggedSlideIndex !== null && draggedSlideIndex !== i) {
                          const newSlides = [...(form.slides ?? [])];
                          const [dragged] = newSlides.splice(draggedSlideIndex, 1);
                          newSlides.splice(i, 0, dragged);
                          setF('slides', newSlides);
                          if (previewSlide === draggedSlideIndex) setPreviewSlide(i);
                          else if (previewSlide === i) setPreviewSlide(draggedSlideIndex);
                        }
                        setDraggedSlideIndex(null);
                      }}
                      className={`flex items-center gap-2 bg-white p-2 rounded-xl border-2 transition-all ${draggedSlideIndex === i ? 'border-neutral-300 opacity-50' : 'border-transparent hover:border-stone-200 cursor-grab active:cursor-grabbing shadow-sm'}`}
                    >
                      <button type="button" onClick={() => setPreviewSlide(i)}
                        className="w-12 h-16 bg-stone-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center text-stone-300 border border-stone-200">
                        {url ? <img src={url} className="w-full h-full object-cover pointer-events-none" alt="" /> : <ImageIcon size={18} />}
                      </button>
                      <input value={url}
                        onChange={e => { const s = [...(form.slides ?? [])]; s[i] = e.target.value; setF('slides', s); }}
                        className={`${inp} flex-1 text-sm font-mono`} placeholder={`Slide ${i + 1} URL`} />
                      <button type="button" title="Upload from device"
                        onClick={() => { uploadTargetIdx.current = i; fileInputRef.current?.click(); }}
                        disabled={uploadingSlides.has(i)}
                        className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0">
                        {uploadingSlides.has(i) ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      </button>
                      <button type="button" onClick={() => {
                        const newSlides = (form.slides ?? []).filter((_, idx) => idx !== i);
                        setF('slides', newSlides);
                        if (previewSlide >= newSlides.length) setPreviewSlide(Math.max(0, newSlides.length - 1));
                      }} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mb-6">
                  <button type="button" onClick={() => setF('slides', [...(form.slides ?? []), ''])}
                    className="flex-1 flex items-center gap-1.5 px-3 py-3 bg-stone-50 text-stone-600 hover:bg-stone-100 border border-dashed border-stone-300 rounded-xl text-xs font-bold transition-colors justify-center">
                    <Plus size={15} /> Add URL
                  </button>
                  <button type="button" onClick={() => {
                    const idx = (form.slides ?? []).length;
                    setF('slides', [...(form.slides ?? []), '']);
                    uploadTargetIdx.current = idx;
                    setTimeout(() => fileInputRef.current?.click(), 50);
                  }} className="flex-1 flex items-center gap-1.5 px-3 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-dashed border-blue-300 rounded-xl text-xs font-bold transition-colors justify-center">
                    <Upload size={15} /> From Device
                  </button>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file && uploadTargetIdx.current !== null) uploadSlide(file, uploadTargetIdx.current);
                    e.target.value = '';
                    uploadTargetIdx.current = null;
                  }} />
              </>
            )}

            {/* ── Content Details ── */}

            {/* 1. Summary */}
            {form.type === 'article' && (
              <div className="mb-4">
                <label className={lbl}>
                  <span>Summary</span>
                  <span className="text-[10px] text-stone-400 font-medium">{(form.summary ?? '').length} chars</span>
                </label>
                <AutoResizeTextarea value={form.summary ?? ''} onChange={e => setF('summary', e.target.value || null)} rows={5} className={`${inp} resize-none min-h-[140px]`} placeholder="Brief summary…" />
              </div>
            )}

            {/* 2. Pulse */}
            {form.type === 'article' && (
              <div className="mb-4">
                <label className={lbl}>Pulse JSON (Raw Copy-Paste)</label>
                <AutoResizeTextarea
                  value={pulseRaw}
                  onChange={e => setPulseRaw(e.target.value)}
                  rows={5}
                  className={`${inp} font-mono text-[13px] bg-stone-50 resize-none min-h-[140px]`}
                  placeholder={`{\n  "heading": "...",\n  "text": "..."\n}`}
                />
              </div>
            )}

            {/* 3. Client Shareable Text (Article/Carousel) */}
            {form.type !== 'video' && (
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
                  value={form.client_shares ?? 0}
                  onChange={e => setF('client_shares', parseInt(e.target.value) || 0)}
                  className={`${inp} max-w-[150px] font-mono text-lg font-bold text-center`}
                />
              </div>
            )}

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
                  value={form.client_shares ?? 0}
                  onChange={e => setF('client_shares', parseInt(e.target.value) || 0)}
                  className={`${inp} max-w-[150px] font-mono text-lg font-bold text-center`}
                />
              </div>
            )}

            {/* Project */}
            <div className="mb-5 mt-8">
              <label className={lbl}>Project</label>
              <ProjectSelect
                projects={projects}
                value={form.project_id ?? null}
                onChange={val => setF('project_id', val)}
              />
            </div>

            {/* Zone */}
            <div className="mb-4">
              <label className={lbl}>Zone</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ZONES.map(z => {
                  const selected = (form.zone ?? []).includes(z);
                  return (
                    <label key={z} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold cursor-pointer transition-all ${selected ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm shadow-neutral-900/20' : 'bg-white text-stone-600 border-stone-200 hover:border-neutral-300'}`}>
                      <input type="checkbox" className="hidden" checked={selected}
                        onChange={e => {
                          const curr = new Set(form.zone ?? []);
                          if (e.target.checked) { curr.add(z); }
                          else {
                            curr.delete(z);
                            // clear micromarkets/corridors that no longer have a parent zone
                            const remaining = Array.from(curr);
                            const validMM = remaining.flatMap(zz => ZONE_MICROMARKETS[zz] ?? []);
                            setF('micromarket', (form.micromarket ?? []).filter(m => validMM.includes(m)));
                            const validCo = remaining.flatMap(zz => ZONE_CORRIDORS[zz] ?? []);
                            setF('corridor', (form.corridor ?? []).filter(c => validCo.includes(c)));
                          }
                          setF('zone', Array.from(curr));
                        }}
                      />
                      {z}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Micromarket — appears when zone selected */}
            {(form.zone ?? []).length > 0 && (() => {
              const opts = [...new Set((form.zone ?? []).flatMap(z => ZONE_MICROMARKETS[z] ?? []))];
              return (
                <div className="mb-4">
                  <label className={lbl}>Micromarket</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {opts.map(m => {
                      const selected = (form.micromarket ?? []).includes(m);
                      return (
                        <label key={m} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold cursor-pointer transition-all ${selected ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm shadow-neutral-900/20' : 'bg-white text-stone-600 border-stone-200 hover:border-neutral-300'}`}>
                          <input type="checkbox" className="hidden" checked={selected}
                            onChange={e => {
                              const curr = new Set(form.micromarket ?? []);
                              if (e.target.checked) curr.add(m);
                              else curr.delete(m);
                              setF('micromarket', Array.from(curr));
                            }}
                          />
                          {m}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Corridor — appears when zone selected */}
            {(form.zone ?? []).length > 0 && (() => {
              const opts = [...new Set((form.zone ?? []).flatMap(z => ZONE_CORRIDORS[z] ?? []))];
              return (
                <div className="mb-4">
                  <label className={lbl}>Corridor</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {opts.map(c => {
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
              );
            })()}

            {/* Published At */}
            <div className="mb-4 mt-2">
              <label className={lbl}>
                <span>Published At <span className="text-red-500">*</span></span>
              </label>
              <CustomDateTimePicker
                value={form.published_at ?? null}
                onChange={val => setF('published_at', val)}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

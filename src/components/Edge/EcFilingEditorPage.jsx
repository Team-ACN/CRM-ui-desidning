import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { kml as kmlToGeoJson } from '@tmcw/togeojson';
import {
  ArrowLeft, RefreshCw, UploadCloud, Building2, Check, ChevronDown, Map as MapIcon, Satellite, Copy,
} from 'lucide-react';
import {
  getEcScrape, updateEcScrape, pushEcScrapeToProjects,
  matchDeveloper,
  DEVELOPER_STATUS_OPTIONS, PROJECT_STATUS_OPTIONS, KML_STATUS_OPTIONS, SITE_PLAN_STATUS_OPTIONS,
  LAYOUT_TYPES, CONFIGURATIONS,
} from '../../data/mockEc';
import { getProject, updateProject } from '../../data/mockEdge';

const inp = 'w-full bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-base text-stone-800 focus:border-neutral-400 focus:shadow-sm outline-none transition-all placeholder:text-stone-300';

function FieldLabel({ children }) {
  return <label className="text-sm font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">{children}</label>;
}

function formatDate(d) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

// Same tone rule as the pipeline list — dark green for a clean pass, amber for "needs a look",
// red for a script error, light gray for missing/not-found/no.
function toneFor(dim, value) {
  if (dim === 'overall') return MANUAL_TONE[value] || 'neutral';
  if (value === 'error') return 'bad';
  if (value === 'overlap' || value === 'partial') return 'warn';
  if (value === 'found' || value === 'yes' || value === 'clear' || value === 'extracted' || value === 'manual') return 'good';
  return 'neutral';
}
const TONE_CLASS = {
  good: 'bg-green-100 text-green-700 border-green-200',
  warn: 'bg-amber-100 text-amber-600 border-amber-200',
  bad: 'bg-red-100 text-red-600 border-red-200',
  neutral: 'bg-stone-100 text-stone-400 border-stone-200',
};
const TONE_TEXT = {
  good: 'text-green-700',
  warn: 'text-amber-600',
  bad: 'text-red-600',
  neutral: 'text-stone-400',
};
const MANUAL_TONE = { live: 'good', new: 'warn', hold: 'neutral', reject: 'bad', pending: 'neutral' };

// Labels for the read-only status pill in the header — same values the status dot draws from,
// plus 'pending' (the default state before either triage action below has been taken).
const HEADER_STATUS_LABELS = [
  { value: 'pending', label: 'Pending' },
  { value: 'hold', label: 'Hold' },
  { value: 'reject', label: 'Reject' },
  { value: 'live', label: 'Live' },
  { value: 'new', label: 'Removed' },
];

function Pill({ dim, value, options }) {
  const tone = toneFor(dim, value);
  const label = options?.find(o => o.value === value)?.label || value;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded border text-[11px] font-medium uppercase tracking-wider ${TONE_CLASS[tone]}`}>
      {label}
    </span>
  );
}

// The status pill itself, made clickable — picking a value here is the manual override, no
// separate "Manual override" row of buttons needed.
function StatusDropdown({ dim, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const tone = toneFor(dim, value);
  const label = options.find(o => o.value === value)?.label || value;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium uppercase tracking-wider transition-colors ${TONE_CLASS[tone]}`}
      >
        {label} <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-20 py-1 w-32">
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[13px] font-medium transition-colors outline-none ${TONE_TEXT[toneFor(dim, o.value)]} ${o.value === value ? 'bg-stone-50' : 'hover:bg-stone-50'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// A dropdown checklist for array-valued fields (Layout, Config) — same checkbox-list convention
// used by the filter dropdowns elsewhere in Edge, just backing a data field instead of a filter.
function MultiSelectDropdown({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function toggleValue(v) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} className={`${inp} flex items-center justify-between text-left`}>
        <span className={`truncate ${value.length ? '' : 'text-stone-300'}`}>{value.length ? value.join(', ') : placeholder}</span>
        <ChevronDown size={16} className={`text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-30 max-h-64 overflow-y-auto py-1">
          {options.map(o => {
            const checked = value.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => toggleValue(o)}
                className={`w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm transition-colors ${checked ? 'text-stone-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-neutral-900 border-neutral-900' : 'border-stone-300'}`}>
                  {checked && <Check size={11} className="text-white" />}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


// Illustrative boundary map — deterministic per filing id (no real geometry backing this mock),
// so overlap can actually be seen instead of just read as a status word.
const TILE_LAYERS = {
  normal: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
};

// Real geometry isn't wired up yet (no backend), so each filing is deterministically assigned one
// of a few bundled sample KML boundaries (public/kml-samples) purely to demonstrate what actual
// KML rendering + overlap detection will look like once real files are coming in.
// plot-a and plot-b's coordinates genuinely intersect (see the .kml files) — plot-c sits far away
// and never overlaps anything. So a filing marked "overlap" must always get plot-a as its own
// boundary; picking plot-c there (as pure id-parity used to) would draw two shapes that never
// actually touch, even though the status says they do.
function sampleKmlFor(e) {
  if (!e.kml_file) return null;
  if (e.status.kml === 'overlap') return '/kml-samples/plot-a.kml';
  const n = parseInt(e.id.slice(2), 10) || 0;
  return n % 2 === 0 ? '/kml-samples/plot-a.kml' : '/kml-samples/plot-c.kml';
}

// Matching centroids for the sample files above, so a "copy lat/long" action has something real
// to copy without needing to reach into the live Leaflet instance from outside this component.
const SAMPLE_CENTROIDS = {
  '/kml-samples/plot-a.kml': { lat: 12.971150, lng: 77.749750 },
  '/kml-samples/plot-c.kml': { lat: 12.902000, lng: 77.687000 },
};
function sampleCentroidFor(e) {
  const file = sampleKmlFor(e);
  return file ? SAMPLE_CENTROIDS[file] : null;
}

// overlapWith is stored as display strings like "Sobha Neopolis (P0002)" — pull the real project
// out of each one so an overlap can actually be resolved (and its developer shown) against the
// live project records, not just echoed back as text. A filing can clash with more than one.
function overlapProjects(e) {
  return (e._demo?.overlapWith || []).map(raw => {
    const match = raw.match(/\(([A-Z]\d+)\)/);
    const id = match ? match[1] : null;
    const project = id ? getProject(id) : null;
    return {
      id,
      name: project?.name || raw.replace(/\s*\([^)]*\)\s*$/, ''),
      developerName: project?.builder_name || project?.rawBuilderName || null,
    };
  }).filter(o => o.id);
}

function RealKmlMap({ e, mode, onModeChange, onUploadKml }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const dataLayerRef = useRef(null);
  const hasKml = !!e.kml_file;
  const overlap = e.status.kml === 'overlap';

  // No KML yet → no map container is rendered at all (see below), so this waits on hasKml
  // rather than mounting once — it (re)runs the moment a KML gets attached and the container
  // div actually exists to initialize into.
  useEffect(() => {
    if (!hasKml || !containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { attributionControl: false }).setView([12.9716, 77.7], 12);
    mapRef.current = map;
    // The container is sized by an aspect-ratio class, which can settle a tick after Leaflet's
    // own initial measurement — one deferred invalidateSize keeps the tiles from looking cropped.
    setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hasKml]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const cfg = TILE_LAYERS[mode] || TILE_LAYERS.normal;
    tileLayerRef.current = L.tileLayer(cfg.url, { maxZoom: 19, attribution: cfg.attribution }).addTo(map);
  }, [mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    if (dataLayerRef.current) {
      map.removeLayer(dataLayerRef.current);
      dataLayerRef.current = null;
    }

    const ownFile = sampleKmlFor(e);
    if (!ownFile) return undefined;
    const overlapFile = overlap ? '/kml-samples/plot-b.kml' : null;
    const files = [{ url: ownFile, color: '#16a34a' }, ...(overlapFile ? [{ url: overlapFile, color: '#dc2626' }] : [])];

    Promise.all(files.map(f => fetch(f.url)
      .then(r => r.text())
      .then(text => ({ color: f.color, geojson: kmlToGeoJson(new DOMParser().parseFromString(text, 'text/xml')) }))))
      .then(results => {
        if (cancelled || !mapRef.current) return;
        const group = L.layerGroup();
        let bounds = null;
        results.forEach(({ geojson, color }) => {
          const layer = L.geoJSON(geojson, { style: { color, weight: 2, fillColor: color, fillOpacity: 0.25 } });
          layer.addTo(group);
          const b = layer.getBounds();
          if (b.isValid()) bounds = bounds ? bounds.extend(b) : b;
        });
        group.addTo(map);
        dataLayerRef.current = group;
        if (bounds) map.fitBounds(bounds, { padding: [24, 24] });
      })
      .catch(() => {});

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e.id, e.status.kml, e.kml_file]);

  if (!hasKml) {
    return (
      <div className="rounded-2xl border border-stone-200 overflow-hidden">
        <button
          onClick={onUploadKml}
          className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-stone-50 transition-colors"
        >
          <UploadCloud size={32} className="text-stone-300" />
          <span className="text-sm text-stone-400">Click to upload KML</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 overflow-hidden">
      <div className="relative isolate">
        <div ref={containerRef} className="w-full aspect-[4/3]" />
        <div className="absolute bottom-2 left-2 z-[1000] flex items-center gap-1 bg-white rounded-lg shadow border border-stone-200 p-1">
          <button onClick={() => onModeChange('normal')} title="Normal view" className={`p-1.5 rounded transition-colors ${mode === 'normal' ? 'bg-stone-200 text-stone-900' : 'text-stone-400 hover:text-stone-700'}`}><MapIcon size={14} /></button>
          <button onClick={() => onModeChange('satellite')} title="Satellite view" className={`p-1.5 rounded transition-colors ${mode === 'satellite' ? 'bg-stone-200 text-stone-900' : 'text-stone-400 hover:text-stone-700'}`}><Satellite size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default function EcFilingEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshTick, setRefreshTick] = useState(0);
  const [mapMode, setMapMode] = useState('normal');
  const [copiedLatLng, setCopiedLatLng] = useState(false);
  const [savedSpecs, setSavedSpecs] = useState(false);
  const [specsDirty, setSpecsDirty] = useState(false);
  const [updatedProjectIds, setUpdatedProjectIds] = useState([]);
  const [addedProjectId, setAddedProjectId] = useState(null);
  const [pendingOverall, setPendingOverall] = useState(null);
  const refresh = () => setRefreshTick(t => t + 1);

  // Save Specs should only light up once there's actually something unsaved for this filing.
  useEffect(() => setSpecsDirty(false), [id]);
  // Same deal for the header status toggle — picking a value stages it, Save commits it.
  useEffect(() => setPendingOverall(null), [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const e = useMemo(() => getEcScrape(id), [id, refreshTick]);

  if (!e) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-stone-400 gap-3 bg-white">
        <span className="text-sm font-medium">Filing not found.</span>
        <Link to="/ec" className="text-stone-500 hover:text-stone-900 underline text-sm">Back to EC Pipeline</Link>
      </div>
    );
  }

  function setJsonField(key, value) {
    updateEcScrape(e.id, { json_data: { [key]: value } });
    refresh();
  }
  function setSpecField(key, value) {
    setJsonField(key, value);
    setSpecsDirty(true);
  }

  function runDeveloperMatch() {
    const match = matchDeveloper(e.proponent);
    updateEcScrape(e.id, {
      status: { developer: match ? 'found' : 'not-found' },
      json_data: { developer_name: match ? match.builderName : e.json_data.developer_name || null },
    });
    refresh();
  }
  function overrideStatus(dim, value) {
    updateEcScrape(e.id, { status: { [dim]: value } });
    refresh();
  }
  function runKmlCheck() {
    const outcome = e._demo?.kmlOutcome || 'missing';
    updateEcScrape(e.id, { status: { kml: outcome }, kml_file: outcome !== 'missing' ? (e.kml_file || `/mock/kml/${e.id.toLowerCase()}.kml`) : e.kml_file });
    refresh();
  }
  function handleCopyLatLng() {
    const centroid = sampleCentroidFor(e);
    if (!centroid) return;
    navigator.clipboard.writeText(`${centroid.lat.toFixed(6)}, ${centroid.lng.toFixed(6)}`).then(() => {
      setCopiedLatLng(true);
      setTimeout(() => setCopiedLatLng(false), 1500);
    });
  }
  // Every field here already writes through on change (same pattern as the rest of this page) —
  // this button is a deliberate confirmation step, not a real pending-save gate. It only lights up
  // once specsDirty is set, so it doesn't look actionable when there's nothing new to confirm.
  function handleSaveSpecs() {
    setSavedSpecs(true);
    setSpecsDirty(false);
    setTimeout(() => setSavedSpecs(false), 1500);
  }
  function attachKmlManually() {
    updateEcScrape(e.id, { status: { kml: 'clear' }, kml_file: `/mock/kml/${e.id.toLowerCase()}-manual.kml` });
    refresh();
  }
  // Overlap means this filing is really the same site as an already-live project — instead of
  // creating a duplicate, push the resolved specs / boundary onto that existing project record.
  // A filing can clash with more than one project, so every action here is keyed by project id.
  function updateOverlappingProject(pid) {
    const project = getProject(pid);
    updateProject(pid, {
      description: e.json_data.description || project?.description,
      total_units: e.json_data.units ?? project?.total_units,
      floor: e.json_data.floor || project?.floor,
      layouts: e.json_data.layout?.length ? e.json_data.layout : project?.layouts,
      configurations: e.json_data.config?.length ? e.json_data.config : project?.configurations,
      land_area_acres: e.json_data.land_area_acres ?? project?.land_area_acres,
      kml_file_url: e.kml_file || project?.kml_file_url,
    });
    setUpdatedProjectIds(ids => [...ids, pid]);
    setTimeout(() => setUpdatedProjectIds(ids => ids.filter(x => x !== pid)), 1500);
  }
  // The alternative to resolving into an existing project — ignore the overlap and file this as
  // its own new project anyway.
  function addAsNewProject() {
    const created = pushEcScrapeToProjects(e.id);
    if (created) setAddedProjectId(created.id);
  }
  // Finding the PDF and pulling specs out of it used to be two separate buttons — folded into
  // one action here, since extracting only ever makes sense once a site plan has been found.
  function runSitePlanSearch() {
    const outcome = e._demo?.sitePlanOutcome || 'missing';
    const patch = { status: { site_plan: outcome }, site_plan: outcome === 'extracted' ? (e.site_plan || '/site-plans/goyal-hariyana-orchid-greens.pdf') : e.site_plan };
    if (outcome === 'extracted' && !e.json_data.description) {
      patch.json_data = {
        units: 800, floor: 'G+20', land_area_acres: 5, layout: ['Apartment'], config: ['2BHK', '3BHK'],
        description: 'Extracted from site plan (sample).',
      };
      setSpecsDirty(true);
    }
    updateEcScrape(e.id, patch);
    refresh();
  }
  function attachSitePlanManually() {
    updateEcScrape(e.id, { status: { site_plan: 'manual' }, site_plan: '/site-plans/goyal-hariyana-orchid-greens.pdf' });
    refresh();
  }
  function setManualCheck(value) {
    updateEcScrape(e.id, { status: { overall: value } });
    refresh();
  }
  // The header toggle only stages a pick in pendingOverall — this is what actually commits it.
  // Triaging a filing is this page's whole job, so once it's saved there's nothing left to do
  // here — head straight back to wherever the pipeline list was left (filters, page, scroll).
  function handleSaveOverall() {
    if (pendingOverall == null) return;
    setManualCheck(pendingOverall);
    navigate(-1);
  }
  return (
    <div className="bg-white min-h-screen">
      <div className="w-full px-6 md:px-10 pb-32">
        <div className="h-16 flex items-center justify-between mb-6 sticky top-0 bg-stone-50/95 backdrop-blur -mx-6 md:-mx-10 px-6 md:px-10 z-40 border-b border-stone-200">
          <Link to="/ec" className="flex items-center gap-1 px-2 py-1 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors font-medium text-[13px]">
            <ArrowLeft size={15} /><span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <StatusDropdown dim="overall" value={pendingOverall ?? e.status.overall} options={HEADER_STATUS_LABELS} onChange={setPendingOverall} />
            <button
              onClick={handleSaveOverall}
              disabled={pendingOverall == null}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${pendingOverall != null ? 'text-white bg-neutral-900 hover:bg-neutral-950' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
            >
              Save
            </button>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-lg font-mono font-semibold text-stone-900">{e.id}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-stone-100 text-stone-500">{e.source}</span>
            <span className="text-sm text-stone-400 ml-auto">Added {formatDate(e.added_date)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500 font-mono">{e.sia_id}</span>
            <span className="text-stone-400">Submitted {formatDate(e.date_of_submission)}</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Part 1 — Filing Info */}
          <div>
            <div className="space-y-6">

              <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-sm text-stone-500">
                    Developer: <span className="font-medium text-stone-800">{e.json_data.developer_name || ''}</span>
                  </div>
                  <div className="text-sm text-stone-500">
                    Proponent: <span className="font-medium text-stone-800">{e.proponent}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Pill dim="developer" value={e.status.developer} options={DEVELOPER_STATUS_OPTIONS} />
                  <button onClick={runDeveloperMatch} title="Run" className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors">
                    <RefreshCw size={16} />
                  </button>
                  <Link to="/edge/project/developers" title="Open Developers table" className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors">
                    <Building2 size={16} />
                  </Link>
                </div>
              </div>

            <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-4">
              <p className="text-sm text-stone-800 font-medium">{e.name}</p>
              <StatusDropdown dim="project" value={e.status.project} options={PROJECT_STATUS_OPTIONS} onChange={v => overrideStatus('project', v)} />
            </div>
            </div>
          </div>

          {/* Part 2 — Site Plan */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden">
                {e.site_plan ? (
                  <iframe src={`${e.site_plan}#toolbar=0&navpanes=0`} title="Site plan" className="w-full h-full min-h-[460px] block" />
                ) : (
                  <button
                    onClick={attachSitePlanManually}
                    className="w-full min-h-[460px] flex flex-col items-center justify-center gap-3 py-10 text-center cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <UploadCloud size={32} className="text-stone-300" />
                    <span className="text-sm text-stone-400">Click to upload site plan</span>
                  </button>
                )}
              </div>

              <div className="lg:col-span-1 self-start p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <button onClick={attachSitePlanManually} title="Upload manually" className="p-1.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                    <UploadCloud size={14} />
                  </button>
                  <div className="flex items-center gap-1">
                    <Pill dim="site_plan" value={e.status.site_plan} options={SITE_PLAN_STATUS_OPTIONS} />
                    <button onClick={runSitePlanSearch} title="Run" className="p-1.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1.5 flex items-center justify-between gap-1.5">
                    <span>Area</span>
                    <span className="text-[11px] text-stone-400 font-medium normal-case">
                      = <span className="font-semibold text-stone-600">{e.json_data.land_area_acres != null ? e.json_data.land_area_acres.toFixed(2) : '0.00'} acres</span>
                    </span>
                  </label>
                  <input
                    type="number" step="any"
                    value={e.json_data.land_area_acres != null ? (e.json_data.land_area_acres * 4046.85642).toFixed(2) : ''}
                    onChange={ev => setSpecField('land_area_acres', ev.target.value ? parseFloat(ev.target.value) / 4046.85642 : null)}
                    className={inp}
                    placeholder="Sq. m"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Units</FieldLabel>
                    <input type="number" value={e.json_data.units ?? ''} onChange={ev => setSpecField('units', ev.target.value ? parseInt(ev.target.value, 10) : null)} className={inp} />
                  </div>
                  <div>
                    <FieldLabel>Floor</FieldLabel>
                    <input value={e.json_data.floor || ''} onChange={ev => setSpecField('floor', ev.target.value || null)} className={inp} placeholder="e.g. G+20" />
                  </div>
                </div>

                <div>
                  <FieldLabel>Layout</FieldLabel>
                  <MultiSelectDropdown options={LAYOUT_TYPES} value={e.json_data.layout || []} onChange={v => setSpecField('layout', v)} placeholder="Select layout..." />
                </div>

                <div>
                  <FieldLabel>Config</FieldLabel>
                  <MultiSelectDropdown options={CONFIGURATIONS} value={e.json_data.config || []} onChange={v => setSpecField('config', v)} placeholder="Select config..." />
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <button
                    onClick={handleSaveSpecs}
                    disabled={!specsDirty}
                    className={`w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${specsDirty ? 'text-white bg-neutral-900 hover:bg-neutral-950' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                  >
                    {savedSpecs ? <><Check size={14} /> Saved</> : 'Save Specs'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Part 3 — Location (KML) */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RealKmlMap e={e} mode={mapMode} onModeChange={setMapMode} onUploadKml={attachKmlManually} />
              </div>

              <div className="lg:col-span-1 self-start space-y-3">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button onClick={attachKmlManually} title="Upload KML manually" className="p-1.5 rounded text-stone-400 hover:text-stone-700 transition-colors">
                        <UploadCloud size={14} />
                      </button>
                      <button onClick={handleCopyLatLng} title="Copy center lat/long" className="p-1.5 rounded text-stone-400 hover:text-stone-700 transition-colors">
                        {copiedLatLng ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill dim="kml" value={e.status.kml} options={KML_STATUS_OPTIONS} />
                      <button onClick={runKmlCheck} title="Run" className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors">
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Codename</FieldLabel>
                    <input value={e.json_data.codename || ''} onChange={ev => setJsonField('codename', ev.target.value || null)} className={inp} placeholder="Internal short name" />
                  </div>
                </div>

                {e.status.kml === 'overlap' && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    {overlapProjects(e).map(o => (
                      <div key={o.id} className="space-y-2">
                        <div className="text-sm text-stone-600">
                          {o.developerName || 'Unknown developer'} <span className="font-mono text-stone-400">({o.id})</span>
                        </div>
                        <button onClick={() => updateOverlappingProject(o.id)} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 transition-colors">
                          {updatedProjectIds.includes(o.id) ? <><Check size={14} className="text-green-600" /> Updated</> : 'Update this project'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Independent of the overlap-project list above — this filing can be pushed in as
                    its own new project any time it's still in play, whether or not it happens to
                    overlap anything. Only hidden once it's settled as Live or Removed. */}
                {e.status.overall !== 'live' && e.status.overall !== 'new' && (
                  <button onClick={addAsNewProject} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-950 transition-colors">
                    {addedProjectId ? <><Check size={14} /> Added as new project</> : 'Add new project'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

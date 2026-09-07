import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, PlusCircle, Loader2, Search, X, Edit2, Image as ImageIcon, ImagePlus, Filter, Map, FileText, ChevronDown, Check } from 'lucide-react';
import { getProjects, getBuilders, ZONES, LAYOUTS, BUILDER_CATEGORIES } from '../../data/mockEdge';

const DEFAULT_STATUSES = ['live', 'drafted'];

const STATUS_OPTIONS = [
  { value: 'live', label: 'Live' },
  { value: 'drafted', label: 'Draft' },
  { value: 'resale', label: 'Resale' },
  { value: 'archive', label: 'Archive' },
];

const STAGE_OPTIONS = [
  { value: 'Prelaunch', label: 'Pre-launch' },
  { value: 'Developer', label: 'Developer' },
  { value: 'RERA', label: 'RERA' },
];

const POSSESSION_SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'soonest', label: 'Nearest first' },
];

const BUILDER_CATEGORY_OPTIONS = BUILDER_CATEGORIES.map(c => ({ value: c, label: `Category ${c}` }));

const DATA_HEALTH_OPTIONS = [
  { value: 'noCover', label: 'No cover image' },
  { value: 'noNotifImage', label: 'No notification image' },
  { value: 'noPricing', label: 'No pricing' },
  { value: 'noFloor', label: 'No building floor' },
  { value: 'noConfig', label: 'No config' },
  { value: 'noMasterPlan', label: 'No master plan' },
  { value: 'noBrochure', label: 'No brochure' },
];

// Every multi-select filter uses "selected = []" to mean "All" (no restriction on that dimension)
function matchesStatusFn(p, selected) {
  return selected.length === 0 || selected.includes(p.status);
}
function matchesStageFn(p, selected) {
  return selected.length === 0 || selected.includes(p.launch_status);
}
function matchesZoneFn(p, selected) {
  return selected.length === 0 || selected.includes(p.zone);
}
function matchesAssetTypeFn(p, selected) {
  return selected.length === 0 || (p.layouts || []).some(l => selected.includes(l));
}
function matchesOneDataHealth(p, v) {
  switch (v) {
    case 'noCover': return !p.cover_image_url;
    case 'noNotifImage': return !p.notif_image;
    case 'noPricing': return !p.pricing;
    case 'noFloor': return !p.floor;
    case 'noConfig': return !p.configurations || p.configurations.length === 0;
    case 'noMasterPlan': return !p.master_plan_url;
    case 'noBrochure': return !p.brochure_url;
    default: return false;
  }
}
function matchesDataHealthFn(p, selected) {
  return selected.length === 0 || selected.some(v => matchesOneDataHealth(p, v));
}

function zoneShort(z) {
  return z ? z.replace(' Bangalore', '') : z;
}

function summarize(selected, options, allLabel) {
  if (selected.length === 0) return allLabel;
  return options.filter(o => selected.includes(o.value)).map(o => o.label).join(', ');
}

function getNextPossessionDate(p) {
  if (!p.phase_details || p.phase_details.length === 0) return null;
  const futureDates = p.phase_details
    .map(ph => new Date(ph.handover_date))
    .filter(d => !isNaN(d.getTime()) && d.getTime() > Date.now())
    .sort((a, b) => a.getTime() - b.getTime());
  return futureDates[0] || null;
}

// Single-choice custom dropdown (used for the Possession sort order — inherently one value at a time)
function FilterSelect({ label, value, onChange, options, defaultValue }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const current = options.find(o => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-left hover:bg-stone-100 hover:border-stone-300 transition-colors"
      >
        <span className="flex flex-col min-w-0">
          {value !== defaultValue && <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{label}</span>}
          <span className="truncate text-[13px] font-medium text-stone-700">{value === defaultValue ? label : current?.label}</span>
        </span>
        <ChevronDown size={14} className={`text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg z-20 py-1">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-[13px] transition-colors ${o.value === value ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check size={14} className="shrink-0 text-stone-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Multi-choice dropdown — tick as many options as you want, plus an "All" row that clears the selection
function MultiFilterSelect({ label, allLabel, allCount, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function toggle(v) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-1.5 text-left transition-colors ${value.length > 0 ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'}`}
      >
        <span className="flex flex-col min-w-0">
          {value.length > 0 && <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</span>}
          <span className="truncate text-[13px] font-medium">{value.length > 0 ? summarize(value, options, allLabel) : label}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${value.length > 0 ? 'text-white/70' : 'text-stone-400'} ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg z-20 py-1">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-[13px] transition-colors border-b border-stone-100 mb-1 ${value.length === 0 ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <span className="flex items-center gap-2 truncate">
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${value.length === 0 ? 'bg-neutral-900 border-neutral-900' : 'border-stone-300'}`}>
                {value.length === 0 && <Check size={11} className="text-white" />}
              </span>
              {allLabel}
            </span>
            {typeof allCount === 'number' && <span className="text-[11px] text-stone-400 shrink-0">({allCount})</span>}
          </button>
          {options.map(o => {
            const checked = value.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-[13px] transition-colors ${checked ? 'text-stone-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-neutral-900 border-neutral-900' : 'border-stone-300'}`}>
                    {checked && <Check size={11} className="text-white" />}
                  </span>
                  <span className="truncate">{o.label}</span>
                </span>
                {typeof o.count === 'number' && <span className="text-[11px] text-stone-400 shrink-0">({o.count})</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Kept outside the component (module-level) so filter state survives navigating away to the
// editor and back — the page unmounts/remounts on that round trip, but this object doesn't.
let savedFilters = null;

export default function EdgeProjectsPage() {
  const navigate = useNavigate();

  // Filters — each is an array of selected values; [] means "All" for that dimension
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(() => savedFilters?.search ?? '');
  const [showFilters, setShowFilters] = useState(() => savedFilters?.showFilters ?? false);
  const [statusFilter, setStatusFilter] = useState(() => savedFilters?.statusFilter ?? DEFAULT_STATUSES);
  const [stageFilter, setStageFilter] = useState(() => savedFilters?.stageFilter ?? []);
  const [zoneFilter, setZoneFilter] = useState(() => savedFilters?.zoneFilter ?? []);
  const [assetTypeFilter, setAssetTypeFilter] = useState(() => savedFilters?.assetTypeFilter ?? []);
  const [possessionSort, setPossessionSort] = useState(() => savedFilters?.possessionSort ?? 'default');
  const [dataHealthFilter, setDataHealthFilter] = useState(() => savedFilters?.dataHealthFilter ?? []);
  const [builderCategoryFilter, setBuilderCategoryFilter] = useState(() => savedFilters?.builderCategoryFilter ?? []);

  useEffect(() => {
    savedFilters = { search, showFilters, statusFilter, stageFilter, zoneFilter, assetTypeFilter, possessionSort, dataHealthFilter, builderCategoryFilter };
  });

  // Reset to page 1 whenever the filter/search set changes — done during render (React's
  // documented "adjust state while rendering" pattern) rather than in an effect, since an
  // effect that only calls setState is flagged as an avoidable extra render pass.
  const filterKey = JSON.stringify([search, statusFilter, stageFilter, zoneFilter, assetTypeFilter, possessionSort, dataHealthFilter, builderCategoryFilter]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const projects = getProjects();
  const builders = getBuilders();
  const buildersById = useMemo(() => Object.fromEntries(builders.map(b => [b.id, b])), [builders]);
  const buildersByName = useMemo(() => Object.fromEntries(builders.map(b => [b.builderName.toLowerCase(), b])), [builders]);
  const loading = false;

  const zoneOptions = useMemo(() => ZONES.map(z => ({ value: z, label: zoneShort(z) })), []);
  const assetTypeOptions = useMemo(() => LAYOUTS.map(l => ({ value: l, label: l })), []);

  const getDeveloperName = (p) => buildersById[p.builder_id]?.builderName || p.rawBuilderName || '-';
  const getDeveloperCategory = (p) => (buildersById[p.builder_id] ?? (p.rawBuilderName && buildersByName[p.rawBuilderName.toLowerCase()]))?.category ?? null;
  const matchesBuilderCategoryFn = (p, selected) => selected.length === 0 || selected.includes(getDeveloperCategory(p));

  function openCreate() { navigate('/edge/projects/new'); }
  function openEdit(p) { navigate(`/edge/projects/${p.id}`); }

  function clearAllFilters() {
    setSearch('');
    setStatusFilter(DEFAULT_STATUSES);
    setStageFilter([]);
    setZoneFilter([]);
    setAssetTypeFilter([]);
    setPossessionSort('default');
    setDataHealthFilter([]);
    setBuilderCategoryFilter([]);
  }

  const statusIsDefault = statusFilter.length === DEFAULT_STATUSES.length && DEFAULT_STATUSES.every(s => statusFilter.includes(s));

  const activeFilters = [
    search && { key: 'search', label: `"${search}"`, clear: () => setSearch('') },
    !statusIsDefault && { key: 'status', label: `Status: ${summarize(statusFilter, STATUS_OPTIONS, 'All')}`, clear: () => setStatusFilter(DEFAULT_STATUSES) },
    stageFilter.length > 0 && { key: 'stage', label: `Stage: ${summarize(stageFilter, STAGE_OPTIONS, 'All')}`, clear: () => setStageFilter([]) },
    zoneFilter.length > 0 && { key: 'zone', label: `Zone: ${summarize(zoneFilter, zoneOptions, 'All')}`, clear: () => setZoneFilter([]) },
    assetTypeFilter.length > 0 && { key: 'asset', label: `Asset: ${summarize(assetTypeFilter, assetTypeOptions, 'All')}`, clear: () => setAssetTypeFilter([]) },
    possessionSort !== 'default' && { key: 'possession', label: `Possession: ${POSSESSION_SORT_OPTIONS.find(o => o.value === possessionSort)?.label}`, clear: () => setPossessionSort('default') },
    dataHealthFilter.length > 0 && { key: 'health', label: `Health: ${summarize(dataHealthFilter, DATA_HEALTH_OPTIONS, 'All')}`, clear: () => setDataHealthFilter([]) },
    builderCategoryFilter.length > 0 && { key: 'builderCategory', label: `Builder: ${summarize(builderCategoryFilter, BUILDER_CATEGORY_OPTIONS, 'All')}`, clear: () => setBuilderCategoryFilter([]) },
  ].filter(Boolean);

  const searchLower = search.toLowerCase();
  const matchesSearch = (p) => {
    if (!searchLower) return true;
    const developerName = getDeveloperName(p);
    return (p.name || '').toLowerCase().includes(searchLower) ||
      (p.codename || '').toLowerCase().includes(searchLower) ||
      (p.id || '').toLowerCase().includes(searchLower) ||
      (developerName !== '-' && developerName.toLowerCase().includes(searchLower));
  };

  // Faceted counts — "how many projects would match if ONLY this option were picked here", given every OTHER active filter
  function countOptions(dim, options) {
    return options.map(o => ({
      ...o,
      count: projects.filter(p => matchesSearch(p)
        && matchesStatusFn(p, dim === 'status' ? [o.value] : statusFilter)
        && matchesStageFn(p, dim === 'stage' ? [o.value] : stageFilter)
        && matchesZoneFn(p, dim === 'zone' ? [o.value] : zoneFilter)
        && matchesAssetTypeFn(p, dim === 'assetType' ? [o.value] : assetTypeFilter)
        && matchesDataHealthFn(p, dim === 'health' ? [o.value] : dataHealthFilter)
        && matchesBuilderCategoryFn(p, dim === 'builderCategory' ? [o.value] : builderCategoryFilter)
      ).length,
    }));
  }

  function countAll(dim) {
    return projects.filter(p => matchesSearch(p)
      && matchesStatusFn(p, dim === 'status' ? [] : statusFilter)
      && matchesStageFn(p, dim === 'stage' ? [] : stageFilter)
      && matchesZoneFn(p, dim === 'zone' ? [] : zoneFilter)
      && matchesAssetTypeFn(p, dim === 'assetType' ? [] : assetTypeFilter)
      && matchesDataHealthFn(p, dim === 'health' ? [] : dataHealthFilter)
      && matchesBuilderCategoryFn(p, dim === 'builderCategory' ? [] : builderCategoryFilter)
    ).length;
  }

  const statusOptionsCounted = countOptions('status', STATUS_OPTIONS);
  const stageOptionsCounted = countOptions('stage', STAGE_OPTIONS);
  const zoneOptionsCounted = countOptions('zone', zoneOptions);
  const assetTypeOptionsCounted = countOptions('assetType', assetTypeOptions);
  const dataHealthOptionsCounted = countOptions('health', DATA_HEALTH_OPTIONS);
  const builderCategoryOptionsCounted = countOptions('builderCategory', BUILDER_CATEGORY_OPTIONS);

  const filtered = projects.filter(p => matchesSearch(p)
    && matchesStatusFn(p, statusFilter)
    && matchesStageFn(p, stageFilter)
    && matchesZoneFn(p, zoneFilter)
    && matchesAssetTypeFn(p, assetTypeFilter)
    && matchesDataHealthFn(p, dataHealthFilter)
    && matchesBuilderCategoryFn(p, builderCategoryFilter)
  ).sort((a, b) => {
    if (possessionSort === 'soonest') {
      const da = getNextPossessionDate(a);
      const db = getNextPossessionDate(b);
      if (da && db) return da.getTime() - db.getTime();
      if (da) return -1;
      if (db) return 1;
    }
    return b.id.localeCompare(a.id);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Helpers for table cells — filled badges, matching the rest of the CRM's status-pill convention
  const getLiveStatusStyle = (s) => {
    switch (s) {
      case 'live': return 'bg-green-100 text-green-600 border-green-200';
      case 'drafted': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'resale': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'archive': return 'bg-white text-stone-400 border-stone-200';
      default: return 'bg-stone-50 text-stone-400';
    }
  };

  const getLaunchStatusStyle = (s) => {
    if (!s) return 'text-stone-400 font-medium';
    const lower = s.toLowerCase();
    if (lower.includes('prelaunch')) return 'bg-purple-100 text-purple-600 border-purple-200';
    if (lower.includes('developer')) return 'bg-violet-100 text-violet-600 border-violet-200';
    if (lower.includes('rera')) return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-white text-stone-600 border-stone-300';
  };

  const getNextPossession = (p) => {
    if (!p.phase_details || p.phase_details.length === 0) return '-';
    const d = getNextPossessionDate(p);
    if (d) return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    return 'Passed';
  };

  return (
    <div className="flex flex-col bg-stone-50 relative h-full text-[13px]">
      <header className="h-16 flex items-center px-6 bg-white z-30 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/edge" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/edge" className="font-medium text-stone-500 hover:text-stone-700 transition-colors">Edge</Link>
            <span className="text-stone-300">/</span>
            <h1 className="font-bold text-stone-900">Projects</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-medium text-stone-400 px-3 py-1 bg-stone-100 rounded-full">{projects.length} Total Projects</span>
          <Link to="/edge/project/developers" className="flex items-center gap-2 px-5 py-2 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 hover:border-stone-300 transition-colors whitespace-nowrap">
            <Building2 size={16} /> Developers
          </Link>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap">
            <PlusCircle size={16} /> Add Project
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-6 py-3 bg-white border-b border-stone-200 shrink-0">
        <div className="flex items-center flex-wrap gap-3">
          <div className="relative w-full max-w-[220px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ID, name or developer..."
              className="w-full bg-stone-100 rounded-lg py-1.5 pl-8 pr-7 text-[13px] font-medium text-stone-800 outline-none focus:bg-white focus:border-stone-300 border border-transparent transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X size={13} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium border transition-colors shrink-0 ${showFilters ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}>
            <Filter size={13} /> Filters {activeFilters.length > 0 && <span className={`px-1.5 rounded-full text-[11px] ${showFilters ? 'bg-white/20' : 'bg-stone-100'}`}>{activeFilters.length}</span>} {showFilters ? <ChevronDown size={13} /> : ''}
          </button>

          {/* Active filter chips — inline with search/Filters so filtering state is never hidden */}
          {activeFilters.map(f => (
            <span key={f.key} className="inline-flex items-center gap-2 pl-4 pr-2 py-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg text-[13px] font-medium">
              {f.label}
              <button onClick={f.clear} className="p-1 hover:bg-stone-100 rounded-full transition-colors">
                <X size={15} />
              </button>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <button onClick={clearAllFilters} className="text-[13px] font-medium text-stone-400 hover:text-stone-700">
              Clear all
            </button>
          )}
        </div>

        {/* Expanded Filters — tick as many options as you like in each; "All" clears that one dimension */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <MultiFilterSelect label="Status" allLabel="All Status" allCount={countAll('status')} value={statusFilter} onChange={setStatusFilter} options={statusOptionsCounted} />
            <MultiFilterSelect label="Stage" allLabel="All Stages" allCount={countAll('stage')} value={stageFilter} onChange={setStageFilter} options={stageOptionsCounted} />
            <MultiFilterSelect label="Zone" allLabel="All Zones" allCount={countAll('zone')} value={zoneFilter} onChange={setZoneFilter} options={zoneOptionsCounted} />
            <MultiFilterSelect label="Builder" allLabel="All" allCount={countAll('builderCategory')} value={builderCategoryFilter} onChange={setBuilderCategoryFilter} options={builderCategoryOptionsCounted} />
            <MultiFilterSelect label="Asset Type" allLabel="All Types" allCount={countAll('assetType')} value={assetTypeFilter} onChange={setAssetTypeFilter} options={assetTypeOptionsCounted} />
            <FilterSelect label="Possession" value={possessionSort} onChange={setPossessionSort} options={POSSESSION_SORT_OPTIONS} defaultValue="default" />
            <MultiFilterSelect label="Data Health" allLabel="All" allCount={countAll('health')} value={dataHealthFilter} onChange={setDataHealthFilter} options={dataHealthOptionsCounted} />
          </div>
        )}
      </div>

      {/* Table View — a single scroll container (both axes) so position:sticky on the thead has one unambiguous containing block; the header/filter bar above stay fixed and the column header stays pinned while scrolling rows */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-300 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-xs font-medium uppercase tracking-widest">Loading…</span>
          </div>
        ) : (
          <table className="text-left text-[13px] text-stone-600 whitespace-nowrap min-w-[1500px] w-full">
              <thead className="bg-white text-[11px] font-medium uppercase tracking-wider text-stone-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e7e5e4]">
                <tr>
                  <th className="pl-6 pr-4 py-4 font-mono min-w-[130px]">ID</th>
                  <th className="px-4 py-4">State</th>
                  <th className="px-4 py-4">Launch Status</th>
                  <th className="px-4 py-4 min-w-[160px]">Developer</th>
                  <th className="px-4 py-4 min-w-[180px]">Name</th>
                  <th className="px-4 py-4">Price</th>
                  <th className="px-4 py-4">Micromarket</th>
                  <th className="px-6 py-4 min-w-[90px]">Zone</th>
                  <th className="px-6 py-4 min-w-[90px]">Units</th>
                  <th className="px-6 py-4 min-w-[90px]">Area</th>
                  <th className="px-6 py-4 min-w-[90px]">Floor</th>
                  <th className="px-4 py-4 text-center">Media</th>
                  <th className="px-4 py-4">Possession</th>
                  <th className="px-4 py-4 sticky right-0 z-20 bg-white border-l border-stone-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paged.map(p => {
                  const hasImg = !!p.cover_image_url;
                  const hasNotif = !!p.notif_image;
                  const hasMp = !!p.master_plan_url;
                  const hasBrochure = !!p.brochure_url;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="pl-6 pr-4 py-3 font-mono text-stone-600">{p.id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded border text-[11px] font-medium uppercase tracking-wider ${getLiveStatusStyle(p.status)}`}>
                          {p.status === 'drafted' ? 'draft' : p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.launch_status ? (
                          <span className={`inline-flex px-2 py-0.5 rounded border text-[11px] font-medium uppercase tracking-wider ${getLaunchStatusStyle(p.launch_status)}`}>
                            {p.launch_status}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-stone-700 truncate max-w-[160px]" title={getDeveloperName(p)}>{getDeveloperName(p)}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-stone-900 truncate max-w-[200px] inline-block" title={p.name || p.codename}>
                          {p.name || p.codename || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-800">{p.pricing || '-'}</td>
                      <td className="px-4 py-3 text-stone-800">{p.micromarket || '-'}</td>
                      <td className="px-6 py-3 text-stone-500">{zoneShort(p.zone) || '-'}</td>
                      <td className="px-6 py-3 text-stone-800">{p.total_units || '-'}</td>
                      <td className="px-6 py-3 text-stone-800">{p.land_area_acres ? p.land_area_acres.toFixed(2) : '-'}</td>
                      <td className="px-6 py-3 text-stone-800">{p.floor || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-stone-300">
                          <span title={hasImg ? "Has Cover Image" : "No Cover Image"} className={hasImg ? "text-neutral-700" : "opacity-40"}><ImageIcon size={16} /></span>
                          <span title={hasNotif ? "Has Notification Image" : "No Notification Image"} className={hasNotif ? "text-neutral-700" : "opacity-40"}><ImagePlus size={16} /></span>
                          <span title={hasMp ? "Has Master Plan" : "No Master Plan"} className={hasMp ? "text-neutral-700" : "opacity-40"}><Map size={16} /></span>
                          <span title={hasBrochure ? "Has Brochure" : "No Brochure"} className={hasBrochure ? "text-neutral-700" : "opacity-40"}><FileText size={16} /></span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-700">{getNextPossession(p)}</td>
                      <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-stone-50 border-l border-stone-200">
                        <button onClick={() => openEdit(p)} title="Details / Edit" className="inline-flex items-center justify-center p-2 rounded-lg font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors">
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="14" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-stone-400 gap-2">
                        <Search size={32} className="opacity-50" />
                        <span className="font-medium text-[13px]">No projects found matching filters.</span>
                        {activeFilters.length > 0 && (
                          <button onClick={clearAllFilters} className="text-[12px] font-medium text-stone-500 underline underline-offset-2 mt-1">
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        )}
      </div>

      {/* Pagination — a shrink-0 sibling of the scroll container, so it stays fixed at the
          bottom of the page and never scrolls away with the table rows. */}
      <div className="shrink-0 px-6 py-3 bg-white border-t border-stone-200 flex items-center justify-between text-[13px] text-stone-500">
        <span>
          {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-stone-200 font-medium hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            Prev
          </button>
          <span className="font-medium text-stone-700 px-2">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-stone-200 font-medium hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

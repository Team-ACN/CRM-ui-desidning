import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, X, Filter, ChevronDown, MapPin, FileText,
  Building2, Workflow, Sparkles, Loader2, ClipboardPaste,
} from 'lucide-react';
import {
  getEcScrapes, runScraper, hasMoreIncoming,
  PROJECT_STATUS_OPTIONS,
  KML_STATUS_OPTIONS, SITE_PLAN_STATUS_OPTIONS, OVERALL_STATUS_OPTIONS,
} from '../../data/mockEc';
import { getBuilders, BUILDER_CATEGORIES } from '../../data/mockEdge';
import { MultiFilterSelect, FilterSelect } from './FilterControls';
import { summarize } from '../../utils/filters';

const PAGE_SIZE = 20;

// The developer filter buckets by the matched builder's tier, not the raw found/not-found status
// — "unassigned" is a name that matched but has no builder record (a data gap), "blank" is no
// match at all.
const DEVELOPER_CATEGORY_OPTIONS = [
  ...BUILDER_CATEGORIES.map(c => ({ value: c, label: `Cat ${c}` })),
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'blank', label: 'Blank' },
];
function developerCategoryFor(e) {
  if (e.status.developer !== 'found' || !e.json_data.developer_name) return 'blank';
  const builder = getBuilders().find(b => b.builderName === e.json_data.developer_name);
  return builder ? builder.category : 'unassigned';
}

const SORT_OPTIONS = [
  { value: 'added_date', label: 'Added date' },
  { value: 'date_of_submission', label: 'Submitted date' },
];

function formatDate(d) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

// One shared color rule for all four stage dimensions — dark green for a clean pass, amber for a
// "needs a look" result, red for a script error, light gray for missing/not-found/no.
function toneFor(dim, value) {
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

const STAGE_ICONS = [
  { key: 'developer', label: 'Developer', icon: Building2 },
  { key: 'project', label: 'Project', icon: Workflow },
  { key: 'kml', label: 'KML', icon: MapPin },
  { key: 'site_plan', label: 'Site plan', icon: FileText },
];

// The 4-icon status strip shown on every row — one icon per pipeline stage, colored by outcome.
function StatusIcons({ status }) {
  return (
    <div className="flex items-center gap-1.5">
      {STAGE_ICONS.map(s => {
        const tone = toneFor(s.key, status[s.key]);
        const Icon = s.icon;
        return (
          <span
            key={s.key}
            title={`${s.label}: ${status[s.key]}`}
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${TONE_CLASS[tone]}`}
          >
            <Icon size={12} />
          </span>
        );
      })}
    </div>
  );
}

// The manual-check status — a human-set call, separate from the automated stage results. Just a
// read-only badge here; changing it (Hold/Reject/etc.) happens on the filing's own detail page,
// not via a Hold/Reject picker inline on the list.
function ManualCheckBadge({ value }) {
  const current = OVERALL_STATUS_OPTIONS.find(o => o.value === value) || { value: 'pending', label: 'Pending' };
  const tone = MANUAL_TONE[value] || 'neutral';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-medium ${TONE_CLASS[tone]}`}>
      {current.label}
    </span>
  );
}

const SAMPLE_LISTING_TEXT = `SIA/KA/INFRA2/12560/2026 — EC
Godrej Aqua Phase 1
Proponent: Godrej Properties Limited
Submitted: ${new Date().toISOString().slice(0, 10)}`;

const STATUS_LINES = ['Reading the listing…', 'Matching SIA ID…', 'Resolving proponent…'];
const STATUS_INTERVAL_MS = 450;

function StatusTicker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % STATUS_LINES.length), STATUS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
  return <span>{STATUS_LINES[index]}</span>;
}

// Same "paste text → AI fills it in" entry point as Add Inventory's AiPasteModal, adapted for a
// raw EC/ToR listing instead of a property. There's no real NLP here (no backend) — extraction is
// simulated with a short delay, then the next queued incoming filing (runScraper's mock data) is
// what actually gets created, same as the old Run Scraper button did.
function AiExtractModal({ isOpen, isExtracting, onExtract, onClose }) {
  const [text, setText] = useState('');
  if (!isOpen) return null;
  const canExtract = text.trim().length > 20 && !isExtracting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-stone-200">
          <div className="flex gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 text-violet-700 shrink-0">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-stone-900">AI Extraction</h2>
              <p className="text-sm text-stone-500">Paste the raw SEIAA listing text — a new filing gets created and filled in for you.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-stone-400 hover:text-stone-900">
            <X size={20} />
          </button>
        </header>

        <div className="px-6 py-5 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-stone-900">Listing text</label>
            <button
              type="button"
              onClick={() => setText(SAMPLE_LISTING_TEXT)}
              className="flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900"
            >
              <ClipboardPaste size={13} />
              Use a sample
            </button>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={isExtracting}
            rows={8}
            placeholder={'Paste the SEIAA portal row or notice text here…'}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-y disabled:bg-stone-50"
          />
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>{text.trim().length} characters</span>
            <span>Nothing is submitted until you review the filing.</span>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 px-6 py-4 border-t border-stone-200">
          <span className="flex items-center gap-2 text-xs text-stone-500">
            {isExtracting && <Loader2 size={14} className="animate-spin text-violet-600" />}
            {isExtracting && <StatusTicker />}
          </span>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={!canExtract}
              onClick={() => onExtract()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-medium transition-colors"
            >
              {isExtracting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isExtracting ? 'Extracting…' : 'Extract with AI'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}


export default function EcPipelinePage() {
  const [refreshTick, setRefreshTick] = useState(0);
  const refresh = () => setRefreshTick(t => t + 1);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('added_date');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [developerFilter, setDeveloperFilter] = useState([]);
  const [projectFilter, setProjectFilter] = useState([]);
  const [kmlFilter, setKmlFilter] = useState([]);
  const [sitePlanFilter, setSitePlanFilter] = useState([]);
  const [overallFilter, setOverallFilter] = useState([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiExtracting, setAiExtracting] = useState(false);

  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scrapes = useMemo(() => getEcScrapes(), [refreshTick]);

  const searchLower = search.toLowerCase();
  const matchesSearch = (e) => !searchLower || e.name.toLowerCase().includes(searchLower) || e.id.toLowerCase().includes(searchLower) || e.proponent.toLowerCase().includes(searchLower);
  const matchesMulti = (value, sel) => sel.length === 0 || sel.includes(value);

  function clearAllFilters() {
    setSearch('');
    setDeveloperFilter([]); setProjectFilter([]);
    setKmlFilter([]); setSitePlanFilter([]); setOverallFilter([]);
  }

  const activeFilters = [
    search && { key: 'search', label: `"${search}"`, clear: () => setSearch('') },
    overallFilter.length > 0 && { key: 'overall', label: `Manual check: ${summarize(overallFilter, OVERALL_STATUS_OPTIONS, 'All')}`, clear: () => setOverallFilter([]) },
    developerFilter.length > 0 && { key: 'developer', label: `Developer: ${summarize(developerFilter, DEVELOPER_CATEGORY_OPTIONS, 'All')}`, clear: () => setDeveloperFilter([]) },
    projectFilter.length > 0 && { key: 'project', label: `Project: ${summarize(projectFilter, PROJECT_STATUS_OPTIONS, 'All')}`, clear: () => setProjectFilter([]) },
    kmlFilter.length > 0 && { key: 'kml', label: `KML: ${summarize(kmlFilter, KML_STATUS_OPTIONS, 'All')}`, clear: () => setKmlFilter([]) },
    sitePlanFilter.length > 0 && { key: 'site_plan', label: `Site plan: ${summarize(sitePlanFilter, SITE_PLAN_STATUS_OPTIONS, 'All')}`, clear: () => setSitePlanFilter([]) },
  ].filter(Boolean);

  function countBy(dim, options) {
    const base = scrapes.filter(matchesSearch);
    return options.map(o => ({ ...o, count: base.filter(e => e.status[dim] === o.value).length }));
  }
  function countByDeveloperCategory() {
    const base = scrapes.filter(matchesSearch);
    return DEVELOPER_CATEGORY_OPTIONS.map(o => ({ ...o, count: base.filter(e => developerCategoryFor(e) === o.value).length }));
  }
  const searchMatchCount = scrapes.filter(matchesSearch).length;

  const filtered = scrapes.filter(e => matchesSearch(e)
    && matchesMulti(developerCategoryFor(e), developerFilter)
    && matchesMulti(e.status.project, projectFilter)
    && matchesMulti(e.status.kml, kmlFilter)
    && matchesMulti(e.status.site_plan, sitePlanFilter)
    && matchesMulti(e.status.overall, overallFilter)
  );
  const sorted = [...filtered].sort((a, b) => new Date(b[sortBy]) - new Date(a[sortBy]));

  const filterKey = `${search}|${sortBy}|${developerFilter}|${projectFilter}|${kmlFilter}|${sitePlanFilter}|${overallFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // The actual "extraction" is mocked — there's no NLP backend — but the pasted text triggers a
  // believable delay before the next queued incoming filing (runScraper's data) gets created,
  // same underlying mechanism the old Run Scraper button used.
  function handleAiExtract() {
    setAiExtracting(true);
    setTimeout(() => {
      const added = runScraper();
      setAiExtracting(false);
      setAiModalOpen(false);
      refresh();
      if (added) navigate(`/ec/${added.id}`);
    }, 1100);
  }

  return (
    <div className="flex flex-col bg-stone-50 relative h-full text-[13px]">
      <header className="h-16 flex items-center px-6 bg-white z-30 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/edge/projects" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/edge" className="font-medium text-stone-500 hover:text-stone-700 transition-colors">Edge</Link>
            <span className="text-stone-300">/</span>
            <h1 className="font-bold text-stone-900">EC Pipeline</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-medium text-stone-400 px-3 py-1 bg-stone-100 rounded-full">{scrapes.length} Filings</span>
          <button
            onClick={() => setAiModalOpen(true)}
            disabled={!hasMoreIncoming()}
            className="flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} /> AI Extraction
          </button>
        </div>
      </header>

      {/* Search + filters */}
      <div className="px-6 py-3 bg-white border-b border-stone-200 shrink-0">
        <div className="flex items-center flex-wrap gap-3">
          <div className="relative w-full max-w-[240px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ID, name or proponent..."
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

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MultiFilterSelect label="Manual Check" allLabel="All" allCount={searchMatchCount} value={overallFilter} onChange={setOverallFilter} options={countBy('overall', OVERALL_STATUS_OPTIONS)} />
            <MultiFilterSelect label="Developer" allLabel="All" allCount={searchMatchCount} value={developerFilter} onChange={setDeveloperFilter} options={countByDeveloperCategory()} />
            <MultiFilterSelect label="Project" allLabel="All" allCount={searchMatchCount} value={projectFilter} onChange={setProjectFilter} options={countBy('project', PROJECT_STATUS_OPTIONS)} />
            <MultiFilterSelect label="KML" allLabel="All" allCount={searchMatchCount} value={kmlFilter} onChange={setKmlFilter} options={countBy('kml', KML_STATUS_OPTIONS)} />
            <MultiFilterSelect label="Site Plan" allLabel="All" allCount={searchMatchCount} value={sitePlanFilter} onChange={setSitePlanFilter} options={countBy('site_plan', SITE_PLAN_STATUS_OPTIONS)} />
            <FilterSelect label="Sort" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} defaultValue="__none__" />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        <table className="w-full text-left text-[13px] text-stone-600 whitespace-nowrap">
          <thead className="bg-white text-[11px] font-medium uppercase tracking-wider text-stone-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e7e5e4]">
            <tr>
              <th className="pl-6 pr-4 py-4 font-mono">ID</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Added</th>
              <th className="px-2 py-4">Manual Check</th>
              <th className="px-4 py-4">Developer</th>
              <th className="px-4 py-4">Project Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paged.map(e => (
              <tr key={e.id} onClick={() => navigate(`/ec/${e.id}`)} className="hover:bg-stone-50/50 transition-colors group cursor-pointer">
                <td className="pl-6 pr-4 py-3 font-mono font-medium text-stone-700">{e.id}</td>
                <td className="px-4 py-3"><StatusIcons status={e.status} /></td>
                <td className="px-4 py-3 text-stone-500">{formatDate(e.added_date)}</td>
                <td className="px-2 py-1.5">
                  <ManualCheckBadge value={e.status.overall} />
                </td>
                <td className="px-4 py-3 text-stone-700 truncate max-w-[160px]">
                  {e.json_data.developer_name || <span className="text-stone-300">Unmatched</span>}
                </td>
                <td className="px-4 py-3">
                  <span title={e.proponent} className="text-stone-900 truncate max-w-[560px] inline-block">{e.name}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-stone-400 gap-2">
                    <Search size={32} className="opacity-50" />
                    <span className="font-medium text-[13px]">No filings found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="shrink-0 px-6 py-3 bg-white border-t border-stone-200 flex items-center justify-between text-[13px] text-stone-500">
        <span>
          {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-stone-200 font-medium hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white">Prev</button>
          <span className="font-medium text-stone-700 px-2">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-stone-200 font-medium hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white">Next</button>
        </div>
      </div>

      <AiExtractModal
        isOpen={aiModalOpen}
        isExtracting={aiExtracting}
        onExtract={handleAiExtract}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
}

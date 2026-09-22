import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, X, Building2, Check, UploadCloud, Filter, ChevronDown } from 'lucide-react';
import { BUILDER_CATEGORIES, getBuilders, getProjects, updateBuilder } from '../../data/mockEdge';
import { FilterSelect, MultiFilterSelect } from './FilterControls';
import { summarize } from '../../utils/filters';

const inp = 'w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:border-neutral-400 focus:shadow-sm outline-none transition-all placeholder:text-stone-300';

const CATEGORY_OPTIONS = [...BUILDER_CATEGORIES.map(c => ({ value: c, label: `Category ${c}` })), { value: 'uncategorized', label: 'Uncategorized' }];

const DATA_HEALTH_OPTIONS = [
  { value: 'noLogo', label: 'No logo' },
  { value: 'noCategory', label: 'No category' },
  { value: 'noContact', label: 'No contact' },
  { value: 'noPromoters', label: 'No promoters' },
];

const SORT_OPTIONS = [
  { value: 'mostProjects', label: 'Most projects' },
  { value: 'fewestProjects', label: 'Fewest projects' },
  { value: 'nameAsc', label: 'Name A–Z' },
];

function matchesCategoryFn(b, selected) {
  return selected.length === 0 || selected.some(v => v === 'uncategorized' ? !b.category : b.category === v);
}
function matchesOneDataHealth(b, v) {
  switch (v) {
    case 'noLogo': return !b.builderLogo;
    case 'noCategory': return !b.category;
    case 'noContact': return !b.contacts?.[0]?.name;
    case 'noPromoters': return !b.promoters?.length;
    default: return false;
  }
}
function matchesDataHealthFn(b, selected) {
  return selected.length === 0 || selected.some(v => matchesOneDataHealth(b, v));
}

// Only one contact per developer — always normalize to exactly one (blank) contact so the
// modal has a fixed single-contact row instead of an add/remove list.
function draftFromBuilder(b) {
  const first = b.contacts?.[0];
  return {
    ...b,
    contacts: [first ? { ...first } : { name: '', designation: '', mobile: '' }],
    promoters: [...(b.promoters || [])],
  };
}

const PAGE_SIZE = 20;

export default function EdgeDevelopersPage() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [dataHealthFilter, setDataHealthFilter] = useState([]);
  const [sortOption, setSortOption] = useState('mostProjects');
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState(null);
  const [promoterInput, setPromoterInput] = useState('');
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef(null);
  const leftColRef = useRef(null);
  const [rightColHeight, setRightColHeight] = useState(null);

  // Match the promoters column's height to the left column's actual rendered height
  // (Name/Logo/Category/Contact) so the two "cards" line up exactly at the bottom —
  // a hardcoded px value would drift if those fields ever change.
  useLayoutEffect(() => {
    setRightColHeight(draft && leftColRef.current ? leftColRef.current.offsetHeight : null);
  }, [!!draft]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const builders = useMemo(() => getBuilders(), [refreshTick]);
  const projectCounts = useMemo(() => {
    const counts = {};
    getProjects().forEach(p => { if (p.builder_id) counts[p.builder_id] = (counts[p.builder_id] || 0) + 1; });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);
  const loading = false;
  const refresh = () => setRefreshTick(t => t + 1);

  const searchLower = search.toLowerCase();
  const matchesSearch = (b) => !searchLower || b.builderName.toLowerCase().includes(searchLower) || b.id.toLowerCase().includes(searchLower);

  function clearAllFilters() {
    setSearch('');
    setCategoryFilter([]);
    setDataHealthFilter([]);
  }

  const activeFilters = [
    search && { key: 'search', label: `"${search}"`, clear: () => setSearch('') },
    categoryFilter.length > 0 && { key: 'category', label: `Category: ${summarize(categoryFilter, CATEGORY_OPTIONS, 'All')}`, clear: () => setCategoryFilter([]) },
    dataHealthFilter.length > 0 && { key: 'health', label: `Data Health: ${summarize(dataHealthFilter, DATA_HEALTH_OPTIONS, 'All')}`, clear: () => setDataHealthFilter([]) },
  ].filter(Boolean);

  // Faceted counts — "how many developers would match if ONLY this option were picked here", given every OTHER active filter
  function countOptions(dim, options) {
    return options.map(o => ({
      ...o,
      count: builders.filter(b => matchesSearch(b)
        && matchesCategoryFn(b, dim === 'category' ? [o.value] : categoryFilter)
        && matchesDataHealthFn(b, dim === 'health' ? [o.value] : dataHealthFilter)
      ).length,
    }));
  }

  function countAll(dim) {
    return builders.filter(b => matchesSearch(b)
      && matchesCategoryFn(b, dim === 'category' ? [] : categoryFilter)
      && matchesDataHealthFn(b, dim === 'health' ? [] : dataHealthFilter)
    ).length;
  }

  const categoryOptionsCounted = countOptions('category', CATEGORY_OPTIONS);
  const dataHealthOptionsCounted = countOptions('health', DATA_HEALTH_OPTIONS);

  const sorters = {
    mostProjects: (a, b) => (projectCounts[b.id] || 0) - (projectCounts[a.id] || 0),
    fewestProjects: (a, b) => (projectCounts[a.id] || 0) - (projectCounts[b.id] || 0),
    nameAsc: (a, b) => a.builderName.localeCompare(b.builderName),
  };

  const filtered = builders
    .filter(b => matchesSearch(b) && matchesCategoryFn(b, categoryFilter) && matchesDataHealthFn(b, dataHealthFilter))
    .sort(sorters[sortOption] || sorters.mostProjects);

  // Reset to page 1 whenever a filter changes — done during render (React's documented
  // "adjust state while rendering" pattern) rather than in an effect.
  const filterKey = `${search}|${categoryFilter.join(',')}|${dataHealthFilter.join(',')}|${sortOption}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openEdit(b) {
    setDraft(draftFromBuilder(b));
    setPromoterInput('');
  }

  function closeModal() {
    setDraft(null);
    setPromoterInput('');
  }

  function setD(key, val) {
    setDraft(d => ({ ...d, [key]: val }));
  }

  function setContact(key, val) {
    setDraft(d => ({ ...d, contacts: [{ ...d.contacts[0], [key]: val }] }));
  }

  function commitPromoterInput() {
    const name = promoterInput.trim();
    if (!name) return;
    setDraft(d => (d.promoters.includes(name) ? d : { ...d, promoters: [...d.promoters, name] }));
    setPromoterInput('');
  }

  function handlePromoterKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitPromoterInput();
    } else if (e.key === 'Backspace' && !promoterInput && draft.promoters.length > 0) {
      setDraft(d => ({ ...d, promoters: d.promoters.slice(0, -1) }));
    }
  }

  function removePromoter(index) {
    setDraft(d => ({ ...d, promoters: d.promoters.filter((_, i) => i !== index) }));
  }

  function pickCategory(c) {
    // Clicking the already-selected pill again unselects it — category isn't mandatory.
    setDraft(d => ({ ...d, category: d.category === c ? null : c }));
  }

  function handleLogoFile(files) {
    const file = files?.[0];
    if (!file) return;
    setD('builderLogo', URL.createObjectURL(file));
  }

  function handleSave() {
    setSaving(true);
    // Pick up whatever's still sitting in the promoter input box (typed but not yet
    // committed with Enter) so it isn't silently dropped on save.
    const pending = promoterInput.trim();
    const promoters = pending && !draft.promoters.includes(pending) ? [...draft.promoters, pending] : draft.promoters;
    const payload = {
      builderName: draft.builderName,
      builderLogo: draft.builderLogo || null,
      category: draft.category,
      contacts: draft.contacts.filter(c => c.name || c.mobile),
      promoters,
    };
    updateBuilder(draft.id, payload);
    setSaving(false);
    closeModal();
    refresh();
  }

  return (
    <div className="flex flex-col bg-stone-50 relative h-full text-[13px]">
      {/* Header */}
      <header className="h-16 flex items-center px-6 bg-white z-30 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/edge/projects" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/edge" className="font-medium text-stone-500 hover:text-stone-700 transition-colors">Edge</Link>
            <span className="text-stone-300">/</span>
            <h1 className="font-bold text-stone-900">Developers</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium text-stone-400 px-3 py-1 bg-stone-100 rounded-full">{builders.length} Total Developers</span>
        </div>
      </header>

      {/* Search bar */}
      <div className="px-6 py-3 bg-white border-b border-stone-200 shrink-0">
        <div className="flex items-center flex-wrap gap-3">
          <div className="relative w-full max-w-[220px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ID or developer..."
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
          <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MultiFilterSelect label="Category" allLabel="All" allCount={countAll('category')} value={categoryFilter} onChange={setCategoryFilter} options={categoryOptionsCounted} />
            <MultiFilterSelect label="Data Health" allLabel="All" allCount={countAll('health')} value={dataHealthFilter} onChange={setDataHealthFilter} options={dataHealthOptionsCounted} />
            <FilterSelect label="Sort" value={sortOption} onChange={setSortOption} options={SORT_OPTIONS} defaultValue="__never__" />
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-300 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-xs font-medium uppercase tracking-widest">Loading…</span>
          </div>
        ) : (
          <table className="w-full text-left text-[13px] text-stone-600 whitespace-nowrap">
            <thead className="bg-white text-[11px] font-medium uppercase tracking-wider text-stone-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e7e5e4]">
              <tr>
                <th className="pl-6 pr-4 py-4 font-mono">ID</th>
                <th className="px-4 py-4">Developer</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Projects</th>
                <th className="px-4 py-4">Contact</th>
                <th className="px-4 py-4">Designation</th>
                <th className="px-4 py-4">Mobile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paged.map(b => {
                const contact = b.contacts?.[0] || {};
                return (
                  <tr key={b.id} onClick={() => openEdit(b)} className="hover:bg-stone-50/50 transition-colors group cursor-pointer">
                    <td className="pl-6 pr-4 py-3 font-mono text-stone-600">{b.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {b.builderLogo ? (
                            <img src={b.builderLogo} alt={b.builderName} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 size={20} className="text-stone-300" />
                          )}
                        </div>
                        <span className="text-base font-semibold text-stone-900 group-hover:underline">{b.builderName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{b.category || '-'}</td>
                    <td className="px-4 py-3">{projectCounts[b.id] || 0}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{contact.name || '-'}</td>
                    <td className="px-4 py-3 text-stone-500">{contact.designation || '-'}</td>
                    <td className="px-4 py-3 font-mono">{contact.mobile || '-'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-stone-400 gap-2">
                      <Search size={32} className="opacity-50" />
                      <span className="font-medium text-[13px]">No developers found.</span>
                      {search && (
                        <button onClick={() => setSearch('')} className="text-[12px] font-medium text-stone-500 underline underline-offset-2 mt-1">
                          Clear search
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

      {/* Edit Developer modal */}
      {draft && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-900">Edit Developer</h2>
              <button onClick={closeModal} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left column — identity, category, contact */}
              <div ref={leftColRef} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1.5 block">Developer Name</label>
                  <input value={draft.builderName} onChange={e => setD('builderName', e.target.value)} className={inp} placeholder="Developer Name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1.5 block">Logo</label>
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="w-11 h-11 shrink-0 rounded-xl border border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 flex items-center justify-center overflow-hidden cursor-pointer transition-colors"
                    >
                      {draft.builderLogo ? (
                        <img src={draft.builderLogo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UploadCloud size={16} className="text-stone-300" />
                      )}
                      <input ref={logoInputRef} type="file" accept="image/*" onChange={e => handleLogoFile(e.target.files)} className="hidden" />
                    </div>
                    <input
                      value={draft.builderLogo || ''}
                      onChange={e => setD('builderLogo', e.target.value)}
                      placeholder="or paste image URL…"
                      className={`${inp} flex-1`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1.5 block">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BUILDER_CATEGORIES.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => pickCategory(c)}
                        className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${draft.category === c ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-300 bg-white'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 mb-3">Contact</h3>
                  <div className="space-y-2.5">
                    <input value={draft.contacts[0].name} onChange={e => setContact('name', e.target.value)} placeholder="Name" className={inp} />
                    <input value={draft.contacts[0].designation} onChange={e => setContact('designation', e.target.value)} placeholder="Designation" className={inp} />
                    <input value={draft.contacts[0].mobile} onChange={e => setContact('mobile', e.target.value)} placeholder="Mobile" className={inp} />
                  </div>
                </div>
              </div>

              {/* Right column — promoters, one per line; height is locked to match the left
                  column's measured height so its bottom edge lines up with the Contact inputs,
                  and scrolls internally instead of growing past that. */}
              <div className="flex flex-col" style={rightColHeight ? { height: rightColHeight } : undefined}>
                <label className="text-sm font-medium text-stone-600 mb-1.5 block">Promoters</label>
                <input
                  id="promoter-input"
                  value={promoterInput}
                  onChange={e => setPromoterInput(e.target.value)}
                  onKeyDown={handlePromoterKeyDown}
                  onBlur={commitPromoterInput}
                  placeholder="Type a name and press Enter to add…"
                  className={`${inp} mb-2 shrink-0`}
                />
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 w-full bg-white border border-stone-200 rounded-xl p-2.5">
                  {draft.promoters.map((name, i) => (
                    <div key={`${name}-${i}`} className="flex items-center justify-between gap-2 bg-stone-100 rounded-lg pl-3 pr-1.5 py-2">
                      <span className="text-sm font-medium text-stone-700 truncate">{name}</span>
                      <button
                        type="button"
                        onClick={() => removePromoter(i)}
                        className="p-1 rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  {draft.promoters.length === 0 && (
                    <div className="text-center py-6 text-stone-300 text-xs">No promoters added yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-5 border-t border-stone-100">
              <button onClick={closeModal} className="px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !draft.builderName} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-950 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

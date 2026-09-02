import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, X, Building2, Check, UploadCloud } from 'lucide-react';
import { BUILDER_CATEGORIES, getBuilders, getProjects, updateBuilder } from '../../data/mockEdge';

const inp = 'w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:border-neutral-400 focus:shadow-sm outline-none transition-all placeholder:text-stone-300';

// Only one contact per developer — always normalize to exactly one (blank) contact so the
// modal has a fixed single-contact row instead of an add/remove list.
function draftFromBuilder(b) {
  const first = b.contacts?.[0];
  return { ...b, contacts: [first ? { ...first } : { name: '', designation: '', mobile: '' }] };
}

export default function EdgeDevelopersPage() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef(null);

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

  const filtered = builders.filter(b => {
    return b.builderName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => b.id.localeCompare(a.id));

  function openEdit(b) {
    setDraft(draftFromBuilder(b));
  }

  function closeModal() {
    setDraft(null);
  }

  function setD(key, val) {
    setDraft(d => ({ ...d, [key]: val }));
  }

  function setContact(key, val) {
    setDraft(d => ({ ...d, contacts: [{ ...d.contacts[0], [key]: val }] }));
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
    const payload = {
      builderName: draft.builderName,
      builderLogo: draft.builderLogo || null,
      category: draft.category,
      contacts: draft.contacts.filter(c => c.name || c.mobile),
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
        </div>
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
              {filtered.map(b => {
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
                        <span className="font-semibold text-stone-900 group-hover:underline">{b.builderName}</span>
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

      {/* Edit Developer modal */}
      {draft && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-900">Edit Developer</h2>
              <button onClick={closeModal} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-stone-600 mb-1.5 block">Developer Name</label>
                <input value={draft.builderName} onChange={e => setD('builderName', e.target.value)} className={inp} placeholder="Developer Name" />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-600 mb-1.5 block">Logo</label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="w-16 h-16 shrink-0 rounded-xl border border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 flex items-center justify-center overflow-hidden cursor-pointer transition-colors"
                  >
                    {draft.builderLogo ? (
                      <img src={draft.builderLogo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UploadCloud size={20} className="text-stone-300" />
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={e => handleLogoFile(e.target.files)} className="hidden" />
                  </div>
                  <input
                    value={draft.builderLogo || ''}
                    onChange={e => setD('builderLogo', e.target.value)}
                    placeholder="or paste Image URL…"
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
            </div>

            <div className="mb-2">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">Contact</h3>
              <div className="grid grid-cols-3 gap-2.5">
                <input value={draft.contacts[0].name} onChange={e => setContact('name', e.target.value)} placeholder="Name" className={inp} />
                <input value={draft.contacts[0].designation} onChange={e => setContact('designation', e.target.value)} placeholder="Designation" className={inp} />
                <input value={draft.contacts[0].mobile} onChange={e => setContact('mobile', e.target.value)} placeholder="Mobile" className={inp} />
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

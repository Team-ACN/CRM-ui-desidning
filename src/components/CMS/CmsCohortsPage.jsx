import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users as UsersIcon, Pencil, Archive, RotateCcw } from 'lucide-react';
import { Button, EmptyState, useToast } from './index';
import { SearchCircle, ArchiveCircle } from './ToolbarIcons';
import { getCohorts, ruleTags, setCohortStatus } from '../../data/mockCms';
import CohortDrawer from './CohortDrawer';

const CmsCohortsPage = () => {
  const [, forceRender] = useState(0);
  const bump = () => forceRender((v) => v + 1);
  const toast = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const openId = searchParams.get('open');

  const [tab, setTab] = useState('active');
  const [query, setQuery] = useState('');

  const openDrawer = (id) => setSearchParams(id ? { open: id } : {});
  const closeDrawer = () => setSearchParams({});

  const all = getCohorts();

  const filtered = all.filter((c) => {
    if (tab === 'active' && c.status === 'archived') return false;
    if (tab === 'archived' && c.status !== 'archived') return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const matchesName = c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      const matchesCpid = c.members.some((m) => m.cpid.toLowerCase().includes(q));
      if (!matchesName && !matchesCpid) return false;
    }
    return true;
  });
  const rows = filtered
    .slice()
    .sort((a, b) => Object.keys(b.templateMappings).length - Object.keys(a.templateMappings).length);

  function handleArchive(c) {
    const previousStatus = c.status;
    setCohortStatus(c.id, 'archived');
    bump();
    toast(`Archived '${c.name}'`, {
      undo: () => {
        setCohortStatus(c.id, previousStatus);
        bump();
      },
    });
  }

  function handleRestore(c) {
    setCohortStatus(c.id, 'live');
    bump();
    toast(`Restored '${c.name}' to Active`);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <SearchCircle value={query} onChange={setQuery} />
          <ArchiveCircle active={tab === 'archived'} onToggle={() => setTab((t) => (t === 'archived' ? 'active' : 'archived'))} />
          <Button variant="primary" onClick={() => openDrawer('new')}>
            New Cohort
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4">
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          {rows.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              text={all.length === 0 ? 'No cohorts yet. Everyone sees the Base template.' : 'No matches.'}
              actionLabel={all.length === 0 ? 'New cohort' : undefined}
              onAction={() => openDrawer('new')}
            />
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-separator text-left text-[12px] text-secondary">
                  <th className="px-5 py-3 font-medium">Cohort</th>
                  <th className="px-4 py-3 font-medium w-24 text-right">Users</th>
                  <th className="px-4 py-3 font-medium w-28 text-center">Status</th>
                  <th className="pl-4 pr-6 py-3 w-24 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const isMapped = Object.keys(c.templateMappings).length > 0;
                  return (
                    <tr key={c.id} onClick={() => openDrawer(c.id)} className="border-b border-separator last:border-0 cursor-pointer hover:bg-fill/50 transition-colors">
                      <td className="px-5 py-3.5 min-h-[48px]">
                        <p className="font-semibold text-label">{c.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {ruleTags(c).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center h-5 px-2 rounded-full bg-neutral-100 text-[11px] text-neutral-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-label tabular-nums text-right">{c.userCount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-center">
                        {isMapped ? (
                          <span className="text-[12px] font-medium text-positive">Active</span>
                        ) : (
                          <span className="text-[12px] text-tertiary">—</span>
                        )}
                      </td>
                      <td className="pl-4 pr-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {tab === 'archived' ? (
                            <button
                              type="button"
                              title="Restore to Active"
                              onClick={() => handleRestore(c)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                title="Edit"
                                onClick={() => openDrawer(c.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                              >
                                <Pencil size={14} />
                              </button>
                              {!isMapped && (
                                <button
                                  type="button"
                                  title="Archive"
                                  onClick={() => handleArchive(c)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-danger"
                                >
                                  <Archive size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {openId && <CohortDrawer id={openId === 'new' ? null : openId} onClose={closeDrawer} onChanged={bump} />}
    </div>
  );
};

export default CmsCohortsPage;

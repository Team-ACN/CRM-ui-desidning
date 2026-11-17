import React, { useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, Copy, Eye, MousePointerClick, Plus, RotateCcw } from 'lucide-react';
import { EmptyState, useToast } from './index';
import { SearchCircle, ArchiveCircle } from './ToolbarIcons';
import { POPUP_CREATIVE, getPopups, popupCpids, reorderSurfacePopups, setPopupStatus } from '../../data/mockPopups';
import PopupEditor from './Popups/PopupEditor';

const fmt = (n) => n.toLocaleString('en-IN');
const iconBtn = 'w-7 h-7 rounded-full inline-flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900';

const SURFACES = [
  { key: 'app', label: 'Mobile' },
  { key: 'web', label: 'Desktop' },
];

const copyBtn = (title, onClick) => (
  <button type="button" title={title} onClick={onClick} className="text-tertiary hover:text-neutral-900">
    <Copy size={11} />
  </button>
);

// App-managed popups ship inside the app: they only take part in the ranking, so they always sit
// in the active (ranked) group.
const isActive = (p) => p.appManaged || p.status === 'live';

function PopupCard({ p, surface, rank, archived, dragProps, onOpen, onArchive, onRestore, onCopy }) {
  const clicks = Math.round((p.impressions * p.ctr) / 100);
  return (
    <div className="bg-surface rounded-2xl shadow-card overflow-hidden h-full">
      <button
        type="button"
        onClick={onOpen}
        className={`relative w-full bg-fill flex items-center justify-center ${p.appManaged ? 'cursor-grab' : ''}`}
        style={{ aspectRatio: POPUP_CREATIVE[surface].ratio.replace(':', ' / ') }}
      >
        {p.creative?.url ? <img src={p.creative.url} alt="" draggable={false} className="w-full h-full object-cover" /> : <span className="text-[12px] text-tertiary">App-managed</span>}
        {(archived || isActive(p)) && (
          <span className={`absolute top-2.5 left-2.5 z-10 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${archived ? 'bg-neutral-100 text-neutral-500' : 'bg-green-100 text-green-700'}`}>
            {archived ? 'Archived' : 'Active'}
          </span>
        )}
        {rank && <span className="absolute top-2.5 right-2.5 z-10 text-[11.5px] font-semibold px-2 py-1 rounded-full bg-white/90 text-neutral-700 tabular-nums">#{rank}</span>}
      </button>
      <div className="px-4 pt-3 pb-4" {...dragProps}>
        <div className="flex items-center justify-between gap-2 h-7">
          <button type="button" onClick={onOpen} className="min-w-0 text-left">
            <p className="text-[13.5px] font-semibold text-label truncate">{p.name}</p>
          </button>
          {!p.appManaged && (
            <div className="flex items-center gap-1 shrink-0">
              {archived ? (
                <button type="button" title="Restore" onClick={onRestore} className={iconBtn}>
                  <RotateCcw size={14} />
                </button>
              ) : (
                <>
                  {p.status !== 'live' && (
                    <button type="button" title="Archive" onClick={onArchive} className={iconBtn}>
                      <Archive size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        {!p.appManaged && (
          <span className="mt-2 flex items-center gap-3 text-[11px] text-secondary tabular-nums">
            <span className="flex items-center gap-1" title="Views"><Eye size={11} /> {fmt(p.impressions)} {copyBtn('Copy CPIDs who saw', () => onCopy(popupCpids(p).viewers, 'viewer'))}</span>
            <span className="flex items-center gap-1" title="Clicks"><MousePointerClick size={11} /> {fmt(clicks)} {copyBtn('Copy CPIDs who clicked', () => onCopy(popupCpids(p).clickers, 'clicker'))}</span>
            <span className="font-medium text-neutral-700">{p.ctr.toFixed(1)}%</span>
          </span>
        )}
      </div>
    </div>
  );
}

function SortableCard({ p, ...rest }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined, opacity: isDragging ? 0.85 : 1 }}
      className={`touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      {...attributes}
      {...listeners}
    >
      <PopupCard p={p} {...rest} />
    </div>
  );
}

const CmsPopupsPage = () => {
  const [, forceRender] = useState(0);
  const bump = () => forceRender((v) => v + 1);
  const toast = useToast();

  const [surface, setSurface] = useState('app');
  const [query, setQuery] = useState('');
  const [archived, setArchived] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [editor, setEditor] = useState(null); // null | 'new' | popup id

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const q = query.trim().toLowerCase();
  const list = getPopups(surface).filter((p) => (p.status === 'archived') === archived && (!q || p.name.toLowerCase().includes(q)));
  const activeList = archived ? [] : list.filter(isActive);
  const disabledList = archived ? [] : list.filter((p) => !isActive(p));
  const cols = surface === 'app' ? 'grid-cols-5' : 'grid-cols-2';

  function copyList(cpids, label) {
    navigator.clipboard?.writeText(cpids.join('\n')).then(() => toast(`Copied ${cpids.length} ${label} CPIDs`));
  }
  function archive(p) {
    const prev = p.status;
    setPopupStatus(p.id, 'archived');
    bump();
    toast(`Archived '${p.name}'`, {
      undo: () => {
        setPopupStatus(p.id, prev);
        bump();
      },
    });
  }
  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const ids = activeList.map((p) => p.id);
    const next = arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id));
    reorderSurfacePopups(surface, [...next, ...disabledList.map((p) => p.id)]);
    bump();
  }

  const cardProps = (p, rank) => ({
    p,
    surface,
    rank,
    archived,
    onOpen: () => !p.appManaged && setEditor(p.id),
    onArchive: () => archive(p),
    onRestore: () => {
      setPopupStatus(p.id, 'paused');
      bump();
    },
    onCopy: copyList,
  });

  // Same proportions as a popup card: the poster area at the surface ratio, then the footer strip.
  const newTile = (
    <button type="button" onClick={() => setEditor('new')} className="w-full rounded-2xl border border-neutral-200 bg-neutral-100/70 overflow-hidden flex flex-col text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
      <span className="w-full flex flex-col items-center justify-center gap-1" style={{ aspectRatio: POPUP_CREATIVE[surface].ratio.replace(':', ' / ') }}>
        <Plus size={18} />
        <span className="text-[13px] font-medium">New popup</span>
        <span className="text-[11px] text-tertiary">{POPUP_CREATIVE[surface].ratio} · {POPUP_CREATIVE[surface].size}</span>
      </span>
      <span className="w-full h-[78px]" />
    </button>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className={`shrink-0 px-6 pt-5 pb-4 flex items-center justify-between gap-3 flex-wrap border-b transition-colors ${scrolled ? 'border-separator' : 'border-transparent'}`}>
        <div className="flex items-center gap-2">
          {SURFACES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSurface(s.key)}
              className={`px-3 py-1.5 rounded-xl border text-left transition-colors ${
                s.key === surface ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-surface text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <span className="block text-[13px] font-medium leading-tight">Popup</span>
              <span className={`block text-[11px] leading-tight mt-0.5 ${s.key === surface ? 'text-white/60' : 'text-tertiary'}`}>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SearchCircle value={query} onChange={setQuery} />
          <ArchiveCircle active={archived} onToggle={() => setArchived((v) => !v)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-8" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}>
        {archived ? (
          list.length === 0 ? (
            <EmptyState text="No archived popups." />
          ) : (
            <div className={`grid gap-3 ${cols}`}>
              {list.map((p) => (
                <PopupCard key={p.id} {...cardProps(p)} />
              ))}
            </div>
          )
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={activeList.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div className={`grid gap-3 ${cols}`}>
                  {newTile}
                  {activeList.map((p, i) => (
                    <SortableCard key={p.id} {...cardProps(p, i + 1)} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {disabledList.length > 0 && (
              <section className="border-t border-separator pt-8">
                <div className={`grid gap-3 ${cols}`}>
                  {disabledList.map((p) => (
                    <PopupCard key={p.id} {...cardProps(p)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {editor && <PopupEditor id={editor === 'new' ? null : editor} surface={surface} onClose={() => setEditor(null)} onChanged={bump} />}
    </div>
  );
};

export default CmsPopupsPage;

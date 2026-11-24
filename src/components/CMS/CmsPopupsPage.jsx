import React, { useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, Copy, Eye, MousePointerClick, Pencil, Plus, RotateCcw } from 'lucide-react';
import { EmptyState, useToast } from './index';
import { SearchCircle, ArchiveCircle } from './ToolbarIcons';
import { POPUP_CREATIVE, getPopups, popupCpids, reorderPopups, setPopupStatus } from '../../data/mockPopups';
import PopupEditor from './Popups/PopupEditor';

const fmt = (n) => n.toLocaleString('en-IN');
const iconBtn = 'w-7 h-7 rounded-full inline-flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900';

const ratioOf = (s) => POPUP_CREATIVE[s].ratio.replace(':', ' / ');

const archivedTag = (p) => p.status === 'archived' && <span className="absolute top-2 left-2 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500">Archived</span>;

// One creative in full (no crop).
// Ranked popups tag each surface they run on with Active.
function Slot({ p, s, tagged, className = '' }) {
  const url = p.creatives?.[s]?.url;
  const off = !p.on?.[s];
  return (
    <div className={`relative rounded-xl overflow-hidden bg-fill flex items-center justify-center ${className}`} style={{ aspectRatio: ratioOf(s) }}>
      {url ? <img src={url} alt="" draggable={false} className="w-full h-full object-cover" /> : <span className="text-[11px] text-tertiary">{p.appManaged && s === 'app' ? 'App-managed' : ''}</span>}
      {tagged && !off && <span className="absolute top-2 left-2 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Active</span>}
      {archivedTag(p)}
    </div>
  );
}

const copyBtn = (title, onClick) => (
  <button type="button" title={title} onClick={onClick} className="text-tertiary hover:text-neutral-900">
    <Copy size={11} />
  </button>
);

// App-managed popups ship inside the app: they only take part in the ranking, so they always sit
// in the active (ranked) group.
const isActive = (p) => p.appManaged || p.status === 'live';

function PopupCard({ p, rank, archived, onOpen, onArchive, onRestore, onCopy }) {
  const clicks = Math.round((p.impressions * p.ctr) / 100);
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className={`bg-surface rounded-2xl shadow-card overflow-hidden h-full ${p.appManaged ? '' : 'cursor-pointer hover:shadow-raised transition-shadow'}`}
    >
      <div className="p-3 grid grid-cols-[1fr_36%] gap-3 items-start">
        <div className="min-w-0 flex flex-col gap-3">
          <Slot p={p} s="web" tagged={!archived && isActive(p)} />
          <div className="px-1">
            <div className="flex items-center gap-1 h-7">
              <p className="flex-1 min-w-0 text-[13.5px] font-semibold text-label truncate">{p.name}</p>
              {rank && <span className="shrink-0 text-[11.5px] font-semibold px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 tabular-nums">#{rank}</span>}
              {!p.appManaged && !archived && (
                <button type="button" title="Edit" onClick={stop(onOpen)} className={iconBtn}>
                  <Pencil size={14} />
                </button>
              )}
              {!p.appManaged &&
                (archived ? (
                  <button type="button" title="Restore" onClick={stop(onRestore)} className={iconBtn}>
                    <RotateCcw size={14} />
                  </button>
                ) : (
                  p.status !== 'live' && (
                    <button type="button" title="Archive" onClick={stop(onArchive)} className={iconBtn}>
                      <Archive size={14} />
                    </button>
                  )
                ))}
            </div>
            {!p.appManaged && (
              <span className="mt-1.5 flex items-center gap-3 text-[11px] text-secondary tabular-nums">
                <span className="flex items-center gap-1" title="Views"><Eye size={11} /> {fmt(p.impressions)} {copyBtn('Copy CPIDs who saw', stop(() => onCopy(popupCpids(p).viewers, 'viewer')))}</span>
                <span className="flex items-center gap-1" title="Clicks"><MousePointerClick size={11} /> {fmt(clicks)} {copyBtn('Copy CPIDs who clicked', stop(() => onCopy(popupCpids(p).clickers, 'clicker')))}</span>
                <span className="font-medium text-neutral-700">{p.ctr.toFixed(1)}%</span>
              </span>
            )}
          </div>
        </div>
        <Slot p={p} s="app" tagged={!archived && isActive(p)} />
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

  const [query, setQuery] = useState('');
  const [archived, setArchived] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [editor, setEditor] = useState(null); // null | 'new' | popup id

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const q = query.trim().toLowerCase();
  const list = getPopups().filter((p) => (p.status === 'archived') === archived && (!q || p.name.toLowerCase().includes(q)));
  const activeList = archived ? [] : list.filter(isActive);
  const disabledList = archived ? [] : list.filter((p) => !isActive(p));
  const cols = 'grid-cols-2';

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
    reorderPopups(next);
    bump();
  }

  const cardProps = (p, rank) => ({
    p,
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

  // Same proportions as a popup card: the creative area, then the footer strip.
  const newTile = (
    <button type="button" onClick={() => setEditor('new')} className="w-full h-full min-h-[200px] rounded-2xl border border-neutral-200 bg-neutral-100/70 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
      <Plus size={18} />
      <span className="text-[13px] font-medium">New popup</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className={`shrink-0 px-6 pt-5 pb-4 flex items-center justify-between gap-3 flex-wrap border-b transition-colors ${scrolled ? 'border-separator' : 'border-transparent'}`}>
        <div />
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

      {editor && <PopupEditor id={editor === 'new' ? null : editor} onClose={() => setEditor(null)} onChanged={bump} />}
    </div>
  );
};

export default CmsPopupsPage;

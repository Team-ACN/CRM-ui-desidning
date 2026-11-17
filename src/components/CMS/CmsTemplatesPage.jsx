import React, { useState } from 'react';
import { Pencil, Plus, Archive, RotateCcw, GripVertical, Layers } from 'lucide-react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, EmptyState, useToast } from './index';
import { SearchCircle, ArchiveCircle } from './ToolbarIcons';
import BaseEditor from './Templates/BaseEditor';
import { PAGES, SYSTEM_WIDGETS, resolvePage, createTemplate, getPageMatrix, reorderTemplates, updateTemplate } from '../../data/mockCms';


function SortableRow({ id, disabled, children, ...rest }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, position: isDragging ? 'relative' : undefined, zIndex: isDragging ? 5 : undefined, background: isDragging ? 'white' : undefined, boxShadow: isDragging ? '0 6px 18px rgb(0 0 0 / 0.12)' : undefined }} {...rest}>
      {children({ attributes, listeners })}
    </tr>
  );
}

const iconAct = 'w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900';

const CmsTemplatesPage = () => {
  const [, forceRender] = useState(0);
  const bump = () => forceRender((v) => v + 1);
  const toast = useToast();

  const [pageKey, setPageKey] = useState(PAGES[0].key);
  const [tab, setTab] = useState('active');
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [settingsFirst, setSettingsFirst] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [baseOpen, setBaseOpen] = useState(false);

  const page = PAGES.find((p) => p.key === pageKey);
  const all = getPageMatrix(pageKey).templates;
  const movable = all.filter((t) => !t.isBase && t.status !== 'archived');

  const rows = all.filter((t) => {
    if (t.isBase) return false;
    if (tab === 'archived' ? t.status !== 'archived' : t.status === 'archived') return false;
    const q = query.trim().toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.cohorts.some((c) => c.toLowerCase().includes(q));
  });

  function handleDragEnd(e) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = movable.map((t) => t.id);
    reorderTemplates(pageKey, arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id)));
    bump();
  }
  function newTemplate() {
    const names = new Set(all.map((t) => t.name));
    let n = 1;
    while (names.has(n === 1 ? 'New template' : `New template ${n}`)) n += 1;
    const t = createTemplate(pageKey, { name: n === 1 ? 'New template' : `New template ${n}`, status: 'disabled' });
    setSettingsFirst(true);
    setEditor(t.id);
    bump();
  }
  function archive(t) {
    const prev = t.status;
    updateTemplate(pageKey, t.id, { status: 'archived', cohorts: [] });
    bump();
    toast(`Archived '${t.name}'`, {
      undo: () => {
        updateTemplate(pageKey, t.id, { status: prev });
        bump();
      },
    });
  }
  function restore(t) {
    updateTemplate(pageKey, t.id, { status: 'disabled' });
    bump();
    toast(`Restored '${t.name}'`);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {PAGES.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPageKey(p.key)}
                className={`px-3 py-1.5 rounded-xl border text-left transition-colors ${
                  p.key === pageKey ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-surface text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <span className="block text-[13px] font-medium leading-tight whitespace-nowrap">{p.label}</span>
                <span className={`block text-[11px] leading-tight mt-0.5 whitespace-nowrap ${p.key === pageKey ? 'text-white/60' : 'text-tertiary'}`}>
                  {p.platform === 'web' ? 'Desktop' : 'Mobile'}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SearchCircle value={query} onChange={setQuery} />
          <ArchiveCircle active={tab === 'archived'} onToggle={() => setTab((t) => (t === 'archived' ? 'active' : 'archived'))} />
          <Button onClick={() => setBaseOpen(true)}>Base template</Button>
          <Button variant="primary" icon={Plus} onClick={() => newTemplate()}>
            New template
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4">
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          {rows.length === 0 ? (
            <EmptyState icon={Layers} text="No templates." />
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-separator text-left text-[12px] text-secondary">
                  <th className="pl-5 pr-2 py-3 w-20 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium w-28 text-center">Components</th>
                  <th className="px-4 py-3 font-medium w-28 text-center">Status</th>
                  <th className="pl-4 pr-6 py-3 w-40 font-medium text-left">Action</th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={rows.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {rows.map((t) => {
                  return (
                    <SortableRow key={t.id} id={t.id} disabled={tab === 'archived'} onClick={() => setEditor(t.id)} className="border-b border-separator last:border-0 cursor-pointer hover:bg-fill/50 transition-colors">
                      {({ attributes, listeners }) => (<>
                      <td className="pl-5 pr-2 py-3" onClick={(e) => e.stopPropagation()}>
                        {t.isBase || tab === 'archived' ? (
                          <span className="text-[11px] text-tertiary pl-1">{t.isBase ? 'Last' : '—'}</span>
                        ) : (
                          <span {...attributes} {...listeners} title="Drag to reorder" className="w-7 h-7 inline-flex items-center justify-center text-tertiary cursor-grab active:cursor-grabbing">
                            <GripVertical size={15} />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-label">{t.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {t.isBase ? (
                            <span className="text-[11px] text-tertiary">Everyone else</span>
                          ) : t.cohorts.length === 0 ? (
                            <span className="text-[11px] text-tertiary">No cohorts</span>
                          ) : (
                            t.cohorts.map((id) => (
                              <span key={id} className="inline-flex items-center h-5 px-2 rounded-full bg-neutral-100 text-[11px] text-neutral-600">
                                {id}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-label tabular-nums">
                        {resolvePage(pageKey, t.id).filter((i) => !i.hidden && !SYSTEM_WIDGETS[i.row.widget]?.fixed).length}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {t.isBase ? (
                          <span className="text-[12px] text-secondary">Default</span>
                        ) : t.status === 'live' ? (
                          <span className="text-[12px] font-medium text-positive">Active</span>
                        ) : (
                          <span className="text-[12px] text-tertiary">Disabled</span>
                        )}
                      </td>
                      <td className="pl-4 pr-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {tab === 'archived' ? (
                            <button type="button" title="Restore" onClick={() => restore(t)} className={iconAct}>
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <>
                              <button type="button" title="Edit" onClick={() => setEditor(t.id)} className={iconAct}>
                                <Pencil size={14} />
                              </button>
                              {!t.isBase && t.status !== 'live' && (
                                <button type="button" title="Archive" onClick={() => archive(t)} className={`${iconAct} hover:text-danger`}>
                                  <Archive size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      </>)}
                    </SortableRow>
                  );
                })}
              </tbody>
              </SortableContext>
              </DndContext>
            </table>
          )}
        </div>
      </div>

      {baseOpen && <BaseEditor key="base" page={page} onClose={() => setBaseOpen(false)} onChanged={bump} />}
      {editor && <BaseEditor key={editor} startSettings={settingsFirst} page={page} template={all.find((t) => t.id === editor)} onClose={() => { setEditor(null); setSettingsFirst(false); }} onChanged={bump} />}
    </div>
  );
};

export default CmsTemplatesPage;

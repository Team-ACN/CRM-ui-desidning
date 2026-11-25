import React, { useEffect, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { ArrowLeft, ChevronRight, Eye, GripVertical, Lock } from 'lucide-react';
import { Button, useToast } from '../index';
import { COMPONENT_TYPES, SYSTEM_WIDGETS, getComponent, addMatrixRow, createCardRow, getCohorts, getPageMatrix, moveMatrixRowTo, rowTemplateUsage, setCellState, setTemplateTopBanner, updateTemplate, removeMatrixRow, setTopBanner, componentTitle } from '../../../data/mockCms';
import ComponentLibrary, { MIN_CARDS } from './ComponentLibrary';
import DragPreview from './DragPreview';
import { snapToCursor, gapCollision } from './cursorModifier';
import { componentName, rowLabel, typeLine } from './rowLabel';
import PreviewModal from './PreviewModal';
import ComponentStrip from './ComponentStrip';
import SectionEditDrawer from './SectionEditDrawer';
import ServicesDrawer from './ServicesDrawer';

const TAGS = {
  base: { label: 'BASE', cls: 'bg-neutral-300 text-neutral-800 border-neutral-400' },
  fixed: { label: 'FIXED', cls: 'bg-neutral-300 text-neutral-800 border-neutral-400' },
  top: { label: 'TOP', cls: 'bg-white text-neutral-700 border-neutral-300' },
  cms: { label: 'CMS', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
};


function Gap({ rowId, dragging }) {
  const { setNodeRef, isOver } = useDroppable({ id: `gap:${rowId}` });
  return (
    <div ref={setNodeRef} className="relative h-4">
      {dragging && isOver && <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-neutral-900" />}
    </div>
  );
}

function BaseRow({ row, page, tpl, moved, active, onEdit, onRemove, onChanged }) {
  const sys = row.kind === 'system' ? SYSTEM_WIDGETS[row.widget] : null;
  const isBase = !tpl || tpl.isBase;
  const cell = isBase ? { state: 'base' } : getPageMatrix(page.key).cells[tpl.id]?.[row.id] || { state: 'inherit' };
  const hidden = cell.state === 'hide';
  const component = getComponent(cell.state === 'override' && cell.override?.componentId ? cell.override.componentId : row.componentId);
  // In a template, rows that come from Base are grey and locked: they can only be switched on/off.
  const inherited = !isBase && !row.onlyFor;
  const locked = !!sys?.fixed || inherited;
  // Widgets carry no tag; fixed sections, the top banner and CMS components do.
  const tag = sys ? (sys.fixed && isBase ? TAGS.fixed : null) : row.kind === 'top' ? null : TAGS.cms;
  const { shown, total } = rowTemplateUsage(page.key, row.id);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `row:${row.id}`, data: { rowId: row.id }, disabled: locked });
  const highlight = moved || active;
  // Popular services opens its own picker (where the row can be edited).
  const picker = !!sys?.services && !locked;
  const poster = component && !COMPONENT_TYPES[component.type]?.inventory;
  return (
    <div
      ref={setNodeRef}
      id={`base-row-${row.id}`}
      style={highlight ? { boxShadow: '0 0 0 1px #171717' } : undefined}
      onClick={sys && !picker ? undefined : onEdit}
      className={`rounded-xl border overflow-hidden flex items-stretch ${sys && !picker ? '' : 'cursor-pointer'} ${isDragging ? 'opacity-40 ' : ''}${hidden ? 'border-red-300 bg-red-50' : row.onlyFor && !isBase ? 'border-neutral-200 bg-green-50' : `${highlight ? 'border-neutral-900' : locked ? 'border-neutral-400' : 'border-neutral-200'} ${locked ? 'bg-neutral-100' : 'bg-surface'}`}`}
    >
      <div className="w-1/2 shrink-0 min-w-0 p-3 flex gap-2.5 min-h-[84px]">
        {locked ? (
          <span className="w-6 h-6 flex items-center justify-center text-neutral-300 shrink-0">
            <Lock size={13} />
          </span>
        ) : (
          <span {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} title="Drag to reorder" className="w-6 h-6 flex items-center justify-center text-tertiary cursor-grab active:cursor-grabbing shrink-0">
            <GripVertical size={15} />
          </span>
        )}
        <div className="min-w-0 flex-1 flex flex-col justify-between gap-2.5">
          <p className={`text-[14px] font-semibold text-label leading-snug break-words `}>
            {component ? (component.cardComponent ? typeLine(component) : `${typeLine(component)} · `) : ''}
            {sys ? sys.label : component?.cardComponent ? '' : componentName(component)}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {inherited && <span className={`shrink-0 px-2.5 h-6 inline-flex items-center rounded-full border text-[11px] font-semibold tracking-wide ${TAGS.base.cls}`}>{TAGS.base.label}</span>}
            {tag && <span className={`shrink-0 px-2.5 h-6 inline-flex items-center rounded-full border text-[11px] font-semibold tracking-wide ${tag.cls}`}>{tag.label}</span>}
            {isBase && !locked && total > 0 &&
              (sys ? (
                <span title="Shown in this many templates" className="shrink-0 h-6 px-2.5 rounded-full border border-neutral-200 bg-white inline-flex items-center text-[11px] font-semibold text-neutral-600 tabular-nums">
                  {shown}/{total}
                </span>
              ) : (
                <button type="button" title="Shown in this many templates" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="shrink-0 h-6 px-2.5 rounded-full border border-neutral-200 bg-white text-[11px] font-semibold text-neutral-600 tabular-nums hover:border-neutral-400">
                  {shown}/{total}
                </button>
              ))}
            {inherited && !sys?.fixed && (
              <button
                type="button"
                title={hidden ? 'Hidden in this template · click to show' : 'Shown in this template · click to hide'}
                onClick={(e) => {
                  e.stopPropagation();
                  setCellState(page.key, tpl.id, row.id, hidden ? 'inherit' : 'hide');
                  onChanged();
                }}
                className={`shrink-0 h-6 px-2.5 rounded-full border inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${hidden ? 'bg-white border-transparent text-red-600 hover:bg-neutral-50' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hidden ? 'bg-red-500' : 'bg-green-600'}`} />
                {hidden ? 'Hidden' : 'Live'}
              </button>
            )}
            {!locked && (
              <button type="button" title="Delete" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="shrink-0 h-6 px-2.5 rounded-full text-[11px] font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-600">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {poster && (
        <div className="w-1/2 min-w-0 self-center flex justify-end p-3 pl-0">
          <ComponentStrip component={component} height={96} />
        </div>
      )}
    </div>
  );
}

// Base template editor: the library on the left, the default layout (what everyone gets unless a
// template overrides it) on the right.
const BaseEditor = ({ page, template, onClose, onChanged, startSettings = false }) => {
  const toast = useToast();
  const [, forceRender] = useState(0);
  const bump = () => {
    forceRender((v) => v + 1);
    onChanged();
  };
  const [dragId, setDragId] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [movedId, setMovedId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(startSettings);
  // After an up/down move, flash the row that moved and keep it in view so it's easy to follow.
  useEffect(() => {
    if (!movedId) return undefined;
    document.getElementById(`base-row-${movedId}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const t = setTimeout(() => setMovedId(null), 1100);
    return () => clearTimeout(t);
  }, [movedId]);

  const matrix = getPageMatrix(page.key);
  const base = matrix.templates.find((t) => t.isBase);
  const tpl = template ? matrix.templates.find((t) => t.id === template.id) || base : base;
  const rows = matrix.rows.filter((r) => (tpl.isBase ? !r.onlyFor : !r.onlyFor || r.onlyFor === tpl.id));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));


  // Drag-drop or + from the library adds straight away (no confirmation); template columns inherit it.
  function removeNow(row) {
    removeMatrixRow(page.key, row.id);
    toast(`Removed '${rowLabel(row)}'`);
    bump();
  }

  function quickAdd(rawPreset, afterRowId) {
    if (rawPreset.cardIds && rawPreset.cardIds.length < MIN_CARDS) {
      toast(`Pick at least ${MIN_CARDS} cards`);
      return;
    }
    const preset = rawPreset.cardIds ? { componentId: createCardRow(rawPreset.cardIds).id } : rawPreset;
    if (preset.topId) {
      if (tpl.isBase) setTopBanner(page.key, preset.topId);
      else setTemplateTopBanner(page.key, tpl.id, preset.topId);
      toast(`Top banner set to '${componentTitle(getComponent(preset.topId))}'`);
      bump();
      return;
    }
    const after = afterRowId || rows.slice(-1)[0].id;
    if (preset.widget) {
      const added = addMatrixRow(page.key, { widget: preset.widget, heading: '', ...(tpl.isBase ? {} : { only: tpl.id }) }, after, null);
      toast(`Added ${SYSTEM_WIDGETS[preset.widget].label}`);
      if (SYSTEM_WIDGETS[preset.widget].services) setEditRowId(added.id);
    } else {
      addMatrixRow(page.key, { componentId: preset.componentId, ...(tpl.isBase ? {} : { only: tpl.id }) }, after, null);
      toast(`Added ${getComponent(preset.componentId)?.cardComponent ? typeLine(getComponent(preset.componentId)) : `'${componentTitle(getComponent(preset.componentId))}'`}`);
    }
    bump();
  }

  function handleDragEnd(e) {
    setDragId(null);
    setSelectedCards([]);
    const over = e.over?.id;
    if (!over || !String(over).startsWith('gap:')) return;
    const after = String(over).slice(4);
    if (String(e.active.id).startsWith('row:')) {
      const id = e.active.data.current.rowId;
      moveMatrixRowTo(page.key, id, after);
      setMovedId(id);
      bump();
    } else {
      quickAdd(e.active.data.current, after);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={gapCollision} onDragStart={(e) => setDragId(String(e.active.id))} onDragEnd={handleDragEnd} onDragCancel={() => setDragId(null)}>
      <div className="absolute inset-0 z-[40] bg-white flex flex-col">
        <header className="shrink-0 h-16 px-5 flex items-center gap-3 border-b border-separator">
          <button type="button" onClick={onClose} className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="ml-auto flex items-center gap-2">
            {!(settingsOpen && !tpl.isBase) && (
              <>
                <Button icon={Eye} onClick={() => setPreviewOpen(true)}>
                  Preview
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    toast('Saved');
                    onClose();
                  }}
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-3">
          <aside className="overflow-y-auto p-5 border-r border-separator">
            <div>
            {!tpl.isBase && (
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className={`w-full mb-5 rounded-xl border px-3 py-2.5 flex items-center gap-2.5 text-left transition-colors ${settingsOpen ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 bg-surface hover:border-neutral-400'}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-tertiary">Template</span>
                <span className="block text-[14px] font-semibold text-label truncate">{tpl.isBase ? 'Base' : tpl.name}</span>
              </span>
              {!tpl.isBase && <span className={`w-2 h-2 rounded-full shrink-0 ${tpl.status === 'live' ? 'bg-[#16a34a]' : 'bg-[#d97706]'}`} />}
              <ChevronRight size={15} className="text-tertiary shrink-0" />
            </button>
            )}
            <ComponentLibrary
              page={page}
              templateId={tpl.isBase ? null : tpl.id}
              selected={selectedCards}
              setSelected={setSelectedCards}
              onAdd={(preset) => quickAdd(preset)}
            />
            </div>
          </aside>

          <div className="col-span-2 overflow-y-auto p-5">
            {settingsOpen && !tpl.isBase ? (
              <div className="max-w-2xl mx-auto pt-4 space-y-9">
                <input
                  value={tpl.name}
                  onChange={(e) => { updateTemplate(page.key, tpl.id, { name: e.target.value }); bump(); }}
                  placeholder="Template name"
                  className="w-full h-12 px-4 rounded-lg bg-white text-[16px] text-label border border-neutral-200 outline-none focus:border-neutral-500"
                />
                <div className="inline-flex rounded-full border border-neutral-300 p-0.5">
                  {[['live', 'Active', 'bg-green-50 text-[#16a34a]'], ['disabled', 'Disabled', 'bg-neutral-100 text-neutral-700']].map(([v, l, on]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { updateTemplate(page.key, tpl.id, { status: v }); bump(); }}
                      className={`h-9 px-5 rounded-full text-[15px] font-medium transition-colors ${tpl.status === v ? on : 'text-neutral-400 hover:text-neutral-700'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {getCohorts().filter((c) => c.status !== 'archived').map((c) => {
                    const on = tpl.cohorts.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { updateTemplate(page.key, tpl.id, { cohorts: on ? tpl.cohorts.filter((x) => x !== c.id) : [...tpl.cohorts, c.id] }); bump(); }}
                        className={`h-10 px-4 rounded-full border text-[15px] font-medium transition-colors ${on ? 'bg-neutral-100 border-neutral-400 text-neutral-900' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                <Button className="w-full" onClick={() => setSettingsOpen(false)}>Done</Button>
              </div>
            ) : null}
            {!(settingsOpen && !tpl.isBase) && rows.map((row) => (
              <React.Fragment key={row.id}>
                <BaseRow row={row} page={page} tpl={tpl} onChanged={bump} moved={movedId === row.id} active={editRowId === row.id} onEdit={() => setEditRowId(row.id)} onRemove={() => removeNow(row)} />
                <Gap rowId={row.id} dragging={!!dragId} />
              </React.Fragment>
            ))}
          </div>

        </div>

      </div>
      {editRowId && SYSTEM_WIDGETS[matrix.rows.find((r) => r.id === editRowId)?.widget]?.services && (
        <ServicesDrawer key={editRowId} page={page} row={matrix.rows.find((r) => r.id === editRowId)} onClose={() => setEditRowId(null)} onChanged={bump} />
      )}
      {editRowId && matrix.rows.find((r) => r.id === editRowId) && !SYSTEM_WIDGETS[matrix.rows.find((r) => r.id === editRowId)?.widget]?.services && (
        <SectionEditDrawer page={page} tpl={tpl.isBase ? null : tpl} row={matrix.rows.find((r) => r.id === editRowId)} onClose={() => setEditRowId(null)} onChanged={bump} />
      )}
      {previewOpen && <PreviewModal page={page} template={tpl} onClose={() => setPreviewOpen(false)} />}
      <DragOverlay dropAnimation={null} zIndex={500} modifiers={[snapToCursor]}>
        <DragPreview dragId={dragId} rows={rows} />
      </DragOverlay>
    </DndContext>
  );
};

export default BaseEditor;

import React from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Drawer } from '../index';
import {
  COMPONENT_TYPES,
  SYSTEM_WIDGETS,
  componentFitsPage,
  componentTitle,
  getComponent,
  getCards,
  getComponents,
  itemFromCard,
  getPageMatrix,
  replaceRowComponent,
  rowTemplateUsage,
  setCellState,
  updateComponent,
} from '../../../data/mockCms';
import ComponentStrip from './ComponentStrip';
import { MIN_CARDS } from './ComponentLibrary';
import { typeLine } from './rowLabel';
import SectionImage from './SectionImage';

// Side drawer for one section: which templates show it (Base is the default and always shows
// it), and which banner it uses — banners only, full width, no captions.
function SortableCard({ item, index, ratio, canRemove, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-2">
      <span {...attributes} {...listeners} title="Drag to reorder" className="w-6 h-7 flex items-center justify-center text-tertiary cursor-grab active:cursor-grabbing"><GripVertical size={15} /></span>
      <span className="w-4 text-center text-[12px] font-semibold text-tertiary tabular-nums">{index + 1}</span>
      <div className="w-14 shrink-0 rounded-md overflow-hidden bg-fill" style={{ aspectRatio: ratio.replace(':', ' / ') }}>
        {item.imageUrl && <img src={item.imageUrl.url} alt="" className="w-full h-full object-cover" />}
      </div>
      <p className="min-w-0 flex-1 text-[13px] font-medium text-label truncate">{item.name}</p>
      <button type="button" title="Remove" disabled={!canRemove} onClick={onRemove} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"><X size={14} /></button>
    </div>
  );
}

const SectionEditDrawer = ({ page, tpl, row, onClose, onChanged }) => {
  const matrix = getPageMatrix(page.key);
  const templates = tpl ? [] : matrix.templates.filter((t) => t.status !== 'archived' && !t.isBase);
  const cell = tpl ? matrix.cells[tpl.id]?.[row.id] || { state: 'inherit' } : null;
  const currentId = tpl ? cell.override?.componentId || row.componentId : row.componentId;
  const baseComponent = getComponent(row.componentId);
  const sys = row.kind === 'system' ? SYSTEM_WIDGETS[row.widget] : null;
  const { shown, total } = rowTemplateUsage(page.key, row.id);
  const meta = baseComponent ? COMPONENT_TYPES[baseComponent.type] : null;

  const cardRow = !!baseComponent?.cardComponent;
  const setItems = (items) => {
    updateComponent(baseComponent.id, { items, internalName: items[0]?.name || baseComponent.internalName });
    onChanged();
  };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const moreCards = cardRow ? getCards(baseComponent.type).filter((c) => !baseComponent.items.some((it) => it.cardId === c.id)) : [];
  const candidates = baseComponent && !meta.inventory && !baseComponent.cardComponent
    ? getComponents().filter((c) => c.type === baseComponent.type && componentFitsPage(c, page.key) && (tpl || row.kind === 'top' || c.id === row.componentId || !matrix.rows.some((r) => r.componentId === c.id)))
    : [];

  return (
    <Drawer
      title={sys ? sys.label : baseComponent?.cardComponent ? typeLine(baseComponent) : componentTitle(baseComponent)}
      onClose={onClose}
      footer={
        <Button variant="primary" className="w-full" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-6">
        {!tpl && (
          <div>
            <p className="flex items-center justify-between text-[13px] font-semibold text-label mb-2">
              Templates <span className="h-6 px-2.5 inline-flex items-center rounded-full border border-neutral-200 bg-white text-[11px] font-semibold text-neutral-600 tabular-nums">{shown}/{total}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((t) => {
                const on = matrix.cells[t.id]?.[row.id]?.state !== 'hide';
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setCellState(page.key, t.id, row.id, on ? 'hide' : 'inherit');
                      onChanged();
                    }}
                    className={`h-8 px-3 rounded-full border text-[13px] font-medium transition-colors ${
                      on ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {cardRow && (
          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-label">Cards</p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (!over || active.id === over.id) return;
                const items = baseComponent.items;
                setItems(arrayMove(items, items.findIndex((x) => x.id === active.id), items.findIndex((x) => x.id === over.id)));
              }}
            >
              <SortableContext items={baseComponent.items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
                {baseComponent.items.map((item, i) => (
                  <SortableCard key={item.id} item={item} index={i} ratio={meta.ratio} canRemove={baseComponent.items.length > MIN_CARDS} onRemove={() => setItems(baseComponent.items.filter((x) => x.id !== item.id))} />
                ))}
              </SortableContext>
            </DndContext>
            {moreCards.length > 0 && (
              <div className="pt-4">
                <p className="text-[13px] font-semibold text-label mb-2">Add cards</p>
                <div className={`grid gap-2 ${meta.ratio === '4:5' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  {moreCards.map((c) => (
                    <button key={c.id} type="button" onClick={() => setItems([...baseComponent.items, itemFromCard(c)])} className="text-left group">
                      <div className="relative rounded-lg overflow-hidden bg-fill" style={{ aspectRatio: meta.ratio.replace(':', ' / ') }}>
                        {c.imageUrl && <img src={c.imageUrl.url} alt="" className="w-full h-full object-cover" />}
                        <span className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100"><Plus size={18} className="text-white" /></span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-label truncate">{c.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {candidates.length > 0 && (
          <div className="space-y-3">
            <p className="flex items-center justify-between text-[13px] font-semibold text-label">
              {meta.label} <span className="font-normal text-secondary tabular-nums">{candidates.length}</span>
            </p>
            {candidates.map((c) => (
              <button
                key={c.id}
                type="button"
                title={componentTitle(c)}
                onClick={() => {
                  if (!tpl) replaceRowComponent(page.key, row.id, c.id);
                  else if (c.id === row.componentId) setCellState(page.key, tpl.id, row.id, 'inherit');
                  else setCellState(page.key, tpl.id, row.id, 'override', { componentId: c.id });
                  onChanged();
                }}
                className={`block w-full overflow-hidden rounded-xl border-2 transition-colors ${c.id === currentId ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'}`}
              >
                {meta.carousel ? <ComponentStrip component={c} height={meta.ratio === '4:5' ? 140 : 100} /> : <SectionImage component={c} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default SectionEditDrawer;

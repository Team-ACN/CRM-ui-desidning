import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DndContext, DragOverlay, PointerSensor, closestCenter, pointerWithin, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Drawer } from '../index';
import { POPULAR_SERVICES_MAX, SERVICES_CATALOG, setRowServices } from '../../../data/mockCms';

// Pointer decides the zone; inside the section, the nearest service row wins (for the drop spot).
function collide(args) {
  const hits = pointerWithin(args);
  if (!hits.length) return closestCenter(args);
  if (hits.some((h) => h.id === 'top')) {
    const rows = closestCenter({ ...args, droppableContainers: args.droppableContainers.filter((c) => String(c.id).startsWith('p:')) });
    return rows.length ? rows : hits.filter((h) => h.id === 'top');
  }
  return hits;
}

const label = (key) => SERVICES_CATALOG.find((s) => s.key === key)?.label || key;

function Picked({ id, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `p:${id}` });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`h-10 flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white pl-2 pr-1 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
    >
      <span className="w-4 text-center text-[11.5px] font-semibold text-tertiary tabular-nums shrink-0">{index + 1}</span>
      <p className="min-w-0 flex-1 text-[12.5px] font-medium text-label truncate">{label(id)}</p>
      <button type="button" title="Remove" onPointerDown={(e) => e.stopPropagation()} onClick={onRemove} className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 shrink-0">
        <X size={13} />
      </button>
    </div>
  );
}

function Available({ id, disabled }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `a:${id}`, disabled });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`h-10 flex items-center rounded-xl border border-neutral-200 bg-white px-3 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab hover:shadow-card active:cursor-grabbing'} ${isDragging ? 'opacity-30' : ''}`}
    >
      <p className="min-w-0 flex-1 text-[12.5px] font-medium text-label truncate">{label(id)}</p>
    </div>
  );
}

function Zone({ id, className, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? 'ring-2 ring-neutral-900/15' : ''}`}>
      {children}
    </div>
  );
}

// Popular services section: drag services from the catalogue (below) into the section (above),
// up to 8. Drag inside the section to reorder; drag one back down (or ✕) to take it out.
const ServicesDrawer = ({ page, row, onClose, onChanged }) => {
  const [picked, setPicked] = useState(row.services || []);
  const [dragging, setDragging] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const full = picked.length >= POPULAR_SERVICES_MAX;
  const rest = SERVICES_CATALOG.filter((s) => !picked.includes(s.key));

  // Saved only once all 8 are in.
  function save() {
    setRowServices(page.key, row.id, picked);
    onChanged();
    onClose();
  }

  function handleDragEnd({ active, over }) {
    setDragging(null);
    if (!over) return;
    const a = String(active.id);
    const o = String(over.id);
    const key = a.slice(2);
    if (a.startsWith('a:')) {
      if (full || (o !== 'top' && !o.startsWith('p:'))) return;
      // Dropped on a row: before it if above its middle, after it if below.
      let at = picked.length;
      if (o.startsWith('p:')) {
        const r = active.rect.current.translated;
        const below = r && r.top + r.height / 2 > over.rect.top + over.rect.height / 2;
        at = picked.indexOf(o.slice(2)) + (below ? 1 : 0);
      }
      const next = [...picked];
      next.splice(at, 0, key);
      setPicked(next);
    } else if (a.startsWith('p:')) {
      if (o === 'bottom') setPicked(picked.filter((k) => k !== key));
      else if (o.startsWith('p:') && o !== a) setPicked(arrayMove(picked, picked.indexOf(key), picked.indexOf(o.slice(2))));
    }
  }

  return (
    <Drawer
      title="Popular services"
      onClose={onClose}
      footer={
        <Button variant="primary" className="w-full" disabled={!full} onClick={save}>
          Save
        </Button>
      }
    >
      <DndContext sensors={sensors} collisionDetection={collide} onDragStart={(e) => setDragging(String(e.active.id))} onDragEnd={handleDragEnd} onDragCancel={() => setDragging(null)}>
        <div className="space-y-6">
          <Zone id="top" className="grid grid-cols-2 gap-2 rounded-xl">
            <SortableContext items={picked.map((k) => `p:${k}`)} strategy={rectSortingStrategy}>
              {picked.map((k, i) => (
                <Picked key={k} id={k} index={i} onRemove={() => setPicked(picked.filter((x) => x !== k))} />
              ))}
            </SortableContext>
            {Array.from({ length: POPULAR_SERVICES_MAX - picked.length }, (_, i) => (
              <div key={i} className="h-10 rounded-xl border border-dashed border-neutral-300 flex items-center pl-2 text-[11.5px] font-semibold text-tertiary tabular-nums">
                <span className="w-4 text-center">
                {picked.length + i + 1}</span>
              </div>
            ))}
          </Zone>

          <Zone id="bottom" className="rounded-xl">
            <p className="text-[13px] font-semibold text-label mb-2">All services</p>
            <div className="grid grid-cols-2 gap-2">
              {rest.map((s) => (
                <Available key={s.key} id={s.key} disabled={full} />
              ))}
            </div>
          </Zone>
        </div>
        <DragOverlay dropAnimation={null} zIndex={500}>
          {dragging ? (
            <div className="flex items-center gap-2 rounded-xl border border-neutral-900 bg-white px-3 py-2 shadow-raised text-[12.5px] font-medium text-label">
              {label(dragging.slice(2))}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Drawer>
  );
};

export default ServicesDrawer;

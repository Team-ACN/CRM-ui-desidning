import React, { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Check, GripVertical, Lock, Eye } from 'lucide-react';
import { Button, IconButton, ListGroup, Switch } from '../cms-ui';
import StatusChip from './StatusChip';
import { surfaceLabel } from './popupConstants';
import { describeTrigger } from './popupValidation';
import { groupPopupsByContext } from './groupPopups';

const SortableRow = ({ popup, index, onPreview, onToggleActive }) => {
  const creative = popup.imageUrl || popup.imageUrlDesktop;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: popup.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`flex items-center gap-4 px-4 min-h-[60px] py-3 bg-surface ${
        isDragging ? 'z-10 rounded-xl shadow-raised' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary transition-colors touch-none"
      >
        <GripVertical size={16} strokeWidth={1.75} />
      </button>

      <span className="w-4 text-[13px] text-tertiary tabular-nums text-right shrink-0">
        {index + 1}
      </span>

      <div className="w-9 h-11 rounded-lg overflow-hidden bg-fill shrink-0 flex items-center justify-center">
        {creative ? (
          <img src={creative} alt="" className="w-full h-full object-cover" />
        ) : (
          <Lock size={14} strokeWidth={1.75} className="text-tertiary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-[15px] font-medium tracking-[-0.01em] text-label truncate">{popup.name}</p>
          {popup.managedExternally && (
            <span className="text-[12px] text-tertiary shrink-0">App-managed</span>
          )}
        </div>
        <p className="text-[13px] text-secondary truncate mt-0.5">{describeTrigger(popup)}</p>
      </div>

      {popup.status === 'Not Live' ? (
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          onClick={() => onPreview(popup)}
          className="shrink-0"
        >
          Preview to activate
        </Button>
      ) : popup.status === 'Draft' || popup.managedExternally ? (
        <StatusChip status={popup.status} className="shrink-0" />
      ) : (
        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`text-[13px] font-medium ${popup.isActive ? 'text-positive' : 'text-secondary'}`}>
            {popup.isActive ? 'Live' : 'Off'}
          </span>
          <Switch
            checked={!!popup.isActive}
            onChange={() => onToggleActive(popup.id)}
            label={popup.isActive ? 'Turn off' : 'Turn on'}
          />
        </div>
      )}
    </div>
  );
};

// Two-step by design: ranking only changes inside this screen, and only on Save.
const PopupPriorityManager = ({ popups, surface, onSave, onBack, onPreview, onToggleActive }) => {
  const [groups, setGroups] = useState(() => groupPopupsByContext(popups));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Ordering is local until saved, but status changes (approve, turn off) are live —
  // so rows always render the latest record and keep only their position from state.
  const latestById = useMemo(() => new Map(popups.map((p) => [p.id, p])), [popups]);

  const initialOrder = useMemo(
    () => groupPopupsByContext(popups).flatMap((g) => g.items.map((p) => p.id)).join('|'),
    [popups]
  );
  const currentOrder = groups.flatMap((g) => g.items.map((p) => p.id)).join('|');
  const isDirty = initialOrder !== currentOrder;

  const handleDragEnd = (groupKey) => ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setGroups((prev) =>
      prev.map((group) => {
        if (group.key !== groupKey) return group;
        const oldIndex = group.items.findIndex((p) => p.id === active.id);
        const newIndex = group.items.findIndex((p) => p.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return group;
        return { ...group, items: arrayMove(group.items, oldIndex, newIndex) };
      })
    );
  };

  const handleSave = () =>
    onSave(groups.flatMap((group) => group.items.map((popup, i) => ({ ...popup, priority: i + 1 }))));

  return (
    <div className="pb-12">
      <header className="material bg-surface/80 backdrop-blur-xl backdrop-saturate-150 border-b border-separator sticky top-0 z-10">
        <div className="h-16 px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <IconButton icon={ArrowLeft} label="Back" size={18} onClick={onBack} className="-ml-2" />
            <div className="min-w-0">
              <h1 className="text-[17px] leading-[22px] font-semibold tracking-[-0.01em] text-label">
                Manage priority
                <span className="ml-2 font-normal text-secondary">{surfaceLabel(surface)}</span>
              </h1>
              <p className="text-[13px] text-secondary truncate">
                Drag to reorder · approve popups waiting for review · changes apply only when you save
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDirty && <span className="mr-2 text-[13px] text-warning font-medium">Unsaved changes</span>}
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button variant="primary" icon={Check} onClick={handleSave} disabled={!isDirty}>
              Save &amp; apply
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-8 mt-6 px-4 py-3 bg-surface rounded-2xl shadow-card">
        <p className="text-[14px] font-semibold text-label">How priority works</p>
        <p className="text-[13px] text-secondary mt-0.5">
          Only one popup shows per view. {surfaceLabel(surface)} popups are ranked per trigger,
          and never compete with popups on the other surface.
        </p>
      </div>

      <div className="px-8 mt-8 space-y-8">
        {groups.map((group) => (
          <ListGroup key={group.key} header={group.label}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd(group.key)}
            >
              <SortableContext
                items={group.items.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {group.items.map((item, index) => {
                  const popup = latestById.get(item.id) || item;
                  return (
                  <SortableRow
                    key={popup.id}
                    popup={popup}
                    index={index}
                    onPreview={onPreview}
                    onToggleActive={onToggleActive}
                  />
                  );
                })}
              </SortableContext>
            </DndContext>
          </ListGroup>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-12 text-[13px] text-secondary">No popups for this surface yet.</div>
        )}
      </div>
    </div>
  );
};

export default PopupPriorityManager;

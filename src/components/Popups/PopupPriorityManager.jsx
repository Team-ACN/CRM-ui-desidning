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
import { ArrowLeft, Check, GripVertical, Lock, Eye, Power } from 'lucide-react';
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
      className={`flex items-center gap-4 px-4 py-3 bg-white border rounded-xl ${
        isDragging ? 'border-emerald-300 shadow-lg' : 'border-gray-200'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
      >
        <GripVertical size={18} />
      </button>

      <span className="w-7 h-7 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
        {index + 1}
      </span>

      <div className="w-9 h-11 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
        {creative ? (
          <img src={creative} alt="" className="w-full h-full object-cover" />
        ) : (
          <Lock size={13} className="text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{popup.name}</p>
          {popup.managedExternally && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 shrink-0">
              App-managed
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{describeTrigger(popup)}</p>
      </div>

      {popup.status === 'Not Live' ? (
        <button
          onClick={() => onPreview(popup)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
        >
          <Eye size={13} />
          Preview to activate
        </button>
      ) : popup.status === 'Draft' || popup.managedExternally ? (
        <StatusChip status={popup.status} className="shrink-0" />
      ) : (
        <button
          onClick={() => onToggleActive(popup.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
            popup.isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Power size={13} />
          {popup.isActive ? 'Live' : 'Off'}
        </button>
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">Manage priority</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                  {surfaceLabel(surface)}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Drag to reorder · approve popups waiting for review · changes apply only when you save
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>}
            <button
              onClick={onBack}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Check size={16} />
              Save &amp; apply
            </button>
          </div>
        </div>
      </header>

      <div className="mx-6 mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700 font-medium">How priority works</p>
        <p className="text-xs text-blue-600 mt-0.5">
          Only one popup shows per view. {surfaceLabel(surface)} popups are ranked per trigger,
          and never compete with popups on the other surface.
        </p>
      </div>

      <div className="px-6 mt-5 space-y-6">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2 pb-2 border-b border-gray-100">
              {group.label}
            </h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd(group.key)}
            >
              <SortableContext
                items={group.items.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
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
                </div>
              </SortableContext>
            </DndContext>
          </section>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No popups for this surface yet.</div>
        )}
      </div>
    </div>
  );
};

export default PopupPriorityManager;

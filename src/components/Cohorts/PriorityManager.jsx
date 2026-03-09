import React, { useState, useEffect } from 'react';
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
import { GripVertical, X, Save, ArrowLeft, Check, Power } from 'lucide-react';
import { mockCohorts as allCohorts, availableWidgets } from '../../data/mockCohorts';

const SortableItem = ({ template, index, cohorts, onToggleActive }) => {
  const cohort = cohorts.find((c) => c.id === template.cohortId);
  const widgetIcons = template.widgets.map((w) => {
    const aw = availableWidgets.find((a) => a.type === w.type);
    return aw?.icon || '';
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: template.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 px-4 py-3.5 bg-white border rounded-xl ${
        isDragging ? 'border-emerald-300 shadow-lg' : 'border-gray-200'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
      >
        <GripVertical size={18} />
      </button>

      {/* Rank */}
      <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
        {index + 1}
      </div>

      {/* Template info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{template.name}</p>
        <p className="text-xs text-gray-400 truncate">{cohort?.name || 'Unknown cohort'}</p>
      </div>

      {/* Widget icons */}
      <div className="flex items-center gap-0.5">
        {widgetIcons.map((emoji, i) => (
          <span key={i} className="text-sm">{emoji}</span>
        ))}
      </div>

      {/* Active toggle */}
      <button
        onClick={() => onToggleActive(template.id)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          template.isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
        }`}
      >
        <Power size={12} />
        {template.isActive ? 'Live' : 'Draft'}
      </button>
    </div>
  );
};

const PriorityManager = ({ templates, cohorts, onSave, onBack }) => {
  const [items, setItems] = useState(
    [...templates].sort((a, b) => a.priority - b.priority)
  );

  // Sync when templates prop changes
  useEffect(() => {
    setItems([...templates].sort((a, b) => a.priority - b.priority));
  }, [templates]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((t) => t.id === active.id);
    const newIndex = items.findIndex((t) => t.id === over.id);
    setItems(arrayMove(items, oldIndex, newIndex));
  };

  const handleToggleActive = (id) => {
    setItems((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, isActive: !t.isActive, status: t.isActive ? 'Draft' : 'Live' }
          : t
      )
    );
  };

  const handleSave = () => {
    const updated = items.map((t, i) => ({ ...t, priority: i + 1 }));
    onSave(updated);
  };

  const liveCount = items.filter((t) => t.isActive).length;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Manage Priority</h1>
              <p className="text-xs text-gray-400">
                Drag to reorder • Toggle to activate • {liveCount} live, {items.length - liveCount} draft
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Check size={16} />
            Save & Apply
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-6 mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700 font-medium">How priority works</p>
        <p className="text-xs text-blue-600 mt-0.5">
          When an agent belongs to multiple cohorts, they see the template with the highest priority (1 = highest). 
          Drag templates to reorder and toggle them Live to activate.
        </p>
      </div>

      {/* Sortable list */}
      <div className="px-6 mt-5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((template, index) => (
                <SortableItem
                  key={template.id}
                  template={template}
                  index={index}
                  cohorts={cohorts}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No templates created yet. Create templates first, then come here to set priority.
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityManager;

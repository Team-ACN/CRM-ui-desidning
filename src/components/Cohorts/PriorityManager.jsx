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
import { GripVertical, X, Save, ArrowLeft, Check, Eye, ArrowUpDown } from 'lucide-react';
import { mockCohorts as allCohorts, availableWidgets } from '../../data/mockCohorts';
import { Button, IconButton, pressable, sectionTitleClass } from '../cms-ui';

const SortableItem = ({ template, index, cohorts, onToggleActive, onPreview }) => {
  const targetCohorts = template.cohortIds?.map(id => cohorts.find(c => c.id === id)).filter(Boolean) || [];
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
      className={`relative flex items-center gap-3 px-4 min-h-[60px] py-3 bg-surface first:rounded-t-2xl last:rounded-b-2xl ${
        isDragging ? 'z-10 rounded-2xl shadow-raised' : ''
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="-ml-1 p-1 rounded-md cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary touch-none"
      >
        <GripVertical size={16} strokeWidth={1.75} />
      </button>

      {/* Rank */}
      <span className="w-5 shrink-0 text-right text-[13px] font-medium text-tertiary tabular-nums">
        {index + 1}
      </span>

      {/* Template info */}
      <div className="flex-1 min-w-0 ml-1">
        <p className="text-[15px] font-medium tracking-[-0.01em] text-label truncate">{template.name}</p>
        <p className="text-[13px] text-secondary truncate mt-0.5">{targetCohorts.map(tc => tc.name).join(', ') || 'No valid cohorts'}</p>
      </div>

      {/* Widget icons */}
      <div className="flex items-center gap-0.5">
        {widgetIcons.map((emoji, i) => (
          <span key={i} className="text-sm">{emoji}</span>
        ))}
      </div>

      {/* Active toggle / Preview */}
      {template.status === 'Not Live' ? (
        <Button
          size="sm"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
        >
          Preview to Activate
        </Button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(template.id);
          }}
          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-[13px] font-medium text-positive ${pressable}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-positive-dot" />
          Live
        </button>
      )}
    </div>
  );
};

const PriorityManager = ({ templates, cohorts, onSave, onBack, onPreview }) => {
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
          ? { ...t, isActive: !t.isActive, status: t.isActive ? 'Not Live' : 'Live' }
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
      <div className="material bg-surface/80 backdrop-blur-xl backdrop-saturate-150 border-b border-separator sticky top-0 z-20">
        <div className="h-16 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconButton icon={ArrowLeft} label="Back" onClick={onBack} className="-ml-2" />
            <div>
              <h1 className={sectionTitleClass}>Manage Priority</h1>
              <p className="text-[13px] text-secondary">
                Drag to reorder · Toggle to activate · <span className="tabular-nums">{liveCount}</span> live, <span className="tabular-nums">{items.length - liveCount}</span> not live
              </p>
            </div>
          </div>
          <Button variant="primary" icon={Check} onClick={handleSave}>
            Save & Apply
          </Button>
        </div>
      </div>

      {/* Sortable list */}
      <div className="max-w-4xl mx-auto px-8 mt-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {/* Grouped surface without overflow clipping, so a dragged row can leave it */}
            {items.length > 0 && (
              <section>
                <h3 className="px-4 mb-2 text-[13px] font-medium text-secondary">Priority order</h3>
                <div className="bg-surface rounded-2xl shadow-card divide-y divide-separator">
                  {items.map((template, index) => (
                    <SortableItem
                      key={template.id}
                      template={template}
                      index={index}
                      cohorts={cohorts}
                      onToggleActive={handleToggleActive}
                      onPreview={onPreview}
                    />
                  ))}
                </div>
                <p className="px-4 mt-2 text-[12px] leading-4 text-secondary">
                  When an agent belongs to multiple cohorts, they see the template with the highest priority (1 = highest).
                  Drag templates to reorder and toggle them Live to activate.
                </p>
              </section>
            )}
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-12 h-12 bg-fill rounded-2xl flex items-center justify-center mb-3">
              <ArrowUpDown size={20} strokeWidth={1.75} className="text-secondary" />
            </div>
            <p className="text-[15px] font-semibold text-label">No templates yet</p>
            <p className="mt-1 text-[13px] text-secondary">
              No templates created yet. Create templates first, then come here to set priority.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityManager;

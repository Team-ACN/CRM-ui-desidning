import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import WidgetLibrary from './WidgetLibrary';
import PhoneCanvas from './PhoneCanvas';
import WidgetSettingsPanel from './WidgetSettingsPanel';
import BuilderHeader from './BuilderHeader';
import TemplateSettingsPanel from './TemplateSettingsPanel';
import { availableWidgets } from '../../data/mockCohorts';

// Website templates always start with the Top Banner (hero) in the first slot
const withDefaultHero = (widgets, pageType) =>
  pageType === 'WEBSITE' && !widgets.some((w) => w.type === 'top_banner')
    ? [{ id: `w-hero-${Date.now()}`, type: 'top_banner', config: {} }, ...widgets]
    : widgets;

const TemplateBuilder = ({ template, pageType, cohorts, components, onSave, onBack, onOpenCohortModal, setCohortIdRef, onOpenComponentBuilder }) => {
  const isEditing = !!template?.name;
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [cohortIds, setCohortIds] = useState(template?.cohortIds || []);
  const [widgets, setWidgets] = useState(() =>
    withDefaultHero(template?.widgets || [], template?.pageType || pageType)
  );
  const [activeId, setActiveId] = useState(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);

  // Expose setCohortIds to parent so it can auto-select newly created cohort
  if (setCohortIdRef) setCohortIdRef.current = (id) => setCohortIds(prev => [...prev, id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Dropping from library to canvas
    const isOverCanvas = over.id === 'phone-canvas' || widgets.some((w) => w.id === over.id);
    
    if (active.data?.current?.fromLibrary && isOverCanvas) {
      if (widgets.length >= 5) return;
      const widgetType = active.data.current.type;
      const widgetDef = availableWidgets.find((w) => w.type === widgetType);
      if (widgetDef?.singleton && widgets.some((w) => w.type === widgetType)) return;
      const widgetConfig = active.data.current.config || {};
      const isComponent = active.data.current.isComponent;
      const componentId = active.data.current.componentId;
      const componentName = active.data.current.componentName;
      
      const newWidget = {
        id: `w-${Date.now()}`,
        type: widgetType,
        isComponent,
        componentId,
        componentName,
        config: widgetConfig,
      };
      
      // Place the new widget at the correct index if dropped over another widget
      // Hero (top_banner) always occupies the first slot
      let insertIndex = widgets.length;
      if (widgetType === 'top_banner') {
        insertIndex = 0;
      } else if (over.id !== 'phone-canvas') {
        const overIndex = widgets.findIndex((w) => w.id === over.id);
        if (overIndex !== -1) insertIndex = overIndex;
      }
      
      const newWidgets = [...widgets];
      newWidgets.splice(insertIndex, 0, newWidget);
      
      setWidgets(newWidgets);
      setSelectedWidgetId(newWidget.id);
      return;
    }

    // Reordering within canvas
    if (!active.data?.current?.fromLibrary && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setWidgets((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const handleRemoveWidget = (widgetId, e) => {
    if (e) e.stopPropagation();
    if (widgets.find((w) => w.id === widgetId)?.type === 'top_banner') return;
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    if (selectedWidgetId === widgetId) setSelectedWidgetId(null);
  };

  const handleUpdateWidget = (widgetId, updatedWidget) => {
    setWidgets((prev) => prev.map((w) => w.id === widgetId ? updatedWidget : w));
  };

  const handleSave = (saveStatus) => {
    if (!canSave) return;
    const templateData = {
      id: template?.id || `T${Date.now()}`,
      name,
      description,
      cohortIds,
      priority: template?.priority || 999, // unranked by default
      status: saveStatus,
      isActive: false,
      pageType: template?.pageType || pageType, // inherit from prop if new
      widgets,
    };
    onSave(templateData);
  };



  const steps = [
    { label: 'Name', done: !!name.trim() },
    { label: 'Cohorts', done: cohortIds.length > 0 },
    { label: 'Widgets', done: widgets.some((w) => w.type !== 'top_banner') },
    // Website templates must have a hero (top_banner) with an image uploaded
    ...((template?.pageType || pageType) === 'WEBSITE'
      ? [{ label: 'Top Banner', done: widgets.some((w) => w.type === 'top_banner' && w.config?.imageUrl) }]
      : []),
  ];
  const canSave = steps.every((step) => step.done);

  // Get the active draggable for the overlay
  const activeWidget = activeId
    ? availableWidgets.find((w) => `library-${w.type}` === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-[calc(100vh-0px)] bg-canvas">
        <BuilderHeader
          isEditing={isEditing}
          pageType={pageType}
          steps={steps}
          canSave={canSave}
          onBack={onBack}
          onSaveDraft={() => handleSave('Draft')}
          onSubmit={() => handleSave('Not Live')}
        />

        {/* Builder body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Widget library */}
          <WidgetLibrary components={components} pageType={pageType} />

          {/* Center: Phone canvas */}
          <PhoneCanvas 
            widgets={widgets} 
            pageType={pageType}
            onRemoveWidget={handleRemoveWidget} 
            selectedWidgetId={selectedWidgetId}
            onSelectWidget={setSelectedWidgetId}
          />

          {/* Right: Settings */}
          <div className="w-72 bg-surface border-l border-separator flex flex-col">
            {selectedWidgetId ? (() => {
               const activeW = widgets.find((w) => w.id === selectedWidgetId);
               return (
                 <WidgetSettingsPanel
                   widget={activeW}
                   isComponentBuilder={false}
                   isComponent={activeW.isComponent}
                   componentName={activeW.componentName}
                   onUpdate={handleUpdateWidget}
                   onBack={() => setSelectedWidgetId(null)}
                   onOpenComponentBuilder={onOpenComponentBuilder} /* passed from CohortsPage */
                   components={components}
                   pageType={pageType}
                 />
               );
             })() : (
              <TemplateSettingsPanel
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                cohorts={cohorts}
                cohortIds={cohortIds}
                setCohortIds={setCohortIds}
                onOpenCohortModal={onOpenCohortModal}
                widgets={widgets}
                onSelectWidget={setSelectedWidgetId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeWidget ? (
          <div className="flex items-center gap-3 p-3 bg-surface ring-2 ring-accent rounded-2xl shadow-raised w-56">
            <span className="w-8 h-8 shrink-0 bg-fill rounded-lg flex items-center justify-center text-secondary">
              {activeWidget.icon}
            </span>
            <div>
              <p className="text-[14px] font-medium text-label">{activeWidget.label}</p>
              <p className="text-[12px] text-secondary">{activeWidget.description}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TemplateBuilder;

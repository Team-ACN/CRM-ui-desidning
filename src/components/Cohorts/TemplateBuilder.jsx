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
import { ArrowLeft, Save, Plus, Search } from 'lucide-react';
import WidgetLibrary from './WidgetLibrary';
import PhoneCanvas from './PhoneCanvas';
import WidgetSettingsPanel from './WidgetSettingsPanel';
import { availableWidgets } from '../../data/mockCohorts';

const TemplateBuilder = ({ template, pageType, cohorts, components, onSave, onBack, onOpenCohortModal, setCohortIdRef, onOpenComponentBuilder }) => {
  const isEditing = !!template?.name;
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [cohortIds, setCohortIds] = useState(template?.cohortIds || []);
  const [cohortSearch, setCohortSearch] = useState('');
  const [widgets, setWidgets] = useState(template?.widgets || []);
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
      let insertIndex = widgets.length;
      if (over.id !== 'phone-canvas') {
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
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    if (selectedWidgetId === widgetId) setSelectedWidgetId(null);
  };

  const handleUpdateWidget = (widgetId, updatedWidget) => {
    setWidgets((prev) => prev.map((w) => w.id === widgetId ? updatedWidget : w));
  };

  const handleSave = (saveStatus) => {
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
      <div className="flex flex-col h-[calc(100vh-0px)]">
        {/* Builder header */}
        <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {isEditing ? 'Edit Template' : 'Create Template'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {name || 'Untitled template'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('Draft')}
              disabled={!name.trim() || cohortIds.length === 0 || widgets.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={16} />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('Not Live')}
              disabled={!name.trim() || cohortIds.length === 0 || widgets.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={16} />
              Save & Request Approval
            </button>
          </div>
        </div>

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
          <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
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
              <>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Template Settings</h3>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Premium Whitefield Home"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Template description..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Cohorts — Multi-select */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-gray-600">
                        Target Cohorts
                      </label>
                      <button
                        onClick={onOpenCohortModal}
                        className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                      >
                        <Plus size={10} />
                        Create New
                      </button>
                    </div>
                    
                    <div className="relative mb-2">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Search size={12} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={cohortSearch}
                        onChange={(e) => setCohortSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                    
                    <div className="w-full max-h-40 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg bg-white divide-y divide-gray-50">
                      {cohorts
                        .filter(c => 
                          c.name.toLowerCase().includes(cohortSearch.toLowerCase()) || 
                          c.id.toString().toLowerCase().includes(cohortSearch.toLowerCase())
                        )
                        .map((c) => {
                        const isSelected = cohortIds.includes(c.id);
                        return (
                          <label key={c.id} className={`flex items-start gap-2 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                            <input
                              type="checkbox"
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 shrink-0"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCohortIds([...cohortIds, c.id]);
                                } else {
                                  setCohortIds(cohortIds.filter(id => id !== c.id));
                                }
                              }}
                            />
                            <div className="flex flex-col w-full min-w-0">
                              <div className="flex justify-between items-start gap-2 w-full">
                                <span className={`text-xs truncate ${isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{c.name}</span>
                                <span className="text-[9px] font-mono text-gray-500 bg-gray-100 border border-gray-200 px-1 py-0.5 rounded shrink-0 leading-none">{c.id}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{c.description || 'No description'}</span>
                            </div>
                          </label>
                        );
                      })}
                      {cohorts.filter(c => 
                          c.name.toLowerCase().includes(cohortSearch.toLowerCase()) || 
                          c.id.toString().toLowerCase().includes(cohortSearch.toLowerCase())
                        ).length === 0 && (
                        <div className="p-3 text-center text-xs text-gray-500">No matching cohorts.</div>
                      )}
                    </div>
                    {cohortIds.length > 0 && (
                       <p className="mt-1.5 text-[10px] text-gray-500">{cohortIds.length} cohort(s) selected.</p>
                    )}
                  </div>

                  {/* Status hint */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-[11px] text-amber-700 font-medium">Not Live</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      Templates are saved as Not Live. Set priority and use the Preview to activate them from the "Manage Priority" section.
                    </p>
                  </div>

                  {/* Widget summary */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Widgets ({widgets.length}/5)
                    </label>
                    {widgets.length === 0 ? (
                      <p className="text-xs text-gray-400">No widgets added yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {widgets.map((w, i) => {
                          const wt = availableWidgets.find((aw) => aw.type === w.type);
                          return (
                            <button
                              key={w.id}
                              onClick={() => setSelectedWidgetId(w.id)}
                              className="w-full flex items-center gap-2 text-xs text-gray-600 hover:bg-gray-50 p-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-colors text-left"
                            >
                              <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-[10px] shrink-0">
                                {i + 1}
                              </span>
                              <span>{wt?.icon}</span>
                              <span className="truncate flex-1">{wt?.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeWidget ? (
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-emerald-400 rounded-xl shadow-lg opacity-90 w-56">
            <span className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-lg">
              {activeWidget.icon}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">{activeWidget.label}</p>
              <p className="text-xs text-gray-400">{activeWidget.description}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TemplateBuilder;

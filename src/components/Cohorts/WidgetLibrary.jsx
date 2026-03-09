import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Layers, Puzzle } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';

const DraggableWidget = ({ widget, title, subtitle, icon, isComponent, config }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${isComponent ? widget.id : widget.type}`,
    data: { 
      type: widget.type, 
      fromLibrary: true, 
      isComponent: !!isComponent,
      config: config || {}
    },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <span className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg text-gray-600">
        {icon || widget.icon || <Puzzle size={18} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
      </div>
    </div>
  );
};

const WidgetLibrary = ({ components = [], pageType }) => {
  const [activeTab, setActiveTab] = useState('base'); // 'base' | 'saved'
  
  const relevantComponents = components.filter(c => c.pageType === pageType);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">Builder Library</h3>
        <p className="text-xs text-gray-400 mt-0.5">Drag items to the canvas</p>
        
        {/* Toggle between Base Widgets and Saved Components */}
        <div className="flex bg-gray-100 p-1 rounded-lg mt-4">
          <button
            onClick={() => setActiveTab('base')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'base' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Puzzle size={13} />
            Widgets
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'saved' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers size={13} />
            Saved ({relevantComponents.length})
          </button>
        </div>
      </div>
      
      <div className="p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'base' && availableWidgets.map((widget) => (
          <DraggableWidget 
            key={widget.type} 
            widget={widget} 
            title={widget.label}
            subtitle={widget.description}
            icon={widget.icon}
          />
        ))}
        
        {activeTab === 'saved' && (
          relevantComponents.length > 0 ? (
            relevantComponents.map((comp) => {
              const bW = availableWidgets.find(w => w.type === comp.type);
              return (
                <DraggableWidget 
                  key={comp.id} 
                  widget={comp} 
                  isComponent={true}
                  config={comp.config}
                  title={comp.name}
                  subtitle={bW?.label || 'Preset Component'}
                  icon={bW?.icon}
                />
              );
            })
          ) : (
             <div className="text-center py-10 px-4">
               <Layers className="mx-auto text-gray-300 mb-2" size={24} />
               <p className="text-xs text-gray-500 font-medium">No saved components</p>
               <p className="text-[10px] text-gray-400 mt-1">Create predefined widgets in the Components tab.</p>
             </div>
          )
        )}
      </div>
    </div>
  );
};

export default WidgetLibrary;

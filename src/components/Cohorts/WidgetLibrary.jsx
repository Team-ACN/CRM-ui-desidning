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
      componentId: isComponent ? widget.id : null,
      componentName: isComponent ? widget.name : null,
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

const WidgetLibrary = ({ pageType }) => {

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">Builder Library</h3>
        <p className="text-xs text-gray-400 mt-0.5">Drag widgets to the canvas</p>
      </div>
      
      <div className="p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {availableWidgets.map((widget) => (
          <DraggableWidget 
            key={widget.type} 
            widget={widget} 
            title={widget.label}
            subtitle={widget.description}
            icon={widget.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default WidgetLibrary;

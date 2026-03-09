import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { availableWidgets } from '../../data/mockCohorts';

const DraggableWidget = ({ widget }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${widget.type}`,
    data: { type: widget.type, fromLibrary: true },
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
      <span className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
        {widget.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{widget.label}</p>
        <p className="text-xs text-gray-400 truncate">{widget.description}</p>
      </div>
    </div>
  );
};

const WidgetLibrary = () => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Widget Library</h3>
        <p className="text-xs text-gray-400 mt-0.5">Drag widgets to the canvas</p>
      </div>
      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
        {availableWidgets.map((widget) => (
          <DraggableWidget key={widget.type} widget={widget} />
        ))}
      </div>
    </div>
  );
};

export default WidgetLibrary;

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';
import WidgetInner from './WidgetInner';

const WidgetPreview = ({ widget, onRemove, isSelected, onSelect }) => {
  const widgetType = availableWidgets.find((w) => w.type === widget.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
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
      onClick={onSelect}
      className={`bg-white rounded-xl overflow-hidden shadow-sm transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-emerald-500 border-transparent shadow-md' : 'border border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Widget header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        isSelected ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing touch-none ${
              isSelected ? 'text-emerald-400 hover:text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <GripVertical size={14} />
          </button>
          <span className="text-sm">{widgetType?.icon}</span>
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">{widgetType?.label || widget.type}</span>
        </div>
        <button
          onClick={(e) => onRemove(widget.id, e)}
          className="p-0.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Widget miniature representation */}
      <WidgetInner widget={widget} />
    </div>
  );
};

export default WidgetPreview;

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';
import WidgetInner from './WidgetInner';
import { IconButton } from '../cms-ui';

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
      className={`bg-surface rounded-xl overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-accent' : 'shadow-card'
      }`}
    >
      {/* Widget header */}
      <div className="flex items-center justify-between pl-1.5 pr-1 h-9">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="w-6 h-6 flex items-center justify-center rounded-md cursor-grab active:cursor-grabbing touch-none text-tertiary hover:text-secondary hover:bg-fill"
          >
            <GripVertical size={14} strokeWidth={1.75} />
          </button>
          <span className="text-[13px]">{widgetType?.icon}</span>
          <span className="text-[12px] font-medium text-label truncate">{widgetType?.label || widget.type}</span>
        </div>
        <IconButton
          icon={X}
          label="Remove widget"
          size={14}
          onClick={(e) => onRemove(widget.id, e)}
        />
      </div>

      {/* Widget miniature representation */}
      <WidgetInner widget={widget} />
    </div>
  );
};

export default WidgetPreview;

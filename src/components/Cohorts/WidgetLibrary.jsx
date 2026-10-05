import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Puzzle, Zap, SlidersHorizontal } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';

const DraggableWidget = ({ widget, title, subtitle, icon, isComponent, config, badge }) => {
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
      className={`flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md hover:border-gray-300 ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <span className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-gray-600 shrink-0">
        {icon || widget.icon || <Puzzle size={16} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
      </div>
      {badge && (
        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide shrink-0 ${badge.className}`}>
          {badge.label}
        </span>
      )}
    </div>
  );
};

// CMS widgets need a linked component (or uploaded content); auto widgets render from system data.
const isCmsWidget = (widget) => widget.hasConfig || widget.category === 'cms';

const WIDGET_GROUPS = [
  {
    key: 'auto',
    title: 'Auto Widgets',
    subtitle: 'No config needed — system-driven',
    icon: <Zap size={11} className="text-emerald-600" />,
    badge: { label: 'Auto', className: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    match: (widget) => !isCmsWidget(widget),
  },
  {
    key: 'cms',
    title: 'CMS Widgets',
    subtitle: 'Requires a linked component',
    icon: <SlidersHorizontal size={11} className="text-indigo-500" />,
    badge: { label: 'CMS', className: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
    match: isCmsWidget,
  },
];

const WidgetGroup = ({ group, widgets }) => (
  <section>
    <div className="px-1 mb-2">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          {group.icon}
          {group.title}
        </h4>
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gray-200 text-[9px] font-semibold text-gray-600 flex items-center justify-center">
          {widgets.length}
        </span>
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5">{group.subtitle}</p>
    </div>
    <div className="space-y-1.5">
      {widgets.map((widget) => (
        <DraggableWidget
          key={widget.type}
          widget={widget}
          title={widget.label}
          subtitle={widget.description}
          icon={widget.icon}
          badge={group.badge}
        />
      ))}
    </div>
  </section>
);

const WidgetLibrary = ({ pageType }) => {
  const pageWidgets = availableWidgets.filter(
    (widget) => !widget.isDefault && (!widget.pageTypes || widget.pageTypes.includes(pageType))
  );

  return (
    <div className="w-60 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="px-3 py-3.5 border-b border-gray-200 bg-white shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">Widget Library</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Drag onto the canvas</p>
      </div>

      <div className="p-2 pt-3 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
        {WIDGET_GROUPS.map((group) => {
          const groupWidgets = pageWidgets.filter(group.match);
          return groupWidgets.length > 0 && (
            <WidgetGroup key={group.key} group={group} widgets={groupWidgets} />
          );
        })}
      </div>
    </div>
  );
};

export default WidgetLibrary;

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Puzzle, Zap, SlidersHorizontal } from 'lucide-react';
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
      className={`relative flex items-center gap-3 px-3 py-2.5 bg-surface first:rounded-t-2xl last:rounded-b-2xl cursor-grab active:cursor-grabbing transition-colors hover:bg-black/[0.02] active:bg-black/[0.04] ${
        isDragging ? 'opacity-50 z-50' : ''
      }`}
    >
      <span className="w-8 h-8 bg-fill rounded-lg flex items-center justify-center text-secondary shrink-0">
        {icon || widget.icon || <Puzzle size={16} strokeWidth={1.75} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-label truncate">{title}</p>
        <p className="text-[12px] text-secondary truncate">{subtitle}</p>
      </div>
    </div>
  );
};

// CMS widgets need a linked component (or uploaded content); auto widgets render from system data.
const isCmsWidget = (widget) => widget.hasConfig || widget.category === 'cms';

const WIDGET_GROUPS = [
  {
    key: 'auto',
    title: 'Auto widgets',
    subtitle: 'No setup needed. Content comes from system data.',
    icon: <Zap size={14} strokeWidth={1.75} />,
    match: (widget) => !isCmsWidget(widget),
  },
  {
    key: 'cms',
    title: 'CMS widgets',
    subtitle: 'Each needs a linked component you configure.',
    icon: <SlidersHorizontal size={14} strokeWidth={1.75} />,
    match: isCmsWidget,
  },
];

const WidgetGroup = ({ group, widgets }) => (
  <section>
    <div className="px-3 mb-2">
      <h4 className="flex items-center gap-1.5 text-[13px] font-medium text-secondary">
        {group.icon}
        {group.title}
      </h4>
      <p className="text-[12px] text-tertiary mt-0.5">{group.subtitle}</p>
    </div>
    <div className="rounded-2xl bg-surface shadow-card divide-y divide-separator">
      {widgets.map((widget) => (
        <DraggableWidget
          key={widget.type}
          widget={widget}
          title={widget.label}
          subtitle={widget.description}
          icon={widget.icon}
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
    <div className="w-60 bg-canvas border-r border-separator flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3.5 border-b border-separator bg-surface shrink-0">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-label">Widget library</h3>
        <p className="text-[13px] text-secondary mt-0.5">Drag onto the canvas</p>
      </div>

      <div className="p-3 pt-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
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

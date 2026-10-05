import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Smartphone } from 'lucide-react';
import WidgetPreview from './WidgetPreview';
import AppHeaderMock from './AppHeaderMock';
import PropertiesHeaderMock from './PropertiesHeaderMock';
import MockPropertyCard from './MockPropertyCard';
import WebsiteCanvas from './WebsiteCanvas';

const PhoneCanvas = ({ widgets, onRemoveWidget, selectedWidgetId, onSelectWidget, pageType }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'phone-canvas' });
  const widgetIds = widgets.map((w) => w.id);

  if (pageType === 'WEBSITE') {
    return (
      <div className="flex-1 flex items-start justify-center py-8 bg-canvas overflow-y-auto">
        <WebsiteCanvas
          widgets={widgets}
          isOver={isOver}
          setNodeRef={setNodeRef}
          selectedWidgetId={selectedWidgetId}
          onSelectWidget={onSelectWidget}
          onRemoveWidget={onRemoveWidget}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-start justify-center py-8 bg-canvas overflow-y-auto">
      {/* Phone frame */}
      <div className="w-[390px] h-[844px] shrink-0 bg-[#FAFAFA] rounded-[44px] shadow-raised overflow-hidden border-[5px] border-[#1d1d1f] relative flex flex-col items-center">
        
        {/* New Match-Design App Header */}
        {pageType === 'PROPERTIES' ? (
          <PropertiesHeaderMock pageType={pageType} />
        ) : (
          <AppHeaderMock pageType={pageType} />
        )}

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={`flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col px-3 py-3 space-y-2.5 transition-colors ${
            isOver ? 'bg-accent-soft' : ''
          }`}
        >
          {widgets.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-64 text-center rounded-2xl border-2 border-dashed transition-colors ${
              isOver ? 'border-accent/40' : 'border-separator'
            }`}>
              <div className="w-12 h-12 bg-fill rounded-2xl flex items-center justify-center mb-3">
                <Smartphone size={20} strokeWidth={1.75} className="text-secondary" />
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-label">Drop widgets here</p>
              <p className="text-[13px] text-secondary mt-1">
                Drag from the widget library
              </p>
              {isOver && (
                <p className="text-[12px] text-accent font-medium mt-2">
                  Release to add widget
                </p>
              )}
            </div>
          ) : (
            <SortableContext items={widgetIds} strategy={verticalListSortingStrategy}>
              {widgets.map((widget) => (
                <WidgetPreview
                  key={widget.id}
                  widget={widget}
                  onRemove={onRemoveWidget}
                  isSelected={selectedWidgetId === widget.id}
                  onSelect={() => onSelectWidget(widget.id)}
                />
              ))}
              {widgets.length < 5 && isOver && (
                <div className="h-16 border-2 border-dashed border-accent/40 rounded-xl flex items-center justify-center bg-accent-soft">
                  <p className="text-[12px] font-medium text-accent">Drop here</p>
                </div>
              )}
            </SortableContext>
          )}

        </div>
      </div>
    </div>
  );
};

export default PhoneCanvas;

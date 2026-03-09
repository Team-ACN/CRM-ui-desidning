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

const PhoneCanvas = ({ widgets, onRemoveWidget, selectedWidgetId, onSelectWidget, pageType }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'phone-canvas' });
  const widgetIds = widgets.map((w) => w.id);

  return (
    <div className="flex-1 flex items-start justify-center py-6 bg-gray-50 overflow-y-auto">
      {/* Phone frame */}
      <div className="w-[390px] h-[844px] bg-[#FAFAFA] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-gray-800 relative flex flex-col items-center">
        
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
            isOver ? 'bg-emerald-50' : ''
          }`}
        >
          {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <Smartphone size={20} className="text-gray-400" />
              </div>
              <p className="text-xs font-medium text-gray-500">Drop widgets here</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Drag from the widget library
              </p>
              {isOver && (
                <p className="text-[10px] text-emerald-600 font-medium mt-2 animate-pulse">
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
                <div className="h-16 border-2 border-dashed border-emerald-300 rounded-xl flex items-center justify-center bg-emerald-50">
                  <p className="text-xs text-emerald-500">Drop here</p>
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

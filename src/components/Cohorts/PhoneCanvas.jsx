import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Smartphone } from 'lucide-react';
import WidgetPreview from './WidgetPreview';

const PhoneCanvas = ({ widgets, onRemoveWidget, selectedWidgetId, onSelectWidget, pageType }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'phone-canvas' });
  const widgetIds = widgets.map((w) => w.id);

  return (
    <div className="flex-1 flex items-start justify-center py-6 bg-gray-50 overflow-y-auto">
      {/* Phone frame */}
      <div className="w-[320px] min-h-[580px] bg-white rounded-[2.5rem] border-[3px] border-gray-800 shadow-xl relative flex flex-col">
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-20 h-5 bg-gray-900 rounded-full" />
        </div>

        {/* Status bar mockup */}
        <div className="px-6 py-1 flex items-center justify-between text-[10px] text-gray-400">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* App header */}
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-900">
            {pageType === 'PROPERTIES' ? 'ACN Properties' : 'ACN Home'}
          </p>
          <p className="text-[10px] text-gray-400">Powered by your CMS template</p>
        </div>

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={`flex-1 px-3 py-3 space-y-2.5 transition-colors ${
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

          {widgets.length >= 5 && (
            <div className="text-center py-2">
              <p className="text-[10px] text-amber-500 font-medium">Maximum 5 widgets reached</p>
            </div>
          )}
        </div>

        {/* Bottom home indicator */}
        <div className="flex justify-center py-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default PhoneCanvas;

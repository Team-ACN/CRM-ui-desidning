import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';

const ComponentCard = ({ component, onEdit, onDelete }) => {
  const widgetDefinition = availableWidgets.find((w) => w.type === component.type);

  return (
    <div className="grid items-center px-6 py-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors" style={{ gridTemplateColumns: '280px 120px 1fr auto' }}>
      {/* Left: Icon & Name */}
      <div className="flex items-center gap-4 pr-4 overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg text-lg">
          {widgetDefinition?.icon || '🧩'}
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{component.name}</h3>
            <span className="flex-shrink-0 text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
              {component.id}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {widgetDefinition?.label || 'Unknown Widget'}
          </p>
        </div>
      </div>

      {/* Date */}
      <div>
        <p className="text-xs text-gray-500 text-center whitespace-nowrap">
          {new Date(component.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Config Indicators */}
      <div className="flex items-center gap-4 px-4">
         {component.type === 'banner_carousel' && (
           <span className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 whitespace-nowrap">
             {component.config?.items?.length || 0} Slides
           </span>
         )}
         {component.type === 'inventory_discovery' && (
           <span className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 whitespace-nowrap">
             {component.config?.assetType || 'All Assets'} • {component.config?.zone || 'All Zones'}
           </span>
         )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5 justify-end">
        <button
          onClick={() => onEdit(component)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Pencil size={16} />
          Edit
        </button>
        <button
          onClick={() => onDelete(component.id)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ComponentCard;

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';

const ComponentCard = ({ component, onEdit, onDelete }) => {
  const widgetDefinition = availableWidgets.find((w) => w.type === component.type);

  return (
    <div className="flex items-center justify-between px-6 py-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
      {/* Left: Icon & Name */}
      <div className="flex items-center gap-4 min-w-[280px]">
        <div className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg text-lg">
          {widgetDefinition?.icon || '🧩'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{component.name}</h3>
            <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
              {component.id}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {widgetDefinition?.label || 'Unknown Widget'}
          </p>
        </div>
      </div>

      {/* Date */}
      <div className="min-w-[140px]">
        <p className="text-xs text-gray-500 text-center">
          {new Date(component.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Config Indicators */}
      <div className="min-w-[180px] flex items-center gap-4">
         {component.type === 'banner_carousel' && (
           <span className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
             {component.config?.items?.length || 0} Slides
           </span>
         )}
         {component.type === 'inventory_discovery' && (
           <span className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
             {component.config?.assetType || 'All Assets'} • {component.config?.zone || 'All Zones'}
           </span>
         )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">
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

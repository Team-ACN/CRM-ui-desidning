import React from 'react';
import { availableWidgets } from '../../data/mockCohorts';
import { Trash2, Plus, ArrowLeft, Upload, Check } from 'lucide-react';

const WidgetSettingsPanel = ({ widget, onUpdate, onBack }) => {
  if (!widget) return null;

  const widgetDef = availableWidgets.find((w) => w.type === widget.type);
  const config = widget.config || {};

  const handleUpdate = (updates) => {
    onUpdate(widget.id, { ...widget, config: { ...config, ...updates } });
  };

  const handleImageUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const renderConfig = () => {
    switch (widget.type) {
      case 'inventory_discovery':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Asset Type</label>
              <select
                value={config.assetType || ''}
                onChange={(e) => handleUpdate({ assetType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select type...</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Configuration</label>
              <select
                value={config.configuration || ''}
                onChange={(e) => handleUpdate({ configuration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select config...</option>
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK+">4 BHK+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Zone</label>
              <select
                value={config.zone || ''}
                onChange={(e) => handleUpdate({ zone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select zone...</option>
                <option value="North">North Bangalore</option>
                <option value="South">South Bangalore</option>
                <option value="East">East Bangalore (Whitefield)</option>
                <option value="West">West Bangalore</option>
                <option value="Central">Central</option>
              </select>
            </div>
          </div>
        );

      case 'advertisement':
      case 'banner_carousel':
        const items = config.items || [];
        return (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 pb-2 border-b border-gray-100">Add multiple banners.</p>
            {items.map((item, index) => (
              <div key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg relative group">
                <button
                  onClick={() => {
                    const newItems = items.filter((i) => i.id !== item.id);
                    handleUpdate({ items: newItems });
                  }}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                <div className="space-y-3 mb-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Banner Image</label>
                    <label className="flex items-center justify-center w-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-emerald-300 rounded px-2 py-1.5 text-xs text-gray-600 font-medium transition-colors cursor-pointer">
                      <Upload size={12} className="mr-1.5 text-emerald-600" />
                      {item.imageUrl ? 'Replace Image' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (url) => {
                          const newItems = [...items];
                          newItems[index].imageUrl = url;
                          handleUpdate({ items: newItems });
                        })}
                      />
                    </label>
                    {item.imageUrl && (
                      <div className="mt-1.5 text-[9px] text-emerald-600 flex items-center gap-1 font-medium bg-emerald-50 px-1.5 py-0.5 rounded inline-flex">
                        <Check size={10} /> Image attached
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Link URL</label>
                    <input
                      type="text"
                      value={item.linkUrl || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].linkUrl = e.target.value;
                        handleUpdate({ items: newItems });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...items, { id: `b-${Date.now()}`, imageUrl: '', linkUrl: '' }];
                handleUpdate({ items: newItems });
              }}
              className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
            >
              <Plus size={14} />
              Add Banner
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">No additional configuration required for this widget type.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50/50">
        <button onClick={onBack} className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Widget Settings</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px]">{widgetDef?.icon}</span>
            <span className="text-[11px] font-medium text-gray-500">{widgetDef?.label}</span>
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {renderConfig()}
      </div>
    </div>
  );
};

export default WidgetSettingsPanel;

import React from 'react';

const WidgetInner = ({ widget }) => {
  const config = widget.config || {};

  switch (widget.type) {
    case 'analytics_cards':
      return (
        <div className="flex gap-1.5 p-1.5">
          <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded p-1.5 text-center">
            <p className="text-[10px] font-bold text-blue-900">12</p>
            <p className="text-[7px] text-blue-600 uppercase tracking-wider mt-0.5">Properties</p>
          </div>
          <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded p-1.5 text-center">
            <p className="text-[10px] font-bold text-emerald-900">3</p>
            <p className="text-[7px] text-emerald-600 uppercase tracking-wider mt-0.5">Business</p>
          </div>
          <div className="flex-1 bg-purple-50/50 border border-purple-100 rounded p-1.5 text-center">
            <p className="text-[10px] font-bold text-purple-900">8</p>
            <p className="text-[7px] text-purple-600 uppercase tracking-wider mt-0.5">Edge</p>
          </div>
        </div>
      );

    case 'delist_inventories':
      return (
        <div className="p-2 space-y-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded p-1.5">
              <div className="w-16 h-2 bg-gray-200 rounded" />
              <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-red-500 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'enquiry_received':
    case 'enquiry_feedback':
      return (
        <div className="p-2">
          <div className="bg-gray-50 border border-gray-100 rounded p-2">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
              <div className="w-20 h-2 bg-gray-200 rounded" />
            </div>
            <div className="w-full h-8 bg-white border border-gray-100 rounded mt-1" />
          </div>
        </div>
      );

    case 'banner_carousel':
    case 'advertisement':
      const items = config.items && config.items.length > 0 ? config.items : [{ id: 1 }];
      return (
        <div className="p-2 space-y-1.5">
          {items.slice(0, 2).map((item, idx) => (
            <div key={item.id || idx} className="relative w-full h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="Banner" className="w-full h-full object-cover opacity-80" />
              ) : (
                <span className="text-[8px] text-gray-400">
                  {widget.type === 'advertisement' ? 'Ad Space' : `Carousel slide ${idx + 1}`}
                </span>
              )}
            </div>
          ))}
          {items.length > 2 && (
            <div className="w-full flex justify-center gap-0.5 mt-1">
              {items.map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-gray-800' : 'bg-gray-300'}`} />
              ))}
            </div>
          )}
        </div>
      );

    case 'inventory_discovery':
      return (
        <div className="p-2 space-y-1.5">
          <div className="flex gap-1">
            <div className="flex-1 h-5 bg-gray-50 border border-gray-200 rounded flex items-center px-1.5">
              <span className="text-[7px] text-gray-500 truncate">{config.assetType || 'Asset Type'}</span>
            </div>
            <div className="flex-1 h-5 bg-gray-50 border border-gray-200 rounded flex items-center px-1.5">
              <span className="text-[7px] text-gray-500 truncate">{config.configuration || 'Config'}</span>
            </div>
          </div>
          <div className="w-full h-5 bg-gray-50 border border-gray-200 rounded flex items-center px-1.5">
            <span className="text-[7px] text-gray-500 truncate">{config.zone ? `Zone: ${config.zone}` : 'Select Zone'}</span>
          </div>
          <div className="w-full h-6 bg-gray-900 rounded flex items-center justify-center mt-1">
            <span className="text-[8px] text-white font-medium">Search</span>
          </div>
        </div>
      );

    case 'new_resale':
    case 'new_rental':
    case 'suggested_properties':
      return (
        <div className="p-2 flex gap-1.5 overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="flex-1 min-w-[100px] bg-gray-50 rounded p-1.5 border border-gray-100">
              <div className="w-full h-10 bg-gray-200 rounded mb-1.5" />
              <div className="w-16 h-2 bg-gray-300 rounded mb-1" />
              <div className="w-10 h-1.5 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="h-12 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center m-2">
          <span className="text-[8px] text-gray-400">Configure widget</span>
        </div>
      );
  }
};

export default WidgetInner;

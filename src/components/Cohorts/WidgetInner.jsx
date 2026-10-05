import React from 'react';
import { Pin } from 'lucide-react';

const WidgetInner = ({ widget }) => {
  const config = widget.config || {};

  switch (widget.type) {
    case 'analytics_cards':
      return (
        <div className="flex gap-1.5 p-1.5">
          <div className="flex-1 bg-fill rounded-md p-1.5 text-center">
            <p className="text-[10px] font-semibold text-label tabular-nums">12</p>
            <p className="text-[8px] text-secondary mt-0.5">Properties</p>
          </div>
          <div className="flex-1 bg-fill rounded-md p-1.5 text-center">
            <p className="text-[10px] font-semibold text-label tabular-nums">3</p>
            <p className="text-[8px] text-secondary mt-0.5">Business</p>
          </div>
          <div className="flex-1 bg-fill rounded-md p-1.5 text-center">
            <p className="text-[10px] font-semibold text-label tabular-nums">8</p>
            <p className="text-[8px] text-secondary mt-0.5">Edge</p>
          </div>
        </div>
      );

    case 'delist_inventories':
      return (
        <div className="p-2 space-y-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center bg-fill rounded-md p-1.5">
              <div className="w-16 h-2 bg-fill-strong rounded-full" />
              <div className="w-4 h-4 rounded-full bg-surface flex items-center justify-center">
                <div className="w-2 h-0.5 bg-tertiary rounded-full" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'enquiry_received':
    case 'enquiry_feedback':
      return (
        <div className="p-2">
          <div className="bg-fill rounded-md p-2">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 bg-fill-strong rounded-full" />
              <div className="w-20 h-2 bg-fill-strong rounded-full" />
            </div>
            <div className="w-full h-8 bg-surface rounded-md mt-1" />
          </div>
        </div>
      );

    case 'top_banner':
      return (
        <div className="p-2">
          <div className="relative w-full aspect-[1440/378] bg-fill rounded-md overflow-hidden flex items-center justify-center">
            {config.imageUrl ? (
              <img src={config.imageUrl} alt={config.altText || 'Top banner'} className="w-full h-full object-cover object-right" />
            ) : (
              <span className="text-[8px] text-tertiary">Hero image (1440×378)</span>
            )}
          </div>
        </div>
      );

    case 'banner_carousel':
    case 'advertisement':
      const items = config.items && config.items.length > 0 ? config.items : [{ id: 1 }];
      return (
        <div className="p-2 space-y-1.5">
          {items.slice(0, 2).map((item, idx) => (
            <div key={item.id || idx} className="relative w-full h-16 bg-fill rounded-md overflow-hidden flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="Banner" className="w-full h-full object-cover opacity-80" />
              ) : (
                <span className="text-[8px] text-tertiary">
                  {widget.type === 'advertisement' ? 'Ad Space' : `Carousel slide ${idx + 1}`}
                </span>
              )}
            </div>
          ))}
          {items.length > 2 && (
            <div className="w-full flex justify-center gap-0.5 mt-1">
              {items.map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-secondary' : 'bg-fill-strong'}`} />
              ))}
            </div>
          )}
        </div>
      );

    case 'inventory_discovery':
      const propertyIds = config.propertyIds || [];
      return (
        <div className="p-2 space-y-1.5">
          {propertyIds.length > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-1 bg-accent-soft rounded-md">
              <span className="text-[8px] text-accent font-medium flex items-center gap-0.5"><Pin size={8} /> {propertyIds.length} pinned {propertyIds.length === 1 ? 'property' : 'properties'}</span>
            </div>
          )}
          <div className="flex gap-1">
            <div className="flex-1 h-5 bg-fill rounded-md flex items-center px-1.5">
              <span className="text-[8px] text-secondary truncate">{config.assetType || 'Asset Type'}</span>
            </div>
            <div className="flex-1 h-5 bg-fill rounded-md flex items-center px-1.5">
              <span className="text-[8px] text-secondary truncate">{config.configuration || 'Config'}</span>
            </div>
          </div>
          <div className="w-full h-5 bg-fill rounded-md flex items-center px-1.5">
            <span className="text-[8px] text-secondary truncate">{config.zone ? `Zone: ${config.zone}` : 'Select Zone'}</span>
          </div>
          <div className="w-full h-6 bg-fill-strong rounded-md flex items-center justify-center mt-1">
            <span className="text-[8px] text-secondary font-medium">Search</span>
          </div>
        </div>
      );

    case 'new_resale':
    case 'new_rental':
    case 'suggested_properties':
      return (
        <div className="p-2 flex gap-1.5 overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="flex-1 min-w-[100px] bg-fill rounded-md p-1.5">
              <div className="w-full h-10 bg-fill-strong rounded-md mb-1.5" />
              <div className="w-16 h-2 bg-fill-strong rounded-full mb-1" />
              <div className="w-10 h-1.5 bg-fill-strong rounded-full" />
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="h-12 bg-fill rounded-md flex items-center justify-center m-2">
          <span className="text-[8px] text-tertiary">Configure widget</span>
        </div>
      );
  }
};

export default WidgetInner;

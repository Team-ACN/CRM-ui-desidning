import React, { useState } from 'react';
import { availableWidgets } from '../../data/mockCohorts';
import { Trash2, Plus, ArrowLeft, Upload, Check, Puzzle, Layers, X, Hash } from 'lucide-react';
import TopBannerSettings from './TopBannerSettings';
import { Button, IconButton, SearchField, fieldClass, labelClass, hintClass, cardClass } from '../cms-ui';

const WidgetSettingsPanel = ({ widget, onUpdate, onBack, hideHeader, isComponentBuilder, isComponent, componentName, onOpenComponentBuilder, components = [], pageType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyIdInput, setPropertyIdInput] = useState('');

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
    // If it's a configurable widget inside the Template Builder (not the Component Builder)
    if (widgetDef?.hasConfig && !isComponentBuilder) {
      if (!isComponent) {
        const filteredComponents = components.filter(c => 
          c.type === widget.type && 
          (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
          <div className="flex flex-col mt-4 space-y-4">
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-2 mb-1">
                 <Puzzle size={16} strokeWidth={1.75} className="text-secondary" />
                 <h4 className="text-[15px] font-semibold text-label">Link component</h4>
              </div>
              <p className={`${hintClass} mb-4`}>
                {widgetDef.label} widgets require a pre-configured component. Search for an existing one below.
              </p>
              
              {/* Search Autocomplete */}
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name or ID"
                className="w-full mb-3"
              />

              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="mb-4 max-h-40 overflow-y-auto custom-scrollbar rounded-[10px] bg-surface shadow-card divide-y divide-separator">
                  {filteredComponents.length > 0 ? (
                    filteredComponents.map(comp => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          onUpdate(widget.id, {
                            ...widget,
                            isComponent: true,
                            componentId: comp.id,
                            componentName: comp.name,
                            config: comp.config || {}
                          });
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-black/[0.02] active:bg-black/[0.04] focus:bg-accent-soft outline-none transition-colors flex flex-col gap-0.5"
                      >
                        <span className="text-[14px] font-medium text-label truncate">{comp.name}</span>
                        <span className="text-[12px] text-tertiary tabular-nums">{comp.id}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 px-3">
                      <p className="text-[13px] text-secondary">No matching components found.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-separator"></div>
                <span className="flex-shrink-0 flex items-center justify-center px-3 text-[12px] text-tertiary">or</span>
                <div className="flex-grow border-t border-separator"></div>
              </div>

              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => onOpenComponentBuilder && onOpenComponentBuilder(widget.type)}
                className="mt-2 w-full"
              >
                Create new component
              </Button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="p-4 bg-fill rounded-2xl mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-secondary"><Layers size={16} strokeWidth={1.75} /></span>
              <span className="text-[13px] font-medium text-secondary">Linked component</span>
            </div>
            <p className="text-[15px] text-label font-medium">{componentName || 'Unknown Component'}</p>
            <p className={`${hintClass} mt-1`}>Read-only configuration</p>
          </div>
        );
      }
    }

    switch (widget.type) {
      case 'top_banner':
        return <TopBannerSettings config={config} onChange={handleUpdate} />;

      case 'inventory_discovery':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Asset Type</label>
              <select
                value={config.assetType || ''}
                onChange={(e) => handleUpdate({ assetType: e.target.value })}
                className={fieldClass}
              >
                <option value="">Select type...</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Configuration</label>
              <select
                value={config.configuration || ''}
                onChange={(e) => handleUpdate({ configuration: e.target.value })}
                className={fieldClass}
              >
                <option value="">Select config...</option>
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK+">4 BHK+</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Zone</label>
              <select
                value={config.zone || ''}
                onChange={(e) => handleUpdate({ zone: e.target.value })}
                className={fieldClass}
              >
                <option value="">Select zone...</option>
                <option value="North">North Bangalore</option>
                <option value="South">South Bangalore</option>
                <option value="East">East Bangalore (Whitefield)</option>
                <option value="West">West Bangalore</option>
                <option value="Central">Central</option>
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className={labelClass}>Price Min (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 50L"
                  value={config.priceMin || ''}
                  onChange={(e) => handleUpdate({ priceMin: e.target.value })}
                  className={fieldClass}
                />
              </div>
              <div className="flex-1">
                <label className={labelClass}>Price Max (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 2Cr"
                  value={config.priceMax || ''}
                  onChange={(e) => handleUpdate({ priceMax: e.target.value })}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {config.assetType === 'Plot' ? 'Plot Size (sq.ft)' : 'SBUA (sq.ft)'}
              </label>
              <input
                type="text"
                placeholder={config.assetType === 'Plot' ? 'e.g. 1200' : 'e.g. 1500'}
                value={config.sbua || ''}
                onChange={(e) => handleUpdate({ sbua: e.target.value })}
                className={fieldClass}
              />
            </div>


            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={config.hasImages || false}
                onChange={(e) => handleUpdate({ hasImages: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-[14px] text-label">Must have images / video</span>
            </label>

            {/* Divider */}
            <div className="relative flex items-center py-3 mt-4">
              <div className="flex-grow border-t border-separator"></div>
              <span className="flex-shrink-0 flex items-center gap-1 px-3 text-[13px] font-medium text-secondary">
                <Hash size={13} strokeWidth={1.75} /> Manual override
              </span>
              <div className="flex-grow border-t border-separator"></div>
            </div>

            {/* Manual Property IDs */}
            <div>
              <label className={labelClass}>Property IDs</label>
              <p className={`${hintClass} mb-2`}>
                Add specific property IDs to show only these properties. When IDs are specified, filters above are ignored.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PB3864"
                  value={propertyIdInput}
                  onChange={(e) => setPropertyIdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && propertyIdInput.trim()) {
                      e.preventDefault();
                      const currentIds = config.propertyIds || [];
                      const newId = propertyIdInput.trim();
                      if (!currentIds.includes(newId)) {
                        handleUpdate({ propertyIds: [...currentIds, newId] });
                      }
                      setPropertyIdInput('');
                    }
                  }}
                  className={`${fieldClass} flex-1`}
                />
                <Button
                  variant="secondary"
                  icon={Plus}
                  onClick={() => {
                    if (propertyIdInput.trim()) {
                      const currentIds = config.propertyIds || [];
                      const newId = propertyIdInput.trim();
                      if (!currentIds.includes(newId)) {
                        handleUpdate({ propertyIds: [...currentIds, newId] });
                      }
                      setPropertyIdInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>

              {/* Chips / Tags */}
              {config.propertyIds && config.propertyIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {config.propertyIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1 h-7 bg-fill text-label text-[13px] tabular-nums rounded-full"
                    >
                      {id}
                      <button
                        type="button"
                        onClick={() => {
                          const newIds = config.propertyIds.filter((pid) => pid !== id);
                          handleUpdate({ propertyIds: newIds });
                        }}
                        aria-label={`Remove ${id}`}
                        className="w-5 h-5 flex items-center justify-center rounded-full text-secondary hover:bg-fill-strong hover:text-label transition-colors"
                      >
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'advertisement':
      case 'banner_carousel':
        let items = [...(config.items || [])];
        // Enforce minimum of 3 mandatory banners
        while (items.length < 3) {
          items.push({ id: `b-auto-${Date.now()}-${items.length}`, imageUrl: '', linkUrl: '' });
        }
        
        return (
          <div className="space-y-4">
            <p className={`${hintClass} pb-2 border-b border-separator`}>Add multiple banners (minimum 3 required).</p>
            {items.map((item, index) => (
              <div key={item.id} className="p-3 bg-fill rounded-xl relative group">
                <span className="absolute top-2.5 left-3 text-[12px] font-medium text-tertiary tabular-nums">
                  {index + 1}
                </span>
                {items.length > 3 && (
                  <button
                    onClick={() => {
                      const newItems = items.filter((i) => i.id !== item.id);
                      handleUpdate({ items: newItems });
                    }}
                    aria-label="Remove banner"
                    className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full text-secondary hover:text-danger hover:bg-danger-soft opacity-0 group-hover:opacity-100 transition-[opacity,color,background-color]"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                  </button>
                )}
                <div className="space-y-3 mb-1 mt-6">
                  <div>
                    <label className={labelClass}>Banner image</label>
                    <label className="flex items-center justify-center w-full h-9 bg-surface hover:bg-black/[0.02] shadow-card rounded-[10px] px-3 text-[13px] text-label font-medium transition-colors cursor-pointer">
                      <Upload size={14} strokeWidth={1.75} className="mr-1.5 text-secondary" />
                      {item.imageUrl ? 'Replace image' : 'Upload image'}
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
                      <div className="mt-1.5 text-[12px] text-positive flex items-center gap-1">
                        <Check size={13} strokeWidth={2} /> Image attached
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Link URL</label>
                    <input
                      type="text"
                      value={item.linkUrl || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].linkUrl = e.target.value;
                        handleUpdate({ items: newItems });
                      }}
                      className={`${fieldClass} bg-surface!`}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="plain"
              icon={Plus}
              onClick={() => {
                const newItems = [...items, { id: `b-${Date.now()}`, imageUrl: '', linkUrl: '' }];
                handleUpdate({ items: newItems });
              }}
              className="w-full"
            >
              Add banner
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-[13px] text-secondary">No additional configuration required for this widget type.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {!hideHeader && (
        <div className="px-3 py-3 border-b border-separator flex items-center gap-2">
          <IconButton icon={ArrowLeft} label="Back to template settings" onClick={onBack} />
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-label">Widget settings</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-secondary">
              <span className="text-[12px]">{widgetDef?.icon}</span>
              <span className="text-[13px] truncate">{widgetDef?.label}</span>
            </div>
          </div>
        </div>
      )}
      <div className={`flex-1 overflow-y-auto ${hideHeader ? 'p-0' : 'p-4'}`}>
        
        {/* Global Widget Settings (Applies to all except the hero, which has no heading) */}
        {widget.type !== 'top_banner' && (
        <div className="mb-6 space-y-4">
          <div>
            <label className={labelClass}>Section heading</label>
            <input
              type="text"
              placeholder="e.g. Featured Properties"
              value={config.heading || ''}
              onChange={(e) => handleUpdate({ heading: e.target.value })}
              className={fieldClass}
            />
          </div>
        </div>
        )}

        {/* Dynamic Widget Specific Configuration */}
        {renderConfig()}
      </div>
    </div>
  );
};

export default WidgetSettingsPanel;

import React, { useState, useEffect } from 'react';
import { X, Save, Box } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';
import WidgetSettingsPanel from './WidgetSettingsPanel';
import { Button, fieldClass, labelClass, hintClass, cardClass, pressable } from '../cms-ui';

const ComponentBuilderModal = ({ isOpen, onClose, onSave, pageType, existingComponents = [], initialSelectedType }) => {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [widgetData, setWidgetData] = useState(null);

  // Widgets that can actually be configured
  const configurableWidgets = availableWidgets.filter(w => w.hasConfig);

  useEffect(() => {
    if (isOpen) {
      setName('');
      
      if (initialSelectedType) {
        setSelectedType(initialSelectedType);
        // Pre-fill a shell for the selected type
        setWidgetData({
          id: `temp-${Date.now()}`,
          type: initialSelectedType,
          config: {}
        });
      } else {
        setSelectedType('');
        setWidgetData(null);
      }
    }
  }, [isOpen, initialSelectedType]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);
    if (newType) {
      // Create a temporary widget shell to feed into the Settings panel
      setWidgetData({
        id: `temp-${Date.now()}`,
        type: newType,
        config: {}
      });
    } else {
      setWidgetData(null);
    }
  };

  const handleSettingsUpdate = (widgetId, updatedWidget) => {
    setWidgetData(updatedWidget);
  };

  const handleSave = () => {
    if (!name.trim() || !selectedType || !widgetData) return;

    let nextNum = 1;
    if (existingComponents && existingComponents.length > 0) {
      const cmpIds = existingComponents
        .map(c => c.id)
        .filter(id => id.startsWith('CMP'));
      const nums = cmpIds
        .map(id => parseInt(id.replace('CMP', ''), 10))
        .filter(n => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const generatedId = `CMP${String(nextNum).padStart(3, '0')}`;

    const newComponent = {
      id: generatedId,
      name: name.trim(),
      type: selectedType,
      pageType: pageType,
      createdAt: new Date().toISOString(),
      config: widgetData.config || {}
    };

    onSave(newComponent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cms fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-scrim-in">
      <div className="bg-surface rounded-2xl shadow-raised animate-sheet-in w-full max-w-4xl mx-4 h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-separator flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-fill rounded-lg flex items-center justify-center text-secondary">
               <Box size={16} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-[17px] leading-[22px] font-semibold tracking-[-0.01em] text-label">Create component</h2>
              <p className="text-[13px] text-secondary">Reusable widget for {pageType === 'HOME' ? 'Home' : 'Properties'} templates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSave}
              disabled={!name.trim() || !selectedType}
            >
              Save component
            </Button>
          </div>
        </div>

        {/* Body columns */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Core Info */}
          <div className="w-1/2 p-6 border-r border-separator overflow-y-auto bg-surface">
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Component name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diwali Hero Banner"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>Base widget type</label>
                <p className={`${hintClass} mb-3`}>Select the type of widget you want to pre-configure.</p>
                
                <div className="space-y-2">
                  {configurableWidgets.map((widget) => (
                    <label 
                      key={widget.type}
                      className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer ${pressable} ${
                        selectedType === widget.type 
                          ? 'bg-accent-soft ring-2 ring-accent' 
                          : 'bg-surface shadow-card hover:bg-black/[0.02]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="widgetType"
                        value={widget.type}
                        checked={selectedType === widget.type}
                        onChange={handleTypeChange}
                        className="sr-only"
                      />
                      <span className="w-8 h-8 shrink-0 bg-fill rounded-lg flex items-center justify-center text-secondary">
                        {widget.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[14px] font-medium text-label">{widget.label}</span>
                        <p className="text-[12px] text-secondary mt-0.5">{widget.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Settings Panel */}
          <div className="w-1/2 bg-canvas relative">
            {!selectedType ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                 <div className="w-12 h-12 bg-fill rounded-2xl flex items-center justify-center mb-4">
                   <Box size={22} strokeWidth={1.75} className="text-secondary" />
                 </div>
                 <h3 className="text-[15px] font-semibold text-label mb-1">Select a widget type</h3>
                 <p className="text-[13px] text-secondary max-w-sm">Choose a configurable widget from the left panel to populate its settings here.</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto w-full custom-scrollbar">
                {/* We render WidgetSettingsPanel but strip out its Header/Back button since this is a modal */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-[15px] font-semibold text-label mb-1">Configuration</h3>
                    <p className="text-[13px] text-secondary">
                      Configure the default parameters for this component.
                    </p>
                  </div>
                  <div className={`${cardClass} p-5`}>
                    <WidgetSettingsPanel 
                      widget={widgetData}
                      onUpdate={handleSettingsUpdate}
                      hideHeader={true}
                      isComponentBuilder={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComponentBuilderModal;

import React, { useState, useEffect } from 'react';
import { X, Save, Box } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';
import WidgetSettingsPanel from './WidgetSettingsPanel';

const ComponentBuilderModal = ({ isOpen, onClose, onSave, pageType, existingComponents = [] }) => {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [widgetData, setWidgetData] = useState(null);

  // Widgets that can actually be configured
  const configurableWidgets = availableWidgets.filter(w => w.hasConfig);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSelectedType('');
      setWidgetData(null);
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between shrink-0 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700">
               <Box size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Create Component</h2>
              <p className="text-xs text-gray-500">Reusable widget for {pageType === 'HOME' ? 'Home' : 'Properties'} templates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || !selectedType}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={16} />
              Save Component
            </button>
          </div>
        </div>

        {/* Body columns */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Core Info */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto bg-white">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Component Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diwali Hero Banner"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Base Widget Type</label>
                <p className="text-xs text-gray-500 mb-3">Select the type of widget you want to pre-configure.</p>
                
                <div className="space-y-2">
                  {configurableWidgets.map((widget) => (
                    <label 
                      key={widget.type}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedType === widget.type 
                          ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="widgetType"
                        value={widget.type}
                        checked={selectedType === widget.type}
                        onChange={handleTypeChange}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg leading-none">{widget.icon}</span>
                          <span className="text-sm font-semibold text-gray-900">{widget.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{widget.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Settings Panel */}
          <div className="w-1/2 bg-gray-50 relative">
            {!selectedType ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                 <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                   <Box size={24} className="text-gray-400" />
                 </div>
                 <h3 className="text-sm font-semibold text-gray-900 mb-1">Select a Widget Type</h3>
                 <p className="text-sm text-gray-500 max-w-sm">Choose a configurable widget from the left panel to populate its settings here.</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto w-full custom-scrollbar">
                {/* We render WidgetSettingsPanel but strip out its Header/Back button since this is a modal */}
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Configuration Settings</h3>
                    <p className="text-xs text-gray-500">
                      Configure the default parameters for this component.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <WidgetSettingsPanel 
                      widget={widgetData}
                      onUpdate={handleSettingsUpdate}
                      hideHeader={true}
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

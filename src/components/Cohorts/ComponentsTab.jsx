import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import ComponentCard from './ComponentCard';
import { availableWidgets } from '../../data/mockCohorts';

const ComponentsTab = ({ components, pageType, searchQuery, onCreateComponent }) => {
  
  // Filter by search query and the active pageType
  const filteredComponents = useMemo(() => {
    return components.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPage = c.pageType === pageType;
      return matchesSearch && matchesPage;
    });
  }, [components, searchQuery, pageType]);

  const handleEdit = (component) => {
    // To be implemented: Open builder with this component data
    console.log("Edit Component", component);
  };

  const handleDelete = (id) => {
    // To be implemented: Remove this component from store
    console.log("Delete Component", id);
  };

  return (
    <div className="p-6">
      
      {/* Header action for components specific tab */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Saved Components</h2>
          <p className="text-sm text-gray-500 mt-1">
            Pre-configured widgets you can reuse across multiple {pageType === 'HOME' ? 'Home' : 'Properties'} templates.
          </p>
        </div>
        <button
          onClick={onCreateComponent}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Create Component
        </button>
      </div>

      {/* Component list */}
      <div className="space-y-8 pb-10">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 border-dashed rounded-xl mt-4">
             <div className="text-4xl mb-3">🧩</div>
             <h3 className="text-sm font-semibold text-gray-900 mb-1">No components saved yet</h3>
             <p className="text-sm text-gray-500">
               Build a widget configuration once, and use it everywhere.
             </p>
          </div>
        ) : (
          availableWidgets.map(widgetDef => {
            const compsForType = filteredComponents.filter(c => c.type === widgetDef.type);
            if (compsForType.length === 0) return null;
            
            return (
              <div key={widgetDef.type} className="space-y-3">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                  <span className="text-lg">{widgetDef.icon}</span>
                  <h3 className="text-sm font-bold text-gray-900">{widgetDef.label}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                    {compsForType.length}
                  </span>
                </div>
                <div className="grid gap-3">
                  {compsForType.map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ComponentsTab;

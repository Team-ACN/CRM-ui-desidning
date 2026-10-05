import React, { useMemo } from 'react';
import { Plus, Puzzle } from 'lucide-react';
import ComponentCard from './ComponentCard';
import { ListGroup, sectionTitleClass } from '../cms-ui';
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
    <div className="px-8 py-6">
      {/* Subtitle */}
      <div className="mb-6">
        <h2 className={sectionTitleClass}>Saved components</h2>
        <p className="text-[13px] text-secondary mt-1">
          Pre-configured widgets you can reuse across multiple {pageType === 'HOME' ? 'Home' : 'Properties'} templates.
        </p>
      </div>

      {/* Component list */}
      <div className="space-y-8 pb-10">
        {filteredComponents.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-12 h-12 bg-fill rounded-2xl flex items-center justify-center text-secondary mb-4">
              <Puzzle size={22} strokeWidth={1.75} />
            </div>
            <h3 className="text-[15px] font-semibold text-label mb-1">No components saved yet</h3>
            <p className="text-[13px] text-secondary">
              Build a widget configuration once, and use it everywhere.
            </p>
          </div>
        ) : (
          availableWidgets.map(widgetDef => {
            const compsForType = filteredComponents.filter(c => c.type === widgetDef.type);
            if (compsForType.length === 0) return null;
            
            return (
              <ListGroup key={widgetDef.type} header={widgetDef.label}>
                {compsForType.map((component) => (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ListGroup>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ComponentsTab;

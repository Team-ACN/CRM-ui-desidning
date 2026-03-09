import React, { useState } from 'react';
import { Search } from 'lucide-react';
import TemplateCard from './TemplateCard';

const TemplatesTab = ({ templates, setTemplates, onEditTemplate, onPreviewTemplate, searchQuery }) => {
  const filteredTemplates = templates
    .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.priority - b.priority);

  const handleToggle = (id) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isActive: !t.isActive,
              status: t.isActive ? 'Not Live' : 'Live',
            }
          : t
      )
    );
  };

  return (
    <div className="p-6">

      {/* Template list */}
      <div className="space-y-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onToggle={handleToggle}
            onEdit={() => onEditTemplate(template)}
            onPreview={() => onPreviewTemplate(template)}
          />
        ))}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No templates found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesTab;

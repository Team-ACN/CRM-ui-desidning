import React, { useState } from 'react';
import { Search, LayoutTemplate } from 'lucide-react';
import TemplateCard from './TemplateCard';
import { ListGroup } from '../cms-ui';

const TemplatesTab = ({ templates, onEditTemplate, onPreviewTemplate, searchQuery }) => {
  const filteredTemplates = templates
    .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.priority - b.priority);

  return (
    <div className="px-8">

      {/* Template list */}
      {filteredTemplates.length > 0 && (
        <ListGroup>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => onEditTemplate(template)}
              onPreview={() => onPreviewTemplate(template)}
            />
          ))}
        </ListGroup>
      )}
      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center text-center py-16">
          <div className="w-12 h-12 bg-fill rounded-2xl flex items-center justify-center mb-3">
            <LayoutTemplate size={20} strokeWidth={1.75} className="text-secondary" />
          </div>
          <p className="text-[15px] font-semibold text-label">No templates found</p>
          <p className="mt-1 text-[13px] text-secondary">Try a different search, or create a new template.</p>
        </div>
      )}
    </div>
  );
};

export default TemplatesTab;

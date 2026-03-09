import React from 'react';
import { Eye, Pencil, GripVertical } from 'lucide-react';
import { mockCohorts, availableWidgets } from '../../data/mockCohorts';

const TemplateCard = ({ template, onToggle, onEdit, onPreview }) => {
  const cohort = mockCohorts.find((c) => c.id === template.cohortId);
  const widgetLabels = template.widgets.map((w) => {
    const aw = availableWidgets.find((a) => a.type === w.type);
    return aw ? aw.icon : '';
  });

  return (
    <div className="flex items-center justify-between px-6 py-4 border border-gray-200 rounded-xl bg-white">
      {/* Left: Name & Cohort */}
      <div className="min-w-[220px]">
        <h3 className="text-sm font-semibold text-gray-900">{template.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {cohort ? cohort.name : 'Unknown cohort'}
        </p>
      </div>

      {/* Priority badge */}
      <div className="min-w-[60px] flex justify-center">
        <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-lg">
          #{template.priority}
        </span>
      </div>

      {/* Widgets */}
      <div className="flex items-center gap-1 min-w-[100px]">
        <span className="text-sm text-gray-600 font-medium">{template.widgets.length} widgets</span>
      </div>

      {/* Status */}
      <div className="min-w-[80px]">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            template.status === 'Live'
              ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
              : template.status === 'Draft'
              ? 'text-amber-600 bg-amber-50 border-amber-200'
              : 'text-gray-500 bg-gray-50 border-gray-200'
          }`}
        >
          {template.status}
        </span>
      </div>

      {/* Toggle */}
      <div className="min-w-[60px] flex justify-center">
        <button
          onClick={() => onToggle(template.id)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
            template.isActive ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              template.isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => onPreview && onPreview(template)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Eye size={16} />
          View
        </button>
        <button
          onClick={() => onEdit && onEdit(template)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Pencil size={16} />
          Edit
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;

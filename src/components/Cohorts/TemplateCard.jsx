import React from 'react';
import { Eye, Pencil, GripVertical } from 'lucide-react';
import { mockCohorts, availableWidgets } from '../../data/mockCohorts';

const TemplateCard = ({ template, onToggle, onEdit, onPreview }) => {
  const linkedCohorts = (template.cohortIds || [])
    .map(id => mockCohorts.find(c => c.id === id))
    .filter(Boolean);
  const cohortNames = linkedCohorts.map(c => c.name);
  const totalAgents = linkedCohorts.reduce((sum, c) => sum + (c.agentCount || 0), 0);
  const widgetLabels = template.widgets.map((w) => {
    const aw = availableWidgets.find((a) => a.type === w.type);
    return aw ? aw.icon : '';
  });

  return (
    <div className="grid items-center px-6 py-4 border border-gray-200 rounded-xl bg-white" style={{ gridTemplateColumns: '220px 60px 100px 80px 60px 80px auto' }}>
      {/* Left: Name & Cohort */}
      <div className="pr-4 overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {cohortNames.length > 0 ? cohortNames.join(', ') : 'Global (All Users)'}
        </p>
      </div>

      {/* Priority badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-lg">
          #{template.priority}
        </span>
      </div>

      {/* Widgets */}
      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{template.widgets.length} widgets</span>
      </div>

      {/* Status */}
      <div className="flex justify-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
            template.status === 'Live'
              ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
              : template.status === 'Not Live'
              ? 'text-amber-600 bg-amber-50 border-amber-200'
              : template.status === 'Draft'
              ? 'text-gray-500 bg-gray-50 border-gray-200'
              : 'text-gray-400 bg-gray-50 border-gray-100'
          }`}
        >
          {template.status}
        </span>
      </div>

      {/* Toggle */}
      <div className="flex justify-center">
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

      {/* Agent Reach */}
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-900">{totalAgents.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Agents</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5 justify-end">
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

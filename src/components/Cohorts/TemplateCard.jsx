import React from 'react';
import { Eye, Pencil, GripVertical } from 'lucide-react';
import { mockCohorts, availableWidgets } from '../../data/mockCohorts';
import { ListRow, IconButton } from '../cms-ui';

const STATUS_STYLES = {
  Live: { dot: 'bg-positive-dot', text: 'text-positive' },
  'Not Live': { dot: 'bg-warning-dot', text: 'text-warning' },
};
const DEFAULT_STATUS_STYLE = { dot: 'bg-tertiary', text: 'text-secondary' };

const TemplateCard = ({ template, onEdit, onPreview }) => {
  const linkedCohorts = (template.cohortIds || [])
    .map(id => mockCohorts.find(c => c.id === id))
    .filter(Boolean);
  const cohortNames = linkedCohorts.map(c => c.name);
  const totalAgents = linkedCohorts.reduce((sum, c) => sum + (c.agentCount || 0), 0);
  const widgetLabels = template.widgets.map((w) => {
    const aw = availableWidgets.find((a) => a.type === w.type);
    return aw ? aw.icon : '';
  });

  const statusStyle = STATUS_STYLES[template.status] || DEFAULT_STATUS_STYLE;

  return (
    <ListRow>
      {/* Priority */}
      <span className="w-5 shrink-0 text-right text-[13px] font-medium text-tertiary tabular-nums">
        {template.priority}
      </span>

      {/* Name & Cohort */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-medium tracking-[-0.01em] text-label truncate">{template.name}</h3>
        <p className="text-[13px] text-secondary mt-0.5 truncate">
          {cohortNames.length > 0 ? cohortNames.join(', ') : 'Global (All Users)'}
        </p>
      </div>

      {/* Widgets */}
      <span className="w-24 shrink-0 text-[13px] text-secondary whitespace-nowrap">
        <span className="tabular-nums">{template.widgets.length}</span> widgets
      </span>

      {/* Agent Reach */}
      <span className="w-24 shrink-0 text-[13px] text-secondary whitespace-nowrap">
        <span className="tabular-nums font-medium text-label">{totalAgents.toLocaleString()}</span> agents
      </span>

      {/* Status */}
      <span className={`w-20 shrink-0 inline-flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap ${statusStyle.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
        {template.status}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <IconButton icon={Eye} label="View" onClick={() => onPreview && onPreview(template)} />
        <IconButton icon={Pencil} label="Edit" onClick={() => onEdit && onEdit(template)} />
      </div>
    </ListRow>
  );
};

export default TemplateCard;

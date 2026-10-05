import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { ListRow, IconButton } from '../cms-ui';

// Tags arrive upper-case (e.g. AREA); show them as quiet sentence-case text.
const formatTag = (tag) => tag.charAt(0) + tag.slice(1).toLowerCase();

const CohortCard = ({ cohort, onView }) => {
  return (
    <ListRow>
      {/* Left: Name & Description */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-medium tracking-[-0.01em] text-label truncate">{cohort.name}</h3>
        <p className="text-[13px] text-secondary mt-0.5 truncate">{cohort.description}</p>
      </div>

      {/* Tags */}
      <div className="w-44 shrink-0 text-[13px] text-secondary truncate">
        {cohort.tags.map(formatTag).join(' · ')}
      </div>

      {/* Agents Count */}
      <div className="w-24 shrink-0 text-right text-[13px] text-secondary whitespace-nowrap">
        <span className="tabular-nums font-medium text-label">{cohort.agentCount || 0}</span> agents
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <IconButton icon={Eye} label="View" onClick={() => onView && onView(cohort)} />
        <IconButton icon={Pencil} label="Edit" />
      </div>
    </ListRow>
  );
};

export default CohortCard;

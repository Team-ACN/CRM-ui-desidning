import React from 'react';
import { Eye, Pencil } from 'lucide-react';

const CohortCard = ({ cohort, onView }) => {
  return (
    <div className="grid items-center px-6 py-4 border border-gray-200 rounded-xl bg-white" style={{ gridTemplateColumns: '260px 1fr 100px auto' }}>
      {/* Left: Name & Description */}
      <div className="pr-4 overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{cohort.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{cohort.description}</p>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 px-4">
        {cohort.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase rounded tracking-wider whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Agents Count */}
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-900">{cohort.agentCount || 0}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Agents</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pl-4 justify-end">
        <button onClick={() => onView && onView(cohort)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <Eye size={16} />
          View
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <Pencil size={16} />
          Edit
        </button>
      </div>
    </div>
  );
};

export default CohortCard;

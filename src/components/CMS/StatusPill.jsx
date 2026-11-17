import React from 'react';

// Status is always visible, never loud — a small dot + label, colour used only for status.
const STATUS_META = {
  live: { dot: 'bg-positive-dot', text: 'text-positive', label: 'Live' },
  paused: { dot: 'bg-warning-dot', text: 'text-warning', label: 'Paused' },
  archived: { dot: 'bg-tertiary', text: 'text-secondary', label: 'Archived' },
  scheduled: { dot: 'bg-blue-500', text: 'text-blue-600', label: 'Scheduled' },
  expired: { dot: 'bg-tertiary', text: 'text-secondary', label: 'Expired' },
  disabled: { dot: 'bg-tertiary', text: 'text-secondary', label: 'Disabled' },
};

const StatusPill = ({ status, label, className = '' }) => {
  const meta = STATUS_META[status] || STATUS_META.archived;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${meta.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
      {label || meta.label}
    </span>
  );
};

export default StatusPill;

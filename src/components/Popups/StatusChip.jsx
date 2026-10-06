import React from 'react';

// One status vocabulary for the whole popup section: a dot + a word.
// No filled pills competing with the buttons around them.
const TONES = {
  Live: { dot: 'bg-positive-dot', text: 'text-positive' },
  'Not Live': { dot: 'bg-warning-dot', text: 'text-warning' },
  Draft: { dot: 'bg-tertiary', text: 'text-secondary' },
  Off: { dot: 'bg-tertiary', text: 'text-tertiary' },
};

const StatusChip = ({ status, className = '' }) => {
  const tone = TONES[status] || TONES.Draft;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${tone.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
      {status}
    </span>
  );
};

export default StatusChip;

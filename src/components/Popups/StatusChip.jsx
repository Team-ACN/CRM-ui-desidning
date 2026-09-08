import React from 'react';

// One status vocabulary for the whole popup section: a dot + a word.
// No filled pills competing with the buttons around them.
const TONES = {
  Live: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  'Not Live': { dot: 'bg-amber-500', text: 'text-amber-700' },
  Draft: { dot: 'bg-gray-400', text: 'text-gray-500' },
  Off: { dot: 'bg-gray-300', text: 'text-gray-400' },
};

const StatusChip = ({ status, className = '' }) => {
  const tone = TONES[status] || TONES.Draft;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
      {status}
    </span>
  );
};

export default StatusChip;

import React from 'react';

// One look for every status label. Component status has three states: 'live' (green Active),
// 'inactive' (not placed in a template yet: no tag at all) and 'archived' (grey Archived).
// `overlay` pins it to the top-left of an image. For other uses pass `live` + labels directly.
const StatusTag = ({ status, live = true, liveLabel = 'Active', hiddenLabel = 'Hidden', overlay = false }) => {
  let isLive = live;
  let label;
  if (status) {
    if (status === 'inactive') return null;
    isLive = status === 'live';
    label = isLive ? 'Active' : 'Archived';
  } else {
    label = live ? liveLabel : hiddenLabel;
  }
  return (
    <span
      className={`shrink-0 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${isLive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'} ${
        overlay ? 'absolute top-2.5 left-2.5 z-10' : ''
      }`}
    >
      {label}
    </span>
  );
};

export default StatusTag;

import React from 'react';
import { SYSTEM_WIDGETS, componentTitle, getComponent } from '../../../data/mockCms';
import { rowLabel } from './rowLabel';

// What follows the cursor while dragging: the card itself (image included), lifted a little.
const lift = 'shadow-raised ring-1 ring-black/10 scale-[1.03] rotate-[1.2deg]';

const DragPreview = ({ dragId, rows }) => {
  if (!dragId) return null;
  let label;
  if (dragId.startsWith('lib:cms:')) label = componentTitle(getComponent(dragId.slice(8)));
  else if (dragId.startsWith('lib:sys:')) label = SYSTEM_WIDGETS[dragId.slice(8)]?.label;
  else label = rowLabel((rows || []).find((r) => r.id === dragId.slice(4)) || { kind: 'cms' });
  return <div className={`max-w-[260px] truncate px-3 py-2 rounded-xl border border-neutral-200 bg-surface text-[13px] font-semibold text-label ${lift}`}>{label}</div>;
};

export default DragPreview;

import React from 'react';
import Button from './Button';

// One sentence + the primary action — every empty list uses this, never a dead end.
const EmptyState = ({ icon: Icon, text, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-fill flex items-center justify-center text-tertiary">
        <Icon size={20} strokeWidth={1.75} />
      </div>
    )}
    <p className="text-[14px] text-secondary max-w-[280px]">{text}</p>
    {actionLabel && (
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;

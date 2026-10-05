import React from 'react';

// Inset grouped list (iOS Settings style): one white surface, rows split by inset hairlines.
export const ListGroup = ({ header, footer, action, children, className = '' }) => (
  <section className={className}>
    {(header || action) && (
      <div className="flex items-end justify-between px-4 mb-2">
        {header && <h3 className="text-[13px] font-medium text-secondary">{header}</h3>}
        {action}
      </div>
    )}
    <div className="bg-surface rounded-2xl shadow-card overflow-hidden divide-y divide-separator [&>*]:relative">
      {children}
    </div>
    {footer && <p className="px-4 mt-2 text-[12px] text-secondary">{footer}</p>}
  </section>
);

export const ListRow = ({ children, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 px-4 min-h-[60px] py-3 transition-colors ${onClick ? 'cursor-pointer hover:bg-black/[0.02] active:bg-black/[0.04]' : ''} ${className}`}
  >
    {children}
  </div>
);

export default ListGroup;

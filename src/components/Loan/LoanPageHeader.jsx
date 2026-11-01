import React from 'react';

// Exact header bar shared by every Home Loan page (Agents/Leads/Cases) — breadcrumb, row count
// pill, and an optional primary action button — kept in one place so the three pages can never
// drift apart pixel-wise.
const LoanPageHeader = ({ section = 'Home Loan', title, countLabel, actionLabel, onAction, ActionIcon }) => (
  <header className="h-16 flex items-center px-6 bg-white justify-between shrink-0 border-b border-neutral-100">
    <div className="flex items-center gap-2">
      <span className="font-medium text-neutral-500">{section}</span>
      <span className="text-neutral-300">/</span>
      <h1 className="font-bold text-neutral-900">{title}</h1>
    </div>
    <div className="flex items-center gap-3">
      <span className="font-medium text-neutral-400 px-3 py-1 bg-neutral-100 rounded-full">{countLabel}</span>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-[13px] transition-colors"
        >
          {ActionIcon && <ActionIcon size={14} />} {actionLabel}
        </button>
      )}
    </div>
  </header>
);

export default LoanPageHeader;

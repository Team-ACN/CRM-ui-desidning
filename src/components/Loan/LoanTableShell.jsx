import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Exact table wrapper + pagination footer shared by every Home Loan table page — the <thead> row
// and <tbody> rows stay page-specific (columns differ), but the surrounding shell (scroll
// container, table classes, empty state, pagination) is one component so every page renders it
// pixel-for-pixel the same, instead of three hand-copied versions drifting apart.
const LoanTableShell = ({
  minWidthPx,
  headerRow,
  children,
  colSpan,
  emptyMessage,
  setPage,
  totalPages,
  currentPage,
  totalCount,
  entityLabel,
}) => (
  <>
    <div className="flex-1 min-h-0 overflow-auto bg-white scrollbar-hide">
      <table className="text-left text-[13px] text-neutral-600 whitespace-nowrap w-full" style={{ minWidth: minWidthPx }}>
        <thead className="bg-white text-[11px] font-medium uppercase tracking-wider text-neutral-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e7e5e4]">
          {headerRow}
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {children}
          {totalCount === 0 && (
            <tr>
              <td colSpan={colSpan} className="px-6 py-10 text-center text-neutral-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {totalCount > 0 && (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-neutral-200 shrink-0">
        <span className="text-neutral-400">
          Page {currentPage} of {totalPages} · {totalCount} {entityLabel}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    )}
  </>
);

export default LoanTableShell;

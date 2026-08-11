import React, { useState } from 'react';
import { Download, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { downloadCsv } from '../../utils/csv';
import { FIELDS_BY_KEY } from './propertySchema';
import { buildErrorReport } from './validateRows';

const VISIBLE_LIMIT = 15;

const IssueList = ({ rows, severity }) => (
  <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
    {rows.map((row) => (
      <li key={row.id} className="px-4 py-3">
        <span className="text-xs font-semibold text-gray-900">Row {row.rowNumber}</span>
        <ul className="mt-1 space-y-1">
          {row.issues
            .filter((entry) => entry.severity === severity)
            .map((entry, index) => (
              <li key={`${entry.field}-${index}`} className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{FIELDS_BY_KEY[entry.field].label}</span>
                {entry.value !== '' && <span className="text-gray-500"> “{entry.value}”</span>}
                <span className="text-gray-400"> → </span>
                <span className={severity === 'error' ? 'text-red-700' : 'text-amber-700'}>{entry.message}</span>
              </li>
            ))}
        </ul>
      </li>
    ))}
  </ul>
);

const IssuePanel = ({ title, tone, rows, action, children }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? rows : rows.slice(0, VISIBLE_LIMIT);
  const tones = {
    error: 'bg-red-50 text-red-800',
    warning: 'bg-amber-50 text-amber-900',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 ${tones[tone]}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          {tone === 'error' ? <AlertCircle size={16} /> : <AlertTriangle size={16} />}
          {title}
        </div>
        {action}
      </div>
      {children ?? <IssueList rows={visibleRows} severity={tone} />}
      {rows.length > VISIBLE_LIMIT && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full px-4 py-2.5 border-t border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {showAll ? 'Show fewer' : `Show ${rows.length - VISIBLE_LIMIT} more rows`}
        </button>
      )}
    </div>
  );
};

const ValidationIssues = ({ headers, rows }) => {
  const failedRows = rows.filter((row) => row.status === 'error');
  const warnedRows = rows.filter((row) => row.status === 'warning');

  const handleDownload = () => {
    const report = buildErrorReport(headers, failedRows);
    downloadCsv('properties-upload-errors.csv', report.headers, report.rows);
  };

  return (
    <div className="space-y-4">
      {failedRows.length === 0 && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 size={16} />
          No blocking errors. {rows.length} row{rows.length === 1 ? '' : 's'} ready to upload.
        </div>
      )}

      {failedRows.length > 0 && (
        <IssuePanel
          tone="error"
          title={`${failedRows.length} row${failedRows.length === 1 ? '' : 's'} blocked — fix before uploading`}
          rows={failedRows}
          action={
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 border border-red-200 bg-white hover:bg-red-100 text-red-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Download size={14} />
              Download error report
            </button>
          }
        />
      )}

      {warnedRows.length > 0 && (
        <IssuePanel
          tone="warning"
          title={`${warnedRows.length} row${warnedRows.length === 1 ? '' : 's'} with warnings — will still upload`}
          rows={warnedRows}
        />
      )}
    </div>
  );
};

export default ValidationIssues;

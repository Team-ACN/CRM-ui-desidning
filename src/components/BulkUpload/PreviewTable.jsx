import React from 'react';
import { FIELDS_BY_KEY, KEY_COLUMN_KEYS, PROPERTY_FIELDS } from './propertySchema';

const PREVIEW_LIMIT = 10;

const STATUS_BADGES = {
  ok: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
};

const PreviewTable = ({ rows }) => {
  const uploadableRows = rows.filter((row) => row.status !== 'error');

  if (uploadableRows.length === 0) return null;

  const previewRows = uploadableRows.slice(0, PREVIEW_LIMIT);
  const hiddenFieldCount = PROPERTY_FIELDS.length - KEY_COLUMN_KEYS.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Preview</h4>
        <span className="text-xs text-gray-500">
          {previewRows.length} of {uploadableRows.length} uploadable rows · {hiddenFieldCount} more fields not shown
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 min-w-[60px]">Row</th>
              {KEY_COLUMN_KEYS.map((key) => (
                <th key={key} className="px-4 py-3 min-w-[110px] whitespace-nowrap">
                  {FIELDS_BY_KEY[key].label}
                </th>
              ))}
              <th className="px-4 py-3 min-w-[90px]">Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {previewRows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{row.rowNumber}</td>
                {KEY_COLUMN_KEYS.map((key) => (
                  <td key={key} className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {row.values[key] === ''
                      ? key === 'propertyId'
                        ? <span className="text-gray-400 italic">auto</span>
                        : '—'
                      : row.values[key]}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_BADGES[row.status]}`}>
                    {row.status === 'ok' ? 'Clean' : `${row.issues.length} warning${row.issues.length === 1 ? '' : 's'}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviewTable;

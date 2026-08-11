import React, { useState } from 'react';
import { AlertTriangle, Check, ArrowRight, Search } from 'lucide-react';
import { FIELDS_BY_KEY, FIELD_GROUPS, IGNORE_FIELD, PROPERTY_FIELDS } from './propertySchema';
import { collectUnknownCpIds } from './agentLookup';
import ValidationIssues from './ValidationIssues';
import PreviewTable from './PreviewTable';

const SummaryCard = ({ label, value, tone }) => {
  const tones = {
    neutral: 'text-gray-900',
    good: 'text-emerald-800',
    warn: 'text-amber-700',
    bad: 'text-red-700',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${tones[tone]}`}>{value}</p>
    </div>
  );
};

const Notice = ({ children }) => (
  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-4 py-3 text-sm">
    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
    <span>{children}</span>
  </div>
);

const MappingStep = ({ parsed, mapping, mappingStatus, summary, validatedRows, onMappingChange }) => {
  const [query, setQuery] = useState('');

  const firstDataRow = parsed.rows[0] ?? [];
  const normalizedQuery = query.trim().toLowerCase();

  const columns = parsed.headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => normalizedQuery === '' || header.toLowerCase().includes(normalizedQuery));

  const unknownCpIds = collectUnknownCpIds(validatedRows);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="Rows in file" value={summary.total} tone="neutral" />
        <SummaryCard label="Ready to upload" value={summary.valid} tone="good" />
        <SummaryCard label="With warnings" value={summary.warned} tone="warn" />
        <SummaryCard label="Blocked by errors" value={summary.invalid} tone="bad" />
      </div>

      <div className="space-y-2">
        {mappingStatus.missingRequired.length > 0 && (
          <Notice>
            Required field{mappingStatus.missingRequired.length === 1 ? '' : 's'} not mapped:{' '}
            <strong>{mappingStatus.missingRequired.join(', ')}</strong>
          </Notice>
        )}
        {mappingStatus.duplicateFields.length > 0 && (
          <Notice>
            Mapped to more than one column: <strong>{mappingStatus.duplicateFields.join(', ')}</strong>
          </Notice>
        )}
        {unknownCpIds.length > 0 && (
          <Notice>
            {unknownCpIds.length} CP ID{unknownCpIds.length === 1 ? '' : 's'} not found in Agents:{' '}
            <strong>{unknownCpIds.slice(0, 8).join(', ')}</strong>
            {unknownCpIds.length > 8 && ` +${unknownCpIds.length - 8} more`} — these rows still upload.
          </Notice>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Column mapping — {mappingStatus.mappedCount} of {parsed.headers.length} columns mapped
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {parsed.delimiter}-separated file · matched automatically where possible · unmapped columns are
              skipped
            </p>
          </div>
          <div className="relative shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a column..."
              className="pl-9 pr-3 py-1.5 w-56 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="max-h-[28rem] overflow-y-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 min-w-[180px]">CSV column</th>
                <th className="px-4 py-3 min-w-[160px]">First value</th>
                <th className="px-4 py-3 w-10" />
                <th className="px-4 py-3 min-w-[220px]">CRM field</th>
                <th className="px-4 py-3 w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {columns.map(({ header, index }) => {
                const mapped = mapping[index] ?? IGNORE_FIELD;
                const isIgnored = !FIELDS_BY_KEY[mapped];
                const selected = isIgnored ? IGNORE_FIELD : mapped;

                return (
                  <tr key={`${header}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{header || `Column ${index + 1}`}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{firstDataRow[index] || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <ArrowRight size={14} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={selected}
                        onChange={(event) => onMappingChange(index, event.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value={IGNORE_FIELD}>— Ignore this column —</option>
                        {FIELD_GROUPS.map((group) => (
                          <optgroup key={group} label={group}>
                            {PROPERTY_FIELDS.filter((field) => field.group === group).map((field) => (
                              <option key={field.key} value={field.key}>
                                {field.label}
                                {field.required ? ' *' : ''}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                          isIgnored
                            ? 'text-gray-500 bg-gray-50 border-gray-200'
                            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {!isIgnored && <Check size={12} />}
                        {isIgnored ? 'Ignored' : 'Mapped'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ValidationIssues headers={parsed.headers} rows={validatedRows} />
      <PreviewTable rows={validatedRows} />
    </div>
  );
};

export default MappingStep;

import React, { useRef, useState } from 'react';
import { UploadCloud, Download, FileText, AlertCircle } from 'lucide-react';
import { downloadCsv } from '../../utils/csv';
import {
  CONDITIONAL_FIELDS,
  FIELD_GROUPS,
  MIN_IMAGES_PER_PROPERTY,
  PROPERTY_FIELDS,
  REQUIREMENT_NOTES,
  TEMPLATE_HEADERS,
  TEMPLATE_ROWS,
} from './propertySchema';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const isCsv = (file) => file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';

const UploadStep = ({ onFileSelected, error, isReading }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;

    if (!isCsv(file)) {
      setLocalError(`"${file.name}" is not a CSV file. Export your sheet as CSV and try again.`);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setLocalError('File is larger than 5 MB. Split it into smaller batches.');
      return;
    }

    setLocalError(null);
    onFileSelected(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const shownError = localError ?? error;
  const requiredFields = PROPERTY_FIELDS.filter((field) => field.required);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <UploadCloud size={22} className="text-gray-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {isReading ? 'Reading file…' : 'Drop your CSV here'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">or click to browse — CSV only, up to 5 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>

        {shownError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{shownError}</span>
          </div>
        )}

        <button
          onClick={() => downloadCsv('properties-bulk-upload-template.csv', TEMPLATE_HEADERS, TEMPLATE_ROWS)}
          className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={16} />
          Download CSV template
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-900">
            {PROPERTY_FIELDS.length} supported columns
          </h4>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Column order does not matter and extra columns are ignored — you map everything in the next step.
          Comma- and tab-separated exports both work.
        </p>

        <p className="text-xs font-semibold text-gray-900 mb-2">Always required</p>
        <ul className="space-y-1.5 mb-4">
          {requiredFields.map((field) => (
            <li key={field.key} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{field.label}</span>
              <span className="text-xs px-2 py-0.5 rounded border bg-gray-900 text-white border-gray-900">
                Required
              </span>
            </li>
          ))}
        </ul>

        <p className="text-xs font-semibold text-gray-900 mb-2">Required depending on the row</p>
        <ul className="space-y-1.5 mb-4">
          {CONDITIONAL_FIELDS.map((field) => (
            <li key={field.key} className="flex items-start justify-between gap-2 text-sm">
              <span className="text-gray-700">{field.label}</span>
              <span className="text-xs text-gray-500 text-right">{REQUIREMENT_NOTES[field.key]}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs font-semibold text-gray-900 mb-2">Other groups</p>
        <ul className="space-y-1.5">
          {FIELD_GROUPS.map((group) => {
            const count = PROPERTY_FIELDS.filter((field) => field.group === group && !field.required).length;
            return count === 0 ? null : (
              <li key={group} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{group}</span>
                <span className="text-xs text-gray-500">{count} fields</span>
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-gray-500 mt-4">
          <span className="font-medium text-gray-700">Property ID</span> and{' '}
          <span className="font-medium text-gray-700">Status</span> are set by the CRM on upload, so they are not read
          from the file. Every property also needs at least {MIN_IMAGES_PER_PROPERTY} photo, added in step 3.
        </p>
      </div>
    </div>
  );
};

export default UploadStep;

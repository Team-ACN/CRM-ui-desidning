import React, { useState } from 'react';
import { X, Search, Check, Copy, Upload } from 'lucide-react';
import SegmentedToggle from '../shared/SegmentedToggle';
import { addLoanAgent, findLoanAgentByPhone, LOAN_SOURCE_OPTIONS } from '../../data/mockLoan';

const inputCls =
  'w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-neutral-400 transition-all';
const labelCls = 'text-[12px] text-neutral-500 font-medium mb-1 block';

// "9845011287" -> "98450 11287" (same mask used across the other Add panels in the app).
function maskPhoneInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

// "Name\tNumber\tSource" per line (tab or comma separated), header row optional.
function parseBulkText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  let rows = lines.map((line) => (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim()));
  if (rows[0][0]?.toLowerCase() === 'name') rows = rows.slice(1);
  return rows.map((cols) => ({ name: cols[0] || '', phone: cols[1] || '', source: cols[2] || '' }));
}

// Same phone-first shell and Single/Multiple toggle as AddLoanLeadPanel, but for creating an Agent
// instead — a number that already belongs to an agent just shows that existing agent (nothing to
// add), so this never creates a duplicate, in either mode.
const AddLoanAgentPanel = ({ onClose, onCreated }) => {
  const [mode, setMode] = useState('single');

  // --- Single-add state ---
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [created, setCreated] = useState(false);

  const digits = phone.replace(/\D/g, '');
  const matchedAgent = digits.length === 10 ? findLoanAgentByPhone(phone) : null;
  const canSubmit = digits.length === 10 && !matchedAgent && name.trim() && !created;

  function handleSubmit() {
    if (!canSubmit) return;
    addLoanAgent({ name: name.trim(), number: `+91 ${phone}` });
    setCreated(true);
    onCreated?.();
    setTimeout(() => onClose?.(), 900);
  }

  // --- Multiple (bulk) state ---
  const [bulkText, setBulkText] = useState('');
  const [previewRows, setPreviewRows] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleCopyTemplate() {
    // One example row per outcome — matches an existing agent (skipped), and a fresh number that
    // creates a brand-new agent — so pasting this straight back in shows both behaviors right away.
    const template = ['Name\tMobile Number\tSource', 'Ramesh Gowda\t9845019980\tApp', 'New Example Agent\t9123456780\tMarketing'].join('\n');
    navigator.clipboard?.writeText(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBulkText(String(reader.result || ''));
    reader.readAsText(file);
    e.target.value = '';
  }

  function evaluateRow(row) {
    const rowDigits = row.phone.replace(/\D/g, '').slice(-10);
    if (rowDigits.length !== 10) return { ...row, status: 'error', message: 'Invalid phone number' };

    const agent = findLoanAgentByPhone(row.phone);
    const sourceMatch = LOAN_SOURCE_OPTIONS.find((o) => o.toLowerCase() === row.source.trim().toLowerCase());

    return {
      ...row,
      digits: rowDigits,
      matchedAgent: agent,
      source: sourceMatch || row.source.trim() || LOAN_SOURCE_OPTIONS[0],
      status: agent ? 'agent' : 'new',
    };
  }

  function handlePreview() {
    setPreviewRows(parseBulkText(bulkText).map(evaluateRow));
  }

  function handleImportAll() {
    if (!previewRows) return;
    previewRows
      .filter((r) => r.status === 'new')
      .forEach((row) => addLoanAgent({ name: row.name.trim(), number: `+91 ${row.digits}`, source: row.source }));
    onCreated?.();
    onClose?.();
  }

  const statusChipCls = {
    agent: 'bg-neutral-200 text-neutral-700',
    new: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700',
  };
  function statusChipText(r) {
    if (r.status === 'agent') return `Agent · ${r.matchedAgent.cpid}`;
    if (r.status === 'new') return 'New';
    return 'Error';
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-2/5 min-w-[460px] shadow-2xl flex flex-col [&_button]:focus:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 h-16 flex items-center justify-between px-4 bg-white border-b border-neutral-100">
          <h2 className="text-[16px] font-bold text-neutral-900">Add Agent</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <SegmentedToggle
            options={[
              { value: 'single', label: 'Single' },
              { value: 'multiple', label: 'Multiple' },
            ]}
            value={mode}
            onChange={setMode}
            ariaLabel="Add mode"
          />

          {mode === 'single' ? (
            <>
              <div>
                <label className={labelCls}>Mobile Number</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(maskPhoneInput(e.target.value))}
                    placeholder="98450 11287"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              {digits.length === 10 && (
                <div>
                  <label className={labelCls}>Name</label>
                  {matchedAgent ? (
                    <div className="flex items-center justify-between border border-neutral-200 rounded-xl px-3 py-2.5">
                      <span className="text-[13px] font-semibold text-neutral-900">{matchedAgent.name}</span>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">Agent · {matchedAgent.cpid}</span>
                    </div>
                  ) : (
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent's name" className={inputCls} />
                  )}
                </div>
              )}

              {matchedAgent && <p className="text-[12px] text-neutral-400 text-center">This number already belongs to an agent.</p>}

              {digits.length === 10 && !matchedAgent && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                >
                  {created ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Agent Added</span>
                    </>
                  ) : (
                    <span>Add Agent</span>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="border border-neutral-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[13px] font-medium transition-colors"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy sheet format'}
                </button>
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-[13px] font-medium transition-colors cursor-pointer">
                  <Upload size={13} />
                  Upload CSV
                  <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div>
                <label className={labelCls}>Name, Mobile Number, Source</label>
                <textarea
                  value={bulkText}
                  onChange={(e) => {
                    setBulkText(e.target.value);
                    setPreviewRows(null);
                  }}
                  placeholder={'Ramesh Gowda\t9845019980\tApp'}
                  rows={6}
                  className={`${inputCls} font-mono text-[12px]`}
                />
              </div>

              <button
                type="button"
                onClick={handlePreview}
                disabled={!bulkText.trim()}
                className="w-full py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Preview
              </button>

              {previewRows && (
                <div className="space-y-3">
                  <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                    {previewRows.map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 text-[12px]">
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 truncate">
                            {r.phone} {r.name && `· ${r.name}`}
                          </p>
                          {r.status === 'error' && <p className="text-red-500 truncate">{r.message}</p>}
                          {r.status === 'agent' && <p className="text-neutral-400 truncate">Already an agent</p>}
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusChipCls[r.status]}`}>{statusChipText(r)}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleImportAll}
                    disabled={previewRows.every((r) => r.status !== 'new')}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Add {previewRows.filter((r) => r.status === 'new').length} Agents
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLoanAgentPanel;

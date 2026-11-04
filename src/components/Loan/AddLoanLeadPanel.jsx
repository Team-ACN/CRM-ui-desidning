import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Check, Copy, Upload, User, Users, ChevronDown } from 'lucide-react';
import SegmentedToggle from '../shared/SegmentedToggle';
import {
  addLoanLead,
  findLoanAgentByPhone,
  findLoanLeadByPhone,
  LOAN_KAM_OPTIONS,
  LOAN_REFERRAL_SOURCE_OPTIONS,
  LOAN_REFERRAL_SOURCE_STYLES,
} from '../../data/mockLoan';
import { addLead } from '../../data/mockLeads';

const inputCls =
  'w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-neutral-400 transition-all';
const labelCls = 'text-[12px] text-neutral-500 font-medium mb-1 block';

// Exact same color palette & styling used by Connect Panels' topic pills (Inventory, Enquiry, Legal, Loan, etc.)
const REFERRAL_SOURCE_COLORS = {
  Agent: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Vault: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'All Doors': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Banker: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Lead: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Direct: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
};

// "9845011287" -> "98450 11287"
function maskPhoneInput(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

// Custom interactive dropdown for KAM (with optional unassign support)
function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select option',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] bg-white flex items-center justify-between hover:border-neutral-300 focus:border-neutral-400 focus:outline-none transition-all cursor-pointer ${
          open ? 'border-neutral-400 ring-2 ring-neutral-100' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${value ? 'text-neutral-800' : 'text-neutral-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-neutral-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-30 py-1 max-h-56 overflow-y-auto divide-y divide-neutral-50">
          {options.map((opt) => {
            const isNone = opt === 'None' || opt === '—';
            const isSelected = isNone ? !value : opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(isNone ? '' : opt);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-neutral-50 font-semibold text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50/80'
                }`}
              >
                <span className={isNone ? 'text-neutral-400' : ''}>{opt}</span>
                {isSelected && <Check size={14} className="text-neutral-700 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Simple bulk text parser for Multiple mode:
// Primary columns: Name | Mobile Number | Source
function parseBulkText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  let rows = lines.map((line) => (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim()));
  if (rows[0][0]?.toLowerCase().includes('name') || rows[0][0]?.toLowerCase().includes('mobile')) rows = rows.slice(1);

  return rows.map((cols) => ({
    name: cols[0] || '',
    phone: cols[1] || '',
    source: cols[2] || 'Agent',
    kam: cols[3] || '',
  }));
}

const AddLoanLeadPanel = ({ onClose, onCreated }) => {
  const [mode, setMode] = useState('single');

  // --- Single-add state ---
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [kam, setKam] = useState(''); // Optional KAM
  const [referralSource, setReferralSource] = useState(LOAN_REFERRAL_SOURCE_OPTIONS[0]); // 'Agent'
  const [referralName, setReferralName] = useState('');
  const [referralNumber, setReferralNumber] = useState('');
  const [created, setCreated] = useState(false);

  // --- Multiple-add state ---
  const [bulkText, setBulkText] = useState('');
  const [bulkKam, setBulkKam] = useState(''); // Optional KAM for bulk batch
  const [previewRows, setPreviewRows] = useState(null);
  const [copied, setCopied] = useState(false);

  const digits = phone.replace(/\D/g, '');
  const matchedAgent = digits.length === 10 ? findLoanAgentByPhone(phone) : null;
  const matchedLead = digits.length === 10 ? findLoanLeadByPhone(phone) : null;

  const canSubmit = name.trim().length > 0 && digits.length === 10 && !matchedLead && !created;

  function handlePhoneChange(value) {
    const masked = maskPhoneInput(value);
    setPhone(masked);
    const d = masked.replace(/\D/g, '');
    if (d.length === 10) {
      const agent = findLoanAgentByPhone(masked);
      if (agent) {
        if (!name.trim()) setName(agent.name);
        if (agent.kam) setKam(agent.kam);
      }
    }
  }

  function handleReferralSourceChange(newSource) {
    setReferralSource(newSource);
    // For Vault, All Doors, and Direct, keep referral name and number completely empty
    if (newSource === 'Vault' || newSource === 'All Doors' || newSource === 'Direct') {
      setReferralName('');
      setReferralNumber('');
    }
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const cleanDigits = digits;
    const formattedPhone = `+91 ${phone.trim()}`;

    if (!matchedAgent) {
      addLead({
        name: name.trim(),
        contact: `+91${cleanDigits}`,
        source: 'loan lead',
        kam: kam || '—',
      });
    }

    const cleanReferralNumber = referralNumber.trim();
    const finalReferralNumber =
      !cleanReferralNumber || cleanReferralNumber === '—'
        ? '—'
        : cleanReferralNumber.startsWith('+91')
        ? cleanReferralNumber
        : `+91 ${cleanReferralNumber}`;

    const finalReferralName = referralName.trim() || '—';

    addLoanLead({
      name: name.trim(),
      number: formattedPhone,
      kam: kam || '—',
      referralSource: referralSource,
      referralName: finalReferralName,
      referralNumber: finalReferralNumber,
    });

    setCreated(true);
    onCreated?.();
    setTimeout(() => onClose?.(), 900);
  }

  // --- Multiple (bulk) handlers ---
  function handleCopyTemplate() {
    const template = [
      'Name\tMobile Number\tSource',
      'Ramesh Gowda\t9845019980\tAgent',
      'Deepa Suresh\t9845022310\tVault',
      'Priya Varma\t9845044532\tAll Doors',
      'Mohammed Irfan\t9845033421\tBanker',
      'New Example Lead\t9123456780\tLead',
    ].join('\n');
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
    const lead = !agent ? findLoanLeadByPhone(row.phone) : null;

    const sourceMatch = LOAN_REFERRAL_SOURCE_OPTIONS.find(
      (o) => o.toLowerCase() === (row.source || '').trim().toLowerCase()
    );
    const referralSource = sourceMatch || (agent ? 'Agent' : 'Agent');

    // KAM is optional in multiple; defaults to bulkKam if selected, or agent.kam, or '—'
    const kamMatch = LOAN_KAM_OPTIONS.find(
      (k) => k.toLowerCase() === (row.kam || '').trim().toLowerCase()
    );
    const kamValue = kamMatch || agent?.kam || bulkKam || '—';

    const isDirectOrg = referralSource === 'Vault' || referralSource === 'All Doors' || referralSource === 'Direct';

    const refName =
      agent
        ? agent.name
        : (row.referralName || '').trim() || (isDirectOrg ? '—' : referralSource);

    const refNum = agent ? agent.number : (row.referralNumber || '').trim() || '—';

    return {
      ...row,
      digits: rowDigits,
      matchedAgent: agent,
      matchedLead: lead,
      kam: kamValue,
      referralSource,
      referralName: refName,
      referralNumber: refNum,
      status: agent ? 'agent' : lead ? 'lead' : 'new',
    };
  }

  function handlePreview() {
    setPreviewRows(parseBulkText(bulkText).map(evaluateRow));
  }

  function handleImportAll() {
    if (!previewRows) return;
    previewRows
      .filter((r) => r.status === 'agent' || r.status === 'new')
      .forEach((row) => {
        if (!row.matchedAgent) {
          addLead({
            name: (row.name || '').trim(),
            contact: `+91${row.digits}`,
            source: 'loan lead',
            kam: row.kam || '—',
          });
        }
        addLoanLead({
          name: (row.name || '').trim() || row.matchedAgent?.name || '',
          number: `+91 ${row.digits}`,
          kam: row.kam || '—',
          referralSource: row.referralSource,
          referralName: row.referralName,
          referralNumber: row.referralNumber,
        });
      });
    onCreated?.();
    onClose?.();
  }

  const statusChipCls = {
    agent: 'bg-blue-50 text-blue-700',
    lead: 'bg-neutral-200 text-neutral-700',
    new: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700',
  };
  function statusChipText(r) {
    if (r.status === 'agent') return `Agent · ${r.matchedAgent.cpid}`;
    if (r.status === 'lead') return `Lead · ${r.matchedLead.leadId}`;
    if (r.status === 'new') return 'New';
    return 'Error';
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-2/5 min-w-[460px] shadow-2xl flex flex-col [&_button]:focus:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 h-16 flex items-center justify-between px-5 bg-white border-b border-neutral-100">
          <h2 className="text-[16px] font-bold text-neutral-900">Add Lead</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
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
            <div className="space-y-4">
              {/* 1. Mobile Number (first) */}
              <div>
                <label className={labelCls}>Mobile Number *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="98450 11287"
                    className={`${inputCls} pl-9 font-mono text-[13px]`}
                  />
                </div>

                {matchedLead && (
                  <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Already exists as a lead</p>
                      <p className="text-[11px] text-red-600 mt-0.5">{matchedLead.name} ({matchedLead.leadId})</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                      Duplicate
                    </span>
                  </div>
                )}

                {matchedAgent && !matchedLead && (
                  <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[12px] text-blue-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-blue-600" />
                      <span>Registered Agent: <strong>{matchedAgent.name}</strong></span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                      {matchedAgent.cpid}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Lead Name (second) */}
              <div>
                <label className={labelCls}>Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Lead's full name"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              {/* 3. KAM - Optional */}
              <div>
                <label className={labelCls}>KAM</label>
                <CustomDropdown
                  value={kam}
                  onChange={setKam}
                  options={['None', ...LOAN_KAM_OPTIONS]}
                  placeholder="Select KAM"
                />
              </div>

              {/* 4. Source - Rounded-full Pills matching Connect Panel Topic style */}
              <div>
                <label className={labelCls}>Source *</label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {LOAN_REFERRAL_SOURCE_OPTIONS.map((source) => {
                    const isSelected = referralSource === source;
                    const c = REFERRAL_SOURCE_COLORS[source] || { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200' };
                    return (
                      <button
                        key={source}
                        type="button"
                        onClick={() => handleReferralSourceChange(source)}
                        className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors cursor-pointer ${
                          isSelected
                            ? `${c.bg} ${c.text} ${c.border} font-semibold`
                            : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
                        }`}
                      >
                        {source}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Referrer & Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Referrer</label>
                  <input
                    type="text"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                    placeholder={
                      referralSource === 'Vault' || referralSource === 'All Doors' || referralSource === 'Direct'
                        ? '—'
                        : referralSource === 'Banker'
                        ? 'e.g. HDFC — Rajiv Menon'
                        : referralSource === 'Agent'
                        ? 'e.g. Ravi Kumar'
                        : 'Referrer name'
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Referrer Mobile</label>
                  <input
                    type="text"
                    value={referralNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '—') setReferralNumber(val);
                      else setReferralNumber(maskPhoneInput(val));
                    }}
                    placeholder={
                      referralSource === 'Vault' || referralSource === 'All Doors' || referralSource === 'Direct'
                        ? '—'
                        : referralSource === 'Banker'
                        ? '98450 00011'
                        : '98450 11301'
                    }
                    className={`${inputCls} font-mono text-[13px]`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                {created ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>Lead Added</span>
                  </>
                ) : (
                  <span>Add Lead</span>
                )}
              </button>

              {!canSubmit && !created && (
                <p className="text-[11px] text-neutral-400 text-center">
                  {digits.length !== 10
                    ? 'Please enter a valid 10-digit mobile number'
                    : !name.trim()
                    ? 'Please enter lead name'
                    : matchedLead
                    ? 'Cannot add duplicate lead'
                    : ''}
                </p>
              )}
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-2xl p-4 space-y-4">
              {/* Optional KAM selection for multiple leads */}
              <div>
                <label className={labelCls}>Assign KAM</label>
                <CustomDropdown
                  value={bulkKam}
                  onChange={(k) => {
                    setBulkKam(k);
                    if (previewRows) {
                      setPreviewRows((rows) => rows.map((r) => ({ ...r, kam: r.matchedAgent?.kam || k || '—' })));
                    }
                  }}
                  options={['None', ...LOAN_KAM_OPTIONS]}
                  placeholder="Select KAM (optional)"
                />
              </div>

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
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls.replace('mb-1', '')}>
                    Name, Mobile Number, Source
                  </label>
                </div>
                <textarea
                  value={bulkText}
                  onChange={(e) => {
                    setBulkText(e.target.value);
                    setPreviewRows(null);
                  }}
                  placeholder={'Ramesh Gowda\t9845019980\tAgent\nDeepa Suresh\t9845022310\tVault\nPriya Varma\t9845044532\tAll Doors'}
                  rows={6}
                  className={`${inputCls} font-mono text-[12px] leading-relaxed`}
                />
              </div>

              <button
                type="button"
                onClick={handlePreview}
                disabled={!bulkText.trim()}
                className="w-full py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Preview Leads
              </button>

              {previewRows && (
                <div className="space-y-3">
                  <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                    {previewRows.map((r, i) => (
                      <div key={i} className="flex flex-col gap-1 px-3 py-2.5 text-[12px]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 font-medium text-neutral-900 truncate">
                            <span>{r.name || 'Unnamed Lead'}</span>
                            <span className="text-neutral-400 font-normal ml-1.5">({r.phone})</span>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusChipCls[r.status]}`}>
                            {statusChipText(r)}
                          </span>
                        </div>
                        {r.status === 'error' && <p className="text-red-500 text-[11px]">{r.message}</p>}
                        {r.status === 'lead' && <p className="text-neutral-400 text-[11px]">Already has a lead</p>}
                        {(r.status === 'new' || r.status === 'agent') && (
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 truncate">
                            <span className="font-medium text-neutral-700">KAM: {r.kam || '—'}</span>
                            <span>•</span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-medium ${LOAN_REFERRAL_SOURCE_STYLES[r.referralSource] || 'bg-neutral-100 text-neutral-600'}`}>
                              {r.referralSource}
                            </span>
                            {r.referralName && r.referralName !== '—' && (
                              <>
                                <span>•</span>
                                <span className="truncate">Ref: {r.referralName}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleImportAll}
                    disabled={previewRows.every((r) => r.status === 'error' || r.status === 'lead')}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Add {previewRows.filter((r) => r.status === 'agent' || r.status === 'new').length} Leads
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

export default AddLoanLeadPanel;

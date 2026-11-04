import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Check,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneCall,
  StickyNote,
  Copy,
  History,
  ChevronDown,
  Plus,
  Search,
} from 'lucide-react';
import SegmentedToggle from '../shared/SegmentedToggle';
import WhatsAppLogo from '../shared/WhatsAppLogo';
import CallbackCalendarAndTimePicker from '../shared/CallbackCalendarAndTimePicker';
import { toBusinessSlot } from '../shared/callbackSlots';
import { CONNECT_TOPIC_OPTIONS } from '../../data/mockAgents';
import {
  LOAN_CASE_STAGE_OPTIONS,
  LOAN_CASE_STAGE_STYLES,
  LOAN_REFERRAL_SOURCE_STYLES,
  LOAN_PROJECT_OPTIONS,
  LOAN_BANK_OPTIONS,
  updateLoanCase,
  addLoanCaseConnectHistoryEntry,
  addLoanCaseStageLog,
} from '../../data/mockLoan';

const topicLabel = (value) =>
  value === 'services' ? 'Legal' : CONNECT_TOPIC_OPTIONS.find((t) => t.value === value)?.label || value;

const TOPIC_COLORS = {
  inventory: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  enquiry: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  mashal_ai: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  primary: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  services: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  loan: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};
const topicColor = (value) =>
  TOPIC_COLORS[value] || { bg: 'bg-neutral-100', text: 'text-neutral-500', border: 'border-neutral-200' };

function connectionStatusMeta(value) {
  if (value === 'connected')
    return { Icon: CheckCircle2, iconClass: 'text-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-600' };
  if (value === 'call_back' || value === 'call back')
    return { Icon: Clock, iconClass: 'text-amber-500', badgeClass: 'bg-amber-50 text-amber-600' };
  return { Icon: XCircle, iconClass: 'text-red-500', badgeClass: 'bg-red-50 text-red-600' };
}

function relativeTime(ts) {
  if (!ts) return null;
  const diffDays = Math.floor((Date.now() - ts) / 86400000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

// ─── Searchable combobox with "Add new" ─────────────────────────────────────
// optionsList is a mutable exported array — addNew pushes directly into it so
// the new entry persists across panel opens for the session.
function ComboSelect({ label, value, onChange, optionsList, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  const filtered = optionsList.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  const canAddNew = query.trim() !== '' && !optionsList.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  // Close on outside click
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function select(val) {
    onChange(val);
    setQuery('');
    setOpen(false);
  }

  function addNew() {
    const trimmed = query.trim();
    if (!trimmed) return;
    optionsList.push(trimmed);
    select(trimmed);
  }

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-[12px] font-medium text-neutral-500 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setQuery('');
        }}
        className="w-full flex items-center justify-between border border-neutral-200 rounded-xl px-3 py-2 text-[13px] bg-white hover:border-neutral-300 transition-colors text-left"
      >
        <span className={value ? 'text-neutral-900' : 'text-neutral-400'}>{value || placeholder}</span>
        <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100">
            <Search size={13} className="text-neutral-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type to add..."
              className="flex-1 text-[13px] outline-none text-neutral-800 placeholder:text-neutral-400"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => select(o)}
                className={`w-full text-left px-3 py-2 text-[13px] transition-colors flex items-center justify-between ${value === o ? 'bg-neutral-50 font-semibold text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                {o}
                {value === o && <Check size={13} className="text-emerald-600" />}
              </button>
            ))}
            {canAddNew && (
              <button
                type="button"
                onClick={addNew}
                className="w-full text-left px-3 py-2.5 text-[13px] text-neutral-600 hover:bg-neutral-50 flex items-center gap-2 border-t border-neutral-100"
              >
                <Plus size={13} className="text-neutral-500" />
                <span>
                  Add <span className="font-semibold text-neutral-900">"{query.trim()}"</span>
                </span>
              </button>
            )}
            {filtered.length === 0 && !canAddNew && (
              <p className="px-3 py-4 text-[13px] text-neutral-400 text-center">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const LoanCasePanel = ({ loanCase, onClose, onUpdated }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  const [onlyWithNotes, setOnlyWithNotes] = useState(true);
  const [savedCase, setSavedCase] = useState(false);

  // Stage section — collapsed by default, pick stage + optional note, Save appends history entry
  const [draftStage, setDraftStage] = useState(loanCase.stage || 'Case');
  const [stageNote, setStageNote] = useState('');
  const [savedStage, setSavedStage] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);

  const hasStageChanges = draftStage !== (loanCase.stage || 'Case') || stageNote.trim() !== '';
  const stageHistory = (loanCase.stageHistory || []).slice().sort((a, b) => (b.time || 0) - (a.time || 0));
  // Most recent history entry that has a note — shown below the stage pill even when collapsed.
  const lastStageNote = stageHistory.find((n) => n.text)?.text || null;

  // Editable Case fields draft
  const [caseDraft, setCaseDraft] = useState({
    project: loanCase.project && loanCase.project !== '—' ? loanCase.project : '',
    bankName: loanCase.bankName && loanCase.bankName !== '—' ? loanCase.bankName : '',
    lan: loanCase.lan && loanCase.lan !== '—' ? loanCase.lan : '',
    sanctionedAmount: loanCase.sanctionedAmount ?? '',
    disbursedAmount: loanCase.disbursedAmount ?? '',
  });

  const hasCaseChanges =
    caseDraft.project.trim() !== (loanCase.project && loanCase.project !== '—' ? loanCase.project : '') ||
    caseDraft.bankName.trim() !== (loanCase.bankName && loanCase.bankName !== '—' ? loanCase.bankName : '') ||
    caseDraft.lan.trim() !== (loanCase.lan && loanCase.lan !== '—' ? loanCase.lan : '') ||
    String(caseDraft.sanctionedAmount) !== String(loanCase.sanctionedAmount ?? '') ||
    String(caseDraft.disbursedAmount) !== String(loanCase.disbursedAmount ?? '');

  // Call log form — copied from Legal Doc panels exactly
  const [callForm, setCallForm] = useState({
    connectMedium: 'on call',
    direction: 'outbound',
    status: 'connected',
    notes: '',
    topics: ['loan'],
  });
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');

  const allEntries = (loanCase.connectHistory || [])
    .slice()
    .sort((a, b) => (b.time || b.timestamp || 0) - (a.time || a.timestamp || 0));
  const visibleEntries = onlyWithNotes ? allEntries.filter((e) => e.notes || e.note) : allEntries;

  const rnrOrdinals = new Map();
  let rnrSeq = 0;
  [...allEntries].reverse().forEach((e) => {
    const s = e.status || e.connection;
    if (s === 'connected') rnrSeq = 0;
    else if (s === 'rnr' || (typeof s === 'string' && s.startsWith('rnr'))) rnrOrdinals.set(e, ++rnrSeq);
  });
  const nextRnrNumber = rnrSeq + 1;

  function handleCopy(key, value) {
    if (!value || value === '—') return;
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    });
  }

  function handleSaveCaseDetails() {
    if (!hasCaseChanges) return;
    updateLoanCase(loanCase.id, {
      project: caseDraft.project.trim() || '—',
      bankName: caseDraft.bankName.trim() || '—',
      lan: caseDraft.lan.trim() || '—',
      sanctionedAmount: caseDraft.sanctionedAmount !== '' ? Number(caseDraft.sanctionedAmount) : null,
      disbursedAmount: caseDraft.disbursedAmount !== '' ? Number(caseDraft.disbursedAmount) : null,
    });
    setSavedCase(true);
    setTimeout(() => setSavedCase(false), 1500);
    onUpdated();
  }

  function handleSaveStage() {
    if (!hasStageChanges) return;
    addLoanCaseStageLog(loanCase.id, { stage: draftStage, text: stageNote, user: loanCase.kam || 'User' });
    setStageNote('');
    setSavedStage(true);
    setTimeout(() => setSavedStage(false), 1500);
    onUpdated();
  }

  function submitLogCall() {
    const callbackAt =
      callForm.status === 'call_back' && callbackDate && callbackTime
        ? new Date(`${callbackDate}T${callbackTime}`).getTime()
        : null;

    addLoanCaseConnectHistoryEntry(loanCase.id, {
      connectMedium: callForm.connectMedium,
      direction: callForm.direction,
      connection:
        callForm.status === 'rnr' ? `rnr${nextRnrNumber}` : callForm.status === 'call_back' ? 'call back' : 'connected',
      status: callForm.status === 'rnr' ? `rnr${nextRnrNumber}` : callForm.status,
      notes: callForm.notes,
      note: callForm.notes,
      topics: callForm.topics,
      callbackAt,
      time: Date.now(),
      timestamp: Date.now(),
      user: loanCase.kam || 'User',
    });

    setCallForm({ connectMedium: 'on call', direction: 'outbound', status: 'connected', notes: '', topics: ['loan'] });
    setCallbackDate('');
    setCallbackTime('');
    onUpdated();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-2/5 min-w-[460px] shadow-2xl flex flex-col [&_button]:focus:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header — just the Case ID, no name duplication ── */}
        <header className="shrink-0 h-14 flex items-center justify-between px-5 bg-white border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
              {loanCase.caseId}
            </span>
            <span className="text-neutral-400 text-[13px]">
              {typeof loanCase.date === 'string' ? loanCase.date.replace(/\/\d{4}$/, '') : loanCase.date}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* 1. Client & Referral — fixed info */}
          <div className="border border-neutral-200 rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-y-1.5 text-[13px] items-center">
              <span className="text-neutral-400">Client</span>
              <span className="text-neutral-700 font-semibold">{loanCase.leadName || '—'}</span>

              <span className="text-neutral-400">Client Number</span>
              {loanCase.leadNumber && loanCase.leadNumber !== '—' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-700">{loanCase.leadNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('leadNumber', loanCase.leadNumber)}
                    title="Copy number"
                    className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                  >
                    {copiedKey === 'leadNumber' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              ) : (
                <span className="text-neutral-700">—</span>
              )}

              <span className="text-neutral-400">Source</span>
              <span>
                {loanCase.referralSource ? (
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${LOAN_REFERRAL_SOURCE_STYLES[loanCase.referralSource] ||
                      'bg-neutral-50 text-neutral-600 border border-neutral-200'
                      }`}
                  >
                    {loanCase.referralSource}
                  </span>
                ) : (
                  <span className="text-neutral-700">—</span>
                )}
              </span>

              <span className="text-neutral-400">Referrer</span>
              <span className="text-neutral-700 font-medium">{loanCase.referralName || '—'}</span>

              {loanCase.referralNumber && loanCase.referralNumber !== '—' && (
                <>
                  <span className="text-neutral-400">Referrer Mobile</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-700">{loanCase.referralNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('referralNumber', loanCase.referralNumber)}
                      title="Copy number"
                      className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                    >
                      {copiedKey === 'referralNumber' ? (
                        <Check size={12} className="text-emerald-600" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Stage — collapsed pill + last note preview; opens to picker + history */}
          <div className="border border-neutral-200 rounded-2xl p-5">
            <button
              type="button"
              onClick={() => setStageOpen((v) => !v)}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Stage</span>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium ${LOAN_CASE_STAGE_STYLES[loanCase.stage] || 'bg-neutral-100 text-neutral-600'
                    }`}
                >
                  {loanCase.stage || 'Case'}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-neutral-400 shrink-0 transition-transform ${stageOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Last note — always visible below the header, even when collapsed */}
            {lastStageNote && !stageOpen && (
              <p className="mt-2.5 text-neutral-500 text-[13px] leading-relaxed line-clamp-2">{lastStageNote}</p>
            )}

            {stageOpen && (
              <div className="mt-4 space-y-4">
                {/* Stage pills — fixed set, no manual/custom stage entry */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  {LOAN_CASE_STAGE_OPTIONS.map((st) => {
                    const isSelected = draftStage === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setDraftStage(st)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${isSelected
                          ? LOAN_CASE_STAGE_STYLES[st] || 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                          }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>

                {/* Note for this stage update */}
                <textarea
                  value={stageNote}
                  onChange={(e) => setStageNote(e.target.value)}
                  placeholder="Add a note about this stage update..."
                  rows={3}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400 resize-none"
                />

                <button
                  type="button"
                  onClick={handleSaveStage}
                  disabled={!hasStageChanges}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-semibold text-[13px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {savedStage && <Check size={14} className="text-emerald-400" />}
                  <span>{savedStage ? 'Saved Stage' : 'Save Stage'}</span>
                </button>

                {/* Stage history — notes shown alongside every entry including Disbursement */}
                <div className="pt-3 border-t border-neutral-100 space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                    History
                  </span>

                  {stageHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
                      <History size={18} className="mb-2 text-neutral-300" />
                      <p className="text-[13px]">No stage updates logged yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stageHistory.map((n, i) => (
                        <div key={i} className="border border-neutral-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium ${LOAN_CASE_STAGE_STYLES[n.stage] || 'bg-neutral-100 text-neutral-600'
                                }`}
                            >
                              {n.stage}
                            </span>
                            <span className="text-neutral-400 text-[12px] whitespace-nowrap">
                              {relativeTime(n.time) || '—'} {n.user ? `by ${n.user}` : ''}
                            </span>
                          </div>
                          {/* Notes are always shown — including for Disbursement stage */}
                          {n.text && (
                            <div className="mt-3 pt-3 border-t border-neutral-100">
                              <p className="text-neutral-600 text-[13px] leading-relaxed">{n.text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Editable Case Details — Project & Bank are searchable dropdowns with "Add new" */}
          <div className="border border-neutral-200 rounded-2xl p-5 space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
              Case Details
            </span>

            {/* Project Name — searchable dropdown, can add new */}
            <ComboSelect
              label="Project Name"
              value={caseDraft.project}
              onChange={(v) => setCaseDraft((d) => ({ ...d, project: v }))}
              optionsList={LOAN_PROJECT_OPTIONS}
              placeholder="Select or type project..."
            />

            {/* Bank Name — searchable dropdown, can add new */}
            <ComboSelect
              label="Bank Name"
              value={caseDraft.bankName}
              onChange={(v) => setCaseDraft((d) => ({ ...d, bankName: v }))}
              optionsList={LOAN_BANK_OPTIONS}
              placeholder="Select or type bank..."
            />

            <div>
              <label className="block text-[12px] font-medium text-neutral-500 mb-1">
                LAN (Loan Application Number)
              </label>
              <input
                type="text"
                value={caseDraft.lan}
                onChange={(e) => setCaseDraft((d) => ({ ...d, lan: e.target.value }))}
                placeholder="e.g. LAN-884210"
                className="w-full font-mono border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-neutral-500 mb-1">Sanctioned (₹)</label>
                <input
                  type="number"
                  value={caseDraft.sanctionedAmount}
                  onChange={(e) => setCaseDraft((d) => ({ ...d, sanctionedAmount: e.target.value }))}
                  placeholder="e.g. 5000000"
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-neutral-500 mb-1">Disbursed (₹)</label>
                <input
                  type="number"
                  value={caseDraft.disbursedAmount}
                  onChange={(e) => setCaseDraft((d) => ({ ...d, disbursedAmount: e.target.value }))}
                  placeholder="e.g. 4500000"
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveCaseDetails}
              disabled={!hasCaseChanges}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-semibold text-[13px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {savedCase && <Check size={14} className="text-emerald-400" />}
              <span>{savedCase ? 'Saved Details' : 'Save Details'}</span>
            </button>
          </div>

          {/* 4. Call Log — exact copy of Legal Doc panel call log */}
          <div className="border border-neutral-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <SegmentedToggle
                value={callForm.connectMedium}
                onChange={(v) => setCallForm((f) => ({ ...f, connectMedium: v }))}
                ariaLabel="Connect Medium"
                options={[
                  { value: 'on call', label: 'Call' },
                  { value: 'on whatsapp', label: 'WhatsApp' },
                ]}
              />
              <SegmentedToggle
                value={callForm.direction}
                onChange={(v) => setCallForm((f) => ({ ...f, direction: v }))}
                ariaLabel="Call Direction"
                options={[
                  { value: 'outbound', label: 'Outbound', icon: <ArrowUpRight size={13.5} />, activeIcon: <ArrowUpRight size={13.5} /> },
                  { value: 'inbound', label: 'Inbound', icon: <ArrowDownLeft size={13.5} />, activeIcon: <ArrowDownLeft size={13.5} /> },
                ]}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCallForm((f) => ({ ...f, status: 'connected' }))}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${callForm.status === 'connected' ? 'bg-white border-neutral-700 text-neutral-900 font-semibold' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
              >
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Connected</span>
              </button>
              <button
                type="button"
                onClick={() => setCallForm((f) => ({ ...f, status: 'rnr' }))}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${callForm.status === 'rnr' ? 'bg-white border-neutral-700 text-neutral-900 font-semibold' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
              >
                <XCircle size={14} className="text-red-500" />
                <span>RNR {nextRnrNumber}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCallForm((f) => ({ ...f, status: 'call_back' }));
                  if (!callbackDate) {
                    const slot = toBusinessSlot(new Date());
                    setCallbackDate(slot.dateValue);
                    setCallbackTime(slot.timeValue);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${callForm.status === 'call_back' ? 'bg-white border-neutral-700 text-neutral-900 font-semibold' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
              >
                <Clock size={14} className="text-amber-500" />
                <span>Call Back</span>
              </button>
            </div>

            {callForm.status === 'call_back' && (
              <CallbackCalendarAndTimePicker
                callbackDate={callbackDate}
                callbackTime={callbackTime}
                onSelectDate={setCallbackDate}
                onSelectTime={setCallbackTime}
              />
            )}

            <div className="flex flex-wrap gap-1.5">
              {CONNECT_TOPIC_OPTIONS.map((o) => {
                const isSelected = callForm.topics.includes(o.value);
                const c = topicColor(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() =>
                      setCallForm((f) => ({
                        ...f,
                        topics: f.topics.includes(o.value)
                          ? f.topics.filter((x) => x !== o.value)
                          : [...f.topics, o.value],
                      }))
                    }
                    className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${isSelected
                      ? `${c.bg} ${c.text} ${c.border} font-semibold`
                      : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
                      }`}
                  >
                    {topicLabel(o.value)}
                  </button>
                );
              })}
            </div>

            <textarea
              placeholder="Need to remember something? Type it here..."
              value={callForm.notes}
              onChange={(e) => setCallForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-neutral-400 resize-none"
            />

            <button
              type="button"
              onClick={submitLogCall}
              disabled={callForm.status === 'call_back' && !(callbackDate && callbackTime)}
              className="w-full py-2.5 bg-white hover:bg-neutral-50 border border-neutral-900 text-neutral-900 rounded-full font-semibold text-[13px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Save Connect Log
            </button>
          </div>

          {/* 5. Connect History — exact copy of Legal Doc panel history */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Connect History
              </span>
              <button
                type="button"
                onClick={() => setOnlyWithNotes((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${onlyWithNotes
                  ? 'bg-white border-neutral-900 text-neutral-900 font-semibold'
                  : 'bg-neutral-100 border-transparent text-neutral-500 hover:bg-neutral-200'
                  }`}
              >
                <StickyNote size={11} /> {onlyWithNotes ? 'Calls with notes' : 'All calls'}
              </button>
            </div>

            {visibleEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
                <PhoneCall size={20} className="mb-2 text-neutral-300" />
                <p className="text-[13px]">
                  {allEntries.length === 0 ? 'No connects logged yet.' : 'No connects with notes yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleEntries.map((entry, i) => {
                  const entryStatus = entry.status || entry.connection;
                  const meta = connectionStatusMeta(entryStatus);
                  const entryNotes = entry.notes || entry.note;
                  const hasBelow = entry.topics?.length > 0 || entryNotes || entry.callbackAt;
                  return (
                    <div key={entry.id || i} className="border border-neutral-200 rounded-2xl p-5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${meta.badgeClass}`}>
                            <meta.Icon size={18} />
                          </span>
                          <span className="text-[13px] font-semibold text-neutral-800">
                            {entryStatus === 'rnr' || (typeof entryStatus === 'string' && entryStatus.startsWith('rnr'))
                              ? `RNR ${rnrOrdinals.get(entry) || entryStatus.replace('rnr', '') || ''}`
                              : entryStatus === 'call_back' || entryStatus === 'call back'
                                ? 'Call Back'
                                : 'Connected'}
                          </span>
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 shrink-0">
                            {entry.connectMedium === 'on whatsapp' ? <WhatsAppLogo size={18} /> : <Phone size={15} />}
                          </span>
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 shrink-0">
                            {entry.direction === 'inbound' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </span>
                        </div>
                        <span className="text-neutral-400 text-[12px] whitespace-nowrap">
                          {relativeTime(entry.time || entry.timestamp) || '—'}{' '}
                          {entry.user ? `by ${entry.user}` : ''}
                        </span>
                      </div>

                      {hasBelow && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3">
                          {entry.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {entry.topics.map((t) => {
                                const c = topicColor(t);
                                return (
                                  <span
                                    key={t}
                                    className={`px-2.5 py-1 rounded-full border text-[11px] font-medium ${c.bg} ${c.text} ${c.border}`}
                                  >
                                    {topicLabel(t)}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {entryNotes && (
                            <p className="text-neutral-600 text-[13px] leading-relaxed">{entryNotes}</p>
                          )}
                          {entry.callbackAt && (
                            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg text-[12px] font-medium w-fit">
                              <Clock size={12} />
                              <span>
                                Callback:{' '}
                                {new Date(entry.callbackAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCasePanel;

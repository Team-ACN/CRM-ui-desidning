import React, { useState } from 'react';
import { Edit2, X, ChevronDown } from 'lucide-react';

function relativeTime(ts) {
  if (!ts) return null;
  const diffDays = Math.floor((Date.now() - ts) / 86400000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const STATUS_LABEL = { good: 'Good', bad: 'Bad', maybe: 'Maybe' };
const STATUS_CLASS = {
  good: 'bg-emerald-50 text-emerald-700',
  bad: 'bg-red-50 text-red-700',
  maybe: 'bg-amber-50 text-amber-700',
};
const STATUS_PICKER_OPTIONS = [
  { value: 'good', label: 'Good', activeClass: 'bg-emerald-600 text-white' },
  { value: 'maybe', label: 'Maybe', activeClass: 'bg-amber-500 text-white' },
  { value: 'bad', label: 'Bad', activeClass: 'bg-red-600 text-white' },
];

// The good/maybe/bad pill-picker row — shared between the primary and secondary status editors
// below so editing either one looks identical.
function StatusPicker({ value, onChange }) {
  return (
    <div className="inline-flex p-1 bg-neutral-100 rounded-full gap-0.5">
      {STATUS_PICKER_OPTIONS.map((opt) => {
        const isSel = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
              isSel ? opt.activeClass : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Avatar + name + "{agentId} · {contact} · KAM {kam}" subtitle, with an optional Legal Status row
// — the identity header shared by the Agent Connect panel and every Legal Doc side panel (Leads /
// Qualify / Service), so an agent's identity AND status look and edit the same way everywhere.
// Pass `status` to show the badge; pass `onUpdateStatus(newStatus, noteText)` too to make it
// editable in place — picking a status no longer commits immediately, it just stages a draft;
// Save commits the status plus whatever note was typed alongside it in one call.
// Pass `secondaryStatus={{ label, value, history }}` to show a second status badge (e.g. Loan
// Status) alongside the primary one; pass `onUpdateSecondaryStatus(newStatus, noteText)` too so
// the same Edit button and Save action update both statuses — and log a note for each — in one go
// (the Agent Connect panel uses this to edit Legal and Loan status together).
// Pass `statusHistory` (array of {text, status, time, user}) for the primary status, and
// `secondaryStatus.history` for the secondary one, to make each badge clickable — clicking it
// expands that status's own note + who-changed-it-when history, collapsed by default.
const AgentIdentityCard = ({
  name,
  agentId,
  contact,
  kam,
  status,
  onUpdateStatus,
  statusLabel = 'Legal Status',
  statusHistory,
  secondaryStatus,
  onUpdateSecondaryStatus,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftSecondaryStatus, setDraftSecondaryStatus] = useState(secondaryStatus?.value);
  const [noteText, setNoteText] = useState('');
  const [secondaryNoteText, setSecondaryNoteText] = useState('');
  const [openHistory, setOpenHistory] = useState(null); // null | 'primary' | 'secondary'

  const openEditor = () => {
    setDraftStatus(status);
    setDraftSecondaryStatus(secondaryStatus?.value);
    setNoteText('');
    setSecondaryNoteText('');
    setIsEditing(true);
  };

  const canEditSecondary = !!(secondaryStatus && onUpdateSecondaryStatus);

  const handleSave = () => {
    onUpdateStatus(draftStatus, noteText.trim());
    if (canEditSecondary) onUpdateSecondaryStatus(draftSecondaryStatus, secondaryNoteText.trim());
    setIsEditing(false);
  };

  const primaryHistory = (statusHistory || []).slice().sort((a, b) => (b.time || 0) - (a.time || 0));
  const secondaryHistory = (secondaryStatus?.history || []).slice().sort((a, b) => (b.time || 0) - (a.time || 0));
  const activeHistory = openHistory === 'primary' ? primaryHistory : openHistory === 'secondary' ? secondaryHistory : [];

  return (
    <div className="border border-neutral-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[13px] font-semibold shrink-0">
          {initials(name)}
        </div>
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-neutral-900 leading-tight truncate">{name}</h2>
          <p className="text-[12px] text-neutral-400 mt-0.5 truncate">
            {agentId} · {contact} · KAM {kam || '—'}
          </p>
        </div>
      </div>

      {status && (
        <div className="pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  primaryHistory.length && setOpenHistory((v) => (v === 'primary' ? null : 'primary'))
                }
                className={`flex items-center gap-2.5 ${primaryHistory.length ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="text-[12px] font-medium text-neutral-500">{statusLabel}</span>
                <span className={`px-3 py-1 rounded-full text-[13px] font-semibold capitalize ${STATUS_CLASS[status] || 'bg-neutral-100 text-neutral-500'}`}>
                  {STATUS_LABEL[status] || status}
                </span>
                {primaryHistory.length > 0 && (
                  <ChevronDown
                    size={12}
                    className={`text-neutral-400 transition-transform ${openHistory === 'primary' ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {secondaryStatus && (
                <button
                  type="button"
                  onClick={() =>
                    secondaryHistory.length && setOpenHistory((v) => (v === 'secondary' ? null : 'secondary'))
                  }
                  className={`flex items-center gap-2.5 pl-4 border-l border-neutral-100 ${
                    secondaryHistory.length ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span className="text-[12px] font-medium text-neutral-500">{secondaryStatus.label}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[13px] font-semibold capitalize ${STATUS_CLASS[secondaryStatus.value] || 'bg-neutral-100 text-neutral-500'}`}
                  >
                    {STATUS_LABEL[secondaryStatus.value] || secondaryStatus.value}
                  </span>
                  {secondaryHistory.length > 0 && (
                    <ChevronDown
                      size={12}
                      className={`text-neutral-400 transition-transform ${openHistory === 'secondary' ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
              )}
            </div>

            {onUpdateStatus && (
              <button
                type="button"
                onClick={() => (isEditing ? setIsEditing(false) : openEditor())}
                className="text-[12px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              >
                {isEditing ? <X size={12} /> : <Edit2 size={12} />}
                {!isEditing && <span>Edit</span>}
              </button>
            )}
          </div>

          {openHistory && !isEditing && (
            <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2 max-h-48 overflow-y-auto">
              {activeHistory.map((n, i) => (
                <div key={i} className="flex items-start justify-between gap-2 text-[12px]">
                  <div className="min-w-0">
                    {n.status && (
                      <span className={`inline-block mr-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_CLASS[n.status.toLowerCase()] || 'bg-neutral-100 text-neutral-500'}`}>
                        {n.status}
                      </span>
                    )}
                    <span className="text-neutral-600">{n.text}</span>
                  </div>
                  <span className="text-neutral-400 whitespace-nowrap shrink-0">
                    {relativeTime(n.time) || '—'} {n.user ? `by ${n.user}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {status && onUpdateStatus && isEditing && (
        <div className="pt-3 border-t border-neutral-100 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-neutral-500 font-medium">{canEditSecondary ? statusLabel : 'Update status'}</span>
              <StatusPicker value={draftStatus} onChange={setDraftStatus} />
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={`Add a note for ${canEditSecondary ? statusLabel : 'this status'} (optional)...`}
              rows={2}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400 resize-none"
            />
          </div>

          {canEditSecondary && (
            <div className="space-y-2 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-500 font-medium">{secondaryStatus.label}</span>
                <StatusPicker value={draftSecondaryStatus} onChange={setDraftSecondaryStatus} />
              </div>
              <textarea
                value={secondaryNoteText}
                onChange={(e) => setSecondaryNoteText(e.target.value)}
                placeholder={`Add a note for ${secondaryStatus.label} (optional)...`}
                rows={2}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400 resize-none"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={
              draftStatus === status &&
              draftSecondaryStatus === secondaryStatus?.value &&
              !noteText.trim() &&
              !secondaryNoteText.trim()
            }
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-neutral-900"
          >
            Save
          </button>
        </div>
      )}

      {!isEditing && children}
    </div>
  );
};

export default AgentIdentityCard;

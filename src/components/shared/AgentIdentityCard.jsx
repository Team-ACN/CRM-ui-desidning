import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';

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

// Avatar + name + "{agentId} · {contact} · KAM {kam}" subtitle, with an optional Legal Status row
// — the identity header shared by the Agent Connect panel and every Legal Doc side panel (Leads /
// Qualify / Service), so an agent's identity AND status look and edit the same way everywhere.
// Pass `status` to show the badge; pass `onUpdateStatus(newStatus, noteText)` too to make it
// editable in place — picking a status no longer commits immediately, it just stages a draft;
// Save commits the status plus whatever note was typed alongside it in one call.
const AgentIdentityCard = ({ name, agentId, contact, kam, status, onUpdateStatus, children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftStatus, setDraftStatus] = useState(status);
  const [noteText, setNoteText] = useState('');

  const openEditor = () => {
    setDraftStatus(status);
    setNoteText('');
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateStatus(draftStatus, noteText.trim());
    setIsEditing(false);
  };

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
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-medium text-neutral-500">Legal Status</span>
            <span className={`px-3 py-1 rounded-full text-[13px] font-semibold capitalize ${STATUS_CLASS[status] || 'bg-neutral-100 text-neutral-500'}`}>
              {STATUS_LABEL[status] || status}
            </span>
          </div>

          {onUpdateStatus && (
            <button
              type="button"
              onClick={() => (isEditing ? setIsEditing(false) : openEditor())}
              className="text-[12px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {isEditing ? <X size={12} /> : <Edit2 size={12} />}
              {!isEditing && <span>Edit</span>}
            </button>
          )}
        </div>
      )}

      {status && onUpdateStatus && isEditing && (
        <div className="pt-3 border-t border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-neutral-500 font-medium">Update status</span>
            <div className="inline-flex p-1 bg-neutral-100 rounded-full gap-0.5">
              {STATUS_PICKER_OPTIONS.map((opt) => {
                const isSel = draftStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDraftStatus(opt.value)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                      isSel ? opt.activeClass : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note (optional)..."
            rows={2}
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-neutral-400 resize-none"
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={draftStatus === status && !noteText.trim()}
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

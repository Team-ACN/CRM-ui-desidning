import React, { useState, useEffect } from 'react';
import { X, NotepadText } from 'lucide-react';
import PartyNumberPicker from './PartyNumberPicker';
import { CALL_PARTIES } from './enquiryConstants';

const NotesPanel = ({ enquiry, notesByParty, onAddNote, onClose }) => {
  const [activeParty, setActiveParty] = useState(CALL_PARTIES[0].key);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const notes = notesByParty?.[activeParty] || [];
  const activeLabel = CALL_PARTIES.find((party) => party.key === activeParty).label;

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    onAddNote(enquiry.id, activeParty, text);
    setDraft('');
  };

  const noteCount = (partyKey) => notesByParty?.[partyKey]?.length || null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="relative w-full max-w-2xl h-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <p className="text-sm text-gray-600">{enquiry.enqId}</p>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              aria-label="Close notes"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-bold text-gray-900 truncate" title={enquiry.propertyName}>
              {enquiry.propertyName}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{enquiry.propertyId}</p>
          </div>

          {/* Notes are kept per contact, so pick whose thread this is */}
          <div className="mt-4">
            <PartyNumberPicker
              enquiry={enquiry}
              activeParty={activeParty}
              onSelectParty={setActiveParty}
              renderBadge={(partyKey) => {
                const count = noteCount(partyKey);
                return count ? `${count} note${count > 1 ? 's' : ''}` : null;
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Internal Notes — {activeLabel}</h3>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            placeholder={`Add a note about the ${activeLabel.toLowerCase()}...`}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900 resize-y focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={addNote}
              disabled={!draft.trim()}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-500 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <NotepadText size={16} />
              Add Note
            </button>
          </div>

          <h3 className="text-sm font-bold text-gray-900 mt-6 mb-4">Notes</h3>
          {notes.length === 0
            ? <p className="text-center text-gray-500 py-8">No notes added yet</p>
            : (
              <ul className="flex flex-col gap-3">
                {notes.map((note) => (
                  <li key={note.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-2">{note.createdAt}</p>
                  </li>
                ))}
              </ul>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};

export default NotesPanel;

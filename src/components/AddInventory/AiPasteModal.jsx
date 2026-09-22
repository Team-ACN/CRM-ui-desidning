import React, { useEffect, useState } from 'react';
import { ClipboardPaste, Loader2, Sparkles, X } from 'lucide-react';
import { SAMPLE_LISTING } from './aiExtract';

const STATUS_LINES = ['Reading the message…', 'Matching property fields…', 'Checking agent records…'];
const STATUS_INTERVAL_MS = 450;

const StatusTicker = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % STATUS_LINES.length), STATUS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return <span>{STATUS_LINES[index]}</span>;
};

/** Paste-a-listing entry point: raw text in, prefilled form out. */
const AiPasteModal = ({ isOpen, isExtracting, hasExistingValues, onExtract, onClose }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const canExtract = text.trim().length > 20 && !isExtracting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-200">
          <div className="flex gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 text-violet-700">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add with AI</h2>
              <p className="text-sm text-gray-500">
                Paste the listing message — the form below gets filled, you review and edit.
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900">
            <X size={20} />
          </button>
        </header>

        <div className="px-6 py-5 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">Listing text</label>
            <button
              type="button"
              onClick={() => setText(SAMPLE_LISTING)}
              className="flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900"
            >
              <ClipboardPaste size={13} />
              Use a sample
            </button>
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={isExtracting}
            rows={10}
            placeholder={'Paste the WhatsApp or email message here.\n\n3 BHK in Sobha Royal Pavilion, 1817 sqft, 7th floor, west facing, 3.35 Cr, ready to move…'}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-y disabled:bg-gray-50"
          />

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{text.trim().length} characters</span>
            <span>Nothing is submitted until you review the form.</span>
          </div>

          {hasExistingValues && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Fields the AI finds will overwrite what is already in the form.
            </p>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
          <span className="flex items-center gap-2 text-xs text-gray-500">
            {isExtracting && <Loader2 size={14} className="animate-spin text-violet-600" />}
            {isExtracting && <StatusTicker />}
          </span>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canExtract}
              onClick={() => onExtract(text)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium transition-colors"
            >
              {isExtracting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isExtracting ? 'Filling form…' : 'Fill form with AI'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AiPasteModal;

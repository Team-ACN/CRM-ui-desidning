import React, { useState } from 'react';
import { sitePlanPlaceholderImageUrl } from './sitePlanPlaceholder';

const THUMB_DISPLAY_WIDTH = 64;

// A full-width strip that sits above the site plan box whenever a saved PDF is assumed to have
// more than one page (a UI-only mock) — pick a thumbnail, hit save, done.
export default function SitePlanPageStrip({ numPages, selected, onSelect, onSave }) {
  // Discarding the other pages is a one-way action, so the button asks for a second click
  // before it actually commits — switching pages cancels the pending confirm. Reset during
  // render (not an effect) so it takes effect in the same paint instead of one render late.
  const [armed, setArmed] = useState(false);
  const [lastSelected, setLastSelected] = useState(selected);
  if (selected !== lastSelected) {
    setLastSelected(selected);
    setArmed(false);
  }

  function handleSaveClick() {
    if (armed) {
      onSave();
      setArmed(false);
    } else {
      setArmed(true);
    }
  }

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto px-3 py-2.5 mb-4 bg-stone-50 border border-stone-200 rounded-2xl">
      {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
        <button key={pageNum} onClick={() => onSelect(pageNum)} className="shrink-0">
          <img
            src={sitePlanPlaceholderImageUrl(pageNum, THUMB_DISPLAY_WIDTH * 2, Math.round(THUMB_DISPLAY_WIDTH * 2 * 1.414))}
            alt={`Page ${pageNum}`}
            style={{ width: THUMB_DISPLAY_WIDTH, height: THUMB_DISPLAY_WIDTH * 1.414 }}
            className={`block rounded-md border-2 object-cover transition-colors ${
              selected === pageNum ? 'border-neutral-900' : 'border-transparent hover:border-stone-300'
            }`}
          />
        </button>
      ))}
      <button
        onClick={handleSaveClick}
        className={`ml-auto self-end flex items-center justify-center w-28 px-8 py-2 rounded-xl text-base font-medium transition-colors shrink-0 ${
          armed ? 'border border-neutral-900 text-neutral-900 hover:bg-neutral-100' : 'text-white bg-neutral-900 hover:bg-neutral-950'
        }`}
      >
        {armed ? 'Confirm' : 'Save'}
      </button>
    </div>
  );
}

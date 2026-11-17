import React, { useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

// Full-screen preview of the in-app popup sheet: dimmed backdrop, close control, the poster at
// full width, then the action area (divider + stacked buttons) in the strip colour.
const Star = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill={color} aria-hidden>
    <path d="M7 0c.4 3.9 2.1 6.6 7 7-4.9.4-6.6 3.1-7 7-.4-3.9-2.1-6.6-7-7 4.9-.4 6.6-3.1 7-7z" />
  </svg>
);

const PopupSheetPreview = ({ surface, ratio = '39:50', closeCorner = 'top_right', image, bg, text, divider, buttons, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const line = text + '99';
  const isApp = surface === 'app';

  const sheet = (
    <div className={`flex flex-col items-center w-full ${isApp ? 'min-h-0' : 'max-w-[760px]'}`}>
      <button type="button" onClick={onClose} title="Close" className={`mb-3 w-9 h-9 ${closeCorner === 'top_left' ? 'self-start' : 'self-end'} rounded-xl bg-white/25 backdrop-blur flex items-center justify-center text-white hover:bg-white/35 shrink-0`}>
        <X size={18} />
      </button>
      <div className={`w-full overflow-y-auto ${isApp ? 'rounded-t-[20px]' : 'rounded-[22px]'}`} style={{ background: bg }}>
        {image ? <img src={image} alt="" className="w-full block" /> : <div className="w-full bg-neutral-300" style={{ aspectRatio: ratio.replace(':', ' / ') }}><div className="h-full flex items-center justify-center"><ImageIcon size={28} className="text-neutral-500" /></div></div>}
        <div className="px-3 pt-4 pb-5" style={{ color: text }}>
          {buttons.length > 0 && (
            <div className="space-y-2.5">
              {divider && (
                <div className="flex items-center gap-2 mx-auto" style={{ maxWidth: 260 }}>
                  <span className="flex-1 h-px" style={{ background: line }} />
                  <Star color={text} />
                  <span className="text-[12.5px] font-semibold tracking-wide whitespace-nowrap">{divider.toUpperCase()}</span>
                  <Star color={text} />
                  <span className="flex-1 h-px" style={{ background: line }} />
                </div>
              )}
              {buttons.map((b, i) => (
                <div key={i} className="w-full rounded-lg py-2.5 text-center text-[14.5px] font-semibold shadow-md" style={{ background: b.bg, color: b.text }}>
                  {b.label || `Button ${i + 1}`}
                </div>
              ))}
            </div>
          )}
          {isApp && <div className="mx-auto mt-3 h-1 w-28 rounded-full bg-white/80" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center py-8 px-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      {isApp ? (
        <div className="relative w-[410px] rounded-[48px] border-[8px] border-neutral-800 bg-neutral-300 shadow-raised overflow-hidden flex flex-col justify-end" style={{ height: 'min(860px, calc(100vh - 64px))' }}>
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative flex flex-col items-center min-h-0 max-h-full">{sheet}</div>
        </div>
      ) : (
        sheet
      )}
    </div>
  );
};

export default PopupSheetPreview;

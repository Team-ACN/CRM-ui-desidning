import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, Maximize2, X, ScanLine } from 'lucide-react';

// Dashed drop zone with a ratio hint; once an image is in, it renders inside a frame of the
// required ratio. Wrong ratio turns the zone red and rejects the image — never silently accepts it.
const RATIO_TOLERANCE = 0.03;

function parseRatio(ratio) {
  const [w, h] = ratio.split(':').map(Number);
  return w / h;
}

// Right-aligned safe area: the part of the image that is never cropped. Shown as a highlight.
function SafeAreaOverlay({ safe }) {
  const { left, width } = safe;
  const right = 1 - left - width;
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-y-0 left-0 bg-black/45" style={{ width: `${left * 100}%` }} />
      <div className="absolute inset-y-0 right-0 bg-black/45" style={{ width: `${right * 100}%` }} />
      <div className="absolute inset-y-0 border-2 border-dashed border-white/90 flex items-end justify-center pb-1.5" style={{ left: `${left * 100}%`, width: `${width * 100}%` }}>
        <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium">Safe area</span>
      </div>
    </div>
  );
}

const UploadZone = ({ label, ratio, value, onChange, className = '', note, safe }) => {
  const [showSafe, setShowSafe] = useState(false);
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!previewOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setPreviewOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewOpen]);

  function handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const actual = img.naturalWidth / img.naturalHeight;
      const expected = parseRatio(ratio);
      if (Math.abs(actual - expected) / expected > RATIO_TOLERANCE) {
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const d = gcd(img.naturalWidth, img.naturalHeight);
        setError(`This image is ${img.naturalWidth / d}:${img.naturalHeight / d}. Needs ${ratio}.`);
        return;
      }
      setError('');
      onChange({ url, width: img.naturalWidth, height: img.naturalHeight, size: file.size });
    };
    img.src = url;
  }

  return (
    <div className={className}>
      {label && <label className="block text-[13px] font-medium text-label mb-1.5">{label}</label>}
      <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative w-full rounded-[10px] flex flex-col items-center justify-center gap-1.5 overflow-hidden transition-colors ${
          value ? 'bg-fill' : `border border-dashed px-3 ${error ? 'border-danger bg-danger-soft' : 'border-separator hover:border-neutral-400 hover:bg-neutral-50/40'}`
        }`}
        style={{ aspectRatio: ratio.replace(':', ' / ') }}
      >
        {value ? (
          <>
            <img src={value.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {safe && showSafe && <SafeAreaOverlay safe={safe} />}
          </>
        ) : (
          <>
            <ImageIcon size={18} className="text-tertiary" strokeWidth={1.75} />
            <span className={`text-[12px] text-center ${error ? 'text-danger' : 'text-tertiary'}`}>
              {error || `Drop image or click to upload · ${ratio}`}
            </span>
          </>
        )}
      </button>
      {value && safe && (
        <button
          type="button"
          title={showSafe ? 'Hide safe area' : 'Show safe area'}
          onClick={() => setShowSafe((v) => !v)}
          className={`absolute top-2 right-11 w-7 h-7 rounded-full text-white flex items-center justify-center ${showSafe ? 'bg-neutral-900 ring-2 ring-white' : 'bg-black/55 hover:bg-black/75'}`}
        >
          <ScanLine size={13} />
        </button>
      )}
      {value && (
        <button
          type="button"
          title="Preview full screen"
          onClick={() => setPreviewOpen(true)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/75"
        >
          <Maximize2 size={13} />
        </button>
      )}
      </div>
      {note && <p className="mt-2 rounded-[10px] bg-neutral-100 px-3 py-2 text-[12px] leading-relaxed text-neutral-600">{note}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {previewOpen &&
        value &&
        createPortal(
          <div className="cms fixed inset-0 z-[300] bg-black/85 flex items-center justify-center p-6" onClick={() => setPreviewOpen(false)}>
            <div className="relative" style={{ aspectRatio: ratio.replace(':', ' / '), width: `min(100%, calc((100vh - 48px) * ${parseRatio(ratio)}))` }} onClick={(e) => e.stopPropagation()}>
              <img src={value.url} alt="" className="w-full h-full object-cover rounded-lg" />
              {safe && showSafe && <SafeAreaOverlay safe={safe} />}
            </div>
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
            >
              <X size={18} />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};

export default UploadZone;

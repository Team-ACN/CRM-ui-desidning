import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();

// Full-screen eyedropper: move over the image to see the colour under the pointer, click to pick it.
const ImageColorPicker = ({ src, onPick, onClose }) => {
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onerror = () => setError('Could not load this image.');
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale = Math.min((window.innerWidth - 96) / image.naturalWidth, (window.innerHeight - 160) / image.naturalHeight, 1.5);
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      try {
        ctx.getImageData(0, 0, 1, 1);
      } catch {
        setError("This image's colours can't be read here. Type or pick a colour manually.");
      }
    };
    image.src = src;
  }, [src]);

  function colorAt(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height)));
    const [r, g, b] = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  return createPortal(
    <div className="cms fixed inset-0 z-[300] bg-black/85 flex flex-col items-center justify-center gap-4 p-6" onClick={onClose}>
      <p className="text-white/80 text-[13px]">{error || 'Move over the image and click to pick a colour · Esc to cancel'}</p>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <canvas
          ref={canvasRef}
          className={`rounded-lg ${error ? 'hidden' : 'cursor-crosshair'}`}
          onMouseMove={(e) => setHover({ x: e.clientX, y: e.clientY, hex: colorAt(e) })}
          onMouseLeave={() => setHover(null)}
          onClick={(e) => onPick(colorAt(e))}
        />
      </div>
      {hover && (
        <div
          className="fixed pointer-events-none flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white shadow-lg text-[12px] font-mono text-neutral-900"
          style={{ left: hover.x + 16, top: hover.y + 16 }}
        >
          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: hover.hex }} />
          {hover.hex}
        </div>
      )}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
      >
        <X size={18} />
      </button>
    </div>,
    document.body
  );
};

export default ImageColorPicker;

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

// Modal sheet: dims the page to focus, scales in from slightly below (spring-like ease).
// Escape and scrim click close it so the user is never trapped.
const Modal = ({ open = true, onClose, title, subtitle, children, footer, width = 'max-w-lg', align = 'center' }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`cms fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/30 animate-scrim-in p-6 ${align === 'top' ? 'items-start pt-12' : 'items-center'}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`w-full ${width} bg-surface rounded-2xl shadow-raised animate-sheet-in flex flex-col max-h-[calc(100vh-48px)]`}>
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
            <div className="min-w-0">
              {title && <h2 className="text-[17px] leading-[22px] font-semibold tracking-[-0.01em] text-label">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-[13px] text-secondary">{subtitle}</p>}
            </div>
            {onClose && <IconButton icon={X} label="Close" onClick={onClose} className="-mr-2 -mt-1" />}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-separator">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

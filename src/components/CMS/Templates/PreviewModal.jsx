import React from 'react';
import { X } from 'lucide-react';
import PageMockup from './PageMockup';

// The app opened in the middle of the screen: scroll it like the real thing. ✕ sits top-right.
const PreviewModal = ({ page, template, onClose }) => (
  <div className="fixed inset-0 z-[95] bg-black/50 flex items-center justify-center" onClick={onClose}>
    <button
      type="button"
      aria-label="Close preview"
      onClick={onClose}
      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center"
    >
      <X size={18} />
    </button>
    <div onClick={(e) => e.stopPropagation()} className={page.platform === 'web' ? 'w-[min(1240px,92vw)]' : ''}>
      <PageMockup page={page} templateId={template.id} gap={48} zoom={0.92} />
    </div>
  </div>
);

export default PreviewModal;

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

// Right-side slide-in panel for create/edit/detail views — the page behind stays visible and
// dimmed. Same shell everywhere: header (title, status, ×), optional tabs, scrollable body,
// sticky footer. Escape and scrim click close it, matching Modal's behavior.
const Drawer = ({ open = true, onClose, title, status, tabs, activeTab, onTabChange, children, footer, width = 'max-w-[560px]', headerActions }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="cms fixed inset-0 z-[100] flex justify-end bg-black/30 animate-scrim-in"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`w-full ${width} h-full bg-surface shadow-raised animate-drawer-in flex flex-col`}>
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-separator">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {onClose && <IconButton icon={X} label="Close" onClick={onClose} className="-ml-2 shrink-0" />}
              <h2 className="text-[17px] leading-[22px] font-semibold tracking-[-0.01em] text-label truncate">{title}</h2>
              {status}
            </div>
            {headerActions}
          </div>

          {tabs && (
            <div className="flex items-center gap-5 mt-4 -mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onTabChange(tab.value)}
                  className={`pb-3 text-[13px] font-medium border-b-2 transition-colors ${
                    activeTab === tab.value
                      ? 'border-accent text-label'
                      : 'border-transparent text-secondary hover:text-label'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && <div className="shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-separator">{footer}</div>}
      </div>
    </div>
  );
};

export default Drawer;

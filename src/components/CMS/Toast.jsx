import React, { useCallback, useState } from 'react';
import { ToastContext } from './ToastContext';

// Bottom-centre, auto-hide, one line, optional Undo — mounted once by CmsShell, used anywhere
// below it via useToast().
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((text, { undo } = {}) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, undo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="cms flex items-center gap-3 bg-label text-white text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-raised animate-sheet-in"
          >
            <span>{t.text}</span>
            {t.undo && (
              <button
                type="button"
                onClick={() => {
                  t.undo();
                  setToasts((cur) => cur.filter((x) => x.id !== t.id));
                }}
                className="text-accent font-semibold hover:opacity-80"
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

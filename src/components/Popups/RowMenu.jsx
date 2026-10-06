import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { IconButton } from '../cms-ui';

// Small overflow menu — keeps one control per row instead of three inline links.
const RowMenu = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <IconButton
        icon={MoreHorizontal}
        label="More actions"
        size={18}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={isOpen ? 'bg-fill text-label' : ''}
      />

      {isOpen && (
        // Grows out of the trigger's corner so it reads as coming from the button.
        <div className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-xl shadow-raised z-20 p-1 origin-top-right transition-[opacity,transform] duration-200 ease-apple starting:opacity-0 starting:scale-95">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                item.onSelect();
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[14px] text-left transition-colors ${
                item.tone === 'danger'
                  ? 'text-danger hover:bg-danger-soft'
                  : 'text-label hover:bg-fill [&>svg]:text-secondary'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RowMenu;

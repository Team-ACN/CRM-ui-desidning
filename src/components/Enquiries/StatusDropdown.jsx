import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { FALLBACK_STATUS_STYLE } from './enquiryConstants';

const DROPDOWN_HEIGHT = 140;

const StatusDropdown = ({ value, options, styles, onChange }) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = () => {
    if (ref.current) {
      const { bottom } = ref.current.getBoundingClientRect();
      setDropUp(bottom + DROPDOWN_HEIGHT > window.innerHeight);
    }
    setOpen((prev) => !prev);
  };

  const style = styles[value] || FALLBACK_STATUS_STYLE;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${style.trigger}`}
      >
        {value}
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 z-20 w-full min-w-[150px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm text-gray-900 text-left truncate transition-colors ${
                (styles[option] || FALLBACK_STATUS_STYLE).option
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;

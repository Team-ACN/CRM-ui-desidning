import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n) => String(n).padStart(2, '0');
const toIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// One calendar, two clicks: first click sets the start, second sets the end (earlier clicks swap).
// The range shades as you move the pointer between the two clicks.
const DateRangePicker = ({ start, end, max, onChange }) => {
  const anchor = start ? new Date(`${start}T00:00:00`) : new Date();
  const [view, setView] = useState({ year: anchor.getFullYear(), month: anchor.getMonth() });
  const [hover, setHover] = useState(null);

  const picking = !!start && !end;
  const first = new Date(view.year, view.month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const days = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const cells = [...days, ...Array(42 - days.length).fill(null)];

  const nextDisabled = !!max && nextMonthStart() > max;

  function nextMonthStart() {
    const d = new Date(view.year, view.month + 1, 1);
    return toIso(d.getFullYear(), d.getMonth(), 1);
  }

  function shift(delta) {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  }

  function pick(iso) {
    if (!start || end) {
      onChange(iso, '');
    } else if (iso < start) {
      onChange(iso, start);
    } else {
      onChange(start, iso);
    }
    setHover(null);
  }

  const rangeEnd = end || (picking && hover && hover >= start ? hover : '');

  return (
    <div className="rounded-2xl border border-separator p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100">
          <ChevronLeft size={15} />
        </button>
        <span className="text-[13px] font-semibold text-label">
          {MONTHS[view.month]} {view.year}
        </span>
        <button type="button" disabled={nextDisabled} onClick={() => shift(1)} aria-label="Next month" className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed">
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] text-tertiary mb-1">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7" onMouseLeave={() => setHover(null)}>
        {cells.map((day, i) => {
          if (!day) return <span key={`b${i}`} />;
          const iso = toIso(view.year, view.month, day);
          const disabled = !!max && iso > max;
          const isStart = iso === start;
          const isEnd = iso === rangeEnd;
          const inRange = !!start && !!rangeEnd && iso > start && iso < rangeEnd;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => pick(iso)}
              onMouseEnter={() => picking && setHover(iso)}
              className={`h-8 text-[12.5px] tabular-nums transition-colors disabled:text-neutral-300 disabled:cursor-not-allowed ${
                isStart || isEnd
                  ? 'bg-neutral-900 text-white font-semibold'
                  : inRange
                  ? 'bg-neutral-200 text-label'
                  : 'text-label hover:bg-neutral-100'
              } ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''} ${isStart && (isEnd || !rangeEnd) ? 'rounded-full' : ''} ${!isStart && !isEnd && !inRange ? 'rounded-full' : ''}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateRangePicker;

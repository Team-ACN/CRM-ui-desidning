import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TIME_SLOTS } from './callbackSlots';

// Same quick-pick pattern as the Edge post editor's "Published At" picker and the Agent
// Connect panel's Call Back scheduler — a mini day-grid calendar next to a grid of hour
// chips, click-to-select only, no typing.
const CallbackCalendarAndTimePicker = ({ callbackDate, callbackTime, onSelectDate, onSelectTime }) => {
  const [viewDate, setViewDate] = useState(() => (callbackDate ? new Date(`${callbackDate}T00:00:00`) : new Date()));

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const now = useMemo(() => new Date(), []);
  const currentHour = now.getHours();
  const todayStr = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }, [today]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  // Drop the trailing 8 PM slot so the remaining 10 slots fill a clean 2-column, 5-row grid
  // next to the calendar — no odd one left over on its own.
  const gridTimeSlots = TIME_SLOTS.slice(0, -1);

  const formatSummary = () => {
    if (!callbackDate) return 'Select date and time';
    const parsed = new Date(`${callbackDate}T${callbackTime || '10:00'}`);
    const dateFormatted = parsed.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    const slot = TIME_SLOTS.find((s) => s.value === callbackTime);
    return callbackTime ? `${dateFormatted} at ${slot?.label || callbackTime}` : `${dateFormatted} (select time)`;
  };

  return (
    <div className="border border-neutral-200 rounded-2xl p-4">
      <div className="grid grid-cols-[2fr_1fr] divide-x divide-neutral-200">
        {/* Calendar */}
        <div className="pr-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-neutral-800">{monthName}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
              <span key={idx} className="text-[10px] font-medium text-neutral-400">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {days.map((dayNum, i) => {
              if (dayNum === null) return <div key={`empty-${i}`} className="h-7" />;
              const pad = (n) => String(n).padStart(2, '0');
              const dStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
              const thisDate = new Date(year, month, dayNum);
              thisDate.setHours(0, 0, 0, 0);
              const isPast = thisDate < today;
              const isSelected = callbackDate === dStr;

              return (
                <button
                  key={dStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => onSelectDate(dStr)}
                  className={`h-7 w-full text-[12px] rounded-md border font-medium transition-colors flex items-center justify-center ${
                    isSelected
                      ? 'bg-white border-neutral-900 text-neutral-900 font-semibold'
                      : isPast
                        ? 'border-transparent text-neutral-300 cursor-not-allowed'
                        : 'border-transparent text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time */}
        <div className="pl-4">
          <div className="grid grid-cols-2 gap-1.5">
            {gridTimeSlots.map((t) => {
              const slotHour = parseInt(t.value.split(':')[0], 10);
              const isPastTime = callbackDate === todayStr && slotHour <= currentHour;
              const isSelected = callbackTime === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  disabled={isPastTime}
                  onClick={() => onSelectTime(t.value)}
                  className={`py-2 rounded-lg border text-[12px] font-medium text-center transition-colors ${
                    isSelected
                      ? 'bg-white border-neutral-900 text-neutral-900 font-semibold'
                      : isPastTime
                        ? 'bg-neutral-50 border-transparent text-neutral-300 cursor-not-allowed'
                        : 'bg-neutral-50 border-transparent text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[12px] text-neutral-500 pt-3 mt-3 border-t border-neutral-100">
        <span>Scheduled:</span>
        <span className="font-semibold text-neutral-900">{formatSummary()}</span>
      </div>
    </div>
  );
};

export default CallbackCalendarAndTimePicker;

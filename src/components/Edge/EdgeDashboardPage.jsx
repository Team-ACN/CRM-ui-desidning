import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Building2, LayoutDashboard, ArrowRight } from 'lucide-react';
import { getPosts, getProjects } from '../../data/mockEdge';

function ActivityCalendar({ title, activityMap, weeks, getStyle, type, showLabels = true }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  const dayOffset = startDate.getDay();
  const currentWeekMonday = startDate.getDate() - dayOffset + (dayOffset === 0 ? -6 : 1);
  startDate.setDate(currentWeekMonday - (weeks - 1) * 7);

  const days = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ date: d, key, count: activityMap[key] || 0 });
  }

  const calendarColumns = [];
  for (let i = 0; i < weeks; i++) {
    calendarColumns.push(days.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className="bg-white border border-stone-200 rounded-[2rem] p-8 shadow-sm w-full lg:w-fit flex-1">
      {title && <h2 className="text-xl font-bold text-stone-900 mb-6">{title}</h2>}
      <div className="overflow-x-auto pb-4 hide-scrollbar">
        <div className="inline-flex gap-2">
          {showLabels && (
            <div className="flex flex-col gap-2 text-[11px] font-bold text-stone-400 mt-6 pr-4">
              <div className="h-10 flex items-center justify-end">Mon</div>
              <div className="h-10 flex items-center justify-end">Tue</div>
              <div className="h-10 flex items-center justify-end">Wed</div>
              <div className="h-10 flex items-center justify-end">Thu</div>
              <div className="h-10 flex items-center justify-end">Fri</div>
              <div className="h-10 flex items-center justify-end">Sat</div>
              <div className="h-10 flex items-center justify-end">Sun</div>
              <div className="h-10 mt-2 flex items-center justify-end text-stone-400 font-bold uppercase">Total</div>
            </div>
          )}

          {calendarColumns.map((week, wIdx) => {
            const firstDayOfMonth = week.find(d => d.date.getDate() === 1);
            const monthLabel = firstDayOfMonth ? firstDayOfMonth.date.toLocaleString('default', { month: 'short' }) : '';
            return (
              <div key={wIdx} className="flex flex-col gap-2">
                <div className="text-[11px] font-bold text-stone-400 h-4 flex items-end">{monthLabel}</div>
                {week.map(day => {
                  const isFuture = day.date > today;
                  if (isFuture) {
                    return <div key={day.key} className="w-14 h-10 rounded-xl" />;
                  }
                  return (
                    <div
                      key={day.key}
                      className={`w-14 h-10 rounded-xl flex items-center justify-center text-sm transition-all duration-300 hover:scale-110 hover:-translate-y-1 z-10 hover:z-20 ${getStyle(day.count)}`}
                      title={`${day.count} ${type}${day.count !== 1 ? 's' : ''} on ${day.date.toLocaleDateString()}`}
                    >
                      {day.count > 0 ? day.count : '-'}
                    </div>
                  );
                })}
                <div className="w-14 h-10 mt-2 rounded-xl bg-transparent text-stone-500 flex items-center justify-center text-sm font-bold">
                  {week.reduce((acc, d) => acc + d.count, 0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function activityStyle(count) {
  if (count === 0) return 'bg-stone-50 text-stone-300 border border-stone-200';
  if (count === 1) return 'bg-neutral-50 text-neutral-600 border border-neutral-200 font-black';
  if (count === 2) return 'bg-neutral-100 text-neutral-700 border border-neutral-300 font-black';
  return 'bg-neutral-900 text-white border border-neutral-900 font-black shadow-md';
}

function buildActivityMap(items) {
  const map = {};
  items.forEach(item => {
    const dStr = item.published_at || item.created_at;
    if (!dStr) return;
    const d = new Date(dStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

const NAV_CARDS = [
  { to: '/edge/posts', label: 'Posts', icon: Newspaper },
  { to: '/edge/projects', label: 'Projects', icon: Building2 },
  { to: '/edge/home', label: 'Home Feed', icon: LayoutDashboard },
];

export default function EdgeDashboardPage() {
  const [postActivityMap] = useState(() => buildActivityMap(getPosts()));
  const [projectActivityMap] = useState(() => buildActivityMap(getProjects()));
  const [loading] = useState(false);

  return (
    <div className="pb-20 bg-stone-50 min-h-screen">
      <div className="w-full px-6 md:px-10 pt-12 space-y-12">

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-stone-900">Edge</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NAV_CARDS.map((card) => {
            const CardIcon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="group relative bg-white border border-stone-200 rounded-[2rem] p-7 flex flex-col justify-between overflow-hidden hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 hover:-translate-y-1 transition-all duration-300 min-h-[140px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 text-neutral-700 flex items-center justify-center group-hover:bg-neutral-700 group-hover:text-white transition-colors duration-300">
                  <CardIcon size={24} strokeWidth={2} />
                </div>
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-1">{card.label}</h2>
                </div>
                <ArrowRight size={20} className="absolute bottom-7 right-7 text-neutral-700 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            );
          })}
        </div>

        {!loading && (
          <div className="flex flex-col lg:flex-row gap-8">
            <ActivityCalendar title="Posts" activityMap={postActivityMap} weeks={5} getStyle={activityStyle} type="post" showLabels={true} />
            <ActivityCalendar title="Projects" activityMap={projectActivityMap} weeks={5} getStyle={activityStyle} type="project" showLabels={false} />
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Copy, Eye, MousePointerClick } from 'lucide-react';
import { Drawer, Chip, Button, useToast } from './index';
import DateRangePicker from './DateRangePicker';
import { getClickInsights } from '../../data/mockCms';

const iso = (date) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
};
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

const PRESETS = [
  { key: 'yesterday', label: 'Yesterday', start: () => daysAgo(1), end: () => daysAgo(1) },
  { key: '2d', label: 'Last 2 days', start: () => daysAgo(1), end: () => daysAgo(0) },
  { key: '7d', label: 'Last 7 days', start: () => daysAgo(6), end: () => daysAgo(0) },
];

const fmt = (n) => n.toLocaleString('en-IN');
const ctr = (clicks, views) => (views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0');
const pretty = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const ClickInsightsDrawer = ({ onClose }) => {
  const toast = useToast();
  const [applied, setApplied] = useState({ start: PRESETS[2].start(), end: PRESETS[2].end() });
  const [draft, setDraft] = useState(applied);

  const data = getClickInsights(applied.start, applied.end);
  const activePreset = PRESETS.find((p) => p.start() === applied.start && p.end() === applied.end);
  const canSearch = !!draft.start && !!draft.end && (draft.start !== applied.start || draft.end !== applied.end);

  function applyPreset(p) {
    const range = { start: p.start(), end: p.end() };
    setDraft(range);
    setApplied(range);
  }

  function copy(list, label) {
    if (!list.length) {
      toast('No CPIDs in this range');
      return;
    }
    navigator.clipboard?.writeText(list.join('\n')).then(() => toast(`Copied ${list.length} CPIDs · ${label}`));
  }

  const copyBtn = (list, label, title = 'Copy CPIDs who clicked') => (
    <button type="button" title={title} onClick={(e) => { e.stopPropagation(); copy(list, label); }} className="text-tertiary hover:text-neutral-900">
      <Copy size={12} />
    </button>
  );

  return (
    <Drawer title="Click insights" onClose={onClose}>
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Chip key={p.key} label={p.label} selected={activePreset === p && !canSearch} onClick={() => applyPreset(p)} />
            ))}
          </div>
          <DateRangePicker
            start={draft.start}
            end={draft.end}
            max={daysAgo(0)}
            onChange={(start, end) => setDraft({ start, end })}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12.5px] text-secondary tabular-nums">
              {pretty(draft.start)} {draft.end && draft.end !== draft.start ? `– ${pretty(draft.end)}` : draft.start && !draft.end ? '– pick end date' : ''}
            </p>
            <Button variant="primary" size="sm" disabled={!canSearch} onClick={() => setApplied({ ...draft })}>
              Search
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-neutral-100 p-3.5">
            <div className="flex items-center justify-between">
              <Eye size={15} className="text-secondary" aria-label="Total views" />
              {copyBtn(data.viewers, 'viewers', 'Copy CPIDs who saw')}
            </div>
            <p className="text-[22px] font-semibold text-label tabular-nums mt-0.5">{fmt(data.totalViews)}</p>
          </div>
          <div className="rounded-xl bg-neutral-100 p-3.5">
            <div className="flex items-center justify-between">
              <MousePointerClick size={15} className="text-secondary" aria-label="Total clicks" />
              {copyBtn(data.cpids, 'all')}
            </div>
            <p className="text-[22px] font-semibold text-label tabular-nums mt-0.5">{fmt(data.totalClicks)}</p>
          </div>
          <div className="rounded-xl bg-neutral-100 p-3.5">
            <p className="text-[12px] text-secondary">CTR</p>
            <p className="text-[22px] font-semibold text-label tabular-nums mt-0.5">{ctr(data.totalClicks, data.totalViews)}%</p>
          </div>
        </div>

        <div>
          <p className="text-[13px] font-medium text-label mb-2">Where the clicks came from</p>
          {data.rows.length === 0 ? (
            <p className="text-[13px] text-tertiary">No data in this date range.</p>
          ) : (
            <div className="rounded-2xl border border-separator divide-y divide-separator overflow-hidden">
              {data.rows.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-medium text-label truncate">{r.name}</span>
                    <span className="block text-[11.5px] text-tertiary">{r.type}</span>
                  </span>
                  <Numbers views={r.views} clicks={r.clicks} viewBtn={copyBtn(r.viewers, r.name, 'Copy CPIDs who saw')} clickBtn={copyBtn(r.cpids, r.name)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

function Numbers({ views, clicks, viewBtn, clickBtn }) {
  return (
    <span className="shrink-0 flex items-center gap-3 text-[12px] text-secondary tabular-nums">
      <span title="Views" className="flex items-center gap-1">
        <Eye size={12} /> {fmt(views)} {viewBtn}
      </span>
      <span title="Clicks" className="flex items-center gap-1 text-label font-medium">
        <MousePointerClick size={12} /> {fmt(clicks)} {clickBtn}
      </span>
      <span title="CTR" className="w-10 text-right">{ctr(clicks, views)}%</span>
    </span>
  );
}

export default ClickInsightsDrawer;

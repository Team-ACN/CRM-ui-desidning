import React from 'react';
import { Eye, Copy, MousePointerClick } from 'lucide-react';

// Views / clicks / click rate with copy-CPID icons. `trailing` (e.g. an archive icon) sits at the right.
const PostStats = ({ analytics, onCopy, trailing = null }) => {
  if (!analytics) return trailing ? <div className="flex justify-end">{trailing}</div> : null;
  const views = analytics.views ?? analytics.viewsOverall;
  const clicks = analytics.clicks ?? analytics.clicksOverall;
  const btn = 'text-tertiary hover:text-neutral-900';
  return (
    <div className="flex items-center gap-4 text-[12px] text-secondary tabular-nums">
      <span className="flex items-center gap-1.5">
        <Eye size={12} /> {views.toLocaleString('en-IN')}
        <button type="button" title="Copy CPIDs who saw" onClick={() => onCopy(analytics.viewerCpids, 'viewer')} className={btn}>
          <Copy size={11} />
        </button>
      </span>
      <span className="flex items-center gap-1.5">
        <MousePointerClick size={12} /> {clicks.toLocaleString('en-IN')}
        <button type="button" title="Copy CPIDs who clicked" onClick={() => onCopy(analytics.clickerCpids, 'clicker')} className={btn}>
          <Copy size={11} />
        </button>
      </span>
      <span className="font-medium text-neutral-700">{views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0'}%</span>
      {trailing && <span className="ml-auto">{trailing}</span>}
    </div>
  );
};

export default PostStats;

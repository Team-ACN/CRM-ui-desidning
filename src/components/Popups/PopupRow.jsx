import React from 'react';
import { Image as ImageIcon, Lock, Pencil, Eye, Power } from 'lucide-react';
import { mockCohorts } from '../../data/mockCohorts';
import StatusChip from './StatusChip';
import RowMenu from './RowMenu';
import { clickThroughRate, formatCount, formatPct } from './popupStats';

const audienceOf = (popup) => {
  const include = popup.cohortIncludeIds || [];
  if (include.length === 0) return 'All users';
  if (include.length === 1) {
    return mockCohorts.find((c) => c.id === include[0])?.name || include[0];
  }
  return `${include.length} cohorts`;
};

const capOf = (popup) => {
  const max = popup.frequency?.maxImpressions ?? 1;
  return max === 1 ? 'shows once' : `up to ${max}×`;
};

const PopupRow = ({ popup, rank, isFirst, isLast, onPreview, onEdit, onToggle }) => {
  const creative = popup.imageUrl || popup.imageUrlDesktop;
  const menuItems = [{ label: 'Preview', icon: <Eye size={15} />, onSelect: () => onPreview(popup) }];

  if (!popup.managedExternally) {
    menuItems.push({ label: 'Edit', icon: <Pencil size={15} />, onSelect: () => onEdit(popup) });

    if (popup.status !== 'Draft' && popup.status !== 'Not Live') {
      menuItems.push({
        label: popup.isActive ? 'Turn off' : 'Turn on',
        icon: <Power size={15} />,
        tone: popup.isActive ? 'danger' : undefined,
        onSelect: () => onToggle(popup.id),
      });
    }
  }

  return (
    <div
      onClick={() => onPreview(popup)}
      className={`group flex items-center gap-4 px-4 py-3 bg-white cursor-pointer transition-colors hover:bg-gray-50 ${
        isLast ? '' : 'border-b border-gray-100'
      } ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
    >
      <span className="w-5 text-xs font-semibold text-gray-400 tabular-nums shrink-0">{rank}</span>

      {/* Creative */}
      <div className="w-10 h-[50px] rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
        {creative ? (
          <img src={creative} alt="" className="w-full h-full object-cover" />
        ) : popup.managedExternally ? (
          <Lock size={14} className="text-gray-400" />
        ) : (
          <ImageIcon size={14} className="text-gray-400" />
        )}
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{popup.name || 'Untitled popup'}</p>
          {popup.managedExternally && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 shrink-0">
              App-managed
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {audienceOf(popup)} · {capOf(popup)}
        </p>
      </div>

      {/* Performance */}
      <div className="w-28 text-right shrink-0 hidden lg:block">
        {popup.stats?.impressions ? (
          <>
            <p className="text-sm font-semibold text-gray-900 tabular-nums">
              {formatCount(popup.stats.impressions)}
            </p>
            <p className="text-[11px] text-gray-400 tabular-nums">
              {formatPct(clickThroughRate(popup))} CTR
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-300">No data yet</p>
        )}
      </div>

      {/* Status + actions */}
      <div className="w-24 shrink-0">
        <StatusChip status={popup.status} />
      </div>
      <RowMenu items={menuItems} />
    </div>
  );
};

export default PopupRow;

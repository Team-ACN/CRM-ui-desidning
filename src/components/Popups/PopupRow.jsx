import React from 'react';
import { Image as ImageIcon, Lock, Pencil, Eye, Power } from 'lucide-react';
import { mockCohorts } from '../../data/mockCohorts';
import { ListRow } from '../cms-ui';
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

const PopupRow = ({ popup, rank, onPreview, onEdit, onToggle }) => {
  const creative = popup.imageUrl || popup.imageUrlDesktop;
  const menuItems = [{ label: 'Preview', icon: <Eye size={16} strokeWidth={1.75} />, onSelect: () => onPreview(popup) }];

  if (!popup.managedExternally) {
    menuItems.push({ label: 'Edit', icon: <Pencil size={16} strokeWidth={1.75} />, onSelect: () => onEdit(popup) });

    if (popup.status !== 'Draft' && popup.status !== 'Not Live') {
      menuItems.push({
        label: popup.isActive ? 'Turn off' : 'Turn on',
        icon: <Power size={16} strokeWidth={1.75} />,
        tone: popup.isActive ? 'danger' : undefined,
        onSelect: () => onToggle(popup.id),
      });
    }
  }

  return (
    <ListRow onClick={() => onPreview(popup)} className="group">
      <span className="w-4 text-[13px] text-tertiary tabular-nums text-right shrink-0">{rank}</span>

      {/* Creative */}
      <div className="w-10 h-[50px] rounded-lg overflow-hidden bg-fill shrink-0 flex items-center justify-center">
        {creative ? (
          <img src={creative} alt="" className="w-full h-full object-cover" />
        ) : popup.managedExternally ? (
          <Lock size={14} strokeWidth={1.75} className="text-tertiary" />
        ) : (
          <ImageIcon size={14} strokeWidth={1.75} className="text-tertiary" />
        )}
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-[15px] font-medium tracking-[-0.01em] text-label truncate">
            {popup.name || 'Untitled popup'}
          </p>
          {popup.managedExternally && (
            <span className="text-[12px] text-tertiary shrink-0">App-managed</span>
          )}
        </div>
        <p className="text-[13px] text-secondary truncate mt-0.5">
          {audienceOf(popup)} · {capOf(popup)}
        </p>
      </div>

      {/* Performance */}
      <div className="w-28 text-right shrink-0 hidden lg:block">
        {popup.stats?.impressions ? (
          <>
            <p className="text-[14px] font-semibold text-label tabular-nums">
              {formatCount(popup.stats.impressions)}
            </p>
            <p className="text-[12px] text-tertiary tabular-nums">
              {formatPct(clickThroughRate(popup))} CTR
            </p>
          </>
        ) : (
          <p className="text-[13px] text-tertiary">No data yet</p>
        )}
      </div>

      {/* Status + actions */}
      <div className="w-24 shrink-0">
        <StatusChip status={popup.status} />
      </div>
      <RowMenu items={menuItems} />
    </ListRow>
  );
};

export default PopupRow;

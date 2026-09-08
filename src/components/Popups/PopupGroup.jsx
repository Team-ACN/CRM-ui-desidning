import React from 'react';
import PopupRow from './PopupRow';

// One trigger context = one competition. Rank order is shown here; changing it
// happens in the Manage priority screen so a stray drag can't reshuffle live traffic.
const PopupGroup = ({ group, ...rowHandlers }) => {
  const liveCount = group.items.filter((p) => p.status === 'Live').length;

  return (
    <section>
      <div className="flex items-baseline justify-between px-4 mb-2">
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{group.label}</h3>
        <p className="text-[11px] text-gray-400">
          {group.items.length} popup{group.items.length === 1 ? '' : 's'}
          {liveCount > 1 && ' · top live one wins'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        {group.items.map((popup, index) => (
          <PopupRow
            key={popup.id}
            popup={popup}
            rank={index + 1}
            isFirst={index === 0}
            isLast={index === group.items.length - 1}
            {...rowHandlers}
          />
        ))}
      </div>
    </section>
  );
};

export default PopupGroup;

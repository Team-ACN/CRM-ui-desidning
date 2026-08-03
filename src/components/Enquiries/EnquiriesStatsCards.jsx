import React from 'react';

const TILE_STYLES =
  'px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 rounded transition-all text-left';

const StatTile = ({ label, value, active, onClick }) => (
  <button
    onClick={onClick}
    className={`${TILE_STYLES} ${active ? 'border-gray-900 bg-gray-100' : ''}`}
  >
    <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
  </button>
);

const EnquiriesStatsCards = ({ stats, activeKey, onSelect }) => {
  return (
    <div className="grid grid-cols-12 gap-3 mb-4">
      {stats.map((stat) => {
        const overallKey = `${stat.key}:overall`;
        const todayKey = `${stat.key}:today`;

        return (
          <div
            key={stat.key}
            className="col-span-2 bg-white px-2.5 py-2 rounded-lg border border-gray-100 shadow-sm"
          >
            <p className="text-[11px] font-medium text-gray-600 mb-1.5 truncate" title={stat.label}>
              {stat.label}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <StatTile
                label="Overall"
                value={stat.overall}
                active={activeKey === overallKey}
                onClick={() => onSelect(stat, { today: false })}
              />
              <StatTile
                label="Today"
                value={stat.today}
                active={activeKey === todayKey}
                onClick={() => onSelect(stat, { today: true })}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnquiriesStatsCards;

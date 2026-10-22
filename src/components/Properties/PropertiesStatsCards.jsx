import React from 'react';

const PropertiesStatsCards = ({ stats }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white px-8 py-3 rounded-xl border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            {stat.subLabel && <span className="text-[11px] font-normal text-gray-400 whitespace-nowrap">{stat.subLabel}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertiesStatsCards;

import React from 'react';

const PropertiesStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default PropertiesStatsCards;

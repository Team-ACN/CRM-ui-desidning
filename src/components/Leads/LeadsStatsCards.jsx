import React from 'react';

const LeadsStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-8 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default LeadsStatsCards;

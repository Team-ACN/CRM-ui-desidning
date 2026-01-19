import React from 'react';

const QCDashboardStatsCards = ({ stats }) => {
  return (
    <div className="flex gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm min-w-[150px]">
          <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default QCDashboardStatsCards;

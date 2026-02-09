import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityCard = ({ card, kamFilter }) => {
  const navigate = useNavigate();
  const Icon = card.icon;

  const handleClick = () => {
    let url = `${card.targetUrl}?${card.filterKey}=${card.filterValue}`;
    // Add KAM filter if not "all"
    if (kamFilter && kamFilter !== 'all') {
      url += `&kam=${kamFilter}`;
    }
    navigate(url);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white px-3 py-2.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer text-left w-full group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`p-1.5 rounded-md ${card.bgColor}`}>
          <Icon size={14} className={card.color} />
        </div>
        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-600 transition-colors truncate">
          {card.label}
        </p>
      </div>
      
      <p className="text-xl font-bold text-gray-900 pl-0.5">
        {card.count.toLocaleString()}
      </p>
    </button>
  );
};

export default ActivityCard;

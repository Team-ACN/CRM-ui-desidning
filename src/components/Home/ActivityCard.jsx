import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityCard = ({ card, kamFilter }) => {
  const navigate = useNavigate();
  const Icon = card.icon;

  const handleClick = (filterValue) => {
    let url = `${card.targetUrl}?${card.filterKey}=${filterValue || card.filterValue}`;
    if (kamFilter && kamFilter !== 'all') {
      url += `&kam=${kamFilter}`;
    }
    navigate(url);
  };

  const hasSubSections = card.subSections && card.subSections.length > 0;

  // Consistent card wrapper styles
  const cardBaseStyles = "bg-white px-3 py-3 rounded-lg border border-gray-100 shadow-sm h-full";

  if (hasSubSections) {
    return (
      <div className={cardBaseStyles}>
        {/* Card Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-md ${card.bgColor}`}>
            <Icon size={14} className={card.color} />
          </div>
          <p className="text-xs font-medium text-gray-600 truncate">
            {card.label}
          </p>
        </div>
        
        {/* Sub-sections as clickable buttons */}
        <div className="grid grid-cols-2 gap-2">
          {card.subSections.map((section) => (
            <button
              key={section.label}
              onClick={() => handleClick(section.filterValue)}
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 rounded-md transition-all cursor-pointer text-left group"
            >
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                {section.label}
              </p>
              <p className="text-lg font-bold text-gray-900 group-hover:text-gray-700">
                {section.count}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Regular card
  return (
    <button
      onClick={() => handleClick()}
      className={`${cardBaseStyles} hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer text-left w-full group`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-md ${card.bgColor}`}>
          <Icon size={14} className={card.color} />
        </div>
        <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700 transition-colors truncate">
          {card.label}
        </p>
      </div>
      
      <p className="text-xl font-bold text-gray-900">
        {card.count.toLocaleString()}
      </p>
    </button>
  );
};

export default ActivityCard;

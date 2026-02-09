import React, { useState } from 'react';
import { Home, Calendar, BarChart3, ChevronDown, User } from 'lucide-react';
import ActivityCard from './ActivityCard';
import { activityCards, userData, kamList } from '../../data/mockHome';

const HomePage = () => {
  const [selectedKam, setSelectedKam] = useState('samarth');
  const [isKamDropdownOpen, setIsKamDropdownOpen] = useState(false);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format current date
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get selected KAM name
  const getSelectedKamName = () => {
    const kam = kamList.find(k => k.id === selectedKam);
    return kam ? kam.name : 'All KAMs';
  };

  return (
    <div className="pb-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Home size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getGreeting()}, {userData.name}
            </h1>
            <p className="text-sm text-gray-500">
              Here's your daily activity overview
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* KAM Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsKamDropdownOpen(!isKamDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User size={16} className="text-gray-400" />
              <span>{getSelectedKamName()}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isKamDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isKamDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {kamList.map((kam) => (
                    <button
                      key={kam.id}
                      onClick={() => {
                        setSelectedKam(kam.id);
                        setIsKamDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedKam === kam.id 
                          ? 'bg-gray-100 text-gray-900 font-medium' 
                          : 'text-gray-600'
                      }`}
                    >
                      {kam.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{formatDate()}</span>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Section Title with KAM indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
            <p className="text-sm text-gray-500">
              {selectedKam === 'all' 
                ? 'Showing data for all KAMs' 
                : `Showing data for ${getSelectedKamName()}`}
            </p>
          </div>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {activityCards.map((card) => (
            <ActivityCard key={card.id} card={card} kamFilter={selectedKam} />
          ))}
        </div>

        {/* Dashboard Placeholder */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <BarChart3 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Dashboards Coming Soon
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Analytics and performance dashboards will be available here. 
              Track your KAM metrics, agent performance, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

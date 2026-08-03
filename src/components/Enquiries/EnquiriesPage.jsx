import React, { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import EnquiriesStatsCards from './EnquiriesStatsCards';
import EnquiriesFilters from './EnquiriesFilters';
import EnquiriesTable from './EnquiriesTable';
import { DEFAULT_FILTERS, TODAY_PRESET } from './enquiryConstants';
import { buildStatCards, filterEnquiries } from './enquiryStats';
import { mockEnquiries } from '../../data/mockEnquiries';

const EnquiriesPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeStatKey, setActiveStatKey] = useState(null);

  const filteredEnquiries = useMemo(
    () => filterEnquiries(mockEnquiries, filters),
    [filters]
  );

  const stats = useMemo(
    () => buildStatCards(mockEnquiries, filteredEnquiries),
    [filteredEnquiries]
  );

  // Overall tile filters on the metric alone, Today tile adds the date filter
  const handleStatSelect = (stat, { today }) => {
    const key = `${stat.key}:${today ? 'today' : 'overall'}`;

    if (key === activeStatKey) {
      setActiveStatKey(null);
      setFilters(DEFAULT_FILTERS);
      return;
    }

    setActiveStatKey(key);
    setFilters((prev) => ({
      ...prev,
      selected: { ...stat.filter },
      date: today ? TODAY_PRESET : null,
    }));
  };

  const handleFiltersChange = (next) => {
    setActiveStatKey(null);
    setFilters(next);
  };

  // Custom Header for Enquiries
  const Header = () => (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-gray-900">Enquiry</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Add Enquiry Button */}
        <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={18} />
          Add Enquiry
        </button>
      </div>
    </header>
  );

  return (
    <div className="pb-8">
      <Header />
      <div className="px-6">
        <EnquiriesStatsCards
          stats={stats}
          activeKey={activeStatKey}
          onSelect={handleStatSelect}
        />
        <EnquiriesFilters filters={filters} onChange={handleFiltersChange} />
        <EnquiriesTable enquiries={filteredEnquiries} />
      </div>
    </div>
  );
};

export default EnquiriesPage;

import React from 'react';
import { Search, UserPlus } from 'lucide-react';
import LeadsStatsCards from './LeadsStatsCards';
import LeadsFilters from './LeadsFilters';
import LeadsTable from './LeadsTable';
import { mockLeadsStats, mockLeads } from '../../data/mockLeads';

const LeadsPage = () => {
    // Custom Header for Leads
  const Header = () => (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-gray-900">Leads (16267)</h1>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search name and number" 
            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Add Lead Button */}
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <UserPlus size={18} />
          Add Lead
        </button>
      </div>
    </header>
  );

  return (
    <div className="pb-8">
      {/* Note: In a real app, header might be in Layout, but for prototype specific header details differ */}
      <Header /> 
      <div className="px-6"> 
        <LeadsStatsCards stats={mockLeadsStats} />
        <LeadsFilters />
        <LeadsTable leads={mockLeads} />
      </div>
    </div>
  );
};

export default LeadsPage;

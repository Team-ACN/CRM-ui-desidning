import React from 'react';
import { Search, Plus } from 'lucide-react';
import RequirementsStatsCards from './RequirementsStatsCards';
import RequirementsFilters from './RequirementsFilters';
import RequirementsTable from './RequirementsTable';
import { mockRequirementsStats, mockRequirements } from '../../data/mockRequirements';

const RequirementsPage = () => {
  // Custom Header for Requirements
  const Header = () => (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-gray-900">Requirement</h1>
      
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

        {/* Add Requirement Button */}
        <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={18} />
          Add Requirement
        </button>
      </div>
    </header>
  );

  return (
    <div className="pb-8">
      <Header />
      <div className="px-6">
        <RequirementsStatsCards stats={mockRequirementsStats} />
        <RequirementsFilters />
        <RequirementsTable requirements={mockRequirements} />
      </div>
    </div>
  );
};

export default RequirementsPage;

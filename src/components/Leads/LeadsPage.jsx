import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UserPlus, X } from 'lucide-react';
import LeadsStatsCards from './LeadsStatsCards';
import LeadsFilters from './LeadsFilters';
import LeadsTable from './LeadsTable';
import { mockLeadsStats, mockLeads } from '../../data/mockLeads';

const LeadsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get filter from URL
  const statusFilter = searchParams.get('status');
  
  // Filter leads based on URL params
  const filteredLeads = useMemo(() => {
    let result = [...mockLeads];
    
    if (statusFilter) {
      const statusMap = {
        'form_filled': (l) => l.verificationStatus !== 'Not Started',
        'form_skipped': (l) => l.verificationStatus === 'Not Started' && l.leadStatus === 'Not Interested',
      };
      
      if (statusMap[statusFilter]) {
        result = result.filter(statusMap[statusFilter]);
      }
    }
    
    return result;
  }, [statusFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchParams({});
  };

  // Get active filter label
  const getActiveFilterLabel = () => {
    if (statusFilter) {
      const labels = {
        'form_filled': 'Forms Filled',
        'form_skipped': 'Forms Skipped'
      };
      return labels[statusFilter] || statusFilter;
    }
    return null;
  };

  const activeFilter = getActiveFilterLabel();

  // Custom Header for Leads
  const Header = () => (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-gray-900">
        Leads ({filteredLeads.length})
      </h1>
      
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
      <Header />
      <div className="px-6">
        <LeadsStatsCards stats={mockLeadsStats} />
        
        {/* Active Filter Badge */}
        {activeFilter && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Active filter:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded-full">
              {activeFilter}
              <button 
                onClick={clearFilters}
                className="p-0.5 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </span>
            <span className="text-sm text-gray-400">
              ({filteredLeads.length} results)
            </span>
          </div>
        )}
        
        <LeadsFilters />
        <LeadsTable leads={filteredLeads} />
      </div>
    </div>
  );
};

export default LeadsPage;

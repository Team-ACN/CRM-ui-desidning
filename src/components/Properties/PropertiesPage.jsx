import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import PropertiesStatsCards from './PropertiesStatsCards';
import PropertiesFilters from './PropertiesFilters';
import PropertiesTable from './PropertiesTable';
import { mockPropertiesStats, mockProperties } from '../../data/mockProperties';

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get filter from URL
  const statusFilter = searchParams.get('status');
  
  // Filter properties based on URL params
  const filteredProperties = useMemo(() => {
    let result = [...mockProperties];
    
    if (statusFilter) {
      const statusMap = {
        'delisted': (p) => p.status === 'De-Listed' || p.status === 'Delisted',
        'to_be_delisted': (p) => p.status === 'Hold', // Simulating "to be delisted" as Hold
        'available': (p) => p.status === 'Available',
        'sold': (p) => p.status === 'Sold',
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
        'delisted': 'Delisted Inventories',
        'to_be_delisted': 'To Be Delisted',
        'available': 'Available',
        'sold': 'Sold'
      };
      return labels[statusFilter] || statusFilter;
    }
    return null;
  };

  const activeFilter = getActiveFilterLabel();

  // Custom Header for Properties
  const Header = () => (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-gray-900">
        Properties ({filteredProperties.length})
      </h1>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search properties..." 
            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Add Inventory Button */}
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={18} />
          Add Inventory
        </button>
      </div>
    </header>
  );

  return (
    <div className="pb-8">
      <Header />
      <div className="px-6">
        <PropertiesStatsCards stats={mockPropertiesStats} />
        
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
              ({filteredProperties.length} results)
            </span>
          </div>
        )}
        
        <PropertiesFilters />
        <PropertiesTable properties={filteredProperties} />
      </div>
    </div>
  );
};

export default PropertiesPage;

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Header from '../Layout/Header';
import StatsCards from './StatsCards';
import Filters from './Filters';
import AgentsTable from './AgentsTable';
import { mockStats, mockAgents } from '../../data/mockAgents';

const AgentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get filters from URL
  const planFilter = searchParams.get('plan');
  const statusFilter = searchParams.get('status');
  const kamFilter = searchParams.get('kam');
  
  // Filter agents based on URL params
  const filteredAgents = useMemo(() => {
    let result = [...mockAgents];
    
    if (planFilter) {
      result = result.filter(agent => 
        agent.plan.toLowerCase() === planFilter.toLowerCase()
      );
    }
    
    if (statusFilter) {
      // Map status filter values to agent properties
      const statusMap = {
        't3_calling': (a) => a.agentStatus === 'Not Contact',
        'callback': (a) => a.lastStatus === 'Connected',
        'new_assigned': (a) => a.lastConnected === 'Never',
      };
      
      if (statusMap[statusFilter]) {
        result = result.filter(statusMap[statusFilter]);
      }
    }
    
    // Filter by KAM
    if (kamFilter) {
      result = result.filter(agent => 
        agent.kam.toLowerCase() === kamFilter.toLowerCase()
      );
    }
    
    return result;
  }, [planFilter, statusFilter, kamFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
  };

  // Get active filters as array
  const getActiveFilters = () => {
    const filters = [];
    
    if (planFilter) {
      filters.push({
        key: 'plan',
        label: `Plan: ${planFilter.charAt(0).toUpperCase() + planFilter.slice(1)}`
      });
    }
    
    if (statusFilter) {
      const labels = {
        't3_calling': 'T-3 Calling',
        'callback': 'Call Back',
        'new_assigned': 'New Agents Assigned'
      };
      filters.push({
        key: 'status',
        label: labels[statusFilter] || statusFilter
      });
    }
    
    if (kamFilter) {
      filters.push({
        key: 'kam',
        label: `KAM: ${kamFilter.charAt(0).toUpperCase() + kamFilter.slice(1)}`
      });
    }
    
    return filters;
  };

  const activeFilters = getActiveFilters();

  // Remove a specific filter
  const removeFilter = (filterKey) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterKey);
    setSearchParams(newParams);
  };

  return (
    <div className="pb-8">
      <Header />
      <div className="p-6">
        <StatsCards stats={mockStats} />
        
        {/* Active Filter Badges */}
        {activeFilters.length > 0 && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {activeFilters.map((filter) => (
              <span 
                key={filter.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded-full"
              >
                {filter.label}
                <button 
                  onClick={() => removeFilter(filter.key)}
                  className="p-0.5 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {activeFilters.length > 1 && (
              <button 
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            )}
            <span className="text-sm text-gray-400">
              ({filteredAgents.length} results)
            </span>
          </div>
        )}
        
        <Filters />
        <AgentsTable agents={filteredAgents} />
      </div>
    </div>
  );
};

export default AgentsPage;

import React from 'react';
import StatsCards from './StatsCards';
import Filters from './Filters';
import AgentsTable from './AgentsTable';
import { mockStats, mockAgents } from '../../data/mockAgents';

const AgentsPage = () => {
  return (
    <div className="pb-8">
      <StatsCards stats={mockStats} />
      <Filters />
      <AgentsTable agents={mockAgents} />
    </div>
  );
};

export default AgentsPage;

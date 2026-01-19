import React from 'react';
import Header from '../Layout/Header';
import StatsCards from './StatsCards';
import Filters from './Filters';
import AgentsTable from './AgentsTable';
import { mockStats, mockAgents } from '../../data/mockAgents';

const AgentsPage = () => {
  return (
    <div className="pb-8">
      <Header />
      <div className="p-6">
        <StatsCards stats={mockStats} />
        <Filters />
        <AgentsTable agents={mockAgents} />
      </div>
    </div>
  );
};

export default AgentsPage;

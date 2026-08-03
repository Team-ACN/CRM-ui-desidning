import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AgentsPage from './components/Agents/AgentsPage';
import LeadsPage from './components/Leads/LeadsPage';
import PropertiesPage from './components/Properties/PropertiesPage';
import RequirementsPage from './components/Requirements/RequirementsPage';
import EnquiriesPage from './components/Enquiries/EnquiriesPage';
import QCDashboardPage from './components/QCDashboard/QCDashboardPage';
import FinancePage from './components/Finance/FinancePage';
import CohortsPage from './components/Cohorts/CohortsPage';
import HomePage from './components/Home/HomePage';
import AgentDetailsPage from './components/Agents/AgentDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="/enquiries" element={<EnquiriesPage />} />
          <Route path="/qc-dashboard" element={<QCDashboardPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/cms" element={<CohortsPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

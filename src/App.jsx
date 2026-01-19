import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AgentsPage from './components/Agents/AgentsPage';
import LeadsPage from './components/Leads/LeadsPage';
import PropertiesPage from './components/Properties/PropertiesPage';
import RequirementsPage from './components/Requirements/RequirementsPage';
import QCDashboardPage from './components/QCDashboard/QCDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/agents" replace />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="/qc-dashboard" element={<QCDashboardPage />} />
          <Route path="*" element={<Navigate to="/agents" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

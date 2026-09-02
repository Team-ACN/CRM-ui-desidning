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
import BulkUploadPage from './components/BulkUpload/BulkUploadPage';
import EdgeDashboardPage from './components/Edge/EdgeDashboardPage';
import EdgeHomeFeedPage from './components/Edge/EdgeHomeFeedPage';
import EdgePostsPage from './components/Edge/EdgePostsPage';
import EdgePostEditorPage from './components/Edge/EdgePostEditorPage';
import EdgeProjectsPage from './components/Edge/EdgeProjectsPage';
import EdgeDevelopersPage from './components/Edge/EdgeDevelopersPage';
import EdgeProjectEditorPage from './components/Edge/EdgeProjectEditorPage';

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
          <Route path="/bulk-upload" element={<BulkUploadPage />} />
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="/enquiries" element={<EnquiriesPage />} />
          <Route path="/qc-dashboard" element={<QCDashboardPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/cms" element={<CohortsPage />} />
          <Route path="/edge" element={<EdgeDashboardPage />} />
          <Route path="/edge/home" element={<EdgeHomeFeedPage />} />
          <Route path="/edge/posts" element={<EdgePostsPage />} />
          <Route path="/edge/posts/new" element={<EdgePostEditorPage />} />
          <Route path="/edge/posts/:id" element={<EdgePostEditorPage />} />
          <Route path="/edge/projects" element={<EdgeProjectsPage />} />
          <Route path="/edge/project/developers" element={<EdgeDevelopersPage />} />
          <Route path="/edge/projects/new" element={<EdgeProjectEditorPage />} />
          <Route path="/edge/projects/:id" element={<EdgeProjectEditorPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

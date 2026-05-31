import { Route } from 'react-router-dom';
import Dashboard from '../../pages/hdmai/Dashboard';
import Usage from '../../pages/hdmai/Usage';
import ApiKeys from '../../pages/hdmai/ApiKeys';
import Users from '../../pages/hdmai/Users';
import Health from '../../pages/hdmai/Health';
import AIConfigPage from '../../pages/hdmai/AIConfig';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="usage" element={<Usage />} />
    <Route path="ai-config" element={<AIConfigPage />} />
    <Route path="api-keys" element={<ApiKeys />} />
    <Route path="users" element={<Users />} />
    <Route path="health" element={<Health />} />
  </>
);

export default routes;
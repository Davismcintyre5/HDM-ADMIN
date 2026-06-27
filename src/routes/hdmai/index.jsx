import { Route } from 'react-router-dom';
import Dashboard from '../../pages/hdmai/Dashboard';
import Users from '../../pages/hdmai/Users';
import AIKeys from '../../pages/hdmai/AIKeys';
import ProjectKeys from '../../pages/hdmai/ProjectKeys';
import Usage from '../../pages/hdmai/Usage';
import Health from '../../pages/hdmai/Health';
import Settings from '../../pages/hdmai/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="keys" element={<AIKeys />} />
    <Route path="project-keys" element={<ProjectKeys />} />
    <Route path="usage" element={<Usage />} />
    <Route path="health" element={<Health />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
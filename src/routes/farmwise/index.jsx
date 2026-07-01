import { Route } from 'react-router-dom';
import Dashboard from '../../pages/farmwise/Dashboard';
import Users from '../../pages/farmwise/Users';
import Settings from '../../pages/farmwise/Settings';
import Health from '../../pages/farmwise/Health';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="settings" element={<Settings />} />
    <Route path="health" element={<Health />} />
  </>
);

export default routes;
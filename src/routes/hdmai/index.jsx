import { Route } from 'react-router-dom';
import Dashboard from '../../pages/hdmai/Dashboard';
import ApiKeys from '../../pages/hdmai/ApiKeys';
import Users from '../../pages/hdmai/Users';
import Health from '../../pages/hdmai/Health';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="api-keys" element={<ApiKeys />} />
    <Route path="users" element={<Users />} />
    <Route path="health" element={<Health />} />
  </>
);

export default routes;
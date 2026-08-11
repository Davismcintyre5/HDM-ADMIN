import { Route } from 'react-router-dom';
import Dashboard from '../../pages/farmvexa/Dashboard';
import Users from '../../pages/farmvexa/Users';
import Approvals from '../../pages/farmvexa/Approvals';
import Farms from '../../pages/farmvexa/Farms';
import Models from '../../pages/farmvexa/Models';
import Usage from '../../pages/farmvexa/Usage';
import Health from '../../pages/farmvexa/Health';
import Settings from '../../pages/farmvexa/Settings';
import Payments from '../../pages/farmvexa/Payments';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="approvals" element={<Approvals />} />
    <Route path="farms" element={<Farms />} />
    <Route path="models" element={<Models />} />
    <Route path="usage" element={<Usage />} />
    <Route path="health" element={<Health />} />
    <Route path="settings" element={<Settings />} />
    <Route path="payments" element={<Payments />} />
  </>
);

export default routes;
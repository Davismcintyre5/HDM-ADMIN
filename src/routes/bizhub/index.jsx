import { Route } from 'react-router-dom';
import Dashboard from '../../pages/bizhub/Dashboard';
import Tenants from '../../pages/bizhub/Tenants';
import Approvals from '../../pages/bizhub/Approvals';
import Plans from '../../pages/bizhub/Plans';
import Payments from '../../pages/bizhub/Payments';
import Analytics from '../../pages/bizhub/Analytics';
import Communication from '../../pages/bizhub/Communication';
import Settings from '../../pages/bizhub/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="tenants" element={<Tenants />} />
    <Route path="approvals" element={<Approvals />} />
    <Route path="plans" element={<Plans />} />
    <Route path="payments" element={<Payments />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="communication" element={<Communication />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
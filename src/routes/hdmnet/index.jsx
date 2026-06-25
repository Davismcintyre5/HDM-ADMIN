import { Route } from 'react-router-dom';
import Dashboard from '../../pages/hdmnet/Dashboard';
import Owners from '../../pages/hdmnet/Owners';
import OwnerDetail from '../../pages/hdmnet/OwnerDetail';
import Plans from '../../pages/hdmnet/Plans';
import Settings from '../../pages/hdmnet/Settings';
import Backups from '../../pages/hdmnet/Backups';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="owners" element={<Owners />} />
    <Route path="owners/:id" element={<OwnerDetail />} />
    <Route path="plans" element={<Plans />} />
    <Route path="settings" element={<Settings />} />
    <Route path="backups" element={<Backups />} />
  </>
);

export default routes;
import { Route } from 'react-router-dom';
import Dashboard from '../../pages/flax/Dashboard';
import Admins from '../../pages/flax/Admins';
import Settings from '../../pages/flax/Settings';
import Legals from '../../pages/flax/Legals';
import Financial from '../../pages/flax/Financial';
import Backups from '../../pages/flax/Backups';
import System from '../../pages/flax/System';
import Users from '../../pages/flax/Users';
import UserDetail from '../../pages/flax/UserDetail';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="admins" element={<Admins />} />
    <Route path="settings" element={<Settings />} />
    <Route path="legals" element={<Legals />} />
    <Route path="financial" element={<Financial />} />
    <Route path="backups" element={<Backups />} />
    <Route path="system" element={<System />} />
    <Route path="users" element={<Users />} />
    <Route path="users/:id" element={<UserDetail />} />
  </>
);

export default routes;
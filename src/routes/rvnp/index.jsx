import { Route } from 'react-router-dom';
import Dashboard from '../../pages/rvnp/Dashboard';
import Users from '../../pages/rvnp/Users';
import UserDetail from '../../pages/rvnp/UserDetail';
import VerificationQueue from '../../pages/rvnp/VerificationQueue';
import Moderation from '../../pages/rvnp/Moderation';
import Spotlight from '../../pages/rvnp/Spotlight';
import Support from '../../pages/rvnp/Support';
import SupportDetail from '../../pages/rvnp/SupportDetail';
import Reports from '../../pages/rvnp/Reports';
import Announcements from '../../pages/rvnp/Announcements';
import Analytics from '../../pages/rvnp/Analytics';
import Payments from '../../pages/rvnp/Payments';
import Plans from '../../pages/rvnp/Plans';
import Health from '../../pages/rvnp/Health';
import Backups from '../../pages/rvnp/Backups';
import Settings from '../../pages/rvnp/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="users/:id" element={<UserDetail />} />
    <Route path="verification-queue" element={<VerificationQueue />} />
    <Route path="moderation" element={<Moderation />} />
    <Route path="spotlight" element={<Spotlight />} />
    <Route path="support" element={<Support />} />
    <Route path="support/:id" element={<SupportDetail />} />
    <Route path="reports" element={<Reports />} />
    <Route path="announcements" element={<Announcements />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="payments" element={<Payments />} />
    <Route path="plans" element={<Plans />} />
    <Route path="health" element={<Health />} />
    <Route path="backups" element={<Backups />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
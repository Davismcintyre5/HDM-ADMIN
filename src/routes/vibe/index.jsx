import { Route } from 'react-router-dom';
import Dashboard from '../../pages/vibe/Dashboard';
import Users from '../../pages/vibe/Users';
import Moderation from '../../pages/vibe/Moderation';
import Reports from '../../pages/vibe/Reports';
import Verification from '../../pages/vibe/Verification';
import Payments from '../../pages/vibe/Payments';
import Broadcast from '../../pages/vibe/Broadcast';
import Settings from '../../pages/vibe/Settings';
import ComingSoon from '../../shared/pages/ComingSoon';
import Analytics from '../../pages/vibe/Analytics';


const Placeholder = () => <ComingSoon />;

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="moderation" element={<Moderation />} />
    <Route path="reports" element={<Reports />} />
    <Route path="verification" element={<Verification />} />
    <Route path="payments" element={<Payments />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="broadcast" element={<Broadcast />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
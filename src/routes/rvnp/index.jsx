import { Route } from 'react-router-dom';
import Dashboard from '../../pages/rvnp/Dashboard';
import Users from '../../pages/rvnp/Users';
import Moderation from '../../pages/rvnp/Moderation';
import Reports from '../../pages/rvnp/Reports';
import AuditLogs from '../../pages/rvnp/AuditLogs';
import Analytics from '../../pages/rvnp/Analytics';
import Legals from '../../pages/rvnp/Legals';
import Backups from '../../pages/rvnp/Backups';
import Settings from '../../pages/rvnp/Settings';
import Health from '../../pages/rvnp/Health';


const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="moderation" element={<Moderation />} />
    <Route path="reports" element={<Reports />} />
    <Route path="audit-logs" element={<AuditLogs />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="legals" element={<Legals />} />
    <Route path="backups" element={<Backups />} />
    <Route path="settings" element={<Settings />} />
    <Route path="health" element={<Health />} />
  </>
);

export default routes;
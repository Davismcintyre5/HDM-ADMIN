import { Route } from 'react-router-dom';
import Dashboard from '../../pages/eduprime/Dashboard';
import Schools from '../../pages/eduprime/Schools';
import SchoolDetail from '../../pages/eduprime/SchoolDetail';
import PendingApprovals from '../../pages/eduprime/PendingApprovals';
import Support from '../../pages/eduprime/Support';
import Legals from '../../pages/eduprime/Legals';
import Backups from '../../pages/eduprime/Backups';
import Logs from '../../pages/eduprime/Logs';
import Health from '../../pages/eduprime/Health';
import Settings from '../../pages/eduprime/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="schools" element={<Schools />} />
    <Route path="schools/:id" element={<SchoolDetail />} />
    <Route path="pending" element={<PendingApprovals />} />
    <Route path="support" element={<Support />} />
    <Route path="legals" element={<Legals />} />
    <Route path="backups" element={<Backups />} />
    <Route path="logs" element={<Logs />} />
    <Route path="health" element={<Health />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
import { Route } from 'react-router-dom';
import Dashboard from '../../pages/hdmai2/Dashboard';
import Users from '../../pages/hdmai2/Users';
import ApiKeys from '../../pages/hdmai2/ApiKeys';
import Jobs from '../../pages/hdmai2/Jobs';
import Models from '../../pages/hdmai2/Models';
import Plans from '../../pages/hdmai2/Plans';
import Legals from '../../pages/hdmai2/Legals';
import Health from '../../pages/hdmai2/Health';
import Settings from '../../pages/hdmai2/Settings';
import Logs from '../../pages/hdmai2/Logs';
import Backup from '../../pages/hdmai2/Backup';
import Payments from '../../pages/hdmai2/Payments';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="api-keys" element={<ApiKeys />} />
    <Route path="jobs" element={<Jobs />} />
    <Route path="models" element={<Models />} />
    <Route path="plans" element={<Plans />} />
    <Route path="legals" element={<Legals />} />
    <Route path="health" element={<Health />} />
    <Route path="settings" element={<Settings />} />
    <Route path="logs" element={<Logs />} />
    <Route path="backup" element={<Backup />} />
    <Route path="payments" element={<Payments />} />
  </>
);

export default routes;
import { Route } from 'react-router-dom';
import Dashboard from '../../pages/nexguard/Dashboard';
import Clients from '../../pages/nexguard/Clients';
import ClientDetail from '../../pages/nexguard/ClientDetail';
import Approvals from '../../pages/nexguard/Approvals';
import Payments from '../../pages/nexguard/Payments';
import PaymentMethods from '../../pages/nexguard/PaymentMethods';
import Plans from '../../pages/nexguard/Plans';
import Admins from '../../pages/nexguard/Admins';
import Legal from '../../pages/nexguard/Legal';
import Backups from '../../pages/nexguard/Backups';
import Health from '../../pages/nexguard/Health';
import Settings from '../../pages/nexguard/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="clients" element={<Clients />} />
    <Route path="clients/:id" element={<ClientDetail />} />
    <Route path="approvals" element={<Approvals />} />
    <Route path="payments" element={<Payments />} />
    <Route path="payment-methods" element={<PaymentMethods />} />
    <Route path="plans" element={<Plans />} />
    <Route path="admins" element={<Admins />} />
    <Route path="legal" element={<Legal />} />
    <Route path="backups" element={<Backups />} />
    <Route path="health" element={<Health />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
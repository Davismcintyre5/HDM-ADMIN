import { Route } from 'react-router-dom';
import Dashboard from '../../pages/smartpos/Dashboard';
import Clients from '../../pages/smartpos/Clients';
import ClientDetail from '../../pages/smartpos/ClientDetail';
import Subscriptions from '../../pages/smartpos/Subscriptions';
import Payments from '../../pages/smartpos/Payments';
import Plans from '../../pages/smartpos/Plans';
import PaymentMethods from '../../pages/smartpos/PaymentMethods';
import Ai from '../../pages/smartpos/Ai';
import Analytics from '../../pages/smartpos/Analytics';
import Revenue from '../../pages/smartpos/Revenue';
import Notifications from '../../pages/smartpos/Notifications';
import Admins from '../../pages/smartpos/Admins';
import AuditLogs from '../../pages/smartpos/AuditLogs';
import Backups from '../../pages/smartpos/Backups';
import Legal from '../../pages/smartpos/Legal';
import Health from '../../pages/smartpos/Health';
import Settings from '../../pages/smartpos/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="clients" element={<Clients />} />
    <Route path="clients/:id" element={<ClientDetail />} />
    <Route path="subscriptions" element={<Subscriptions />} />
    <Route path="payments" element={<Payments />} />
    <Route path="plans" element={<Plans />} />
    <Route path="payment-methods" element={<PaymentMethods />} />
    <Route path="ai" element={<Ai />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="revenue" element={<Revenue />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="admins" element={<Admins />} />
    <Route path="audit" element={<AuditLogs />} />
    <Route path="backups" element={<Backups />} />
    <Route path="legal" element={<Legal />} />
    <Route path="health" element={<Health />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
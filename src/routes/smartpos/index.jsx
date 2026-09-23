import { Route } from 'react-router-dom';

import Dashboard from '../../pages/smartpos/Dashboard';
import Clients from '../../pages/smartpos/Clients';
import ClientDetail from '../../pages/smartpos/ClientDetail';
import Pending from '../../pages/smartpos/Pending';
import PendingDetail from '../../pages/smartpos/PendingDetail';
import Plans from '../../pages/smartpos/Plans';
import PaymentMethods from '../../pages/smartpos/PaymentMethods';
import Settings from '../../pages/smartpos/Settings';
import Legal from '../../pages/smartpos/Legal';
import LegalEditor from '../../pages/smartpos/LegalEditor';
import Backups from '../../pages/smartpos/Backups';
import AiUsage from '../../pages/smartpos/AiUsage';
import AuditLogs from '../../pages/smartpos/AuditLogs';
import Health from '../../pages/smartpos/Health';
import Profile from '../../pages/smartpos/Profile';
import Forbidden from '../../pages/smartpos/Forbidden';
import NotFound from '../../pages/smartpos/NotFound';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />

    <Route path="clients" element={<Clients />} />
    <Route path="clients/:id" element={<ClientDetail />} />

    <Route path="pending" element={<Pending />} />
    <Route path="pending/:id" element={<PendingDetail />} />

    <Route path="plans" element={<Plans />} />
    <Route path="payment-methods" element={<PaymentMethods />} />

    <Route path="settings" element={<Settings />} />

    <Route path="legal" element={<Legal />} />
    <Route path="legal/:type" element={<LegalEditor />} />
    <Route path="legal/:type/:version" element={<LegalEditor />} />

    <Route path="backups" element={<Backups />} />
    <Route path="ai-usage" element={<AiUsage />} />
    <Route path="audit" element={<AuditLogs />} />
    <Route path="health" element={<Health />} />
    <Route path="profile" element={<Profile />} />

    <Route path="403" element={<Forbidden />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default routes;
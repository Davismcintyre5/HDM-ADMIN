import { Route } from 'react-router-dom';
import Dashboard from '../../pages/spark/Dashboard';
import Users from '../../pages/spark/Users';
import UserDetail from '../../pages/spark/UserDetail';
import Reports from '../../pages/spark/Reports';
import Tickets from '../../pages/spark/Tickets';
import TicketDetail from '../../pages/spark/TicketDetail';
import Moderation from '../../pages/spark/Moderation';
import Settings from '../../pages/spark/settings/Settings';
import GeneralSettings from '../../pages/spark/settings/General';
import PaymentsSettings from '../../pages/spark/settings/Payments';
import AIConfigSettings from '../../pages/spark/settings/AIConfig';
import SoundPacksSettings from '../../pages/spark/settings/SoundPacks';
import DeepLinksSettings from '../../pages/spark/settings/DeepLinks';
import LegalSettings from '../../pages/spark/settings/Legal';
import BackupsSettings from '../../pages/spark/settings/Backups';
import SystemSettings from '../../pages/spark/settings/System';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="users/:id" element={<UserDetail />} />
    <Route path="reports" element={<Reports />} />
    <Route path="reports/:id" element={<Reports />} />
    <Route path="tickets" element={<Tickets />} />
    <Route path="tickets/:id" element={<TicketDetail />} />
    <Route path="moderation" element={<Moderation />} />
    <Route path="settings" element={<Settings />}>
      <Route index element={<GeneralSettings />} />
      <Route path="general" element={<GeneralSettings />} />
      <Route path="payments" element={<PaymentsSettings />} />
      <Route path="ai-config" element={<AIConfigSettings />} />
      <Route path="sound-packs" element={<SoundPacksSettings />} />
      <Route path="deeplinks" element={<DeepLinksSettings />} />
      <Route path="legal" element={<LegalSettings />} />
      <Route path="backups" element={<BackupsSettings />} />
      <Route path="system" element={<SystemSettings />} />
    </Route>
  </>
);

export default routes;
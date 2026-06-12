import { Route } from 'react-router-dom';
import Dashboard from '../../pages/bizhub/Dashboard';
import Users from '../../pages/bizhub/Users';
import Subscriptions from '../../pages/bizhub/Subscriptions';
import Payments from '../../pages/bizhub/Payments';
import Reports from '../../pages/bizhub/Reports';
import Broadcast from '../../pages/bizhub/Broadcast';
import Settings from '../../pages/bizhub/Settings';
import SystemSettings from '../../pages/bizhub/settings/System';
import MaintenanceSettings from '../../pages/bizhub/settings/Maintenance';
import ContentSettings from '../../pages/bizhub/settings/Content';
import ChatbotSettings from '../../pages/bizhub/settings/Chatbot';
import AISettings from '../../pages/bizhub/settings/AI';
import LegalSettings from '../../pages/bizhub/settings/Legal';
import PaymentsSettingsTab from '../../pages/bizhub/settings/PaymentsSettings';
import AuditLogsSettings from '../../pages/bizhub/settings/AuditLogs';
import BackupsSettings from '../../pages/bizhub/settings/Backups';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="subscriptions" element={<Subscriptions />} />
    <Route path="payments" element={<Payments />} />
    <Route path="reports" element={<Reports />} />
    <Route path="broadcast" element={<Broadcast />} />
    <Route path="settings" element={<Settings />}>
      <Route index element={<SystemSettings />} />
      <Route path="system" element={<SystemSettings />} />
      <Route path="maintenance" element={<MaintenanceSettings />} />
      <Route path="content" element={<ContentSettings />} />
      <Route path="chatbot" element={<ChatbotSettings />} />
      <Route path="ai" element={<AISettings />} />
      <Route path="legal" element={<LegalSettings />} />
      <Route path="payments" element={<PaymentsSettingsTab />} />
      <Route path="audit" element={<AuditLogsSettings />} />
      <Route path="backups" element={<BackupsSettings />} />
    </Route>
  </>
);

export default routes;
import { Route } from 'react-router-dom';
import Dashboard from '../../pages/bridge/Dashboard';
import Users from '../../pages/bridge/Users';
import Payments from '../../pages/bridge/Payments';
import Plans from '../../pages/bridge/Plans';
import PaymentMethods from '../../pages/bridge/PaymentMethods';
import Settings from '../../pages/bridge/Settings';
import SystemSettings from '../../pages/bridge/settings/System';
import CurrencySettings from '../../pages/bridge/settings/Currency';
import AIWidgetSettings from '../../pages/bridge/settings/AIWidget';
import LegalSettings from '../../pages/bridge/settings/Legal';
import AnalyticsSettings from '../../pages/bridge/settings/Analytics';
import BackupSettings from '../../pages/bridge/settings/Backup';
import AdminsSettings from '../../pages/bridge/settings/Admins';
import AuditLogsSettings from '../../pages/bridge/settings/AuditLogs';
import HealthSettings from '../../pages/bridge/settings/Health';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="payments" element={<Payments />} />
    <Route path="plans" element={<Plans />} />
    <Route path="payment-methods" element={<PaymentMethods />} />
    <Route path="settings" element={<Settings />}>
      <Route index element={<SystemSettings />} />
      <Route path="system" element={<SystemSettings />} />
      <Route path="currency" element={<CurrencySettings />} />
      <Route path="ai-widget" element={<AIWidgetSettings />} />
      <Route path="legal" element={<LegalSettings />} />
      <Route path="analytics" element={<AnalyticsSettings />} />
      <Route path="backup" element={<BackupSettings />} />
      <Route path="admins" element={<AdminsSettings />} />
      <Route path="audit" element={<AuditLogsSettings />} />
      <Route path="health" element={<HealthSettings />} />
    </Route>
  </>
);

export default routes;
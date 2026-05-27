import { Route } from 'react-router-dom';
import Dashboard from '../../pages/vault/Dashboard';
import Approvals from '../../pages/vault/Approvals';
import Users from '../../pages/vault/Users';
import UsersList from '../../pages/vault/users/List';
import UserDetail from '../../pages/vault/users/Detail';
import Organizations from '../../pages/vault/Organizations';
import OrganizationsList from '../../pages/vault/organizations/List';
import OrganizationDetail from '../../pages/vault/organizations/Detail';
import Devices from '../../pages/vault/Devices';
import Payments from '../../pages/vault/Payments';
import AuditLogs from '../../pages/vault/AuditLogs';
import Settings from '../../pages/vault/Settings';
import SystemSettings from '../../pages/vault/settings/System';
import DownloadsSettings from '../../pages/vault/settings/Downloads';
import FeaturesSettings from '../../pages/vault/settings/Features';
import AISettings from '../../pages/vault/settings/AI';
import NotificationsSettings from '../../pages/vault/settings/Notifications';
import SecuritySettings from '../../pages/vault/settings/Security';
import ThreatIntelSettings from '../../pages/vault/settings/ThreatIntel';
import PlansSettings from '../../pages/vault/settings/Plans';
import LandingSettings from '../../pages/vault/settings/Landing';
import LegalSettings from '../../pages/vault/settings/Legal';
import BackupsSettings from '../../pages/vault/settings/Backups';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="approvals" element={<Approvals />} />
    <Route path="users" element={<Users />}>
      <Route index element={<UsersList />} />
      <Route path="list" element={<UsersList />} />
      <Route path="detail/:id" element={<UserDetail />} />
    </Route>
    <Route path="organizations" element={<Organizations />}>
      <Route index element={<OrganizationsList />} />
      <Route path="list" element={<OrganizationsList />} />
      <Route path="detail/:id" element={<OrganizationDetail />} />
    </Route>
    <Route path="devices" element={<Devices />} />
    <Route path="payments" element={<Payments />} />
    <Route path="audit" element={<AuditLogs />} />
    <Route path="settings" element={<Settings />}>
      <Route index element={<SystemSettings />} />
      <Route path="system" element={<SystemSettings />} />
      <Route path="downloads" element={<DownloadsSettings />} />
      <Route path="features" element={<FeaturesSettings />} />
      <Route path="ai" element={<AISettings />} />
      <Route path="notifications" element={<NotificationsSettings />} />
      <Route path="security" element={<SecuritySettings />} />
      <Route path="threat-intel" element={<ThreatIntelSettings />} />
      <Route path="plans" element={<PlansSettings />} />
      <Route path="landing" element={<LandingSettings />} />
      <Route path="legal" element={<LegalSettings />} />
      <Route path="backups" element={<BackupsSettings />} />
    </Route>
  </>
);

export default routes;
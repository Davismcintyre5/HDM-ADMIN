import { Route } from 'react-router-dom';
import Dashboard from '../../pages/hdmerp/Dashboard';
import Tenants from '../../pages/hdmerp/Tenants';
import TenantDetail from '../../pages/hdmerp/TenantDetail';
import Approvals from '../../pages/hdmerp/Approvals';
import Plans from '../../pages/hdmerp/Plans';
import Payments from '../../pages/hdmerp/Payments';
import AIConfig from '../../pages/hdmerp/AIConfig';
import Uploads from '../../pages/hdmerp/Uploads';
import Legal from '../../pages/hdmerp/Legal';
import Backups from '../../pages/hdmerp/Backups';
import Settings from '../../pages/hdmerp/settings/Settings';
import GeneralSettings from '../../pages/hdmerp/settings/General';
import BrandingSettings from '../../pages/hdmerp/settings/Branding';
import LandingSettings from '../../pages/hdmerp/settings/Landing';
import UploadsSettings from '../../pages/hdmerp/settings/UploadsSettings';
import DownloadsSettings from '../../pages/hdmerp/settings/Downloads';
import MaintenanceSettings from '../../pages/hdmerp/settings/Maintenance';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="tenants" element={<Tenants />} />
    <Route path="tenants/:id" element={<TenantDetail />} />
    <Route path="approvals" element={<Approvals />} />
    <Route path="plans" element={<Plans />} />
    <Route path="payments" element={<Payments />} />
    <Route path="ai-config" element={<AIConfig />} />
    <Route path="uploads" element={<Uploads />} />
    <Route path="legal" element={<Legal />} />
    <Route path="backups" element={<Backups />} />
    <Route path="settings" element={<Settings />}>
      <Route index element={<GeneralSettings />} />
      <Route path="general" element={<GeneralSettings />} />
      <Route path="branding" element={<BrandingSettings />} />
      <Route path="landing" element={<LandingSettings />} />
      <Route path="uploads" element={<UploadsSettings />} />
      <Route path="downloads" element={<DownloadsSettings />} />
      <Route path="maintenance" element={<MaintenanceSettings />} />
    </Route>
  </>
);

export default routes;
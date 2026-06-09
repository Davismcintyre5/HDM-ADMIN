import { Route } from 'react-router-dom';
import Dashboard from '../../pages/smartpos/Dashboard';
import Clients from '../../pages/smartpos/Clients';
import ClientDetail from '../../pages/smartpos/ClientDetail';
import Payments from '../../pages/smartpos/Payments';
import Subscription from '../../pages/smartpos/Subscription';
import AIConfigPage from '../../pages/smartpos/AIConfig';
import Communication from '../../pages/smartpos/Communication';
import Backups from '../../pages/smartpos/Backups';
import Compose from '../../pages/smartpos/Compose';
import Settings from '../../pages/smartpos/settings/Settings';
import SystemSettings from '../../pages/smartpos/settings/System';
import PaymentMethodsSettings from '../../pages/smartpos/settings/PaymentMethods';
import CurrencySettings from '../../pages/smartpos/settings/Currency';
import ContentSettings from '../../pages/smartpos/settings/Content';
import InquiriesSettings from '../../pages/smartpos/settings/Inquiries';
import LegalSettings from '../../pages/smartpos/settings/Legal';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="clients" element={<Clients />} />
    <Route path="clients/:id" element={<ClientDetail />} />
    <Route path="payments" element={<Payments />} />
    <Route path="subscription" element={<Subscription />} />
    <Route path="ai-config" element={<AIConfigPage />} />
    <Route path="communication" element={<Communication />} />
    <Route path="backups" element={<Backups />} />
    <Route path="compose" element={<Compose />} />
    <Route path="settings" element={<Settings />}>
      <Route index element={<SystemSettings />} />
      <Route path="system" element={<SystemSettings />} />
      <Route path="payment-methods" element={<PaymentMethodsSettings />} />
      <Route path="currency" element={<CurrencySettings />} />
      <Route path="content" element={<ContentSettings />} />
      <Route path="inquiries" element={<InquiriesSettings />} />
      <Route path="legal" element={<LegalSettings />} />
    </Route>
  </>
);

export default routes;
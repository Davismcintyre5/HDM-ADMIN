import { Route } from 'react-router-dom';

import Dashboard from '../../pages/pharmasys/Dashboard';
import Tenants from '../../pages/pharmasys/Tenants';
import TenantDetail from '../../pages/pharmasys/TenantDetail';
import Pending from '../../pages/pharmasys/Pending';
import PendingDetail from '../../pages/pharmasys/PendingDetail';
import Plans from '../../pages/pharmasys/Plans';
import Payments from '../../pages/pharmasys/Payments';
import PaymentDetail from '../../pages/pharmasys/PaymentDetail';
import Invoices from '../../pages/pharmasys/Invoices';
import InvoiceDetail from '../../pages/pharmasys/InvoiceDetail';
import PaymentMethods from '../../pages/pharmasys/PaymentMethods';
import Settings from '../../pages/pharmasys/Settings';
import AuditLogs from '../../pages/pharmasys/AuditLogs';
import Backups from '../../pages/pharmasys/Backups';
import Legal from '../../pages/pharmasys/Legal';
import LegalEditor from '../../pages/pharmasys/LegalEditor';
import Health from '../../pages/pharmasys/Health';
import Profile from '../../pages/pharmasys/Profile';
import Forbidden from '../../pages/pharmasys/Forbidden';
import NotFound from '../../pages/pharmasys/NotFound';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />

    <Route path="tenants" element={<Tenants />} />
    <Route path="tenants/:id" element={<TenantDetail />} />

    <Route path="pending" element={<Pending />} />
    <Route path="pending/:id" element={<PendingDetail />} />

    <Route path="plans" element={<Plans />} />

    <Route path="payments" element={<Payments />} />
    <Route path="payments/:id" element={<PaymentDetail />} />

    <Route path="invoices" element={<Invoices />} />
    <Route path="invoices/:id" element={<InvoiceDetail />} />

    <Route path="payment-methods" element={<PaymentMethods />} />

    <Route path="settings" element={<Settings />} />

    <Route path="audit-logs" element={<AuditLogs />} />

    <Route path="backups" element={<Backups />} />

    <Route path="legal" element={<Legal />} />
    <Route path="legal/:type" element={<LegalEditor />} />

    <Route path="health" element={<Health />} />

    <Route path="profile" element={<Profile />} />

    <Route path="403" element={<Forbidden />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default routes;
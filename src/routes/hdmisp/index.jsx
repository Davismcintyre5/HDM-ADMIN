import { Route } from 'react-router-dom';
import Dashboard from '../../pages/hdmisp/Dashboard';
import Health from '../../pages/hdmisp/Health';
import PendingProviders from '../../pages/hdmisp/PendingProviders';
import PendingProviderDetail from '../../pages/hdmisp/PendingProviderDetail';
import Providers from '../../pages/hdmisp/Providers';
import ProviderDetail from '../../pages/hdmisp/ProviderDetail';
import Transactions from '../../pages/hdmisp/Transactions';
import TransactionDetail from '../../pages/hdmisp/TransactionDetail';
import PendingPayments from '../../pages/hdmisp/PendingPayments';
import BillingPlans from '../../pages/hdmisp/BillingPlans';
import Invoices from '../../pages/hdmisp/Invoices';
import InvoiceDetail from '../../pages/hdmisp/InvoiceDetail';
import PaymentMethods from '../../pages/hdmisp/PaymentMethods';
import Legal from '../../pages/hdmisp/Legal';
import Notifications from '../../pages/hdmisp/Notifications';
import Reports from '../../pages/hdmisp/Reports';
import Admins from '../../pages/hdmisp/Admins';
import Settings from '../../pages/hdmisp/Settings';
import Profile from '../../pages/hdmisp/Profile';
import Forbidden from '../../pages/hdmisp/Forbidden';
import NotFound from '../../pages/hdmisp/NotFound';

const hdmispRoutes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="health" element={<Health />} />

    <Route path="pending" element={<PendingProviders />} />
    <Route path="pending/:id" element={<PendingProviderDetail />} />

    <Route path="providers" element={<Providers />} />
    <Route path="providers/:id" element={<ProviderDetail />} />

    <Route path="transactions" element={<Transactions />} />
    <Route path="transactions/:id" element={<TransactionDetail />} />
    <Route path="pending-payments" element={<PendingPayments />} />

    <Route path="billing-plans" element={<BillingPlans />} />
    <Route path="invoices" element={<Invoices />} />
    <Route path="invoices/:id" element={<InvoiceDetail />} />

    <Route path="payment-methods" element={<PaymentMethods />} />
    <Route path="legal" element={<Legal />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="reports" element={<Reports />} />
    <Route path="admins" element={<Admins />} />
    <Route path="settings" element={<Settings />} />
    <Route path="profile" element={<Profile />} />

    <Route path="forbidden" element={<Forbidden />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default hdmispRoutes;
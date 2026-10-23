import { Route } from 'react-router-dom';

import Dashboard from '../../pages/meteo/Dashboard';
import Pending from '../../pages/meteo/Pending';
import PendingDetail from '../../pages/meteo/PendingDetail';
import Tenants from '../../pages/meteo/Tenants';
import TenantDetail from '../../pages/meteo/TenantDetail';
import Users from '../../pages/meteo/Users';
import UserDetail from '../../pages/meteo/UserDetail';
import Plans from '../../pages/meteo/Plans';
import Invoices from '../../pages/meteo/Invoices';
import InvoiceDetail from '../../pages/meteo/InvoiceDetail';
import Payments from '../../pages/meteo/Payments';
import PaymentDetail from '../../pages/meteo/PaymentDetail';
import Settings from '../../pages/meteo/Settings';
import PaymentMethods from '../../pages/meteo/PaymentMethods';
import ApiKeys from '../../pages/meteo/ApiKeys';
import Backups from '../../pages/meteo/Backups';
import Health from '../../pages/meteo/Health';
import Admins from '../../pages/meteo/Admins';
import Profile from '../../pages/meteo/Profile';
import Forbidden from '../../pages/meteo/Forbidden';
import NotFound from '../../pages/meteo/NotFound';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />

    <Route path="pending" element={<Pending />} />
    <Route path="pending/:id" element={<PendingDetail />} />

    <Route path="tenants" element={<Tenants />} />
    <Route path="tenants/:id" element={<TenantDetail />} />

    <Route path="users" element={<Users />} />
    <Route path="users/:id" element={<UserDetail />} />

    <Route path="plans" element={<Plans />} />

    <Route path="invoices" element={<Invoices />} />
    <Route path="invoices/:id" element={<InvoiceDetail />} />

    <Route path="payments" element={<Payments />} />
    <Route path="payments/:id" element={<PaymentDetail />} />

    <Route path="settings" element={<Settings />} />
    <Route path="payment-methods" element={<PaymentMethods />} />
    <Route path="api-keys" element={<ApiKeys />} />
    <Route path="backups" element={<Backups />} />
    <Route path="health" element={<Health />} />
    <Route path="admins" element={<Admins />} />
    <Route path="profile" element={<Profile />} />

    <Route path="403" element={<Forbidden />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default routes;
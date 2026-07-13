import { Route } from 'react-router-dom';
import Dashboard from '../../pages/marketbridge/Dashboard';
import StoresList from '../../pages/marketbridge/StoresList';
import PendingApprovals from '../../pages/marketbridge/PendingApprovals';
import StoreDetail from '../../pages/marketbridge/StoreDetail';
import DisputesList from '../../pages/marketbridge/DisputesList';
import Commissions from '../../pages/marketbridge/Commissions';
import Plans from '../../pages/marketbridge/Plans';
import Settings from '../../pages/marketbridge/Settings';
import Communication from '../../pages/marketbridge/Communication';
import Customers from '../../pages/marketbridge/Customers';
import Shipping from '../../pages/marketbridge/Shipping';
import Categories from '../../pages/marketbridge/Categories';
import Orders from '../../pages/marketbridge/Orders';
import Payouts from '../../pages/marketbridge/Payouts';
import Accounts from '../../pages/marketbridge/Accounts';
import Agents from '../../pages/marketbridge/Agents';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="stores" element={<StoresList />} />
    <Route path="stores/pending" element={<PendingApprovals />} />
    <Route path="stores/:id" element={<StoreDetail />} />
    <Route path="customers" element={<Customers />} />
    <Route path="communication" element={<Communication />} />
    <Route path="categories" element={<Categories />} />
    <Route path="orders" element={<Orders />} />
    <Route path="disputes" element={<DisputesList />} />
    <Route path="commissions" element={<Commissions />} />
    <Route path="subscriptions" element={<Plans />} />
    <Route path="shipping" element={<Shipping />} />
    <Route path="payouts" element={<Payouts />} />
    <Route path="accounts" element={<Accounts />} />
    <Route path="agents" element={<Agents />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
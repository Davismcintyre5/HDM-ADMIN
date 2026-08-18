import { Route } from 'react-router-dom';
import Dashboard from '../../pages/hdmnet/Dashboard';
import Providers from '../../pages/hdmnet/Providers';
import ProviderDetail from '../../pages/hdmnet/ProviderDetail';
import PendingActivations from '../../pages/hdmnet/PendingActivations';
import Transactions from '../../pages/hdmnet/Transactions';
import Backups from '../../pages/hdmnet/Backups';
import Legal from '../../pages/hdmnet/Legal';
import Settings from '../../pages/hdmnet/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="providers" element={<Providers />} />
    <Route path="providers/:id" element={<ProviderDetail />} />
    <Route path="pending" element={<PendingActivations />} />
    <Route path="transactions" element={<Transactions />} />
    <Route path="backups" element={<Backups />} />
    <Route path="legal" element={<Legal />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
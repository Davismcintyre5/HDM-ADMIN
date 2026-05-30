import { Route } from 'react-router-dom';
import Dashboard from '../../pages/docusoft/Dashboard';
import Categories from '../../pages/docusoft/Categories';
import Documents from '../../pages/docusoft/Documents';
import Software from '../../pages/docusoft/Software';
import Users from '../../pages/docusoft/Users';
import Payments from '../../pages/docusoft/Payments';
import Orders from '../../pages/docusoft/Orders';
import Backups from '../../pages/docusoft/Backups';
import Settings from '../../pages/docusoft/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="categories" element={<Categories />} />
    <Route path="documents" element={<Documents />} />
    <Route path="software" element={<Software />} />
    <Route path="users" element={<Users />} />
    <Route path="payments" element={<Payments />} />
    <Route path="orders" element={<Orders />} />
    <Route path="backups" element={<Backups />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
// src/routes/talanta/index.jsx
import { Route } from 'react-router-dom';
import Dashboard from '../../pages/talanta/Dashboard';
import Match from '../../pages/talanta/Match';
import Categories from '../../pages/talanta/Categories';
import Faqs from '../../pages/talanta/Faqs';
import NotifyList from '../../pages/talanta/NotifyList';
import Tickets from '../../pages/talanta/Tickets';
import Payments from '../../pages/talanta/Payments';
import PaymentDetail from '../../pages/talanta/PaymentDetail';
import Images from '../../pages/talanta/Images';
import Settings from '../../pages/talanta/Settings';
import NotFound from '../../pages/talanta/NotFound';

export default (
  <>
    <Route index element={<Dashboard />} />
    <Route path="match" element={<Match />} />
    <Route path="categories" element={<Categories />} />
    <Route path="faqs" element={<Faqs />} />
    <Route path="notify" element={<NotifyList />} />
    <Route path="tickets" element={<Tickets />} />
    <Route path="payments" element={<Payments />} />
    <Route path="payments/:id" element={<PaymentDetail />} />
    <Route path="images" element={<Images />} />
    <Route path="settings" element={<Settings />} />
    <Route path="*" element={<NotFound />} />
  </>
);
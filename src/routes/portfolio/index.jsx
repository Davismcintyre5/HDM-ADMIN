import { Route } from 'react-router-dom';
import Dashboard from '../../pages/portfolio/Dashboard';
import Apps from '../../pages/portfolio/Apps';
import Services from '../../pages/portfolio/Services';
import Projects from '../../pages/portfolio/Projects';
import Photos from '../../pages/portfolio/Photos';
import Contacts from '../../pages/portfolio/Contacts';
import Cloudinary from '../../pages/portfolio/Cloudinary';
import MongoDB from '../../pages/portfolio/MongoDB';
import Backups from '../../pages/portfolio/Backups';
import Company from '../../pages/portfolio/Company';
import Settings from '../../pages/portfolio/Settings';
import Health from '../../pages/portfolio/Health';
import SmartGenUsers from '../../pages/portfolio/SmartGenUsers';
import PaymentRequests from '../../pages/portfolio/PaymentRequests';
import Communications from '../../pages/portfolio/Communications';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="apps" element={<Apps />} />
    <Route path="services" element={<Services />} />
    <Route path="projects" element={<Projects />} />
    <Route path="photos" element={<Photos />} />
    <Route path="contacts" element={<Contacts />} />
    <Route path="communications" element={<Communications />} />
    <Route path="payment-requests" element={<PaymentRequests />} />
    <Route path="cloudinary" element={<Cloudinary />} />
    <Route path="mongodb" element={<MongoDB />} />
    <Route path="backups" element={<Backups />} />
    <Route path="company" element={<Company />} />
    <Route path="settings" element={<Settings />} />
    <Route path="health" element={<Health />} />
    <Route path="smartgen-users" element={<SmartGenUsers />} />
  </>
);

export default routes;
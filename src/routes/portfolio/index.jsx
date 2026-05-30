import { Route } from 'react-router-dom';
import Dashboard from '../../pages/portfolio/Dashboard';
import Apps from '../../pages/portfolio/Apps';
import Services from '../../pages/portfolio/Services';
import Projects from '../../pages/portfolio/Projects';
import Photos from '../../pages/portfolio/Photos';
import Contacts from '../../pages/portfolio/Contacts';
import Backups from '../../pages/portfolio/Backups';
import Company from '../../pages/portfolio/Company';
import Settings from '../../pages/portfolio/Settings';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="apps" element={<Apps />} />
    <Route path="services" element={<Services />} />
    <Route path="projects" element={<Projects />} />
    <Route path="photos" element={<Photos />} />
    <Route path="contacts" element={<Contacts />} />
    <Route path="backups" element={<Backups />} />
    <Route path="company" element={<Company />} />
    <Route path="settings" element={<Settings />} />
  </>
);

export default routes;
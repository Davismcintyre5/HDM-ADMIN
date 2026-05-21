import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../../../components/hdmerp/ui/Tabs';

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'branding', label: 'Branding' },
  { key: 'landing', label: 'Landing Page' },
  { key: 'uploads', label: 'Upload Settings' },
  { key: 'downloads', label: 'Downloads' },
  { key: 'maintenance', label: 'Maintenance' },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/hdmerp/settings') {
      navigate('/hdmerp/settings/general', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <Tabs tabs={tabs} basePath="/hdmerp/settings" />
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
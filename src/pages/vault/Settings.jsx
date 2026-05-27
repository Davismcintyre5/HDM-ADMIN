import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../../components/vault/ui/Tabs';

const tabs = [
  { key: 'system', label: 'System' },
  { key: 'downloads', label: 'Downloads' },
  { key: 'features', label: 'Features' },
  { key: 'ai', label: 'AI' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Security' },
  { key: 'threat-intel', label: 'Threat Intel' },
  { key: 'plans', label: 'Plans' },
  { key: 'landing', label: 'Landing' },
  { key: 'legal', label: 'Legal' },
  { key: 'backups', label: 'Backups' },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/hdmvault/settings') {
      navigate('/hdmvault/settings/system', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <Tabs tabs={tabs} basePath="/hdmvault/settings" />
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
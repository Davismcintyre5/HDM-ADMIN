import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../../components/bridge/ui/Tabs';

const tabs = [
  { key: 'system', label: 'System' },
  { key: 'currency', label: 'Currency' },
  { key: 'ai-widget', label: 'AI Widget' },
  { key: 'legal', label: 'Legal' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'backup', label: 'Backup' },
  { key: 'admins', label: 'Admins' },
  { key: 'audit', label: 'Audit Logs' },
  { key: 'health', label: 'Health' },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/bridge/settings') {
      navigate('/bridge/settings/system', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <Tabs tabs={tabs} basePath="/bridge/settings" />
        <div className="p-4 sm:p-6"><Outlet /></div>
      </div>
    </div>
  );
}
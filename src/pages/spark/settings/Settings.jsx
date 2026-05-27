import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../../../components/spark/ui/Tabs';

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'payments', label: 'Payments' },
  { key: 'ai-config', label: 'AI Config' },
  { key: 'sound-packs', label: 'Sound Packs' },
  { key: 'deeplinks', label: 'Deep Links' },
  { key: 'legal', label: 'Legal' },
  { key: 'backups', label: 'Backups' },
  { key: 'system', label: 'System' },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/spark/settings') {
      navigate('/spark/settings/general', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <Tabs tabs={tabs} basePath="/spark/settings" />
        <div className="p-4 sm:p-6"><Outlet /></div>
      </div>
    </div>
  );
}
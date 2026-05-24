import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../../../components/smartpos/ui/Tabs';

const tabs = [
  { key: 'system', label: 'System' },
  { key: 'payment-methods', label: 'Pay Methods' },
  { key: 'currency', label: 'Currency' },
  { key: 'content', label: 'Content' },
  { key: 'inquiries', label: 'Inquiries' },
  { key: 'legal', label: 'Legal' },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/smartpos/settings') {
      navigate('/smartpos/settings/system', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <Tabs tabs={tabs} basePath="/smartpos/settings" />
        <div className="p-4 sm:p-6"><Outlet /></div>
      </div>
    </div>
  );
}
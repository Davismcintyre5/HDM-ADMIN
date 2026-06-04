import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../../components/bizhub/ui/Tabs';

const tabs = [
  { key: 'system', label: 'System' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'content', label: 'Content' },
  { key: 'chatbot', label: 'Chatbot' },
  { key: 'ai', label: 'AI' },
  { key: 'legal', label: 'Legal' },
  { key: 'payments', label: 'Payments' },
  { key: 'audit', label: 'Audit Logs' },
  { key: 'backups', label: 'Backups' },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/bizhub/settings') {
      navigate('/bizhub/settings/system', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <Tabs tabs={tabs} basePath="/bizhub/settings" />
        <div className="p-4 sm:p-6"><Outlet /></div>
      </div>
    </div>
  );
}
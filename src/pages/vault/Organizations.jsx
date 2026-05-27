import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Tabs from '../../components/vault/ui/Tabs';

const tabs = [
  { key: 'list', label: 'All Organizations' },
];

export default function Organizations() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/hdmvault/organizations') {
      navigate('/hdmvault/organizations/list', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Organizations</h1>
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <Tabs tabs={tabs} basePath="/hdmvault/organizations" />
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
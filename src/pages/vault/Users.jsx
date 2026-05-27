import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Tabs from '../../components/vault/ui/Tabs';

const tabs = [
  { key: 'list', label: 'All Users' },
];

export default function Users() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/hdmvault/users') {
      navigate('/hdmvault/users/list', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Users</h1>
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <Tabs tabs={tabs} basePath="/hdmvault/users" />
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
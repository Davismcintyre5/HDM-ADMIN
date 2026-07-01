import { useEffect, useState } from 'react';
import { getMetrics } from '../../services/farmwise/system';
import Card from '../../components/farmwise/ui/Card';
import Spinner from '../../components/farmwise/ui/Spinner';
import { HiDatabase, HiUsers, HiHeart, HiCheck } from 'react-icons/hi';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics()
      .then(res => setMetrics(res?.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { key: 'farms', label: 'Total Farms', icon: HiDatabase, color: 'text-emerald-600 dark:text-emerald-400', format: (v) => v },
    { key: 'users', label: 'Farm Admins', icon: HiUsers, color: 'text-blue-600 dark:text-blue-400', format: (v) => `${v?.active || 0} active / ${v?.total || 0} total` },
    { key: 'animals', label: 'Animals', icon: HiHeart, color: 'text-amber-600 dark:text-amber-400', format: (v) => v },
    { key: 'users', label: 'Active Admins', icon: HiCheck, color: 'text-green-600 dark:text-green-400', format: (v) => v?.active || 0 },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const m = metrics || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">FarmWise platform overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Farms</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{m.farms || 0}</p>
            </div>
            <HiDatabase className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Farm Admins</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{m.users?.total || 0}</p>
              <p className="text-xs text-[var(--text-muted)]">{m.users?.active || 0} active</p>
            </div>
            <HiUsers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Animals</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{m.animals || 0}</p>
            </div>
            <HiHeart className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">DB Status</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 capitalize">{m.system?.dbStatus || 'N/A'}</p>
            </div>
            <HiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">System</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Database:</span>
              <span className="text-[var(--text-primary)] font-medium capitalize">{m.system?.dbStatus || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Uptime:</span>
              <span className="text-[var(--text-primary)]">{Math.floor((m.system?.uptime || 0) / 60)} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Memory:</span>
              <span className="text-[var(--text-primary)]">{Math.round((m.system?.memoryUsage?.rss || 0) / 1048576)} MB</span>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
          <p className="text-sm text-[var(--text-secondary)]">Use the sidebar to manage farm admins, system settings, and monitor health.</p>
        </Card>
      </div>
    </div>
  );
}
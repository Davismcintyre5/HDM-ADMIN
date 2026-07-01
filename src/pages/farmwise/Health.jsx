import { useEffect, useState } from 'react';
import { getMetrics } from '../../services/farmwise/system';
import Card from '../../components/farmwise/ui/Card';
import Badge from '../../components/farmwise/ui/Badge';
import Spinner from '../../components/farmwise/ui/Spinner';
import { HiServer, HiDatabase, HiChip, HiClock } from 'react-icons/hi';

function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return 'N/A';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '< 1m';
}

export default function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics()
      .then(res => setHealth(res?.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!health) return <Card className="text-center text-[var(--text-muted)]">No health data</Card>;

  const sys = health.system || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">System Health</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <HiServer className="w-6 h-6 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Database</h2>
          </div>
          <Badge variant={sys.dbStatus === 'connected' ? 'success' : 'danger'}>
            {sys.dbStatus || 'Unknown'}
          </Badge>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <HiClock className="w-6 h-6 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Uptime</h2>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{formatUptime(sys.uptime)}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <HiChip className="w-6 h-6 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Memory (RSS)</h2>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{Math.round((sys.memoryUsage?.rss || 0) / 1048576)} MB</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <HiDatabase className="w-6 h-6 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Heap Used</h2>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{Math.round((sys.memoryUsage?.heapUsed || 0) / 1048576)} MB</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Platform Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{health.farms || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">Farms</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{health.users?.total || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">Users</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{health.animals || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">Animals</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{health.users?.active || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">Active Users</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
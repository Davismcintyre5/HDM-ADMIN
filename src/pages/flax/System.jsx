import { useEffect, useState } from 'react';
import { getHealth, getLogs } from '../../services/flax/system';
import Card from '../../components/flax/ui/Card';
import Badge from '../../components/flax/ui/Badge';
import Spinner from '../../components/flax/ui/Spinner';
import Pagination from '../../components/flax/ui/Pagination';
import { formatDate } from '../../utils/flax/formatDate';

const LEVELS = ['all', 'info', 'warning', 'error', 'critical'];

export default function System() {
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getHealth()
      .then((res) => setHealth(res?.data || res))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (level !== 'all') params.level = level;
    getLogs(params)
      .then((res) => {
        const d = res?.data || res;
        setLogs(d.logs || []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, level]);

  const levelVariants = { info: 'info', warning: 'warning', error: 'danger', critical: 'danger' };

  const formatUptime = (s) => {
    if (!s) return 'N/A';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatMB = (b) => b ? `${(b / 1048576).toFixed(0)} MB` : 'N/A';

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">System</h1>

      {health && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card><p className="text-sm text-[var(--text-secondary)]">Uptime</p><p className="text-lg font-bold text-[var(--text-primary)]">{formatUptime(health.server?.uptime)}</p></Card>
          <Card><p className="text-sm text-[var(--text-secondary)]">Memory</p><p className="text-lg font-bold text-[var(--text-primary)]">{formatMB(health.server?.memory?.rss)}</p></Card>
          <Card><p className="text-sm text-[var(--text-secondary)]">Database</p><Badge variant={health.database?.status === 'connected' ? 'success' : 'danger'}>{health.database?.status}</Badge></Card>
          <Card><p className="text-sm text-[var(--text-secondary)]">Host</p><p className="text-sm text-[var(--text-primary)]">{health.database?.host || 'N/A'}</p></Card>
        </div>
      )}

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">System Logs</h2>
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => { setLevel(l); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${level === l ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>{l}</button>
          ))}
        </div>
        <div className="space-y-2">
          {loading ? <div className="flex justify-center py-10"><Spinner size="md" /></div> : logs.length === 0 ? <p className="text-center text-[var(--text-muted)] py-8">No logs found.</p> :
            logs.map((l) => (
              <div key={l._id} className="flex items-start gap-3 py-2 border-b border-[var(--border-color)] last:border-0 text-sm">
                <Badge variant={levelVariants[l.level] || 'default'}>{l.level}</Badge>
                <span className="text-[var(--text-muted)] text-xs w-12">{formatDate(l.createdAt, 'DD/MM/YYYY')}</span>
                <span className="text-[var(--text-primary)] flex-1">{l.message}</span>
              </div>
            ))
          }
        </div>
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}
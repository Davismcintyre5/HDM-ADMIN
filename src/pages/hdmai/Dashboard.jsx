import { useEffect, useState } from 'react';
import { getStats, getUsage } from '../../services/hdmai/stats';
import Card from '../../components/hdmai/ui/Card';
import Spinner from '../../components/hdmai/ui/Spinner';
import Badge from '../../components/hdmai/ui/Badge';
import { HiUsers, HiKey, HiLightningBolt, HiDatabase } from 'react-icons/hi';
import { PROJECT_LABELS } from '../../utils/hdmai/constants';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getStats(), getUsage()])
      .then(([s, u]) => { setStats(s); setUsage(u); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Users</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats?.total_users || 0}</p>
            </div>
            <HiUsers className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Active API Keys</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats?.active_api_keys || 0}</p>
            </div>
            <HiKey className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Requests</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats?.total_requests?.toLocaleString() || 0}</p>
            </div>
            <HiLightningBolt className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Inbound Keys</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats?.inbound_keys || 0}</p>
            </div>
            <HiDatabase className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Project Breakdown */}
      {stats?.projects && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Requests by Project</h2>
          <div className="space-y-3">
            {Object.entries(stats.projects).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="fuchsia">{PROJECT_LABELS[key] || key}</Badge>
                  <span className="text-sm text-[var(--text-secondary)]">{val.active_keys} keys</span>
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">{val.requests?.toLocaleString()} requests</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Usage & Providers */}
      {usage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Providers */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">AI Providers</h2>
            <div className="space-y-5">
              {Object.entries(usage.providers || {}).map(([key, p]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-primary)] font-medium">{p.name}</span>
                    <span className="text-[var(--text-secondary)]">
                      {p.limit === 'unlimited' ? 'Unlimited' : `${p.requests_today || 0} today`}
                    </span>
                  </div>
                  {p.limit === 'unlimited' ? (
                    <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full" />
                    </div>
                  ) : p.usage_percent_today != null ? (
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                      <div className="bg-fuchsia-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(p.usage_percent_today || 0, 100)}%` }} />
                    </div>
                  ) : (
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2" />
                  )}
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {p.limit === 'unlimited' ? 'No limits' : `${(p.tokens_today || 0).toLocaleString()} tokens`}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Database Status */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Database Status</h2>
            <div className="space-y-3">
              {Object.entries(usage.database || {}).map(([key, db]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <span className="text-sm font-medium text-[var(--text-primary)] capitalize">{key}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${db.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-[var(--text-secondary)]">{db.status}</span>
                    {db.limit_storage_mb && <span className="text-xs text-[var(--text-muted)]">{db.limit_storage_mb} MB</span>}
                  </div>
                </div>
              ))}
            </div>
            {usage.overall && (
              <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Today's Requests</span>
                  <span className="text-[var(--text-primary)] font-medium">{usage.overall.total_requests_today}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Today's Tokens</span>
                  <span className="text-[var(--text-primary)] font-medium">{usage.overall.total_tokens_today?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)]">Monthly Savings</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">{usage.overall.free_tier_savings}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
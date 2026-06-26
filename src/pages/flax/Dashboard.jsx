import { useEffect, useState } from 'react';
import { getOverview, getStats } from '../../services/flax/system';
import Card from '../../components/flax/ui/Card';
import Spinner from '../../components/flax/ui/Spinner';
import { HiUsers, HiCash, HiTrendingUp, HiUserAdd } from 'react-icons/hi';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverview().catch(() => null), getStats().catch(() => null)])
      .then(([ov, st]) => {
        setOverview(ov?.data || ov);
        setStats(st?.data || st);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { key: 'totalUsers', label: 'Total Users', icon: HiUsers, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'newUsersToday', label: 'New Today', icon: HiUserAdd, color: 'text-green-600 dark:text-green-400' },
    { key: 'transactionsToday', label: 'Tx Today', icon: HiTrendingUp, color: 'text-purple-600 dark:text-purple-400' },
    { key: 'volumeToday', label: 'Volume Today', icon: HiCash, color: 'text-yellow-600 dark:text-yellow-400', format: (v) => `KES ${(v || 0).toLocaleString()}` },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Flax mobile money overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {s.format ? s.format(overview?.[s.key]) : (overview?.[s.key] ?? 0).toLocaleString()}
                </p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Users</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total:</span><span className="text-[var(--text-primary)] font-medium">{stats.users?.total || 0}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Active:</span><span className="text-[var(--text-primary)] font-medium">{stats.users?.active || 0}</span></div>
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Transactions</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total:</span><span className="text-[var(--text-primary)] font-medium">{stats.transactions?.total || 0}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Today:</span><span className="text-[var(--text-primary)] font-medium">{stats.transactions?.today || 0}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Volume:</span><span className="text-[var(--text-primary)] font-medium">KES {(stats.volume?.total || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Fees:</span><span className="text-[var(--text-primary)] font-medium">KES {(stats.volume?.fees || 0).toLocaleString()}</span></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
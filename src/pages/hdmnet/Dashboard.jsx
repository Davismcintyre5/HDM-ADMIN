import { useEffect, useState } from 'react';
import { getOwners } from '../../services/hdmnet/owners';
import { getPlans } from '../../services/hdmnet/plans';
import Card from '../../components/hdmnet/ui/Card';
import Spinner from '../../components/hdmnet/ui/Spinner';
import Badge from '../../components/hdmnet/ui/Badge';
import { HiUsers, HiCreditCard, HiCurrencyDollar, HiCheckCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/hdmnet/formatDate';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOwners, setRecentOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOwners({ limit: 100 }).catch(() => ({ data: [] })),
      getPlans().catch(() => []),
    ])
      .then(([ownersRes, plansRes]) => {
        const owners = ownersRes?.data || ownersRes || [];
        const plans = plansRes?.data || plansRes || [];
        const pending = owners.filter(o => o.status === 'pending').length;
        const active = owners.filter(o => o.status === 'active').length;
        setStats({
          totalOwners: owners.length,
          activeOwners: active,
          pendingOwners: pending,
          totalPlans: Array.isArray(plans) ? plans.length : 0,
        });
        setRecentOwners(owners.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { key: 'totalOwners', label: 'Total Owners', icon: HiUsers, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'activeOwners', label: 'Active Owners', icon: HiCheckCircle, color: 'text-green-600 dark:text-green-400' },
    { key: 'pendingOwners', label: 'Pending Approval', icon: HiCurrencyDollar, color: 'text-yellow-600 dark:text-yellow-400' },
    { key: 'totalPlans', label: 'Plans', icon: HiCreditCard, color: 'text-purple-600 dark:text-purple-400' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Overview of your WiFi billing platform</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{(stats?.[s.key] ?? 0).toLocaleString()}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Owners</h2>
          <button onClick={() => navigate('/hdmnet/owners')} className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
            View All
          </button>
        </div>
        {recentOwners.length > 0 ? (
          <div className="space-y-2">
            {recentOwners.map((owner) => (
              <div key={owner._id || owner.id} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                <div>
                  <button onClick={() => navigate(`/hdmnet/owners/${owner._id || owner.id}`)} className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
                    {owner.business_name || owner.full_name || owner.name || 'N/A'}
                  </button>
                  <p className="text-xs text-[var(--text-muted)]">{owner.email || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={owner.status === 'active' ? 'success' : owner.status === 'pending' ? 'warning' : 'default'}>
                    {owner.status || 'unknown'}
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)]">{formatDate(owner.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">No owners registered yet.</p>
        )}
      </Card>
    </div>
  );
}
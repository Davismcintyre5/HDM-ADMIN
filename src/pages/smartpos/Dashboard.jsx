import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/smartpos/dashboard';
import Card from '../../components/smartpos/ui/Card';
import Spinner from '../../components/smartpos/ui/Spinner';
import Badge from '../../components/smartpos/ui/Badge';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiOfficeBuilding, HiCheckCircle, HiCash, HiExclamation } from 'react-icons/hi';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  const stats = [
    { key: 'totalClients', label: 'Total Clients', icon: HiOfficeBuilding, color: 'text-blue-600 dark:text-blue-400', value: data?.totalClients || 0 },
    { key: 'activeClients', label: 'Active Clients', icon: HiCheckCircle, color: 'text-green-600 dark:text-green-400', value: data?.activeClients || 0 },
    { key: 'trialClients', label: 'Trial Clients', icon: HiExclamation, color: 'text-yellow-600 dark:text-yellow-400', value: data?.trialClients || 0 },
    { key: 'totalRevenue', label: 'Total Revenue', icon: HiCash, color: 'text-purple-600 dark:text-purple-400', value: `KES ${(data?.totalRevenue || 0).toLocaleString()}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {data?.recentPayments?.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {data.recentPayments.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{p.client?.businessName || 'Unknown'}</p>
                  <p className="text-xs text-[var(--text-muted)]">{p.client?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--text-primary)]">KES {p.amount?.toLocaleString()}</p>
                  <Badge variant={p.status === 'approved' ? 'success' : 'warning'}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
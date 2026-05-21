import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/hdmerp/dashboard';
import Card from '../../components/hdmerp/ui/Card';
import Spinner from '../../components/hdmerp/ui/Spinner';
import { HiOfficeBuilding, HiCheckCircle, HiKey, HiSparkles } from 'react-icons/hi';

const stats = [
  { key: 'totalTenants', label: 'Total Tenants', icon: HiOfficeBuilding, color: 'text-blue-600 dark:text-blue-400' },
  { key: 'activeTenants', label: 'Active Tenants', icon: HiCheckCircle, color: 'text-green-600 dark:text-green-400' },
  { key: 'pendingApprovals', label: 'Pending Approvals', icon: HiKey, color: 'text-yellow-600 dark:text-yellow-400' },
  { key: 'activeLicenseKeys', label: 'Active License Keys', icon: HiSparkles, color: 'text-purple-600 dark:text-purple-400' },
];

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{data?.[s.key] ?? 0}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>
      {data?.aiUsage && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">AI Usage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Tokens</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{data.aiUsage.totalTokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Requests</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{data.aiUsage.totalRequests.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
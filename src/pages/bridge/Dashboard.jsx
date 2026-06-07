import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/bridge/analytics';
import Card from '../../components/bridge/ui/Card';
import Spinner from '../../components/bridge/ui/Spinner';
import { HiUsers, HiCash, HiMail, HiOfficeBuilding } from 'react-icons/hi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.stats || res.data?.stats || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const statCards = [
    { key: 'totalUsers', label: 'Total Users', icon: HiUsers, color: 'text-blue-500', value: stats?.totalUsers || 0 },
    { key: 'totalOrganizations', label: 'Organizations', icon: HiOfficeBuilding, color: 'text-indigo-500', value: stats?.totalOrganizations || 0 },
    { key: 'activeSubscriptions', label: 'Active Subs', icon: HiCash, color: 'text-green-500', value: stats?.activeSubscriptions || 0 },
    { key: 'totalRevenue', label: 'Revenue', icon: HiCash, color: 'text-yellow-500', value: `$${(stats?.totalRevenue || 0).toLocaleString()}` },
    { key: 'emailsToday', label: 'Emails Today', icon: HiMail, color: 'text-indigo-500', value: stats?.emailsToday?.toLocaleString() || 0 },
    { key: 'emailsThisMonth', label: 'Emails This Month', icon: HiMail, color: 'text-purple-500', value: stats?.emailsThisMonth?.toLocaleString() || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(s => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-[var(--text-secondary)]">{s.label}</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{s.value}</p></div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
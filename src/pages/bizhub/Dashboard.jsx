import { useEffect, useState } from 'react';
import { getUsers } from '../../services/bizhub/users';
import { getSubscriptions } from '../../services/bizhub/subscriptions';
import { getRevenueReport } from '../../services/bizhub/reports';
import { getSystems } from '../../services/bizhub/systems';
import Card from '../../components/bizhub/ui/Card';
import Spinner from '../../components/bizhub/ui/Spinner';
import { HiUsers, HiCreditCard, HiCash, HiChartBar } from 'react-icons/hi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsers(), getSubscriptions(), getRevenueReport(), getSystems()])
      .then(([u, s, r, sys]) => {
        const users = u.data || u || [];
        const subs = s.data || s || [];
        const revenue = r.summary || r.data?.summary || r;
        const systems = sys.data || sys;
        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          activeSubscriptions: Array.isArray(subs) ? subs.filter(s => s.status !== 'cancelled').length : 0,
          totalRevenue: revenue?.totalRevenue || 0,
          modulesActive: Object.values(systems || {}).filter(Boolean).length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const statCards = [
    { key: 'totalUsers', label: 'Total Users', icon: HiUsers, color: 'text-blue-500', value: stats?.totalUsers || 0 },
    { key: 'activeSubscriptions', label: 'Active Subs', icon: HiCreditCard, color: 'text-teal-500', value: stats?.activeSubscriptions || 0 },
    { key: 'totalRevenue', label: 'Revenue', icon: HiCash, color: 'text-green-500', value: `KES ${(stats?.totalRevenue || 0).toLocaleString()}` },
    { key: 'modulesActive', label: 'Active Modules', icon: HiChartBar, color: 'text-cyan-500', value: stats?.modulesActive || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
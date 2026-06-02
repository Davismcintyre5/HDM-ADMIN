import { useEffect, useState } from 'react';
import { getDashboard, getActiveUsers } from '../../services/vibe/dashboard';
import Card from '../../components/vibe/ui/Card';
import Spinner from '../../components/vibe/ui/Spinner';
import { HiUsers, HiFlag, HiCash, HiBan, HiCheckCircle, HiPhotograph } from 'react-icons/hi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboard(), getActiveUsers()])
      .then(([s, a]) => {
        setStats(s.data || s);
        setActiveUsers(a.data?.count || 0);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  const statCards = [
    { key: 'totalUsers', label: 'Total Users', icon: HiUsers, color: 'text-blue-500', value: stats?.totalUsers || 0 },
    { key: 'newUsersToday', label: 'New Today', icon: HiUsers, color: 'text-green-500', value: stats?.newUsersToday || 0 },
    { key: 'activeUsers', label: 'Active Now', icon: HiCheckCircle, color: 'text-emerald-500', value: activeUsers },
    { key: 'totalPosts', label: 'Total Posts', icon: HiPhotograph, color: 'text-purple-500', value: stats?.totalPosts || 0 },
    { key: 'pendingReports', label: 'Reports', icon: HiFlag, color: 'text-red-500', value: stats?.pendingReports || 0 },
    { key: 'pendingActivations', label: 'Pending Verification', icon: HiCheckCircle, color: 'text-yellow-500', value: stats?.pendingActivations || 0 },
    { key: 'totalRevenue', label: 'Revenue', icon: HiCash, color: 'text-green-500', value: `$${stats?.totalRevenue || 0}` },
    { key: 'bannedUsers', label: 'Banned', icon: HiBan, color: 'text-gray-500', value: stats?.bannedUsers || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
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
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getStats, getActivity } from '../../services/spark/dashboard';
import Card from '../../components/spark/ui/Card';
import Spinner from '../../components/spark/ui/Spinner';
import Badge from '../../components/spark/ui/Badge';
import { HiUsers, HiChat, HiPhone, HiCash, HiFlag, HiTicket, HiBan } from 'react-icons/hi';
import { formatDate } from '../../utils/spark/formatDate';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: HiUsers, color: 'text-blue-500' },
  { key: 'activeUsers', label: 'Active Users', icon: HiUsers, color: 'text-green-500' },
  { key: 'totalMessages', label: 'Messages', icon: HiChat, color: 'text-sky-500' },
  { key: 'todayMessages', label: 'Today Messages', icon: HiChat, color: 'text-cyan-500' },
  { key: 'totalGroups', label: 'Groups', icon: HiUsers, color: 'text-purple-500' },
  { key: 'totalCalls', label: 'Calls', icon: HiPhone, color: 'text-indigo-500' },
  { key: 'totalPayments', label: 'Payments', icon: HiCash, color: 'text-yellow-500' },
  { key: 'pendingActivations', label: 'Pending Activations', icon: HiTicket, color: 'text-orange-500' },
  { key: 'openReports', label: 'Open Reports', icon: HiFlag, color: 'text-red-500' },
  { key: 'openTickets', label: 'Open Tickets', icon: HiTicket, color: 'text-pink-500' },
  { key: 'activeBans', label: 'Active Bans', icon: HiBan, color: 'text-gray-500' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getStats(), getActivity()])
      .then(([s, a]) => { setStats(s); setActivity(a); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats?.overview?.[s.key] ?? 0}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {activity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Users</h2>
            <div className="space-y-2">
              {activity.recentUsers?.slice(0, 5).map(u => (
                <div key={u._id} className="flex justify-between text-sm"><span className="text-[var(--text-primary)]">{u.username || u.email}</span><span className="text-[var(--text-muted)]">{formatDate(u.createdAt)}</span></div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Reports</h2>
            <div className="space-y-2">
              {activity.recentReports?.slice(0, 5).map(r => (
                <div key={r._id} className="flex justify-between text-sm"><span className="text-[var(--text-primary)]">{r.reason}</span><Badge variant="warning">{r.status}</Badge></div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Payments</h2>
            <div className="space-y-2">
              {activity.recentPayments?.slice(0, 5).map(p => (
                <div key={p._id} className="flex justify-between text-sm"><span className="text-[var(--text-primary)]">${p.amount}</span><Badge variant="success">{p.status}</Badge></div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
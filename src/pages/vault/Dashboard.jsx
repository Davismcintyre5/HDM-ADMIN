import { useEffect, useState } from 'react';
import { getDashboard, getRevenue, getRecentUsers } from '../../services/vault/dashboard';
import Card from '../../components/vault/ui/Card';
import Spinner from '../../components/vault/ui/Spinner';
import Badge from '../../components/vault/ui/Badge';
import { HiOfficeBuilding, HiUsers, HiDeviceMobile, HiClipboardCheck, HiKey } from 'react-icons/hi';
import { formatDate } from '../../utils/vault/formatDate';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboard(), getRevenue(), getRecentUsers()])
      .then(([s, r, u]) => { setStats(s); setRevenue(r || []); setRecentUsers(u || []); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  const statCards = [
    { key: 'totalOrganizations', label: 'Organizations', icon: HiOfficeBuilding, color: 'text-orange-500', value: stats?.totalOrganizations || 0 },
    { key: 'totalUsers', label: 'Users', icon: HiUsers, color: 'text-blue-500', value: stats?.totalUsers || 0 },
    { key: 'totalDevices', label: 'Devices', icon: HiDeviceMobile, color: 'text-green-500', value: stats?.totalDevices || 0 },
    { key: 'pendingActivations', label: 'Pending', icon: HiClipboardCheck, color: 'text-yellow-500', value: stats?.pendingActivations || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-[var(--text-secondary)]">{s.label}</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{s.value}</p></div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">License Overview</h2>
          <div className="space-y-2">
            {Object.entries(stats?.activeLicenses || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm"><span className="text-[var(--text-secondary)] capitalize">{k}</span><Badge variant="orange">{v}</Badge></div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Users</h2>
          <div className="space-y-2">
            {recentUsers.slice(0, 5).map(u => (
              <div key={u._id} className="flex justify-between text-sm">
                <span className="text-[var(--text-primary)]">{u.fullName || u.email}</span>
                <span className="text-[var(--text-muted)]">{u.orgId?.name || '—'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getStats } from '../../services/rvnp/dashboard';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/rvnp/ui/Card';
import Spinner from '../../components/rvnp/ui/Spinner';
import StatCard from '../../components/rvnp/ui/StatCard';
import { HiUsers, HiUserGroup, HiUserAdd, HiPhotograph, HiCollection, HiTag, HiCash, HiFlag, HiSupport, HiArrowRight, HiSparkles } from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(res => setData(res?.data || res))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const d = data || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">RVNP Campus Hub overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Total Users" value={d.totalUsers || 0} color="text-emerald-500" />
        <StatCard icon={HiUserGroup} label="Active Today" value={d.activeToday || 0} color="text-blue-500" />
        <StatCard icon={HiUserAdd} label="New Today" value={d.newUsersToday || 0} color="text-violet-500" />
        <StatCard icon={HiPhotograph} label="Total Posts" value={d.totalPosts || 0} color="text-amber-500" />
        <StatCard icon={HiCollection} label="Groups" value={d.totalGroups || 0} color="text-cyan-500" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card><p className="text-sm text-[var(--text-secondary)]">Active Listings</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{d.activeListings || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Stories Today</p><p className="text-2xl font-bold text-amber-500 mt-1">{d.storiesToday || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Pending Reports</p><p className="text-2xl font-bold text-red-500 mt-1">{d.pendingReports || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Open Tickets</p><p className="text-2xl font-bold text-blue-500 mt-1">{d.openTickets || 0}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiCash className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Revenue</h2>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">KES {(d.totalRevenue || 0).toLocaleString()}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiSparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Users', path: '/rvnp/users' },
              { label: 'Moderation', path: '/rvnp/moderation' },
              { label: 'Announcements', path: '/rvnp/announcements' },
              { label: 'Settings', path: '/rvnp/settings' },
            ].map(link => (
              <button key={link.path} onClick={() => navigate(link.path)}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--sidebar-hover)] text-sm text-[var(--text-primary)] transition-colors group">
                {link.label}
                <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
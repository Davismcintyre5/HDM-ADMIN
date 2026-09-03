import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/rvnp/dashboard';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/rvnp/ui/Card';
import Spinner from '../../components/rvnp/ui/Spinner';
import StatCard from '../../components/rvnp/ui/StatCard';
import { HiUsers, HiPhotograph, HiCollection, HiCalendar, HiFlag, HiArrowRight, HiSparkles } from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res?.data || res))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const d = stats || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">RVNP Campus Hub overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Total Users" value={d.totalUsers || 0} sub={`${d.activeUsers || 0} active`} color="text-emerald-500" />
        <StatCard icon={HiPhotograph} label="Total Posts" value={d.totalPosts || 0} sub={`${d.newPostsToday || 0} today`} color="text-blue-500" />
        <StatCard icon={HiCollection} label="Reels" value={d.totalReels || 0} color="text-violet-500" />
        <StatCard icon={HiCalendar} label="Groups & Events" value={`${d.totalGroups || 0}/${d.totalEvents || 0}`} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><p className="text-sm text-[var(--text-secondary)]">Listings</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{d.totalListings || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Suspended</p><p className="text-2xl font-bold text-red-500 mt-1">{d.suspendedUsers || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Pending Reports</p><p className="text-2xl font-bold text-amber-500 mt-1">{d.pendingReports || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">New Today</p><p className="text-2xl font-bold text-emerald-500 mt-1">{d.newUsersToday || 0}</p></Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <HiSparkles className="w-5 h-5 text-emerald-500" />
          <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Users', path: '/rvnp/users' },
            { label: 'Moderation', path: '/rvnp/moderation' },
            { label: 'Reports', path: '/rvnp/reports' },
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
  );
}
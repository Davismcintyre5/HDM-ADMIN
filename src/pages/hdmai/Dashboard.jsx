import { useEffect, useState } from 'react';
import { getStats } from '../../services/hdmai/stats';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/hdmai/ui/Card';
import Spinner from '../../components/hdmai/ui/Spinner';
import Badge from '../../components/hdmai/ui/Badge';
import { HiUsers, HiKey, HiLightningBolt, HiSparkles, HiChip, HiArrowRight } from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(d => setStats(d?.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const quickLinks = [
    { label: 'AI Keys', desc: 'Manage provider keys', path: '/hdmai/keys', color: 'from-fuchsia-500 to-purple-600', icon: HiKey },
    { label: 'Project Keys', desc: 'View user API keys', path: '/hdmai/project-keys', color: 'from-violet-500 to-indigo-600', icon: HiKey },
    { label: 'Users', desc: 'Manage platform users', path: '/hdmai/users', color: 'from-blue-500 to-cyan-600', icon: HiUsers },
    { label: 'Usage', desc: 'Analytics & stats', path: '/hdmai/usage', color: 'from-emerald-500 to-teal-600', icon: HiLightningBolt },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">HDM AI Platform Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full" />
          <HiUsers className="w-8 h-8 text-blue-500 mb-3" />
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">Total Users</p>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" />
          <HiKey className="w-8 h-8 text-green-500 mb-3" />
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats?.activeProjectKeys || 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">Project Keys</p>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full" />
          <HiLightningBolt className="w-8 h-8 text-amber-500 mb-3" />
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats?.requestsToday || 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">Requests Today</p>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-fuchsia-500/10 rounded-bl-full" />
          <HiSparkles className="w-8 h-8 text-fuchsia-500 mb-3" />
          <p className="text-3xl font-bold text-[var(--text-primary)]">{(stats?.tokensToday || 0).toLocaleString()}</p>
          <p className="text-sm text-[var(--text-secondary)]">Tokens Today</p>
        </Card>
      </div>

      {/* Status & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-1">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stats?.pythonStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm text-[var(--text-secondary)]">Python AI</span>
              </div>
              <Badge variant={stats?.pythonStatus === 'healthy' ? 'success' : 'danger'}>{stats?.pythonStatus || 'unknown'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiChip className="w-4 h-4 text-fuchsia-500" />
                <span className="text-sm text-[var(--text-secondary)]">AI Keys</span>
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">{stats?.activeAiKeys || 0} active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiSparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-[var(--text-secondary)]">Key Cache</span>
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">{stats?.keyCache?.keys || 0} cached</span>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`p-4 rounded-xl bg-gradient-to-r ${link.color} text-white text-left hover:shadow-lg transition-all hover:scale-[1.02] group`}
              >
                <div className="flex items-center justify-between">
                  <link.icon className="w-6 h-6 opacity-80" />
                  <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="font-semibold mt-2">{link.label}</p>
                <p className="text-xs text-white/70 mt-0.5">{link.desc}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
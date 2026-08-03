import { useEffect, useState } from 'react';
import { getSchools } from '../../services/eduprime/schools';
import { getPendingSchools } from '../../services/eduprime/pendingSchools';
import { getHealth } from '../../services/eduprime/health';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/eduprime/ui/Card';
import Spinner from '../../components/eduprime/ui/Spinner';
import StatCard from '../../components/eduprime/ui/StatCard';
import { HiAcademicCap, HiClock, HiHeart, HiArrowRight, HiSparkles, HiPlus, HiCollection } from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSchools({ limit: 1 }), getPendingSchools({ limit: 1 }), getHealth()])
      .then(([schools, pending, health]) => {
        setStats({
          totalSchools: schools.pagination?.total || 0,
          pendingApprovals: pending.pagination?.total || 0,
          dbStatus: health?.data?.dbStatus || health?.data?.database?.state || 'unknown',
          uptime: health?.data?.uptime || health?.data?.server?.uptime || 0,
          nodeVersion: health?.data?.server?.nodeVersion,
          environment: health?.data?.server?.environment,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const d = stats || {};

  const quickActions = [
    { label: 'Add School', path: '/eduprime/schools', icon: HiPlus, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
    { label: 'View Schools', path: '/eduprime/schools', icon: HiAcademicCap, color: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pending Approvals', path: '/eduprime/pending', icon: HiClock, color: 'from-orange-500 to-red-500', iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' },
    { label: 'System Health', path: '/eduprime/health', icon: HiHeart, color: 'from-green-500 to-emerald-600', iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Welcome to EduPrime — school management system</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiAcademicCap} label="Total Schools" value={d.totalSchools || 0} color="text-amber-500" />
        <StatCard icon={HiClock} label="Pending Approvals" value={d.pendingApprovals || 0} color="text-orange-500" />
        <StatCard icon={HiHeart} label="Database" value={d.dbStatus || '—'} color="text-green-500" />
        <StatCard icon={HiSparkles} label="Uptime" value={d.uptime ? `${Math.floor(d.uptime / 3600)}h ${Math.floor((d.uptime % 3600) / 60)}m` : '—'} color="text-amber-500" />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <HiSparkles className="w-5 h-5 text-amber-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${action.color} opacity-10 rounded-bl-3xl group-hover:opacity-20 transition-opacity`} />
              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm text-[var(--text-primary)]">{action.label}</p>
                </div>
                <HiArrowRight className="w-4 h-4 text-[var(--text-muted)] ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <HiCollection className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <p className="text-2xl font-bold text-amber-500">{d.totalSchools || 0}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Schools</p>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <p className="text-2xl font-bold text-orange-500">{d.pendingApprovals || 0}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Pending</p>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <p className="text-2xl font-bold text-green-500">{d.dbStatus === 'connected' || d.dbStatus === 'up' ? 'Online' : 'Offline'}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Database</p>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{d.environment || 'dev'}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Environment</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiHeart className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">System</h2>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Database" value={d.dbStatus} />
            <Row label="Uptime" value={d.uptime ? `${Math.floor(d.uptime / 3600)}h ${Math.floor((d.uptime % 3600) / 60)}m` : '—'} />
            <Row label="Node" value={d.nodeVersion} />
            <Row label="Environment" value={d.environment} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="text-[var(--text-primary)] font-medium">{value || '—'}</span>
    </div>
  );
}
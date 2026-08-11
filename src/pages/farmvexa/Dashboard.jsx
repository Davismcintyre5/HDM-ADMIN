import { useEffect, useState } from 'react';
import { getUsers } from '../../services/farmvexa/users';
import { getFarms } from '../../services/farmvexa/farms';
import { getPendingApprovals } from '../../services/farmvexa/approvals';
import { getTotalUsage } from '../../services/farmvexa/usage';
import { getHealth } from '../../services/farmvexa/health';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/farmvexa/ui/Card';
import Spinner from '../../components/farmvexa/ui/Spinner';
import StatCard from '../../components/farmvexa/ui/StatCard';
import Badge from '../../components/farmvexa/ui/Badge';
import {
  HiUsers, HiGlobe, HiCheckCircle, HiChartBar, HiArrowRight, HiSparkles,
  HiPlus, HiClipboardList, HiHeart, HiChip
} from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUsers({ limit: 1 }),
      getFarms({ limit: 1 }),
      getPendingApprovals({ limit: 1 }),
      getTotalUsage(),
      getHealth()
    ])
      .then(([users, farms, approvals, usage, health]) => {
        setStats({
          users: users?.pagination?.total || 0,
          farms: farms?.pagination?.total || 0,
          pending: approvals?.pagination?.total || 0,
          todayUsage: usage?.data?.usage?.today || 0,
          totalUsage: usage?.data?.usage?.total || 0,
          devicesOnline: health?.data?.stats?.devices?.online || 0,
          devicesTotal: health?.data?.stats?.devices?.total || 0,
          services: health?.data || {},
        });
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const d = stats || {};
  const services = d.services || {};
  const serviceList = [
    { key: 'server', label: 'Server', status: services.server?.status },
    { key: 'database', label: 'Database', status: services.database?.status },
    { key: 'redis', label: 'Redis', status: services.redis?.status },
    { key: 'pythonAi', label: 'Python AI', status: services.pythonAi?.status },
    { key: 'email', label: 'Email', status: services.email?.status },
    { key: 'sms', label: 'SMS', status: services.sms?.status },
    { key: 'storage', label: 'Storage', status: services.storage?.status },
  ];

  const getServiceColor = (status) => {
    if (status === 'running' || status === 'connected' || status === 'up' || status === 'enabled' || status === 'online') return 'bg-green-500';
    if (status === 'disabled' || status === 'unknown') return 'bg-gray-400';
    return 'bg-red-500';
  };

  const quickActions = [
    { label: 'Add User', path: '/farmvexa/users', icon: HiPlus, color: 'from-emerald-500 to-green-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Review Approvals', path: '/farmvexa/approvals', icon: HiClipboardList, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', badge: d.pending },
    { label: 'View Farms', path: '/farmvexa/farms', icon: HiGlobe, color: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'System Health', path: '/farmvexa/health', icon: HiHeart, color: 'from-red-500 to-rose-600', iconBg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Welcome to FarmVexa — AI-Powered Farm Intelligence</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Total Farmers" value={d.users || 0} color="text-emerald-500" />
        <StatCard icon={HiGlobe} label="Active Farms" value={d.farms || 0} color="text-blue-500" />
        <StatCard icon={HiCheckCircle} label="Pending Approvals" value={d.pending || 0} color="text-amber-500" />
        <StatCard icon={HiChartBar} label="Today's Usage" value={d.todayUsage || 0} sub={`${d.totalUsage || 0} total`} color="text-violet-500" />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <HiSparkles className="w-5 h-5 text-emerald-500" />
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
                <div className="text-left flex-1">
                  <p className="font-medium text-sm text-[var(--text-primary)]">{action.label}</p>
                </div>
                {action.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white">{action.badge}</span>
                )}
                <HiArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Status + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <HiHeart className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">System Status</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {serviceList.map(svc => (
              <div key={svc.key} className="flex items-center gap-2 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <span className={`w-2.5 h-2.5 rounded-full ${getServiceColor(svc.status)} flex-shrink-0`} />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{svc.label}</p>
                  <p className="text-xs font-medium text-[var(--text-primary)] capitalize">{svc.status || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Overview Stats */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiChartBar className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-center gap-2">
                <HiUsers className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-[var(--text-primary)]">Farmers</span>
              </div>
              <span className="text-lg font-bold text-emerald-500">{d.users || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-center gap-2">
                <HiGlobe className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-[var(--text-primary)]">Farms</span>
              </div>
              <span className="text-lg font-bold text-blue-500">{d.farms || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-center gap-2">
                <HiChip className="w-4 h-4 text-violet-500" />
                <span className="text-sm text-[var(--text-primary)]">Devices</span>
              </div>
              <span className="text-lg font-bold text-violet-500">{d.devicesOnline || 0}/{d.devicesTotal || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-center gap-2">
                <HiChartBar className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-[var(--text-primary)]">Today Usage</span>
              </div>
              <span className="text-lg font-bold text-amber-500">{d.todayUsage || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
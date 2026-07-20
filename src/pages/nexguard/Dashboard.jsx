import { useEffect, useState } from 'react';
import { getOverview } from '../../services/nexguard/dashboard';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/nexguard/ui/Card';
import Spinner from '../../components/nexguard/ui/Spinner';
import StatCard from '../../components/nexguard/ui/StatCard';
import Badge from '../../components/nexguard/ui/Badge';
import { HiUsers, HiShieldCheck, HiExclamation, HiSearch, HiCash, HiArrowRight, HiSparkles } from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview()
      .then(res => setData(res?.data || res))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const d = data || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">NexGuard system overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Total Users" value={d.users?.total || 0} color="text-blue-500" />
        <StatCard icon={HiShieldCheck} label="Active Users" value={d.users?.active || 0} color="text-cyan-500" />
        <StatCard icon={HiSearch} label="Scans" value={d.scans || 0} color="text-violet-500" />
        <StatCard icon={HiExclamation} label="Alerts" value={d.alerts?.total || 0} color="text-red-500" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card><p className="text-sm text-[var(--text-secondary)]">Devices</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{d.devices || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Critical Alerts</p><p className="text-2xl font-bold text-red-500 mt-1">{d.alerts?.critical || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Pending Approvals</p><p className="text-2xl font-bold text-amber-500 mt-1">{d.pendingApprovals || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Revenue</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">KES {(d.revenue || 0).toLocaleString()}</p></Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <HiSparkles className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Clients', path: '/nexguard/clients', color: 'from-blue-500 to-blue-600' },
            { label: 'Approvals', path: '/nexguard/approvals', color: 'from-amber-500 to-orange-600' },
            { label: 'Plans', path: '/nexguard/plans', color: 'from-cyan-500 to-teal-600' },
            { label: 'Settings', path: '/nexguard/settings', color: 'from-gray-500 to-gray-600' },
          ].map(link => (
            <button key={link.path} onClick={() => navigate(link.path)}
              className={`p-4 rounded-xl bg-gradient-to-r ${link.color} text-white text-left hover:shadow-lg transition-all hover:scale-[1.02] group`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{link.label}</p>
                <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
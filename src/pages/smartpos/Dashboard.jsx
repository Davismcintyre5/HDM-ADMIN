import { useEffect, useState } from 'react';
import { getOverview } from '../../services/smartpos/dashboard';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/smartpos/ui/Card';
import Spinner from '../../components/smartpos/ui/Spinner';
import StatCard from '../../components/smartpos/ui/StatCard';
import { HiUsers, HiCheckCircle, HiClock, HiCash, HiArrowRight, HiSparkles } from 'react-icons/hi';

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
  const clients = d.clients || {};
  const revenue = d.revenue || {};

  const formatMinor = (minor, currency) => {
    if (minor == null) return '—';
    return `${currency || ''} ${(minor / 100).toLocaleString()}`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">SmartPOS overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Total Clients" value={clients.total || 0} sub={`${clients.active || 0} active`} color="text-blue-500" />
        <StatCard icon={HiClock} label="Trials" value={clients.trials || 0} sub={`${clients.renewals || 0} renewals`} color="text-amber-500" />
        <StatCard icon={HiCheckCircle} label="Pending Approvals" value={clients.pendingApprovals || 0} color="text-orange-500" />
        <StatCard icon={HiCash} label="Revenue (30d)" value={formatMinor(revenue.last30DaysMinor, revenue.currency)} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card><p className="text-sm text-[var(--text-secondary)]">Suspended</p><p className="text-2xl font-bold text-red-500 mt-1">{clients.suspended || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Recent Signups</p><p className="text-2xl font-bold text-emerald-500 mt-1">{clients.recentSignups || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Unread Notifications</p><p className="text-2xl font-bold text-amber-500 mt-1">{d.notifications?.unread || 0}</p></Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <HiSparkles className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Clients', path: '/smartpos/clients' },
            { label: 'Pending', path: '/smartpos/clients' },
            { label: 'Payments', path: '/smartpos/payments' },
            { label: 'Settings', path: '/smartpos/settings' },
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
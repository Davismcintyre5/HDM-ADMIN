import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/hdmnet/dashboard';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/hdmnet/ui/Card';
import Spinner from '../../components/hdmnet/ui/Spinner';
import StatCard from '../../components/hdmnet/ui/StatCard';
import { HiUsers, HiCreditCard, HiWifi, HiCash, HiArrowRight, HiSparkles } from 'react-icons/hi';

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
  const providers = typeof d.providers === 'object' ? d.providers?.total || 0 : d.providers || 0;
  const routers = typeof d.routers === 'object' ? d.routers?.total || 0 : d.routers || 0;
  const transactions = typeof d.transactions === 'object' ? d.transactions?.total || 0 : d.transactions || 0;
  const revenue = typeof d.revenue === 'object' ? d.revenue?.total || 0 : d.revenue || 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">HDM NET system overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Providers" value={providers} color="text-blue-500" />
        <StatCard icon={HiWifi} label="Routers" value={routers} color="text-cyan-500" />
        <StatCard icon={HiCreditCard} label="Transactions" value={transactions} color="text-amber-500" />
        <StatCard icon={HiCash} label="Revenue" value={revenue} color="text-green-500" />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <HiSparkles className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Providers', path: '/hdmnet/providers' },
            { label: 'Pending', path: '/hdmnet/pending' },
            { label: 'Transactions', path: '/hdmnet/transactions' },
            { label: 'Settings', path: '/hdmnet/settings' },
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
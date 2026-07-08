import { useEffect, useState } from 'react';
import { getStats } from '../../services/marketbridge/dashboard';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/marketbridge/ui/Card';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { HiShoppingBag, HiUsers, HiCash, HiExclamation, HiArrowRight } from 'react-icons/hi';

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

  const getValue = (key) => {
    const val = stats?.[key];
    if (val === null || val === undefined) return 0;
    if (typeof val === 'object') return val.total || val.count || 0;
    return val;
  };

  const statCards = [
    { key: 'orders', label: 'Total Orders', icon: HiShoppingBag, color: 'text-violet-600 dark:text-violet-400' },
    { key: 'revenue', label: 'Revenue', icon: HiCash, color: 'text-green-600 dark:text-green-400', format: true },
    { key: 'stores', label: 'Active Stores', icon: HiShoppingBag, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'users', label: 'Users', icon: HiUsers, color: 'text-amber-600 dark:text-amber-400' },
    { key: 'disputes', label: 'Open Disputes', icon: HiExclamation, color: 'text-red-600 dark:text-red-400' },
  ];

  const formatValue = (key, value) => {
    if (key === 'revenue') return `KES ${(value || 0).toLocaleString()}`;
    return (value || 0).toLocaleString();
  };

  const quickLinks = [
    { label: 'Pending Stores', desc: 'Approve new vendors', path: '/marketbridge/stores/pending', color: 'from-amber-500 to-orange-600' },
    { label: 'Disputes', desc: 'Resolve conflicts', path: '/marketbridge/disputes', color: 'from-red-500 to-rose-600' },
    { label: 'Commissions', desc: 'Set rates', path: '/marketbridge/commissions', color: 'from-green-500 to-emerald-600' },
    { label: 'Settings', desc: 'Platform config', path: '/marketbridge/settings', color: 'from-violet-500 to-purple-600' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">MarketBridge platform overview</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => {
          const val = getValue(s.key);
          return (
            <Card key={s.key}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {formatValue(s.key, val)}
                  </p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map(link => (
          <button key={link.path} onClick={() => navigate(link.path)}
            className={`p-4 rounded-xl bg-gradient-to-r ${link.color} text-white text-left hover:shadow-lg transition-all hover:scale-[1.02] group`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{link.label}</p>
              <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-white/70 mt-0.5">{link.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
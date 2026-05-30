import { useEffect, useState } from 'react';
import { getStats } from '../../services/docusoft/dashboard';
import Card from '../../components/docusoft/ui/Card';
import Spinner from '../../components/docusoft/ui/Spinner';
import { HiUsers, HiDocumentText, HiCode, HiShoppingCart, HiCash } from 'react-icons/hi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats()
      .then(res => setStats(res.data || res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  const statCards = [
    { key: 'totalUsers', label: 'Total Users', icon: HiUsers, color: 'text-blue-500', value: stats?.totalUsers || 0 },
    { key: 'totalDocuments', label: 'Documents', icon: HiDocumentText, color: 'text-purple-500', value: stats?.totalDocuments || 0 },
    { key: 'totalSoftware', label: 'Software', icon: HiCode, color: 'text-green-500', value: stats?.totalSoftware || 0 },
    { key: 'totalOrders', label: 'Orders', icon: HiShoppingCart, color: 'text-orange-500', value: stats?.totalOrders || 0 },
    { key: 'pendingPayments', label: 'Pending Payments', icon: HiCash, color: 'text-yellow-500', value: stats?.pendingPayments || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map(s => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
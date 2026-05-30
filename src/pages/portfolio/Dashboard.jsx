import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/portfolio/dashboard';
import Card from '../../components/portfolio/ui/Card';
import Spinner from '../../components/portfolio/ui/Spinner';
import { HiCode, HiBriefcase, HiClipboardList, HiPhotograph, HiMail } from 'react-icons/hi';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data || res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  const stats = [
    { key: 'apps', label: 'Apps', icon: HiCode, color: 'text-blue-500', value: data?.apps || 0 },
    { key: 'services', label: 'Services', icon: HiBriefcase, color: 'text-green-500', value: data?.services || 0 },
    { key: 'projects', label: 'Projects', icon: HiClipboardList, color: 'text-purple-500', value: data?.projects || 0 },
    { key: 'photos', label: 'Photos', icon: HiPhotograph, color: 'text-orange-500', value: data?.photos || 0 },
    { key: 'unreadMessages', label: 'Messages', icon: HiMail, color: 'text-red-500', value: data?.unreadMessages || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map(s => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-[var(--text-secondary)]">{s.label}</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{s.value}</p></div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
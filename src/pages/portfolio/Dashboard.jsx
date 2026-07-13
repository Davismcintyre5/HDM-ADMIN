import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/portfolio/dashboard';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/portfolio/ui/Card';
import Badge from '../../components/portfolio/ui/Badge';
import Spinner from '../../components/portfolio/ui/Spinner';
import { HiCode, HiBriefcase, HiClipboardList, HiPhotograph, HiMail, HiArrowRight, HiTrendingUp, HiSparkles } from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
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
    { key: 'apps', label: 'Apps', icon: HiCode, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', value: data?.apps || 0, path: '/portfolio/apps' },
    { key: 'services', label: 'Services', icon: HiBriefcase, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', value: data?.services || 0, path: '/portfolio/services' },
    { key: 'projects', label: 'Projects', icon: HiClipboardList, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', value: data?.projects || 0, path: '/portfolio/projects' },
    { key: 'photos', label: 'Photos', icon: HiPhotograph, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', value: data?.photos || 0, path: '/portfolio/photos' },
    { key: 'unreadMessages', label: 'Messages', icon: HiMail, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', value: data?.unreadMessages || 0, path: '/portfolio/contacts' },
  ];

  const quickLinks = [
    { label: 'Cloudinary', desc: 'Manage media storage', icon: '☁️', path: '/portfolio/cloudinary', color: 'from-sky-500 to-blue-600' },
    { label: 'MongoDB', desc: 'Database management', icon: '🗄️', path: '/portfolio/mongodb', color: 'from-emerald-500 to-green-600' },
    { label: 'Backups', desc: 'System backups', icon: '💾', path: '/portfolio/backups', color: 'from-violet-500 to-purple-600' },
    { label: 'Company', desc: 'Company profile', icon: '🏢', path: '/portfolio/company', color: 'from-amber-500 to-orange-600' },
    { label: 'Settings', desc: 'System settings', icon: '⚙️', path: '/portfolio/settings', color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">HDM Portfolio Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <Card key={s.key} className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(s.path)}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${s.color.replace('text-', 'bg-')}`} />
            <s.icon className={`w-8 h-8 ${s.color} mb-3`} />
            <p className="text-3xl font-bold text-[var(--text-primary)]">{s.value}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{s.label}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
              View all <HiArrowRight className="w-3 h-3" />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HiSparkles className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`p-4 rounded-xl bg-gradient-to-r ${link.color} text-white text-left hover:shadow-lg transition-all hover:scale-[1.02] group`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{link.icon}</span>
                <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="font-semibold text-sm">{link.label}</p>
              <p className="text-xs text-white/70 mt-0.5">{link.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <HiTrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
          </div>
          <Card>
            <div className="space-y-2">
              {data.recentActivity.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={activity.type === 'create' ? 'success' : activity.type === 'update' ? 'info' : 'default'}>
                      {activity.type}
                    </Badge>
                    <span className="text-sm text-[var(--text-primary)]">{activity.description || activity.message}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{activity.time || activity.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
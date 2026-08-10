import { useEffect, useState } from 'react';
import { getUsers } from '../../services/hdmai2/users';
import { getJobs } from '../../services/hdmai2/jobs';
import { getModels } from '../../services/hdmai2/models';
import { getHealth } from '../../services/hdmai2/health';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/hdmai2/ui/Card';
import Spinner from '../../components/hdmai2/ui/Spinner';
import StatCard from '../../components/hdmai2/ui/StatCard';
import { HiUsers, HiChip, HiCube, HiHeart, HiArrowRight, HiSparkles } from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsers(), getJobs(), getModels(), getHealth()])
      .then(([users, jobs, models, health]) => {
        setStats({
          users: users?.count || users?.data?.length || 0,
          jobs: jobs?.data?.length || jobs?.count || 0,
          models: models?.data?.length || models?.count || 0,
          pythonStatus: health?.data?.pythonAPI || 'unknown',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const d = stats || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">HDM AI system overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiUsers} label="Users" value={d.users || 0} color="text-violet-500" />
        <StatCard icon={HiChip} label="Training Jobs" value={d.jobs || 0} color="text-blue-500" />
        <StatCard icon={HiCube} label="Models" value={d.models || 0} color="text-amber-500" />
        <StatCard icon={HiHeart} label="Python API" value={d.pythonStatus || '—'} color="text-green-500" />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <HiSparkles className="w-5 h-5 text-violet-500" />
          <h2 className="font-semibold text-[var(--text-primary)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Users', path: '/hdmai2/users' },
            { label: 'Training Jobs', path: '/hdmai2/jobs' },
            { label: 'Models', path: '/hdmai2/models' },
            { label: 'Settings', path: '/hdmai2/settings' },
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
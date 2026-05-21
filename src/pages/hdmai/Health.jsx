import { useEffect, useState } from 'react';
import { getAdminHealth } from '../../services/hdmai/health';
import Card from '../../components/hdmai/ui/Card';
import Badge from '../../components/hdmai/ui/Badge';
import Spinner from '../../components/hdmai/ui/Spinner';
import { HiServer, HiDatabase, HiCloud, HiCheck, HiX } from 'react-icons/hi';

export default function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminHealth()
      .then(setHealth)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!health) return null;

  const services = [
    { key: 'mongodb', label: 'MongoDB', icon: HiDatabase },
    { key: 'redis', label: 'Redis', icon: HiDatabase },
    { key: 'groq_api', label: 'Groq API', icon: HiCloud },
    { key: 'gemini_api', label: 'Gemini API', icon: HiCloud },
    { key: 'code_execution', label: 'Code Execution', icon: HiServer },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">System Health</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Server Info */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <HiServer className="w-6 h-6 text-fuchsia-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">Server</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={health.server === 'running' ? 'success' : 'danger'}>{health.server}</Badge></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Version:</span><span className="text-[var(--text-primary)]">{health.version}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Environment:</span><Badge variant="info">{health.environment}</Badge></div>
          </div>
        </Card>

        {/* Services */}
        {services.map(svc => (
          <Card key={svc.key}>
            <div className="flex items-center gap-3 mb-3">
              <svc.icon className="w-6 h-6 text-fuchsia-500" />
              <h2 className="font-semibold text-[var(--text-primary)]">{svc.label}</h2>
            </div>
            <div className="flex items-center gap-2">
              {health[svc.key] === 'connected' || health[svc.key] === 'local' || health[svc.key] === 'running' ? (
                <>
                  <HiCheck className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 capitalize">{health[svc.key]}</span>
                </>
              ) : (
                <>
                  <HiX className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600 capitalize">{health[svc.key] || 'disconnected'}</span>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
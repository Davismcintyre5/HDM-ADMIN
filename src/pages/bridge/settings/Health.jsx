import { useEffect, useState } from 'react';
import { getSystemHealth } from '../../../services/bridge/system';
import Card from '../../../components/bridge/ui/Card';
import Badge from '../../../components/bridge/ui/Badge';
import Spinner from '../../../components/bridge/ui/Spinner';

export default function HealthSettings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemHealth()
      .then(res => setHealth(res.health || res.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!health) return null;

  const services = [
    { key: 'database', label: 'Database', icon: '🗄️' },
    { key: 'redis', label: 'Redis', icon: '⚡' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
            <p className="text-sm text-[var(--text-muted)]">Uptime</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{Math.floor((health.uptime || 0) / 3600)}h</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
            <p className="text-sm text-[var(--text-muted)]">Services</p>
            <p className="text-xl font-bold text-green-600">{services.filter(s => health[s.key] === 'connected').length}/{services.length}</p>
          </div>
        </div>
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.key} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
              <span className="flex items-center gap-2"><span>{s.icon}</span> <span className="font-medium">{s.label}</span></span>
              <Badge variant={health[s.key] === 'connected' ? 'success' : 'danger'}>
                {health[s.key] === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
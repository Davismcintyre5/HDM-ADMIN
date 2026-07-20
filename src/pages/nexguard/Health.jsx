import { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../../services/nexguard/health';
import Card from '../../components/nexguard/ui/Card';
import Badge from '../../components/nexguard/ui/Badge';
import Button from '../../components/nexguard/ui/Button';
import Spinner from '../../components/nexguard/ui/Spinner';
import { HiRefresh, HiServer, HiDatabase, HiChip, HiLink, HiShieldCheck, HiCube } from 'react-icons/hi';

const REFRESH_INTERVAL = 30000; // 30 seconds

const statusConfig = {
  running: { variant: 'success', label: 'Running', color: 'text-green-600', dot: 'bg-green-500' },
  connected: { variant: 'success', label: 'Connected', color: 'text-green-600', dot: 'bg-green-500' },
  disconnected: { variant: 'danger', label: 'Disconnected', color: 'text-red-600', dot: 'bg-red-500' },
  unreachable: { variant: 'danger', label: 'Unreachable', color: 'text-red-600', dot: 'bg-red-500' },
  disabled: { variant: 'warning', label: 'Disabled', color: 'text-yellow-600', dot: 'bg-yellow-500' },
  not_configured: { variant: 'warning', label: 'Not Configured', color: 'text-yellow-600', dot: 'bg-yellow-500' },
};

const StatusDot = ({ status }) => {
  const config = statusConfig[status] || statusConfig.not_configured;
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.dot} mr-2`} />;
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.not_configured;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await getHealth();
      setHealth(res?.data || res);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading && !health) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (error && !health) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-lg mb-4">Failed to fetch health status</div>
        <p className="text-[var(--text-muted)] mb-4">{error}</p>
        <Button onClick={fetchHealth}><HiRefresh className="w-4 h-4 mr-1" /> Retry</Button>
      </div>
    );
  }

  const { server, api, database, redis, bridge, ai } = health || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Health</h1>
          {lastUpdated && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              <span className="ml-2">Auto-refresh: 30s</span>
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={fetchHealth} loading={loading}>
          <HiRefresh className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Server */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiServer className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Server</h3>
            </div>
            <StatusBadge status={server?.status} />
          </div>
          <div className="space-y-2 text-sm">
            <Row label="URL" value={server?.url} />
            <Row label="Uptime" value={server?.uptimeFormatted} />
            <Row label="Node" value={server?.nodeVersion} />
            <Row label="Platform" value={server?.platform} />
            <Row label="Memory Used" value={server?.memoryUsage?.used} />
            <Row label="Memory Free" value={server?.memoryUsage?.free} />
            <Row label="CPU Load" value={server?.cpuLoad?.map(l => `${l}%`).join(' / ')} />
          </div>
        </Card>

   {/* API (Rust Engine) */}
<Card>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <HiCube className="w-5 h-5 text-[var(--text-secondary)]" />
      <h3 className="font-semibold text-[var(--text-primary)]">API Engine</h3>
    </div>
    <StatusBadge status={api?.status} />
  </div>
  <div className="space-y-2 text-sm">
    <Row label="Status" value={api?.status} />
    <Row label="Engine Version" value={api?.version} />
    <Row label="Rust Version" value={api?.rustVersion} />
    <Row label="Platform" value={api?.platform} />
    <Row label="Memory Used" value={api?.memoryUsed} />
    <Row label="URL" value={api?.url} />
    <Row label="Uptime" value={api?.uptimeFormatted} />
  </div>
</Card>

        {/* Database */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiDatabase className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Database</h3>
            </div>
            <StatusBadge status={database?.status} />
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Host" value={database?.host} />
            <Row label="Name" value={database?.name} />
            <Row label="Collections" value={database?.collections} />
          </div>
        </Card>

        {/* Redis */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiLink className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Redis</h3>
            </div>
            <StatusBadge status={redis?.status} />
          </div>
        </Card>

        {/* Bridge */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiLink className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Bridge Server</h3>
            </div>
            <StatusBadge status={bridge?.status} />
          </div>
          <div className="space-y-2 text-sm">
            <Row label="URL" value={bridge?.url} />
          </div>
        </Card>

        {/* AI */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiChip className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">AI Server</h3>
            </div>
            <StatusBadge status={ai?.status} />
          </div>
          <div className="space-y-2 text-sm">
            <Row label="URL" value={ai?.url} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="text-[var(--text-primary)] font-medium">{value}</span>
    </div>
  );
}
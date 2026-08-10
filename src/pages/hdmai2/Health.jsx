import { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../../services/hdmai2/health';
import Card from '../../components/hdmai2/ui/Card';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { HiRefresh, HiServer, HiDatabase, HiStatusOnline, HiCloud, HiCube, HiMail } from 'react-icons/hi';

const REFRESH_INTERVAL = 30000;

const StatusBadge = ({ status }) => {
  const map = { up: 'success', connected: 'success', healthy: 'success', not_configured: 'warning', down: 'danger' };
  return <Badge variant={map[status] || 'default'}>{status || 'unknown'}</Badge>;
};

const StatusDot = ({ status }) => {
  const colors = { up: 'bg-green-500', connected: 'bg-green-500', healthy: 'bg-green-500', not_configured: 'bg-yellow-500', down: 'bg-red-500' };
  return <span className={`w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-gray-400'} inline-block`} />;
};

export default function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await getHealth();
      setHealth(res?.data || res);
      setLastUpdated(new Date());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHealth(); const i = setInterval(fetchHealth, REFRESH_INTERVAL); return () => clearInterval(i); }, [fetchHealth]);

  if (loading && !health) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { server, python, storage, redis, database, hdmBridge } = health || {};
  const servicesUp = [server, python, storage, redis, database].filter(s => s?.status === 'up').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Health</h1>
            <Badge variant={servicesUp >= 5 ? 'success' : 'warning'}>{servicesUp}/5 Services Up</Badge>
          </div>
          {lastUpdated && <p className="text-xs text-[var(--text-muted)] mt-1">Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refresh: 30s</p>}
        </div>
        <Button variant="secondary" onClick={fetchHealth}><HiRefresh className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Server */}
<ServiceCard icon={HiServer} name="Server" status={server?.status} color="blue">
  <Detail label="Version" value={server?.version} />
  <Detail label="Node" value={server?.nodeVersion} />
  <Detail label="Platform" value={`${server?.platform} (${server?.arch})`} />
  <Detail label="URL" value={server?.url} mono />
  <Detail label="Uptime" value={server?.uptime} />
  <Detail label="Memory" value={server?.memory?.used ? `${server.memory.used} / ${server.memory.total} (${server.memory.usagePercent})` : '—'} />
  <Detail label="CPU" value={server?.cpu?.model ? `${server.cpu.model} (${server.cpu.cores} cores)` : '—'} />
  <Detail label="Load Avg" value={server?.cpu?.loadAvg?.join(' / ')} />
  <Detail label="Latency" value={server?.latency} />
</ServiceCard>

        {/* Python */}
<ServiceCard icon={HiCube} name="Python API" status={python?.status} color="amber">
  <Detail label="Version" value={python?.pythonVersion} />
  <Detail label="URL" value={python?.url} mono />
  <Detail label="Uptime" value={python?.uptime} />
  <Detail label="Model" value={python?.model?.name} />
  <Detail label="Capabilities" value={python?.model?.capabilities} />
  <Detail label="Trainings" value={python?.model?.totalTrainings} />
  <Detail label="Total Models" value={python?.model?.totalModels} />
  <Detail label="Latency" value={python?.latency} />
</ServiceCard>

        {/* Database */}
        <ServiceCard icon={HiDatabase} name="Database" status={database?.status} color="green">
          <Detail label="DB" value={database?.dbName} />
          <Detail label="Collections" value={database?.collections} />
          <Detail label="Objects" value={database?.objects} />
          <Detail label="Data Size" value={database?.dataSize} />
          <Detail label="Latency" value={database?.latency} />
        </ServiceCard>

        {/* Redis */}
        <ServiceCard icon={HiStatusOnline} name="Redis" status={redis?.status} color="orange">
          <Detail label="Host" value={redis?.host} />
          <Detail label="Latency" value={redis?.latency} />
        </ServiceCard>

        {/* Storage */}
        <ServiceCard icon={HiCloud} name="Storage" status={storage?.status} color="cyan">
          <Detail label="Type" value={storage?.type} />
          <Detail label="Cloud" value={storage?.cloudName} />
          <Detail label="Models" value={storage?.models} />
          <Detail label="Used" value={storage?.usage?.usedFormatted} />
          <Detail label="Requests" value={storage?.usage?.requests} />
          <Detail label="Latency" value={storage?.latency} />
        </ServiceCard>

        {/* HDM Bridge */}
        <ServiceCard icon={HiMail} name="HDM Bridge" status={hdmBridge?.status} color="purple">
          <Detail label="From" value={hdmBridge?.fromEmail} />
          <Detail label="Sender" value={hdmBridge?.fromName} />
          <Detail label="Latency" value={hdmBridge?.latency} />
        </ServiceCard>
      </div>
    </div>
  );
}

function ServiceCard({ icon: Icon, name, status, color, children }) {
  const ok = status === 'up' || status === 'connected';
  return (
    <Card className={`border-l-4 ${ok ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 text-${color}-500`} />
          <h3 className="font-semibold text-[var(--text-primary)]">{name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="space-y-1 text-sm">{children}</div>
    </Card>
  );
}

function Detail({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)] text-xs">{label}</span>
      <span className={`text-[var(--text-primary)] text-xs ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
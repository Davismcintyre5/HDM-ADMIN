import { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../../services/eduprime/health';
import Card from '../../components/eduprime/ui/Card';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Spinner from '../../components/eduprime/ui/Spinner';
import {
  HiRefresh, HiServer, HiDatabase, HiStatusOnline,
  HiMail, HiDeviceMobile, HiCloud, HiLightningBolt,
  HiCheckCircle, HiXCircle, HiExclamation,
} from 'react-icons/hi';

const REFRESH_INTERVAL = 30000;

const StatusBadge = ({ status }) => {
  const map = {
    running: 'success', up: 'success', connected: 'success',
    enabled: 'success', configured: 'success', healthy: 'success',
    down: 'danger', disconnected: 'danger', disabled: 'warning',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

const StatusDot = ({ status }) => {
  const colors = {
    running: 'bg-green-500', up: 'bg-green-500', connected: 'bg-green-500',
    enabled: 'bg-green-500', healthy: 'bg-green-500',
    down: 'bg-red-500', disconnected: 'bg-red-500',
    disabled: 'bg-yellow-500',
  };
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

  useEffect(() => {
    fetchHealth();
    const i = setInterval(fetchHealth, REFRESH_INTERVAL);
    return () => clearInterval(i);
  }, [fetchHealth]);

  if (loading && !health) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { server, database, redis, email, sms, cloudinary, socket } = health || {};
  const overallOk = health?.overallStatus === 'healthy';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Health</h1>
            <Badge variant={overallOk ? 'success' : 'danger'}>
              {overallOk ? 'All Systems Operational' : 'Issues Detected'}
            </Badge>
          </div>
          {lastUpdated && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refresh: 30s
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={fetchHealth}><HiRefresh className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Server */}
        <ServiceCard icon={HiServer} name="Server" status={server?.status} color="blue">
          <Detail label="Node" value={server?.nodeVersion} />
          <Detail label="Platform" value={`${server?.platform} (${server?.arch})`} />
          <Detail label="Uptime" value={server?.uptimeFormatted} />
          <Detail label="CPU" value={`${server?.cpuUsage}% (${server?.cpuCores} cores)`} />
          <Detail label="Memory" value={`${server?.memoryUsage} / ${server?.totalMemory}`} />
          <Detail label="URL" value={server?.serverUrl} mono />
        </ServiceCard>

        {/* Database */}
        <ServiceCard icon={HiDatabase} name="Database" status={database?.state || database?.status} color="green">
          <Detail label="Host" value={`${database?.host}:${database?.port}`} mono />
          <Detail label="Database" value={database?.dbName} mono />
          <Detail label="Collections" value={database?.collections} />
        </ServiceCard>

        {/* Redis */}
        <ServiceCard icon={HiStatusOnline} name="Redis" status={redis?.status} color="orange">
          <Detail label="Host" value={redis?.host} mono />
        </ServiceCard>

        {/* Email */}
        <ServiceCard icon={HiMail} name="Email" status={email?.status} color="purple">
          <Detail label="Provider" value={email?.provider} />
          <Detail label="From" value={email?.fromEmail} />
          <Detail label="Sender" value={email?.fromName} />
        </ServiceCard>

        {/* SMS */}
        <ServiceCard icon={HiDeviceMobile} name="SMS" status={sms?.status} color="cyan">
          <Detail label="Provider" value={sms?.provider} />
          <Detail label="Sender" value={sms?.sender} />
        </ServiceCard>

        {/* Cloudinary */}
        <ServiceCard icon={HiCloud} name="Cloudinary" status={cloudinary?.status} color="sky">
          <Detail label="Cloud" value={cloudinary?.cloudName} />
        </ServiceCard>

        {/* Socket.IO */}
        <ServiceCard icon={HiLightningBolt} name="Socket.IO" status={socket?.status} color="amber">
  <div className="text-xs text-[var(--text-muted)] break-all mt-1">
    <span className="text-[var(--text-secondary)]">CORS: </span>
    <span className="font-mono text-[var(--text-primary)]">{socket?.corsOrigin}</span>
  </div>
</ServiceCard>
      </div>
    </div>
  );
}

function ServiceCard({ icon: Icon, name, status, color, children }) {
  const ok = status === 'running' || status === 'up' || status === 'connected' || status === 'enabled';

  return (
    <Card className={`border-l-4 ${ok ? 'border-l-green-500' : status === 'disabled' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
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
      <div className="space-y-1.5 text-sm">{children}</div>
    </Card>
  );
}

function Detail({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={`text-[var(--text-primary)] ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../../services/rvnp/health';
import Card from '../../components/rvnp/ui/Card';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Spinner from '../../components/rvnp/ui/Spinner';
import { HiRefresh, HiServer, HiDatabase, HiChip, HiCloud, HiStatusOnline, HiFire } from 'react-icons/hi';

const REFRESH_INTERVAL = 30000;

const statusConfig = {
  running: { variant: 'success', label: 'Running' },
  connected: { variant: 'success', label: 'Connected' },
  disconnected: { variant: 'danger', label: 'Disconnected' },
  unreachable: { variant: 'danger', label: 'Unreachable' },
  disabled: { variant: 'warning', label: 'Disabled' },
  not_configured: { variant: 'warning', label: 'Not Configured' },
  configured: { variant: 'success', label: 'Configured' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const { server, database, redis, cloudinary, agora, firebase, hdmBridge, brevo, hdmAI, mpesa, socketIO, jobs } = health || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Health</h1>
          {lastUpdated && <p className="text-xs text-[var(--text-muted)] mt-1">Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refresh: 30s</p>}
        </div>
        <Button variant="secondary" onClick={fetchHealth}><HiRefresh className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ServiceCard icon={HiServer} name="Server" status={server?.status} details={[['Uptime', server?.uptimeFormatted], ['Memory', `${server?.memory?.heapUsedMB || 0}MB`], ['Node', server?.nodeVersion]]} />
        <ServiceCard icon={HiDatabase} name="Database" status={database?.status} details={[['Host', database?.host], ['Ping', database?.ping], ['Collections', database?.collections]]} />
        <ServiceCard icon={HiStatusOnline} name="Redis" status={redis?.status} details={[['Ping', redis?.ping]]} />
        <ServiceCard icon={HiCloud} name="Cloudinary" status={cloudinary?.status} details={[['Plan', cloudinary?.plan], ['Used', `${cloudinary?.usedMB || 0}MB`]]} />
        <ServiceCard icon={HiFire} name="Socket.IO" status={socketIO?.status} details={[['Clients', socketIO?.connectedClients]]} />
        <ServiceCard icon={HiChip} name="Jobs" status="running" details={[['Total', jobs?.total], ['Running', jobs?.running], ['Failed', jobs?.failed]]} />
        <ServiceCard icon={HiCloud} name="M-Pesa" status={mpesa?.status} details={[['Env', mpesa?.environment]]} />
        <ServiceCard icon={HiServer} name="Bridge" status={hdmBridge?.status} />
        <ServiceCard icon={HiChip} name="AI" status={hdmAI?.status} />
        <ServiceCard icon={HiCloud} name="Agora" status={agora?.status} />
        <ServiceCard icon={HiFire} name="Firebase" status={firebase?.status} />
        <ServiceCard icon={HiServer} name="Brevo" status={brevo?.status} />
      </div>
    </div>
  );
}

function ServiceCard({ icon: Icon, name, status, details }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">{name}</h3>
        </div>
        <StatusBadge status={status} />
      </div>
      {details?.length > 0 && (
        <div className="space-y-1 text-sm">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className="text-[var(--text-primary)]">{value ?? '—'}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
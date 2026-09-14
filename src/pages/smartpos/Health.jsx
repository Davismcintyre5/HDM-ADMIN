import { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../../services/smartpos/health';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';
import { HiRefresh, HiServer, HiDatabase, HiStatusOnline, HiMail, HiDeviceMobile, HiCloud, HiShieldCheck } from 'react-icons/hi';

const REFRESH_INTERVAL = 30000;

const StatusBadge = ({ status }) => {
  const map = { running: 'success', connected: 'success', up: 'success', enabled: 'success', disabled: 'warning', down: 'danger', disconnected: 'danger' };
  return <Badge variant={map[status] || 'default'}>{status || 'unknown'}</Badge>;
};

const StatusDot = ({ status }) => {
  const colors = { running: 'bg-green-500', connected: 'bg-green-500', up: 'bg-green-500', enabled: 'bg-green-500', disabled: 'bg-gray-400', down: 'bg-red-500', disconnected: 'bg-red-500' };
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

  const { server, database, redis, email, sms, storage, cors, stats, timestamp } = health || {};
  const servicesUp = [server, database, redis, email, sms, storage]
    .filter(s => s?.status === 'running' || s?.status === 'connected' || s?.status === 'up' || s?.status === 'enabled').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Health</h1>
            <Badge variant={servicesUp >= 5 ? 'success' : 'warning'}>{servicesUp}/6 Services Up</Badge>
          </div>
          {lastUpdated && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refresh: 30s
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={fetchHealth}>
          <HiRefresh className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ServiceCard icon={HiServer} name="Server" status={server?.status}>
          <Detail label="Node" value={server?.node} />
          <Detail label="Platform" value={server?.platform} />
          <Detail label="URL" value={server?.url} mono />
          <Detail label="Uptime" value={server?.uptime} />
          <Detail label="CPU" value={server?.cpu} />
          <Detail label="Memory" value={server?.memory} />
        </ServiceCard>

        <ServiceCard icon={HiDatabase} name="Database" status={database?.status}>
          <Detail label="Type" value={database?.type} />
          <Detail label="Host" value={database?.host} mono />
          <Detail label="Database" value={database?.database} />
          <Detail label="Collections" value={database?.collections} />
          <Detail label="Documents" value={database?.documents} />
        </ServiceCard>

        <ServiceCard icon={HiStatusOnline} name="Redis" status={redis?.status}>
          <Detail label="Host" value={redis?.host} mono />
          <Detail label="Enabled" value={redis?.enabled ? 'Yes' : 'No'} />
        </ServiceCard>

        <ServiceCard icon={HiMail} name="Email" status={email?.status}>
          <Detail label="Provider" value={email?.provider} />
          <Detail label="From" value={email?.from} />
          <Detail label="Sender" value={email?.sender} />
        </ServiceCard>

        <ServiceCard icon={HiDeviceMobile} name="SMS" status={sms?.status}>
          <Detail label="Provider" value={sms?.provider} />
          <Detail label="Sender" value={sms?.sender} />
        </ServiceCard>

        <ServiceCard icon={HiCloud} name="Storage" status={storage?.status}>
          <Detail label="Type" value={storage?.type} />
          <Detail label="Cloud" value={storage?.cloud} />
          <Detail label="Backups" value={storage?.backups} />
        </ServiceCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Clients" value={stats?.clients?.total} sub={`${stats?.clients?.active || 0} active · ${stats?.clients?.trials || 0} trials`} />
        <StatCard label="Subscriptions" value={stats?.subscriptions?.total} sub={`${stats?.subscriptions?.renewals || 0} renewals`} />
        <StatCard label="Payments" value={stats?.payments?.total} sub={`${stats?.payments?.failed || 0} failed`} />
        <StatCard label="Notifications" value={stats?.notifications} />
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Content</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <MiniStat label="Products" value={stats?.content?.products} />
          <MiniStat label="Categories" value={stats?.content?.categories} />
          <MiniStat label="Sales" value={stats?.content?.sales} />
          <MiniStat label="Customers" value={stats?.content?.customers} />
          <MiniStat label="Staff" value={stats?.content?.staff} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <HiShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="font-semibold text-[var(--text-primary)]">CORS Origins</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {cors?.origins?.map((origin, i) => (
            <Badge key={i} variant="info">{origin}</Badge>
          ))}
        </div>
        {timestamp && (
          <p className="text-xs text-[var(--text-muted)] mt-4">
            Data timestamp: {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </Card>
    </div>
  );
}

function ServiceCard({ icon: Icon, name, status, children }) {
  const ok = status === 'running' || status === 'connected' || status === 'up' || status === 'enabled';
  return (
    <Card className={`border-l-4 ${ok ? 'border-l-green-500' : status === 'disabled' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
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

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
      <p className="text-xl font-bold text-[var(--text-primary)]">{value ?? '—'}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      {sub && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
      <p className="text-xl font-bold text-[var(--text-primary)]">{value || 0}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
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
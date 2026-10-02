import { useEffect, useState, useCallback } from 'react';
import {
  HiServer,
  HiDatabase,
  HiStatusOnline,
  HiMail,
  HiDeviceMobile,
  HiRefresh,
  HiCreditCard,
  HiSparkles,
  HiCollection,
  HiArchive,
  HiGlobe,
  HiCash,
} from 'react-icons/hi';
import { SiStripe, SiPaypal } from 'react-icons/si';
import Card from '../../components/bridge/ui/Card';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Spinner from '../../components/bridge/ui/Spinner';
import { getHealthFull } from '../../services/bridge/system';

const OK_STATES = ['up', 'enabled', 'connected', 'healthy', 'running'];
const WARN_STATES = ['disabled', 'degraded', 'misconfigured', 'partial', 'connecting'];
const BAD_STATES = ['down', 'error', 'disconnected', 'failed'];

function StatusDot({ status }) {
  const ok = OK_STATES.includes(status);
  const warn = WARN_STATES.includes(status);
  const bad = BAD_STATES.includes(status);
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        ok ? 'bg-green-500' : warn ? 'bg-yellow-500' : bad ? 'bg-red-500' : 'bg-gray-400'
      }`}
    />
  );
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  const b = Number(bytes);
  if (b >= 1024 * 1024 * 1024) return `${(b / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Health() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getHealthFull();
      const payload = res?.data?.data || res?.data || res;
      setData(payload);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Health fetch:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <p className="text-sm text-[var(--text-muted)]">Failed to load health data.</p>
        <Button onClick={() => load()} className="mt-4">
          <HiRefresh className="w-4 h-4 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  const overall = data.overall || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">System health</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {overall.up ?? 0}/{overall.total ?? 0} services up
            {overall.degraded > 0 && ` · ${overall.degraded} degraded`}
            {overall.down > 0 && ` · ${overall.down} down`}
            {lastUpdated && ` · updated ${lastUpdated.toLocaleTimeString('en-KE')}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              overall.status === 'healthy'
                ? 'success'
                : overall.status === 'degraded'
                ? 'warning'
                : 'danger'
            }
          >
            {overall.status || 'unknown'}
          </Badge>
          <Button variant="outline" onClick={() => load(true)} loading={refreshing}>
            <HiRefresh className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ServiceCard icon={HiServer} title="Server" status={data.server?.status}>
          <Detail label="Node" value={data.server?.node} />
          <Detail label="Platform" value={data.server?.platform} />
          <Detail label="Arch" value={data.server?.arch} />
          <Detail label="Uptime" value={data.server?.uptimeHuman} />
          <Detail label="CPU" value={`${data.server?.cpuCores ?? 0} cores`} />
          <Detail label="RSS" value={`${data.server?.memoryRssMb ?? 0} MB`} />
          <Detail label="Heap" value={`${data.server?.memoryHeapMb ?? 0} MB`} />
          <Detail label="Env" value={data.server?.env} />
        </ServiceCard>

        <ServiceCard icon={HiDatabase} title="Database" status={data.database?.status}>
          <Detail label="Type" value={data.database?.type} />
          <Detail label="Host" value={data.database?.host} />
          <Detail label="Name" value={data.database?.database} />
          <Detail label="Collections" value={data.database?.collections} />
        </ServiceCard>

        <ServiceCard icon={HiStatusOnline} title="Redis" status={data.redis?.status}>
          <Detail label="Enabled" value={data.redis?.enabled ? 'Yes' : 'No'} />
          <Detail label="Host" value={data.redis?.host} />
          <Detail label="Latency" value={data.redis?.latencyMs != null ? `${data.redis.latencyMs} ms` : undefined} />
        </ServiceCard>

        <ServiceCard icon={HiCollection} title="Queues" status={data.queues?.status}>
          <Detail label="Name" value={data.queues?.name} />
          <Detail label="Waiting" value={data.queues?.waiting} />
          <Detail label="Active" value={data.queues?.active} />
          <Detail label="Completed" value={Number(data.queues?.completed ?? 0).toLocaleString()} />
          <Detail label="Failed" value={Number(data.queues?.failed ?? 0).toLocaleString()} />
          <Detail label="Delayed" value={data.queues?.delayed} />
        </ServiceCard>

        <ServiceCard icon={HiMail} title="Email" status={data.email?.status}>
          <Detail label="Provider" value={data.email?.provider} />
          <Detail label="Accounts" value={data.email?.accounts} />
          <Detail label="From" value={data.email?.fromMasked} />
        </ServiceCard>

        <ServiceCard icon={HiDeviceMobile} title="SMS" status={data.sms?.status}>
          <Detail label="Provider" value={data.sms?.provider} />
          <Detail label="Sender" value={data.sms?.sender} />
        </ServiceCard>

        <ServiceCard icon={SiStripe} title="Stripe" status={data.stripe?.status}>
          <Detail label="Mode" value={data.stripe?.mode} />
        </ServiceCard>

        <ServiceCard icon={SiPaypal} title="PayPal" status={data.paypal?.status}>
          <Detail label="Mode" value={data.paypal?.mode} />
        </ServiceCard>

        <ServiceCard icon={HiCreditCard} title="M-Pesa" status={data.mpesa?.status}>
          <Detail label="Environment" value={data.mpesa?.environment} />
          <Detail label="Shortcode" value={data.mpesa?.shortCode} />
          <Detail label="Type" value={data.mpesa?.transactionType} />
          <Detail label="Callback" value={data.mpesa?.callbackUrl} />
        </ServiceCard>

        <ServiceCard icon={HiSparkles} title="AI" status={data.ai?.status}>
          <Detail label="Provider" value={data.ai?.provider} />
          <Detail label="Model" value={data.ai?.model} />
          <Detail label="Base URL" value={data.ai?.baseUrl} />
        </ServiceCard>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiArchive className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Backups</h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={data.backups?.status} />
              <Badge variant={data.backups?.status === 'enabled' ? 'success' : 'default'}>
                {data.backups?.count ?? 0} files
              </Badge>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Type">{data.backups?.type || '—'}</Row>
            <Row label="Count">{data.backups?.count ?? 0}</Row>
            <Row label="Last">{formatDate(data.backups?.lastBackupAt)}</Row>
            <Row label="Size">{formatBytes(data.backups?.lastBackupSize)}</Row>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <HiGlobe className="w-5 h-5 text-[var(--text-secondary)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">CORS origins</h3>
          </div>
          {(data.cors || []).length > 0 ? (
            <ul className="text-sm space-y-1">
              {data.cors.map((o) => (
                <li key={o} className="font-mono text-xs text-[var(--text-secondary)] truncate">
                  {o}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No origins configured</p>
          )}
        </Card>
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center pt-2">
        HDM BRIDGE v{data.version} · {data.environment} · Response {data.responseTimeMs}ms
      </p>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, status, children }) {
  const ok = OK_STATES.includes(status);
  const warn = WARN_STATES.includes(status);
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <Badge variant={ok ? 'success' : warn ? 'warning' : 'danger'}>
            {status || 'unknown'}
          </Badge>
        </div>
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </Card>
  );
}

function Detail({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return <Row label={label}>{value}</Row>;
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs">{label}</dt>
      <dd className="text-[var(--text-primary)] text-xs text-right truncate">{children}</dd>
    </div>
  );
}
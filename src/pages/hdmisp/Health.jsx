import { useEffect, useState, useCallback, useRef } from 'react';
import {
  HiServer, HiDatabase, HiStatusOnline, HiCloud, HiMail,
  HiCash, HiShieldCheck, HiRefresh, HiClock, HiChip,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { getDetailedHealth } from '../../services/hdmisp/health';

const REFRESH_MS = 30000;

const OK_STATES = ['up', 'enabled', 'connected', 'healthy', 'configured'];
const WARN_STATES = ['disabled', 'degraded', 'idle', 'separate_process'];

function StatusDot({ status }) {
  const ok = OK_STATES.includes(status);
  const warn = WARN_STATES.includes(status);
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        ok ? 'bg-green-500' : warn ? 'bg-yellow-500' : 'bg-red-500'
      }`}
    />
  );
}

function StatusBadge({ status }) {
  const ok = OK_STATES.includes(status);
  const warn = WARN_STATES.includes(status);
  return (
    <Badge variant={ok ? 'success' : warn ? 'warning' : 'danger'} dot>
      {status || 'unknown'}
    </Badge>
  );
}

function ServiceCard({ icon: Icon, title, status, children }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <StatusBadge status={status} />
        </div>
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </Card>
  );
}

function Row({ label, value, mono }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs shrink-0">{label}</dt>
      <dd
        className={`text-[var(--text-primary)] text-xs text-right truncate ${
          mono ? 'font-mono' : ''
        }`}
        title={String(value)}
      >
        {value}
      </dd>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 truncate">
        {value ?? '—'}
      </p>
      {hint && (
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function Health() {
  const inFlight = useRef(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [degraded, setDegraded] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!silent) setLoading(true);

    try {
      const payload = await getDetailedHealth();
      if (payload && typeof payload === 'object' && payload.server) {
        setData(payload);
        setLastUpdated(new Date());
        setErrorMsg(null);
        setDegraded(payload.status !== 'healthy');
      } else if (!silent) {
        setErrorMsg('Health endpoint returned an unexpected payload.');
      }
    } catch (err) {
      if (!silent) {
        setErrorMsg(err?.message || 'Failed to load health');
      }
    } finally {
      inFlight.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), REFRESH_MS);
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
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          {errorMsg || 'Health data unavailable.'}
        </p>
        <Button
          variant="outline"
          onClick={() => load()}
          loading={loading}
          icon={<HiRefresh className="w-4 h-4" />}
        >
          Retry
        </Button>
      </div>
    );
  }

  const s = data.server || {};
  const cpu = s.cpu || {};
  const mem = s.memory || {};
  const db = data.database || {};
  const cloud = data.cloudinary || {};
  const bridge = data.hdmBridge || {};
  const mpesa = data.mpesa || {};
  const radius = data.radius || {};
  const schedulers = data.schedulers || {};
  const overall = data.overall || { up: 0, total: 0 };
  const counts = data.data || {};
  const activity = data.activity || {};
  const isHealthy = !degraded && data.status === 'healthy';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              System Health
            </h1>
            <Badge variant={isHealthy ? 'success' : 'warning'} dot>
              {data.status || 'unknown'}
            </Badge>
            <Badge variant="info">
              {overall.up ?? 0}/{overall.total ?? 0} services
            </Badge>
          </div>
          {lastUpdated && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Updated {lastUpdated.toLocaleTimeString()} · auto-refresh 30s
            </p>
          )}
        </div>
        <Button
          variant="outline"
          icon={<HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          onClick={() => load()}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiServer className="w-5 h-5 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {s.appName || 'API server'}
            </span>
            <Badge variant="default">v{s.version || '—'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={s.status} />
            <StatusBadge status={s.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Node" value={s.node} />
          <Stat label="Environment" value={s.env} />
          <Stat label="Platform" value={s.platformFull} hint={s.arch} />
          <Stat label="Uptime" value={s.uptimeHuman} />
          <Stat label="CPU cores" value={cpu.cores} hint={cpu.model} />
          <Stat
            label="Load (1m/5m/15m)"
            value={cpu.loadAvg ? cpu.loadAvg.map((v) => v.toFixed(2)).join(' / ') : '—'}
          />
          <Stat
            label="Memory (RSS)"
            value={`${mem.rssMb ?? 0} MB`}
            hint={`heap ${mem.heapUsedMb ?? 0}/${mem.heapTotalMb ?? 0} MB`}
          />
          <Stat
            label="System memory"
            value={`${mem.freeSystemMb ?? 0} / ${mem.totalSystemMb ?? 0} MB`}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ServiceCard icon={HiDatabase} title="Database" status={db.status}>
          <Row label="Database" value={db.database} mono />
          <Row label="Host" value={db.host} mono />
          <Row label="Collections" value={db.collections} />
          <Row label="Documents" value={(db.documents ?? 0).toLocaleString()} />
          <Row label="Ping" value={db.pingMs != null ? `${db.pingMs} ms` : null} />
        </ServiceCard>

        <ServiceCard icon={HiCloud} title="Cloudinary" status={cloud.status}>
          <Row label="Cloud" value={cloud.cloud} mono />
          <Row label="Folder" value={cloud.folder} mono />
          <Row label="Ping" value={cloud.pingMs != null ? `${cloud.pingMs} ms` : null} />
          <Row label="Message" value={cloud.message} />
        </ServiceCard>

        <ServiceCard icon={HiMail} title="HDM Bridge" status={bridge.status}>
          <Row label="From email" value={bridge.fromEmail} mono />
          <Row label="From name" value={bridge.fromName} />
          <Row label="SMS sender" value={bridge.smsSender} mono />
          <Row label="Email" value={bridge.emailEnabled ? 'Enabled' : 'Disabled'} />
          <Row label="SMS" value={bridge.smsEnabled ? 'Enabled' : 'Disabled'} />
        </ServiceCard>

        <ServiceCard icon={HiCash} title="M-Pesa" status={mpesa.status}>
          <Row label="Env" value={mpesa.env} />
          <Row label="Type" value={mpesa.transactionType} />
          <Row label="Shortcode" value={mpesa.shortCode} mono />
          <Row label="Till" value={mpesa.tillNumber} mono />
        </ServiceCard>

        <ServiceCard icon={HiStatusOnline} title="RADIUS" status={radius.status}>
          <Row label="Rate-limit attr" value={radius.rateLimitAttribute} mono />
          <Row label="Session timeout" value={radius.sessionTimeout} />
          <Row label="Acct interval" value={radius.acctInterimInterval} />
        </ServiceCard>

        <ServiceCard icon={HiClock} title="Schedulers" status={schedulers.status}>
          <Row label="In-process" value={schedulers.inProcess ? 'Yes' : 'No'} />
        </ServiceCard>

        <ServiceCard icon={HiChip} title="Data" status="up">
          <Row label="Providers" value={counts.providers} />
          <Row label="Admins" value={counts.admins} />
          <Row label="Customers" value={counts.customers} />
          <Row label="Sessions" value={(counts.sessions ?? 0).toLocaleString()} />
          <Row label="Transactions" value={(counts.transactions ?? 0).toLocaleString()} />
          <Row label="Notifications" value={(counts.notifications ?? 0).toLocaleString()} />
        </ServiceCard>

        <ServiceCard icon={HiShieldCheck} title="Activity (24h)" status="up">
          <Row label="Transactions" value={activity.transactions24h} />
          <Row label="Sessions" value={activity.sessions24h} />
          <Row label="Notifications" value={activity.notifications24h} />
        </ServiceCard>
      </div>

      {data.timestamp && (
        <p className="text-xs text-[var(--text-muted)] text-center">
          Server timestamp: {new Date(data.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}
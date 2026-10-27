import { useEffect, useState, useCallback, useRef } from 'react';
import {
  HiServer,
  HiDatabase,
  HiStatusOnline,
  HiCloud,
  HiVideoCamera,
  HiMail,
  HiSparkles,
  HiRefresh,
  HiChip,
  HiInbox,
  HiCog,
} from 'react-icons/hi';
import { getDetailedHealth } from '../../services/tvetgrid/health';
import { useToast } from '../../context/tvetgrid/ToastContext';

const OK_STATES = ['up', 'enabled', 'connected', 'healthy', 'configured'];
const REFRESH_MS = 30000;

function StatusDot({ status }) {
  const ok = OK_STATES.includes(status);
  const warn =
    status === 'disabled' || status === 'degraded' || status === 'idle';
  const color = ok ? 'bg-green-500' : warn ? 'bg-gray-400' : 'bg-red-500';
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function Badge({ color = 'gray', children }) {
  const colors = {
    green:
      'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    yellow:
      'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    gray: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}
    >
      {children}
    </span>
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

function Detail({ label, value, mono }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-muted)] text-xs shrink-0">{label}</dt>
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

function ServiceCard({ icon: Icon, title, status, children }) {
  const ok = OK_STATES.includes(status);
  const warn =
    status === 'disabled' || status === 'degraded' || status === 'idle';
  return (
    <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[var(--text-muted)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <Badge color={ok ? 'green' : warn ? 'gray' : 'red'}>
            {status || 'unknown'}
          </Badge>
        </div>
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </div>
  );
}

// Unwrap ApiResponse.ok body: { success, data, message } → data
// Falls back to the body itself if it's already the payload.
function unwrapHealth(res) {
  if (!res || typeof res !== 'object') return null;
  const candidate = res.data ?? res;
  if (!candidate || typeof candidate !== 'object') return null;
  return candidate;
}

function isUsablePayload(p) {
  if (!p || typeof p !== 'object') return false;
  // Must have at least one expected top-level key
  return ['server', 'database', 'status', 'overall', 'redis'].some(
    (k) => p[k] !== undefined
  );
}

export default function HealthPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  const inFlight = useRef(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const load = useCallback(async (silent = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!silent) setLoading(true);

    try {
      const res = await getDetailedHealth();
      const payload = unwrapHealth(res);

      if (isUsablePayload(payload)) {
        setData(payload);
        setLastUpdated(new Date());
        setRateLimited(false);
        setErrorMsg(null);
      } else if (!silent) {
        setErrorMsg('Health endpoint returned an empty or unexpected payload.');
      }
    } catch (err) {
      // normalizeError flattens the axios error — use err.status, not err.response.status
      const status = err?.status ?? err?.response?.status;
      if (status === 429) {
        setRateLimited(true);
      } else if (!silent) {
        setErrorMsg(err?.message || 'Failed to load health');
        toastRef.current.error(err?.message || 'Failed to load health');
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
        <div className="w-12 h-12 border-2 border-[var(--border-color)] border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 max-w-md mx-auto text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          {rateLimited
            ? 'Rate limited — retrying automatically.'
            : errorMsg || 'Health data unavailable.'}
        </p>
        <button
          onClick={() => load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-secondary)] transition-colors disabled:opacity-50"
        >
          <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Retry
        </button>
      </div>
    );
  }

  const s = data.server || {};
  const cpu = s.cpu || {};
  const mem = s.memory || {};
  const dbx = data.database || {};
  const redis = data.redis || {};
  const cloud = data.cloudinary || {};
  const lk = data.livekit || {};
  const bridge = data.hdmBridge || {};
  const ai = data.hdmAi || {};
  const queues = data.queues || { queues: [] };
  const counts = data.data || {};
  const activity = data.activity || {};
  const overall = data.overall || { up: 0, total: 0 };
  const isHealthy = data.status === 'healthy';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              System Health
            </h1>
            <Badge color={isHealthy ? 'green' : 'yellow'}>
              {data.status || 'unknown'}
            </Badge>
            <Badge color="blue">
              {overall.up}/{overall.total} services
            </Badge>
            {rateLimited && <Badge color="yellow">rate limited</Badge>}
          </div>
          {lastUpdated && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Updated {lastUpdated.toLocaleTimeString()} · auto-refresh 30s
            </p>
          )}
        </div>
        <button
          onClick={() => load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-secondary)] transition-colors disabled:opacity-50"
        >
          <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Server card */}
      <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiServer className="w-5 h-5 text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {s.url || 'API server'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={s.status} />
            <Badge color="green">{s.status || 'unknown'}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="App" value={s.appName} />
          <Stat label="Version" value={s.version} />
          <Stat label="Node" value={s.node} />
          <Stat label="Environment" value={s.env} />

          <Stat
            label="Platform"
            value={s.platformFull}
            hint={s.arch ? `arch: ${s.arch}` : undefined}
          />
          <Stat
            label="Uptime"
            value={s.uptimeHuman}
            hint={
              s.uptimeSeconds
                ? `${s.uptimeSeconds.toLocaleString()}s`
                : undefined
            }
          />
          <Stat
            label="Started"
            value={s.startedAt ? new Date(s.startedAt).toLocaleString() : '—'}
          />
          <Stat label="PID" value={s.pid} />

          <Stat
            label="CPU"
            value={`${cpu.cores ?? 0} cores`}
            hint={cpu.model || undefined}
          />
          <Stat
            label="Load (1m / 5m / 15m)"
            value={
              cpu.loadAvg
                ? cpu.loadAvg.map((v) => v.toFixed(2)).join(' / ')
                : '—'
            }
          />
          <Stat
            label="Memory (RSS)"
            value={`${mem.rssMb ?? 0} MB`}
            hint={`heap ${mem.heapUsedMb ?? 0}/${mem.heapTotalMb ?? 0} MB`}
          />
          <Stat
            label="System memory"
            value={`${mem.freeSystemMb ?? 0} / ${mem.totalSystemMb ?? 0} MB`}
            hint={
              mem.totalSystemMb
                ? `${Math.round(
                    ((mem.totalSystemMb - mem.freeSystemMb) /
                      mem.totalSystemMb) *
                      100
                  )}% used`
                : undefined
            }
          />
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ServiceCard icon={HiDatabase} title="MongoDB" status={dbx.status}>
          <Detail label="Database" value={dbx.database} />
          <Detail label="Host" value={dbx.host} mono />
          <Detail label="Collections" value={dbx.collections} />
          <Detail
            label="Documents"
            value={(dbx.documents ?? 0).toLocaleString()}
          />
          {dbx.pingMs != null && (
            <Detail label="Ping" value={`${dbx.pingMs} ms`} />
          )}
        </ServiceCard>

        <ServiceCard
          icon={HiStatusOnline}
          title="Redis"
          status={redis.status}
        >
          <Detail label="Enabled" value={redis.enabled ? 'Yes' : 'No'} />
          <Detail label="Host" value={redis.host} mono />
          {redis.memoryUsed && (
            <Detail label="Memory" value={redis.memoryUsed} />
          )}
          {redis.connections != null && (
            <Detail label="Connections" value={redis.connections} />
          )}
          {redis.pingMs != null && (
            <Detail label="Ping" value={`${redis.pingMs} ms`} />
          )}
        </ServiceCard>

        <ServiceCard icon={HiCloud} title="Cloudinary" status={cloud.status}>
          <Detail label="Cloud" value={cloud.cloud} />
          <Detail label="Folder" value={cloud.folder} mono />
          {cloud.pingMs != null && (
            <Detail label="Ping" value={`${cloud.pingMs} ms`} />
          )}
          {cloud.message && <Detail label="Error" value={cloud.message} />}
        </ServiceCard>

        <ServiceCard
          icon={HiVideoCamera}
          title="LiveKit"
          status={lk.status}
        >
          <Detail label="URL" value={lk.url} mono />
          <Detail label="Active Rooms" value={lk.activeRooms ?? 0} />
          {lk.pingMs != null && (
            <Detail label="Ping" value={`${lk.pingMs} ms`} />
          )}
          {lk.message && <Detail label="Error" value={lk.message} />}
        </ServiceCard>

        <ServiceCard icon={HiMail} title="HDM Bridge" status={bridge.status}>
          <Detail label="From Email" value={bridge.fromEmail} mono />
          <Detail label="From Name" value={bridge.fromName} />
          <Detail label="SMS Sender" value={bridge.smsSender} mono />
          <Detail
            label="SMS Enabled"
            value={bridge.smsEnabled ? 'Yes' : 'No'}
          />
        </ServiceCard>

        <ServiceCard icon={HiSparkles} title="HDM AI" status={ai.status}>
          <Detail label="Model" value={ai.model} />
          <Detail label="API URL" value={ai.apiUrl} mono />
        </ServiceCard>

        <ServiceCard icon={HiInbox} title="Queues" status={queues.status}>
          {queues.queues?.length ? (
            queues.queues.map((q) => (
              <div
                key={q.name}
                className="border-t border-[var(--border-color)] pt-2 mt-2 first:border-0 first:pt-0 first:mt-0 space-y-1"
              >
                <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                  {q.name}
                </p>
                <Detail label="Waiting" value={q.waiting} />
                <Detail label="Active" value={q.active} />
                <Detail label="Completed" value={q.completed} />
                <Detail label="Failed" value={q.failed} />
                <Detail label="Delayed" value={q.delayed} />
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No queues</p>
          )}
        </ServiceCard>

        <ServiceCard icon={HiChip} title="Content" status="up">
          <Detail label="Users" value={counts.users} />
          <Detail label="Admins" value={counts.admins} />
          <Detail label="Courses" value={counts.courses} />
          <Detail label="Subjects" value={counts.subjects} />
          <Detail label="Lessons" value={counts.lessons} />
          <Detail label="Notes" value={counts.notes} />
          <Detail label="Papers" value={counts.papers} />
        </ServiceCard>

        <ServiceCard icon={HiCog} title="Activity" status="up">
          <Detail label="Attempts (24h)" value={activity.attempts24h} />
          <Detail label="Meetings (24h)" value={activity.meetings24h} />
          <Detail label="Invites (24h)" value={activity.invites24h} />
          <Detail label="Total Attempts" value={counts.attempts} />
          <Detail label="Total Meetings" value={counts.meetings} />
          <Detail label="Total Progress" value={counts.progress} />
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
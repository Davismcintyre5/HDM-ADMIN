import { useEffect, useState, useCallback } from 'react';
import {
  HiServer,
  HiDatabase,
  HiStatusOnline,
  HiMail,
  HiDeviceMobile,
  HiCloud,
  HiRefresh,
  HiSparkles,
  HiCash,
  HiCreditCard,
  HiGlobe,
  HiHeart,
  HiClock,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import { getHealth } from '../../services/meteo/health';
import { formatDate } from '../../utils/meteo/formatDate';

const OK_STATES = ['up', 'enabled', 'connected', 'healthy'];
const REFRESH_MS = 30000;

function StatusDot({ status }) {
  const ok = OK_STATES.includes(status);
  const warn = status === 'disabled' || status === 'degraded';
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        ok ? 'bg-green-500' : warn ? 'bg-gray-400' : 'bg-red-500'
      }`}
    />
  );
}

export default function Health() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await getHealth();
        setData(res?.data || res);
        setLastUpdated(new Date());
      } catch (err) {
        if (!silent) toast.error(err.message || 'Failed to load health');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  const s = data.server || {};
  const cpu = s.cpu || {};
  const mem = s.memory || {};
  const weather = data.weather || {};

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              System Health
            </h1>
            <Badge
              variant={
                data.status === 'healthy'
                  ? 'success'
                  : data.status === 'degraded'
                  ? 'warning'
                  : 'danger'
              }
              dot
            >
              {data.status || 'unknown'}
            </Badge>
            <Badge variant="info">
              {data.overall?.up ?? 0}/{data.overall?.total ?? 0} services
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
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={() => load()}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Server — expanded */}
      <Card title="Server" className="md:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiServer className="w-5 h-5 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {s.url || 'API server'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={s.status} />
            <Badge variant={OK_STATES.includes(s.status) ? 'success' : 'default'}>
              {s.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Version" value={s.version} />
          <Stat label="Node" value={s.node} />
          <Stat label="Environment" value={s.env} />
          <Stat label="Hostname" value={s.hostname} />

          <Stat
            label="Platform"
            value={s.platformFull || s.platform}
            hint={s.arch ? `arch: ${s.arch}` : undefined}
          />
          <Stat label="Uptime" value={s.uptimeHuman} hint={
            s.uptimeSeconds ? `${s.uptimeSeconds.toLocaleString()}s` : undefined
          } />
          <Stat
            label="Started"
            value={s.startedAt ? formatDate(s.startedAt, 'full') : '—'}
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
      </Card>

      {/* Other services — grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ServiceCard icon={HiDatabase} title="Database" status={data.database?.status}>
          <Detail label="Type" value={data.database?.type} />
          <Detail label="Name" value={data.database?.database} />
          <Detail label="Host" value={data.database?.host} mono />
          <Detail label="Collections" value={data.database?.collections} />
          <Detail
            label="Documents"
            value={(data.database?.documents ?? 0).toLocaleString()}
          />
        </ServiceCard>

        <ServiceCard icon={HiStatusOnline} title="Redis" status={data.redis?.status}>
          <Detail label="Enabled" value={data.redis?.enabled ? 'Yes' : 'No'} />
          <Detail label="Host" value={data.redis?.host} mono />
          {data.redis?.memoryUsed && (
            <Detail label="Memory" value={data.redis.memoryUsed} />
          )}
          {data.redis?.message && (
            <Detail label="Message" value={data.redis.message} />
          )}
        </ServiceCard>

        <ServiceCard icon={HiMail} title="Email" status={data.email?.status}>
          <Detail label="Provider" value={data.email?.provider} />
          <Detail label="From" value={data.email?.fromMasked || data.email?.from} />
          <Detail label="Sender" value={data.email?.sender} />
        </ServiceCard>

        <ServiceCard icon={HiDeviceMobile} title="SMS" status={data.sms?.status}>
          <Detail label="Provider" value={data.sms?.provider} />
          <Detail label="Sender" value={data.sms?.sender} />
        </ServiceCard>

        <ServiceCard icon={HiSparkles} title="AI" status={data.ai?.status}>
          <Detail label="Provider" value={data.ai?.provider} />
          <Detail label="Model" value={data.ai?.model} />
          <Detail label="Base URL" value={data.ai?.baseUrl} mono />
        </ServiceCard>

        <ServiceCard icon={HiCash} title="M-Pesa" status={data.mpesa?.status}>
          <Detail label="Mode" value={data.mpesa?.mode} />
          <Detail label="Type" value={data.mpesa?.transactionType} />
          <Detail label="Shortcode" value={data.mpesa?.shortcode} mono />
          <Detail label="Till" value={data.mpesa?.tillNumber} mono />
        </ServiceCard>

        <ServiceCard icon={HiCreditCard} title="Stripe" status={data.stripe?.status}>
          <Detail label="Enabled" value={data.stripe?.enabled ? 'Yes' : 'No'} />
        </ServiceCard>

        <ServiceCard
          icon={HiGlobe}
          title="Weather"
          status={weather.status}
        >
          <div className="mb-2">
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Active provider
            </p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
              {weather.currentLabel || weather.current || '—'}
            </p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">
              {weather.current}
            </p>
          </div>
          <div className="border-t border-[var(--border-color)] pt-2 mt-2 space-y-1">
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Providers
            </p>
            {weather.providers &&
              Object.entries(weather.providers).map(([key, p]) => (
                <div
                  key={key}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="font-mono text-[var(--text-secondary)]">
                    {key}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {p.keySet === false && p.requiresKey && (
                      <span className="text-[10px] text-red-500">no key</span>
                    )}
                    {p.enabled && (
                      <Badge variant="success" dot>
                        on
                      </Badge>
                    )}
                    {p.configured && !p.enabled && (
                      <Badge variant="default">ready</Badge>
                    )}
                    {!p.configured && (
                      <Badge variant="default">off</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
          {weather.fallbackToOpenMeteo !== undefined && (
            <p className="text-[10px] text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border-color)]">
              Fallback to Open-Meteo:{' '}
              <span className="text-[var(--text-primary)]">
                {weather.fallbackToOpenMeteo ? 'Yes' : 'No'}
              </span>
            </p>
          )}
        </ServiceCard>

        <ServiceCard icon={HiCloud} title="Storage" status={data.storage?.status}>
          <Detail label="Type" value={data.storage?.type} />
          <Detail label="Cloud" value={data.storage?.cloud} />
          <Detail label="Folder" value={data.storage?.folder} mono />
        </ServiceCard>

        <ServiceCard icon={HiClock} title="Backups" status={data.backups?.status}>
          <Detail label="Type" value={data.backups?.type} />
          <Detail label="Folder" value={data.backups?.folder} mono />
          <Detail label="Count" value={data.backups?.count ?? 0} />
          {data.backups?.lastBackupAt && (
            <Detail
              label="Last"
              value={formatDate(data.backups.lastBackupAt, 'full')}
            />
          )}
          {data.backups?.lastBackupSize && (
            <Detail
              label="Size"
              value={`${Math.round(data.backups.lastBackupSize / 1024)} KB`}
            />
          )}
        </ServiceCard>

        <ServiceCard icon={HiHeart} title="Platform" status="up">
          <Detail label="Name" value={data.platform?.platformName} />
          {data.platform?.logoUrl && (
            <div className="flex justify-between gap-3 py-0.5">
              <dt className="text-[var(--text-secondary)] text-xs shrink-0">
                Logo
              </dt>
              <dd className="shrink-0">
                <img
                  src={data.platform.logoUrl}
                  alt="Logo"
                  className="h-6 max-w-[100px] object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </dd>
            </div>
          )}
          <Detail label="Support email" value={data.platform?.supportEmail} />
          <Detail label="Support phone" value={data.platform?.supportPhone} />
        </ServiceCard>
      </div>

      <Card title="CORS origins">
        {data.cors?.length ? (
          <ul className="space-y-1">
            {data.cors.map((o) => (
              <li
                key={o}
                className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {o}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">No origins configured</p>
        )}
      </Card>

      {data.timestamp && (
        <p className="text-xs text-[var(--text-muted)] text-center">
          Server timestamp: {formatDate(data.timestamp, 'full')}
        </p>
      )}
    </div>
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
          <Badge variant={OK_STATES.includes(status) ? 'success' : 'default'}>
            {status || 'unknown'}
          </Badge>
        </div>
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </Card>
  );
}

function Detail({ label, value, mono }) {
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
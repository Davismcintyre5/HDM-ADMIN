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
  HiClock,
  HiHeart,
  HiExternalLink,
} from 'react-icons/hi';
import Card from '../../components/portfolio/ui/Card';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import Spinner from '../../components/portfolio/ui/Spinner';
import { useToast } from '../../context/portfolio/ToastContext';
import { getHealth } from '../../services/portfolio/health';
import { formatDate } from '../../utils/portfolio/formatDate';

const OK_STATES = ['up', 'enabled', 'connected', 'healthy', 'running', 'OK'];

const REFRESH_MS = 30000;

function bytes(n) {
  const num = Number(n || 0);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / 1024 / 1024).toFixed(1)} MB`;
  return `${(num / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

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

function StatusBadge({ status }) {
  const ok = OK_STATES.includes(status);
  const warn = status === 'disabled';
  return (
    <Badge variant={ok ? 'success' : warn ? 'default' : 'danger'} dot>
      {status || 'unknown'}
    </Badge>
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

  const {
    overall,
    server,
    database,
    redis,
    email,
    sms,
    ai,
    storage,
    backups,
    platform,
    cors,
    urls,
    environment,
    timestamp,
  } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              System Health
            </h1>
            <Badge
              variant={overall?.up === overall?.total ? 'success' : 'warning'}
              dot
            >
              {overall?.up ?? 0}/{overall?.total ?? 0} services up
            </Badge>
            {environment && (
              <Badge variant="info">{environment}</Badge>
            )}
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

      {/* Service grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ServiceCard
          icon={HiServer}
          title="Server"
          status={server?.status}
        >
          <Detail label="Version" value={server?.version} />
          <Detail label="Node" value={server?.node} />
          <Detail label="Platform" value={`${server?.platform} ${server?.arch}`} />
          <Detail label="Uptime" value={server?.uptimeHuman} />
          <Detail label="CPU cores" value={server?.cpuCores} />
          {server?.load1m !== undefined && (
            <Detail label="Load 1m" value={server.load1m} />
          )}
          <Detail
            label="Memory"
            value={`${server?.memoryRssMb ?? 0} MB RSS · ${server?.memoryHeapMb ?? 0} MB heap`}
          />
          <Detail label="PID" value={server?.pid} />
        </ServiceCard>

        <ServiceCard
          icon={HiDatabase}
          title="Database"
          status={database?.status}
        >
          <Detail label="Name" value={database?.name} />
          <Detail label="Host" value={database?.host} mono />
          <Detail label="Collections" value={database?.collections} />
          <Detail
            label="Documents"
            value={(database?.documents ?? 0).toLocaleString()}
          />
        </ServiceCard>

        <ServiceCard
          icon={HiStatusOnline}
          title="Redis"
          status={redis?.status}
        >
          <Detail label="Enabled" value={redis?.enabled ? 'Yes' : 'No'} />
        </ServiceCard>

        <ServiceCard icon={HiMail} title="Email" status={email?.status}>
          <Detail label="Provider" value={email?.provider} />
          <Detail label="From" value={email?.from} />
        </ServiceCard>

        <ServiceCard
          icon={HiDeviceMobile}
          title="SMS"
          status={sms?.status}
        >
          <Detail label="Provider" value={sms?.provider} />
          <Detail label="Sender" value={sms?.sender} />
        </ServiceCard>

        <ServiceCard icon={HiSparkles} title="AI" status={ai?.status}>
          <Detail label="Provider" value={ai?.provider} />
          <Detail label="URL" value={ai?.url} mono />
        </ServiceCard>

        <ServiceCard icon={HiCloud} title="Storage" status={storage?.status}>
          <Detail label="Type" value={storage?.type} />
          <Detail label="Plan" value={storage?.plan} />
          {storage?.storageUsed !== undefined && (
            <>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                  <span>Storage</span>
                  <span>
                    {bytes(storage.storageUsed)} / {bytes(storage.storageLimit)} (
                    {storage.usedPercent ?? 0}%)
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(storage.usedPercent ?? 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              {storage.bandwidthUsed !== undefined && (
                <Detail
                  label="Bandwidth"
                  value={`${bytes(storage.bandwidthUsed)} / ${bytes(
                    storage.bandwidthLimit
                  )}`}
                />
              )}
              {storage.credits !== undefined && (
                <Detail label="Credits" value={storage.credits} />
              )}
            </>
          )}
        </ServiceCard>

        <ServiceCard
          icon={HiClock}
          title="Backups"
          status={backups?.count > 0 ? 'up' : 'disabled'}
        >
          <Detail label="Count" value={backups?.count ?? 0} />
          {backups?.lastBackupAt && (
            <Detail
              label="Last backup"
              value={formatDate(backups.lastBackupAt, 'full')}
            />
          )}
          {backups?.lastBackupSize && (
            <Detail label="Last size" value={bytes(backups.lastBackupSize)} />
          )}
          {backups?.lastBackupType && (
            <Detail label="Last type" value={backups.lastBackupType} />
          )}
        </ServiceCard>

        <ServiceCard
          icon={HiHeart}
          title="Platform"
          status={platform?.platformName ? 'up' : 'disabled'}
        >
          <Detail label="Name" value={platform?.platformName} />
          <Detail label="Support email" value={platform?.supportEmail} />
          <Detail label="Support phone" value={platform?.supportPhone} />
          {platform?.url && (
            <Detail label="URL" value={platform.url} mono />
          )}
        </ServiceCard>
      </div>

      {/* CORS */}
      <Card title="CORS origins">
        {cors?.length ? (
          <ul className="space-y-1">
            {cors.map((o) => (
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
          <p className="text-xs text-[var(--text-muted)]">No CORS origins</p>
        )}
      </Card>

      {/* URLs */}
      <Card title="Environment URLs">
        <dl className="space-y-2 text-sm">
          {urls &&
            Object.entries(urls).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between gap-3 items-center"
              >
                <dt className="text-[var(--text-secondary)] capitalize text-xs">
                  {key}
                </dt>
                <dd className="text-[var(--text-primary)] text-xs font-mono truncate flex items-center gap-1">
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline truncate"
                  >
                    {value}
                  </a>
                  <HiExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                </dd>
              </div>
            ))}
        </dl>
        {timestamp && (
          <p className="text-xs text-[var(--text-muted)] mt-4 pt-4 border-t border-[var(--border-color)]">
            Server timestamp: {formatDate(timestamp, 'full')}
          </p>
        )}
      </Card>
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
          <StatusBadge status={status} />
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
import { useEffect, useState } from 'react';
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
} from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Spinner from '../../components/pharmasys/ui/Spinner';
import { getHealth } from '../../services/pharmasys/health';
import { bytes } from '../../utils/pharmasys/formatters';

const OK_STATES = ['up', 'enabled', 'connected', 'healthy', 'running'];

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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getHealth();
      setData(res?.data || res);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            System health
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {data.overall?.up ?? 0}/{data.overall?.total ?? 0} services up ·
            updated {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ServiceCard icon={HiServer} title="Server" status={data.server?.status}>
          <Detail label="Version" value={data.server?.version} />
          <Detail label="Node" value={data.server?.node} />
          <Detail label="Uptime" value={data.server?.uptimeHuman} />
          <Detail label="CPU" value={`${data.server?.cpuCores ?? 0} cores`} />
          <Detail label="Memory" value={`${data.server?.memoryRssMb ?? 0} MB`} />
          <Detail label="PID" value={data.server?.pid} />
        </ServiceCard>

        <ServiceCard
          icon={HiDatabase}
          title="Database"
          status={data.database?.status}
        >
          <Detail label="Collections" value={data.database?.collections} />
          <Detail
            label="Documents"
            value={(data.database?.documents ?? 0).toLocaleString()}
          />
        </ServiceCard>

        <ServiceCard
          icon={HiStatusOnline}
          title="Redis"
          status={data.redis?.status}
        >
          <Detail label="Memory used" value={data.redis?.memoryUsed} />
        </ServiceCard>

        <ServiceCard icon={HiMail} title="Email" status={data.email?.status}>
          <Detail label="Provider" value={data.email?.provider} />
        </ServiceCard>

        <ServiceCard
          icon={HiDeviceMobile}
          title="SMS"
          status={data.sms?.status}
        >
          <Detail label="Provider" value={data.sms?.provider} />
        </ServiceCard>

        <ServiceCard icon={HiSparkles} title="AI" status={data.ai?.status}>
          <Detail label="Provider" value={data.ai?.provider} />
        </ServiceCard>

        <ServiceCard icon={HiCash} title="M-Pesa" status={data.mpesa?.status}>
          <Detail label="Mode" value={data.mpesa?.mode} />
        </ServiceCard>

        <ServiceCard
          icon={HiCreditCard}
          title="Stripe"
          status={data.stripe?.status}
        >
          <Detail label="Status" value={data.stripe?.status} />
        </ServiceCard>

        <ServiceCard icon={HiCloud} title="Storage" status={data.storage?.status}>
          <Detail label="Type" value={data.storage?.type} />
        </ServiceCard>

        <Card title="Backups" className="md:col-span-2">
          <dl className="space-y-2 text-sm">
            <Row label="Count">{data.backups?.count ?? 0}</Row>
            {data.backups?.lastBackupAt && (
              <Row label="Last">
                {new Date(data.backups.lastBackupAt).toLocaleString()}
              </Row>
            )}
            {data.backups?.lastBackupSize && (
              <Row label="Size">{bytes(data.backups.lastBackupSize)}</Row>
            )}
          </dl>
        </Card>

        <Card title="Platform">
          <dl className="space-y-2 text-sm">
            <Row label="Name">{data.platform?.platformName || '—'}</Row>
            <Row label="Support email">
              {data.platform?.supportEmail || '—'}
            </Row>
            <Row label="Support phone">
              {data.platform?.supportPhone || '—'}
            </Row>
          </dl>
        </Card>
      </div>

      <Card title="CORS origins">
        <ul className="text-sm space-y-1">
          {(data.cors || []).map((o) => (
            <li
              key={o}
              className="font-mono text-xs text-[var(--text-secondary)]"
            >
              {o}
            </li>
          ))}
        </ul>
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
          <Badge variant={OK_STATES.includes(status) ? 'success' : 'default'}>
            {status || 'unknown'}
          </Badge>
        </div>
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </Card>
  );
}

function Detail({ label, value }) {
  if (!value && value !== 0) return null;
  return <Row label={label}>{value}</Row>;
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs">{label}</dt>
      <dd className="text-[var(--text-primary)] text-xs text-right">
        {children}
      </dd>
    </div>
  );
}
import { useEffect, useState, useCallback } from 'react';
import { getSmsMargin } from '../../services/bridge/sms';
import Card from '../../components/bridge/ui/Card';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Spinner from '../../components/bridge/ui/Spinner';
import PageHeader from '../../components/bridge/ui/PageHeader';
import { HiRefresh } from 'react-icons/hi';

function formatKes(n) {
  if (n === undefined || n === null) return '—';
  return `KSh ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function SmsMargin() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [from, setFrom] = useState(toIsoDate(thirtyDaysAgo));
  const [to, setTo] = useState(toIsoDate(today));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSmsMargin({ from, to });
      setData(res);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const presets = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
  ];

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setFrom(toIsoDate(start));
    setTo(toIsoDate(end));
  };

  const totals = data?.totals || {};
  const config = data?.config || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS Margin"
        description="Revenue vs AT cost for SMS sends"
      />

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
            />
          </div>
          <div className="flex gap-1">
            {presets.map((p) => (
              <Button key={p.days} size="sm" variant="secondary" onClick={() => applyPreset(p.days)}>
                {p.label}
              </Button>
            ))}
          </div>
          <Button onClick={load} loading={loading}>
            <HiRefresh className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </Card>

      {loading && !data ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm text-[var(--text-muted)] mb-1">SMS sent</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] font-mono">
                {Number(totals.totalSms || 0).toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {Number(totals.totalUnits || 0).toLocaleString()} units (multipart)
              </p>
            </Card>

            <Card>
              <p className="text-sm text-[var(--text-muted)] mb-1">Revenue</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] font-mono">
                {formatKes(totals.revenue)}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                charged to users
              </p>
            </Card>

            <Card>
              <p className="text-sm text-[var(--text-muted)] mb-1">AT cost</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] font-mono">
                {formatKes(totals.atCost)}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                paid to Africa's Talking
              </p>
            </Card>

            <Card>
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm text-[var(--text-muted)]">Margin</p>
                <Badge variant={totals.marginPct >= 0 ? 'success' : 'danger'}>
                  {totals.marginPct ?? 0}%
                </Badge>
              </div>
              <p className={`text-2xl font-bold font-mono ${totals.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatKes(totals.margin)}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {formatKes(config.currentMarginPerSms)} per SMS
              </p>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Current config</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs text-[var(--text-muted)]">User rate</dt>
                <dd className="font-mono text-[var(--text-primary)]">{formatKes(config.currentRateKes)} / SMS</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">AT cost</dt>
                <dd className="font-mono text-[var(--text-primary)]">{formatKes(config.atCostKes)} / SMS</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">Margin per SMS</dt>
                <dd className="font-mono text-green-600 font-semibold">{formatKes(config.currentMarginPerSms)} / SMS</dd>
              </div>
            </dl>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Rate is admin-editable in System Settings. Historical rows in the table use the rate at send time.
            </p>
          </Card>

          <Card>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">
              Period summary
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">From</dt>
                <dd className="text-[var(--text-primary)]">{data?.from ? new Date(data.from).toLocaleDateString('en-KE') : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">To</dt>
                <dd className="text-[var(--text-primary)]">{data?.to ? new Date(data.to).toLocaleDateString('en-KE') : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Avg cost per SMS</dt>
                <dd className="text-[var(--text-primary)] font-mono">
                  {totals.totalSms > 0 ? formatKes(totals.revenue / totals.totalSms) : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Avg margin per SMS</dt>
                <dd className="text-[var(--text-primary)] font-mono">
                  {totals.totalSms > 0 ? formatKes(totals.margin / totals.totalSms) : '—'}
                </dd>
              </div>
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}
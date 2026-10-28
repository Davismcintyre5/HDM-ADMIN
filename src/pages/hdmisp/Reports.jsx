import { useEffect, useState, useCallback } from 'react';
import {
  HiChartBar, HiRefresh, HiCash, HiUsers, HiServer,
  HiArrowUp, HiArrowDown, HiDownload, HiCalendar,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Spinner from '../../components/hdmisp/ui/Spinner';
import StatCard from '../../components/hdmisp/ui/StatCard';
import { useToast } from '../../context/hdmisp/ToastContext';
import {
  getReportsSummary,
  getDailyReports,
  getProviderRevenue,
} from '../../services/hdmisp/reports';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';
import { formatDate } from '../../utils/hdmisp/formatDate';

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

function todayISO() {
  return toISODate(new Date());
}

/** Parse a daily report row into { date, revenue, transactions } */
function normalizeDaily(row) {
  return {
    date: row.date || row._id || row.day || null,
    revenue: row.revenue ?? row.completedRevenue ?? row.total ?? 0,
    transactions: row.transactions ?? row.count ?? row.completed ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/* Trend mini-chart (pure CSS/SVG, no deps)                            */
/* ------------------------------------------------------------------ */

function Sparkline({ points, color = '#06b6d4' }) {
  if (!points || points.length < 2) {
    return <div className="h-24 flex items-center justify-center text-xs text-[var(--text-muted)]">Not enough data</div>;
  }
  const w = 100;
  const h = 32;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = w / (points.length - 1);

  const coords = points.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const area = `0,${h} ${coords.join(' ')} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-24">
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bar list (provider revenue)                                         */
/* ------------------------------------------------------------------ */

function RevenueBars({ rows, currency = 'KES' }) {
  if (!rows.length) {
    return <p className="text-sm text-[var(--text-muted)] py-8 text-center">No provider revenue for this period</p>;
  }
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.providerId || r.name}>
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-sm text-[var(--text-primary)] truncate">{r.name || r.providerId || '—'}</span>
            <span className="text-sm font-medium text-[var(--text-primary)] shrink-0">
              {formatMoneyMajor(r.revenue, currency)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
              style={{ width: `${Math.max((r.revenue / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Reports() {
  const toast = useToast();

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [error, setError] = useState(null);

  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(todayISO());

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await getReportsSummary();
      setSummary(data || null);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadDaily = useCallback(async () => {
    setLoadingDaily(true);
    try {
      const res = await getDailyReports({ from, to });
      setDaily((res.data || []).map(normalizeDaily));
    } catch (err) {
      toast.error(err.message || 'Failed to load daily reports');
    } finally {
      setLoadingDaily(false);
    }
  }, [from, to, toast]);

  const loadRevenue = useCallback(async () => {
    setLoadingRevenue(true);
    try {
      const data = await getProviderRevenue({ from, to });
      setRevenue(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load provider revenue');
    } finally {
      setLoadingRevenue(false);
    }
  }, [from, to, toast]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadDaily(); }, [loadDaily]);
  useEffect(() => { loadRevenue(); }, [loadRevenue]);

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([loadSummary(), loadDaily(), loadRevenue()]);
    setRefreshing(false);
  };

  const setPreset = (days) => {
    setFrom(daysAgo(days - 1));
    setTo(todayISO());
  };

  /* Derived numbers */
  const dailyRows = [...daily].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const revenuePoints = dailyRows.map((r) => Number(r.revenue) || 0);
  const totalRevenue = dailyRows.reduce((s, r) => s + (Number(r.revenue) || 0), 0);
  const totalTxns = dailyRows.reduce((s, r) => s + (Number(r.transactions) || 0), 0);
  const firstRev = revenuePoints[0] || 0;
  const lastRev = revenuePoints[revenuePoints.length - 1] || 0;
  const trendPct = firstRev > 0 ? ((lastRev - firstRev) / firstRev) * 100 : 0;

  const d = summary || {};
  const topProviders = [...revenue]
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    .slice(0, 6);

  const statCards = [
    {
      label: 'Total Revenue (range)',
      value: formatMoneyMajor(totalRevenue, 'KES'),
      hint: `${dailyRows.length} day${dailyRows.length !== 1 ? 's' : ''}`,
      icon: HiCash,
      color: 'text-green-500',
    },
    {
      label: 'Transactions (range)',
      value: totalTxns.toLocaleString(),
      hint: 'Completed payments',
      icon: HiChartBar,
      color: 'text-cyan-500',
    },
    {
      label: 'Providers',
      value: (d.providers ?? 0).toLocaleString(),
      hint: 'All tenants',
      icon: HiUsers,
      color: 'text-amber-500',
    },
    {
      label: 'Sessions',
      value: (d.sessions ?? 0).toLocaleString(),
      hint: 'All time',
      icon: HiServer,
      color: 'text-violet-500',
    },
  ];

  const initialLoading = (loadingSummary && loadingDaily && loadingRevenue) && !summary && !daily.length && !revenue.length;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
            <Badge variant="info">Analytics</Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Revenue and activity across the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<HiDownload className="w-4 h-4" />}
            onClick={() => exportCsv(dailyRows, from, to, toast)}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={refreshAll}
            loading={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button size="sm" variant="outline" onClick={loadSummary}>Retry</Button>
          </div>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: '7d', days: 7 },
              { label: '30d', days: 30 },
              { label: '90d', days: 90 },
              { label: '1y', days: 365 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPreset(p.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  from === daysAgo(p.days - 1) && to === todayISO()
                    ? 'bg-cyan-600 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1 min-w-[240px]">
            <Input
              label="From"
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              label="To"
              type="date"
              value={to}
              min={from}
              max={todayISO()}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] lg:ml-auto">
            <HiCalendar className="w-4 h-4" />
            {formatDate(from)} – {formatDate(to)}
          </div>
        </div>
      </Card>

      {/* Revenue chart + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          title="Revenue trend"
          description="Daily completed revenue"
          className="lg:col-span-2"
          actions={
            <Badge variant={trendPct >= 0 ? 'success' : 'danger'} dot>
              {trendPct >= 0 ? (
                <HiArrowUp className="w-3 h-3 inline mr-0.5" />
              ) : (
                <HiArrowDown className="w-3 h-3 inline mr-0.5" />
              )}
              {Math.abs(trendPct).toFixed(1)}%
            </Badge>
          }
        >
          {loadingDaily ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-cyan-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between gap-4 mb-2">
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {formatMoneyMajor(lastRev, 'KES')}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Latest day</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {formatMoneyMajor(totalRevenue, 'KES')}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Total in range</p>
                </div>
              </div>
              <Sparkline points={revenuePoints} />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                <span>{dailyRows[0]?.date ? formatDate(dailyRows[0].date) : '—'}</span>
                <span>{dailyRows[dailyRows.length - 1]?.date ? formatDate(dailyRows[dailyRows.length - 1].date) : '—'}</span>
              </div>
            </>
          )}
        </Card>

        <Card title="Platform summary">
          <dl className="space-y-3 text-sm">
            <SummaryRow label="Providers" value={(d.providers ?? 0).toLocaleString()} />
            <SummaryRow label="Sessions" value={(d.sessions ?? 0).toLocaleString()} />
            <SummaryRow label="Transactions" value={(d.transactions ?? 0).toLocaleString()} />
            <SummaryRow
              label="Avg / day"
              value={formatMoneyMajor(dailyRows.length ? totalRevenue / dailyRows.length : 0, 'KES')}
            />
          </dl>
        </Card>
      </div>

      {/* Top providers */}
      <Card
        title="Top providers by revenue"
        description="Within selected range"
        actions={<Badge variant="default">{topProviders.length}</Badge>}
      >
        {loadingRevenue ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-cyan-600 rounded-full animate-spin" />
          </div>
        ) : (
          <RevenueBars rows={topProviders} />
        )}
      </Card>

      {/* Daily table */}
      <Card title="Daily breakdown" description="Newest first" padding={false}>
        {loadingDaily ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-cyan-600 rounded-full animate-spin" />
          </div>
        ) : dailyRows.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-10 text-center">No daily data for this range</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Transactions</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {[...dailyRows].reverse().map((r) => (
                  <tr key={r.date}>
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {r.date ? formatDate(r.date) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                      {(Number(r.transactions) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                      {formatMoneyMajor(Number(r.revenue) || 0, 'KES')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[var(--bg-secondary)]">
                <tr>
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                    {totalTxns.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                    {formatMoneyMajor(totalRevenue, 'KES')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs">{label}</dt>
      <dd className="text-[var(--text-primary)] text-sm font-medium">{value}</dd>
    </div>
  );
}

/** Download the daily rows as a CSV file. */
function exportCsv(rows, from, to, toast) {
  if (!rows.length) {
    toast.error('Nothing to export');
    return;
  }
  try {
    const header = ['date', 'transactions', 'revenue'];
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push([
        r.date || '',
        Number(r.transactions) || 0,
        Number(r.revenue) || 0,
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hdmisp-reports_${from}_to_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  } catch {
    toast.error('Failed to export CSV');
  }
}
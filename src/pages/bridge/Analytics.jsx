import { useEffect, useState } from 'react';
import { getUserGrowth, getEmailVolume, getRevenue, getPlanDistribution } from '../../services/bridge/analytics';
import Card from '../../components/bridge/ui/Card';
import Spinner from '../../components/bridge/ui/Spinner';
import Badge from '../../components/bridge/ui/Badge';
import { HiUserAdd, HiMail, HiCash, HiChartPie } from 'react-icons/hi';

const CURRENCY_SYMBOLS = { USD: '$', KES: 'KSh', EUR: '€', GBP: '£' };

function formatAmount(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || (currency ? currency + ' ' : '');
  const n = Number(amount || 0);
  return symbol + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function monthLabel(year, month) {
  if (!year || !month) return '—';
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function Bar({ value, max, color = 'bg-indigo-500', label, rightLabel }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-20 shrink-0 text-[var(--text-muted)]">{label}</span>
      <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-5 overflow-hidden">
        <div
          className={`${color} h-5 rounded-full flex items-center justify-end pr-2 transition-all`}
          style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        >
          {value > 0 && (
            <span className="text-[10px] font-medium text-white truncate">
              {rightLabel ?? value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatHeader({ icon: Icon, title, hint }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        {hint && <p className="text-xs text-[var(--text-muted)] mt-0.5">{hint}</p>}
      </div>
      {Icon && <Icon className="w-5 h-5 text-[var(--text-muted)] shrink-0" />}
    </div>
  );
}

export default function Analytics() {
  const [userGrowth, setUserGrowth] = useState([]);
  const [emailVolume, setEmailVolume] = useState([]);
  const [revenue, setRevenue] = useState({ rows: [], reportingCurrency: 'USD', byPlan: [], byMethod: [] });
  const [planDist, setPlanDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserGrowth(), getEmailVolume(), getRevenue(), getPlanDistribution()])
      .then(([u, e, r, p]) => {
        setUserGrowth(u.growth || u.data || []);
        setEmailVolume(e.volume || e.data || []);

        const rev = r?.revenue ? r : r?.data || {};
        setRevenue({
          rows: rev.revenue || [],
          reportingCurrency: rev.reportingCurrency || 'USD',
          byPlan: rev.byPlan || [],
          byMethod: rev.byMethod || [],
        });

        setPlanDist(p.distribution || p.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const growthRows = userGrowth.slice(-12);
  const volumeRows = emailVolume.slice(-14);
  const revenueRows = revenue.rows.slice(-6);
  const reportingCurrency = revenue.reportingCurrency;

  const maxGrowth = Math.max(...growthRows.map((d) => d.count || 0), 1);
  const maxVolume = Math.max(...volumeRows.map((d) => d.sent || 0), 1);
  const maxRev = Math.max(...revenueRows.map((r) => r.totalReporting || 0), 1);
  const maxPlanCount = Math.max(...planDist.map((p) => p.count || 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Platform trends and revenue</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <StatHeader icon={HiUserAdd} title="User growth" hint="Last 12 months" />
          {growthRows.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No data</p>
          ) : (
            <div className="space-y-2">
              {growthRows.map((d, i) => (
                <Bar
                  key={i}
                  value={d.count || 0}
                  max={maxGrowth}
                  color="bg-indigo-500"
                  label={monthLabel(d._id?.year, d._id?.month)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <StatHeader icon={HiMail} title="Email volume" hint="Last 14 days" />
          {volumeRows.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No data</p>
          ) : (
            <div className="space-y-2">
              {volumeRows.map((d, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-20 shrink-0 text-[var(--text-muted)]">{d._id?.slice(5)}</span>
                  <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
                    <div
                      className="bg-green-500 h-5 flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max((d.sent / maxVolume) * 100, d.sent > 0 ? 4 : 0)}%` }}
                    >
                      {d.sent > 0 && <span className="text-[10px] font-medium text-white">{d.sent}</span>}
                    </div>
                    {d.failed > 0 && (
                      <div
                        className="bg-red-500 h-5 transition-all"
                        style={{ width: `${(d.failed / maxVolume) * 100}%` }}
                        title={`${d.failed} failed`}
                      />
                    )}
                    {d.bounced > 0 && (
                      <div
                        className="bg-yellow-500 h-5 transition-all"
                        style={{ width: `${(d.bounced / maxVolume) * 100}%` }}
                        title={`${d.bounced} bounced`}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Sent</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Failed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Bounced</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <StatHeader
            icon={HiCash}
            title="Revenue"
            hint={`Last 6 months · reported in ${reportingCurrency}`}
          />
          {revenueRows.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No data</p>
          ) : (
            <div className="space-y-2">
              {revenueRows.map((r, i) => (
                <Bar
                  key={i}
                  value={r.totalReporting || 0}
                  max={maxRev}
                  color="bg-yellow-500"
                  label={monthLabel(r.year, r.month)}
                  rightLabel={formatAmount(r.totalReporting, reportingCurrency)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <StatHeader icon={HiChartPie} title="Plan distribution" hint={`${planDist.reduce((s, p) => s + (p.count || 0), 0)} active subscriptions`} />
          {planDist.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No data</p>
          ) : (
            <div className="space-y-3">
              {planDist.map((p, i) => {
                const plan = p._id?.plan || p.plan || 'Unknown';
                const tier = p._id?.tier || p.tier || '';
                const mrr = p.mrr || 0;
                const mrrCurrency = p.mrrCurrency || 'USD';
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="indigo">{plan}</Badge>
                        {tier && <span className="text-xs text-[var(--text-muted)] capitalize">{tier}</span>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{p.count} users</p>
                        <p className="text-xs text-[var(--text-muted)]">MRR {formatAmount(mrr, mrrCurrency)}</p>
                      </div>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.max((p.count / maxPlanCount) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {(revenue.byMethod || []).length > 0 && (
        <Card>
          <StatHeader icon={HiCash} title="Revenue by payment method" hint="All time" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {revenue.byMethod.map((m) => (
              <div key={m._id} className="bg-[var(--bg-secondary)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-muted)] capitalize">{m._id || 'unknown'}</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{m.count || 0}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatAmount(m.total, reportingCurrency)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(revenue.byPlan || []).length > 0 && (
        <Card>
          <StatHeader icon={HiChartPie} title="Subscriptions by plan" hint="Active subscriptions only" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {revenue.byPlan.map((p) => (
              <div key={p._id} className="bg-[var(--bg-secondary)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-muted)] truncate">{p._id || 'Unknown'}</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{p.count || 0}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
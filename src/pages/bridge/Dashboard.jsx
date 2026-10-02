import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/bridge/analytics';
import Card from '../../components/bridge/ui/Card';
import Badge from '../../components/bridge/ui/Badge';
import Spinner from '../../components/bridge/ui/Spinner';
import { HiUsers, HiCash, HiMail, HiOfficeBuilding } from 'react-icons/hi';

const CURRENCY_SYMBOLS = { USD: '$', KES: 'KSh', EUR: '€', GBP: '£' };

function formatAmount(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
  const n = Number(amount || 0);
  return symbol + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.stats || res.data?.stats || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const revenue = stats?.revenue || { byCurrency: [], totalReporting: 0, reportingCurrency: 'USD' };
  const byCurrency = revenue.byCurrency || [];
  const reportingCurrency = revenue.reportingCurrency || 'USD';
  const singleCurrency = byCurrency.length === 1;

  const revenueValue = singleCurrency
    ? formatAmount(byCurrency[0].total, byCurrency[0].currency)
    : formatAmount(revenue.totalReporting, reportingCurrency);

  const revenueSub = singleCurrency
    ? null
    : (byCurrency.length > 1 ? `${byCurrency.length} currencies` : null);

  const statCards = [
    { key: 'totalUsers', label: 'Total Users', icon: HiUsers, color: 'text-blue-500', value: stats?.totalUsers || 0 },
    { key: 'totalOrganizations', label: 'Organizations', icon: HiOfficeBuilding, color: 'text-indigo-500', value: stats?.totalOrganizations || 0 },
    { key: 'activeSubscriptions', label: 'Active Subs', icon: HiCash, color: 'text-green-500', value: stats?.activeSubscriptions || 0 },
    { key: 'revenue', label: 'Revenue', icon: HiCash, color: 'text-yellow-500', value: revenueValue, sub: revenueSub },
    { key: 'emailsToday', label: 'Emails Today', icon: HiMail, color: 'text-indigo-500', value: stats?.emailsToday?.toLocaleString() || 0 },
    { key: 'emailsThisMonth', label: 'Emails This Month', icon: HiMail, color: 'text-purple-500', value: stats?.emailsThisMonth?.toLocaleString() || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(s => (
          <Card key={s.key}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 truncate">{s.value}</p>
                {s.sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.sub}</p>}
              </div>
              <s.icon className={`w-8 h-8 flex-shrink-0 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {!singleCurrency && byCurrency.length > 1 && (
        <Card className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[var(--text-primary)]">Revenue by currency</h3>
            {revenue.conversionFailed && (
              <Badge variant="warning">Some conversions failed</Badge>
            )}
          </div>
          <div className="space-y-2">
            {byCurrency.map((row) => (
              <div key={row.currency} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--text-primary)]">{row.currency}</span>
                  <span className="text-xs text-[var(--text-muted)]">({row.count} transactions)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-primary)] font-medium">
                    {formatAmount(row.total, row.currency)}
                  </span>
                  {row.converted !== null && row.currency !== reportingCurrency && (
                    <span className="text-xs text-[var(--text-muted)]">
                      ≈ {formatAmount(row.converted, reportingCurrency)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex justify-between text-sm">
            <span className="font-medium text-[var(--text-primary)]">
              Total (≈ {reportingCurrency})
            </span>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatAmount(revenue.totalReporting, reportingCurrency)}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
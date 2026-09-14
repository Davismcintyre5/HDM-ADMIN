import { useState, useEffect } from 'react';
import { getRevenueSummary, getRevenueByPlan, getRevenueByCurrency, getRevenueByMethod, getRevenueMonthly } from '../../services/smartpos/revenue';
import Card from '../../components/smartpos/ui/Card';
import Spinner from '../../components/smartpos/ui/Spinner';

export default function Revenue() {
  const [summary, setSummary] = useState(null);
  const [byPlan, setByPlan] = useState([]);
  const [byCurrency, setByCurrency] = useState([]);
  const [byMethod, setByMethod] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRevenueSummary(), getRevenueByPlan(), getRevenueByCurrency(), getRevenueByMethod(), getRevenueMonthly()])
      .then(([s, p, c, m, mo]) => {
        setSummary(s?.data || s);
        setByPlan(p?.data || p || []);
        setByCurrency(c?.data || c || []);
        setByMethod(m?.data || m || []);
        setMonthly(mo?.data || mo || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const formatMinor = (minor) => `KES ${((minor || 0) / 100).toLocaleString()}`;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Revenue</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">30 Days</p><p className="text-xl font-bold text-emerald-500 mt-1">{formatMinor(summary?.last30DaysMinor)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">365 Days</p><p className="text-xl font-bold text-emerald-500 mt-1">{formatMinor(summary?.last365DaysMinor)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Failed</p><p className="text-xl font-bold text-red-500 mt-1">{summary?.failedPayments || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Transactions</p><p className="text-xl font-bold mt-1">{summary?.transactionCount || 0}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">By Plan</h2>
          {byPlan.map((p, i) => (
            <div key={i} className="flex justify-between text-sm py-1"><span>{p.plan}</span><span className="font-medium">{formatMinor(p.totalMinor || p.total)}</span></div>
          ))}
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">By Currency</h2>
          {byCurrency.map((c, i) => (
            <div key={i} className="flex justify-between text-sm py-1"><span>{c.currency}</span><span className="font-medium">{((c.totalMinor || 0) / 100).toLocaleString()}</span></div>
          ))}
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">By Method</h2>
          {byMethod.map((m, i) => (
            <div key={i} className="flex justify-between text-sm py-1"><span>{m.method}</span><span className="font-medium">{formatMinor(m.totalMinor || m.total)}</span></div>
          ))}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Monthly</h2>
        <div className="space-y-2">
          {monthly.map((m, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-primary)]">{m.month || m._id}</span>
              <div className="flex-1 mx-4 h-2 bg-[var(--bg-tertiary)] rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${Math.min(((m.totalMinor || 0) / 100000) * 100, 100)}%` }} />
              </div>
              <span className="text-sm font-medium">{formatMinor(m.totalMinor)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
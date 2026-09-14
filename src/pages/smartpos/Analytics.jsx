import { useState, useEffect } from 'react';
import { getTrialConversion, getChurn, getPlanDistribution, getCurrencyDistribution, getStatusDistribution } from '../../services/smartpos/analytics';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Spinner from '../../components/smartpos/ui/Spinner';

export default function Analytics() {
  const [trial, setTrial] = useState(null);
  const [churn, setChurn] = useState(null);
  const [plans, setPlans] = useState([]);
  const [currencies, setCurrencies] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrialConversion(), getChurn(), getPlanDistribution(), getCurrencyDistribution(), getStatusDistribution()])
      .then(([t, c, p, cur, s]) => {
        setTrial(t?.data || t);
        setChurn(c?.data || c);
        setPlans(p?.data || p || []);
        setCurrencies(cur?.data || cur);
        setStatuses(s?.data || s || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">Trial Conversion</h2>
          <p className="text-3xl font-bold text-emerald-500">{trial?.rate ?? 0}%</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{trial?.converted || 0} converted of {trial?.total || 0}</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">30-Day Churn</h2>
          <p className="text-3xl font-bold text-red-500">{churn?.rate ?? 0}%</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{churn?.churned || 0} churned of {churn?.active || 0} active</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Plan Distribution</h2>
          <div className="space-y-2">
            {plans.map((p, i) => (
              <div key={i} className="flex justify-between items-center">
                <Badge variant="info">{p.plan}</Badge>
                <span className="text-sm font-medium">{p.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Currency Distribution</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">Subscription</p>
              {currencies?.subscription?.map((c, i) => (
                <div key={i} className="flex justify-between text-sm"><span>{c.currency}</span><span className="font-medium">{c.count}</span></div>
              ))}
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-[var(--text-muted)] mb-2">Store</p>
              {currencies?.store?.map((c, i) => (
                <div key={i} className="flex justify-between text-sm"><span>{c.currency}</span><span className="font-medium">{c.count}</span></div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Status Distribution</h2>
          <div className="space-y-2">
            {statuses.map((s, i) => (
              <div key={i} className="flex justify-between items-center">
                <Badge variant={s.status === 'active' ? 'success' : 'default'}>{s.status}</Badge>
                <span className="text-sm font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getSubscription, updateSubscription } from '../../services/smartpos/subscription';
import { getCurrency } from '../../services/smartpos/currency';
import Card from '../../components/smartpos/ui/Card';
import Input from '../../components/smartpos/ui/Input';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';
import Badge from '../../components/smartpos/ui/Badge';

const EXCHANGE_RATES = {
  KES: { USD: 0.0077, EUR: 0.0071, GBP: 0.0061, KES: 1 },
  USD: { KES: 130, EUR: 0.92, GBP: 0.79, USD: 1 },
  EUR: { KES: 141, USD: 1.09, GBP: 0.86, EUR: 1 },
  GBP: { KES: 164, USD: 1.27, EUR: 1.16, GBP: 1 },
};

function convertPrice(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency];
  if (!rate) return amount;
  return Math.round(amount * rate);
}

export default function Subscription() {
  const [plan, setPlan] = useState(null);
  const [systemCurrency, setSystemCurrency] = useState('KES');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getSubscription(), getCurrency()])
      .then(([subRes, currRes]) => {
        const p = subRes.plan;
        const baseCurrency = currRes.currency?.baseCurrency || 'KES';
        setSystemCurrency(baseCurrency);
        setPlan({
          ...p,
          priceMonthlyLocal: convertPrice(p.priceMonthly || 0, 'KES', baseCurrency),
          priceYearlyLocal: convertPrice(p.priceYearly || 0, 'KES', baseCurrency),
          pricePermanentLocal: convertPrice(p.pricePermanent || 0, 'KES', baseCurrency),
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setPlan(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        priceMonthly: convertPrice(plan.priceMonthlyLocal || 0, systemCurrency, 'KES'),
        priceYearly: convertPrice(plan.priceYearlyLocal || 0, systemCurrency, 'KES'),
        pricePermanent: convertPrice(plan.pricePermanentLocal || 0, systemCurrency, 'KES'),
        currency: systemCurrency,
        freeTrialDays: plan.freeTrialDays,
      };
      await updateSubscription(dataToSave);
      alert('Subscription plan saved');
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!plan) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Subscription Plan</h1>
          <p className="text-sm text-[var(--text-muted)]">
            System currency: <Badge variant="blue">{systemCurrency}</Badge> — Server stores in <Badge variant="purple">KES</Badge>
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Change currency in Settings → Currency tab
          </p>
        </div>
      </div>

      <Card className="max-w-2xl space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Pricing</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)]">Edit in</span>
              <Badge variant="blue">{systemCurrency}</Badge>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="text-[var(--text-muted)]">Server gets</span>
              <Badge variant="purple">KES</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Monthly ({systemCurrency})</label>
              <input type="number" value={plan.priceMonthlyLocal || ''} onChange={(e) => updateField('priceMonthlyLocal', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">KES (sent to server)</label>
              <input type="text" value={`KES ${convertPrice(plan.priceMonthlyLocal || 0, systemCurrency, 'KES').toLocaleString()}`} readOnly
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Yearly ({systemCurrency})</label>
              <input type="number" value={plan.priceYearlyLocal || ''} onChange={(e) => updateField('priceYearlyLocal', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">KES (sent to server)</label>
              <input type="text" value={`KES ${convertPrice(plan.priceYearlyLocal || 0, systemCurrency, 'KES').toLocaleString()}`} readOnly
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Permanent ({systemCurrency})</label>
              <input type="number" value={plan.pricePermanentLocal || ''} onChange={(e) => updateField('pricePermanentLocal', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">KES (sent to server)</label>
              <input type="text" value={`KES ${convertPrice(plan.pricePermanentLocal || 0, systemCurrency, 'KES').toLocaleString()}`} readOnly
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-sm cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Input label="Free Trial Days" type="number" value={plan.freeTrialDays || ''} onChange={(e) => updateField('freeTrialDays', Number(e.target.value))} />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
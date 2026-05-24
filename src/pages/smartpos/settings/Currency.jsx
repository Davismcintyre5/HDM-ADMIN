import { useEffect, useState } from 'react';
import { getCurrency, updateCurrency } from '../../../services/smartpos/currency';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';
import { CURRENCIES } from '../../../utils/smartpos/constants';

export default function CurrencySettings() {
  const [currency, setCurrency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrency()
      .then(res => setCurrency(res.currency?.baseCurrency || 'KES'))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await updateCurrency({ baseCurrency: currency }); alert('Currency updated'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Base Currency</label>
        <select value={currency || 'KES'} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)]">
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <Button onClick={handleSave} loading={saving}>Save</Button>
    </div>
  );
}
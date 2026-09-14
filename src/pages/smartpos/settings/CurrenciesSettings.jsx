import { useState, useEffect } from 'react';
import { getCurrencies, updateCurrencies } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

const ALL_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX', 'NGN', 'GHS', 'RWF', 'BIF'];

export default function CurrenciesSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrencies().then(res => setData(res?.data || res || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleCurrency = (list, cur) => {
    const arr = data[list] || [];
    return arr.includes(cur) ? arr.filter(c => c !== cur) : [...arr, cur];
  };

  const handleSave = async () => {
    setSaving(true);
    try { await updateCurrencies(data); alert('Saved!'); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">System Currencies</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_CURRENCIES.map(c => (
            <button key={c} onClick={() => setData({ ...data, system: toggleCurrency('system', c) })}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${(data.system || []).includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-[var(--border-color)]'}`}>{c}</button>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Store Currencies</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_CURRENCIES.map(c => (
            <button key={c} onClick={() => setData({ ...data, store: toggleCurrency('store', c) })}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${(data.store || []).includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-[var(--border-color)]'}`}>{c}</button>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Defaults</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Default Subscription</label>
            <select value={data.defaultSubscription || 'USD'} onChange={e => setData({ ...data, defaultSubscription: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {(data.system || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Default Store</label>
            <select value={data.defaultStore || 'KES'} onChange={e => setData({ ...data, defaultStore: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {(data.store || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Currencies</Button>
      </div>
    </div>
  );
}
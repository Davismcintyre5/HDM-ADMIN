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
    getCurrencies()
      .then((res) => {
        const c = res?.data || res || {};
        const system = Array.isArray(c.system) ? c.system : [];
        const store = Array.isArray(c.store) ? c.store : [];

        setData({
          system,
          store,
          defaultSubscription:
            c.defaultSubscription && system.includes(c.defaultSubscription)
              ? c.defaultSubscription
              : system[0] || 'KES',
          defaultStore:
            c.defaultStore && store.includes(c.defaultStore)
              ? c.defaultStore
              : store[0] || 'KES'
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    const system = data.system || [];
    const store = data.store || [];

    const newSub = system.includes(data.defaultSubscription)
      ? data.defaultSubscription
      : system[0] || '';
    const newStore = store.includes(data.defaultStore)
      ? data.defaultStore
      : store[0] || '';

    if (newSub !== data.defaultSubscription || newStore !== data.defaultStore) {
      setData((prev) => ({
        ...prev,
        defaultSubscription: newSub,
        defaultStore: newStore
      }));
    }
  }, [data]);

  const toggleCurrency = (list, cur) => {
    const arr = data[list] || [];
    return arr.includes(cur) ? arr.filter((c) => c !== cur) : [...arr, cur];
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        system: data.system || [],
        store: data.store || [],
        defaultSubscription: data.defaultSubscription,
        defaultStore: data.defaultStore
      };
      await updateCurrencies(payload);
      alert('Saved!');
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const canSave =
    (data.system || []).length > 0 &&
    (data.store || []).length > 0 &&
    data.defaultSubscription &&
    data.defaultStore;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">System Currencies</h2>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Currencies available for subscriptions and billing.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setData({ ...data, system: toggleCurrency('system', c) })}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                (data.system || []).includes(c)
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]'
                  : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Store Currencies</h2>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Currencies stores can use to sell products.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setData({ ...data, store: toggleCurrency('store', c) })}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                (data.store || []).includes(c)
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]'
                  : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Defaults</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Default Subscription Currency
            </label>
            <select
              value={data.defaultSubscription || ''}
              onChange={(e) => setData({ ...data, defaultSubscription: e.target.value })}
              className="w-full px-3 py-2 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]"
            >
              {(data.system || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Shown by default on pricing and register pages.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Default Store Currency
            </label>
            <select
              value={data.defaultStore || ''}
              onChange={(e) => setData({ ...data, defaultStore: e.target.value })}
              className="w-full px-3 py-2 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]"
            >
              {(data.store || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Used by default for new stores.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg" disabled={!canSave}>
          Save Currencies
        </Button>
      </div>
    </div>
  );
}
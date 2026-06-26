import { useEffect, useState } from 'react';
import { getFinancial, getFinancialStats, updateFees, updateLimits, updateCurrency } from '../../services/flax/financial';
import Card from '../../components/flax/ui/Card';
import Input from '../../components/flax/ui/Input';
import Button from '../../components/flax/ui/Button';
import Spinner from '../../components/flax/ui/Spinner';

export default function Financial() {
  const [financial, setFinancial] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getFinancial().catch(() => null), getFinancialStats().catch(() => null)])
      .then(([f, s]) => {
        setFinancial(f?.data?.financial || f?.financial || {});
        setStats(s?.data || s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (fn, data) => {
    setSaving(true);
    try { await fn(data); alert('Saved!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!financial) return null;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Financial</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Total Tx', value: stats.totalTransactions },
            { label: 'Volume', value: `KES ${(stats.totalVolume || 0).toLocaleString()}` },
            { label: 'Fees', value: `KES ${(stats.totalFees || 0).toLocaleString()}` },
          ].map(s => (
            <Card key={s.label}>
              <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{s.value ?? 0}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Fees</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Send Money Flat Fee" type="number" value={financial.sendMoneyFlatFee || 0} onChange={(e) => setFinancial({ ...financial, sendMoneyFlatFee: +e.target.value })} />
            <Input label="Send Money % Fee" type="number" value={financial.sendMoneyPercentageFee || 0} onChange={(e) => setFinancial({ ...financial, sendMoneyPercentageFee: +e.target.value })} />
            <Input label="Withdrawal Flat Fee" type="number" value={financial.withdrawalFlatFee || 0} onChange={(e) => setFinancial({ ...financial, withdrawalFlatFee: +e.target.value })} />
            <Input label="Withdrawal % Fee" type="number" value={financial.withdrawalPercentageFee || 0} onChange={(e) => setFinancial({ ...financial, withdrawalPercentageFee: +e.target.value })} />
          </div>
          <Button size="sm" className="mt-3" onClick={() => handleSave(updateFees, { sendMoneyFlatFee: financial.sendMoneyFlatFee, sendMoneyPercentageFee: financial.sendMoneyPercentageFee, withdrawalFlatFee: financial.withdrawalFlatFee, withdrawalPercentageFee: financial.withdrawalPercentageFee })} loading={saving}>Save Fees</Button>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Limits</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Send" type="number" value={financial.minSendAmount || 0} onChange={(e) => setFinancial({ ...financial, minSendAmount: +e.target.value })} />
            <Input label="Max Send" type="number" value={financial.maxSendAmount || 0} onChange={(e) => setFinancial({ ...financial, maxSendAmount: +e.target.value })} />
            <Input label="Max Daily" type="number" value={financial.maxDailySend || 0} onChange={(e) => setFinancial({ ...financial, maxDailySend: +e.target.value })} />
            <Input label="Max Per Tx" type="number" value={financial.maxPerTransaction || 0} onChange={(e) => setFinancial({ ...financial, maxPerTransaction: +e.target.value })} />
          </div>
          <Button size="sm" className="mt-3" onClick={() => handleSave(updateLimits, { minSendAmount: financial.minSendAmount, maxSendAmount: financial.maxSendAmount, maxDailySend: financial.maxDailySend, maxPerTransaction: financial.maxPerTransaction })} loading={saving}>Save Limits</Button>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Currency</h3>
          <Input label="Currency" value={financial.currency || 'KES'} onChange={(e) => setFinancial({ ...financial, currency: e.target.value })} />
          <Button size="sm" className="mt-3" onClick={() => handleSave(updateCurrency, { currency: financial.currency })} loading={saving}>Save Currency</Button>
        </Card>
      </div>
    </div>
  );
}
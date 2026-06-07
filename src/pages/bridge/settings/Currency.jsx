import { useEffect, useState } from 'react';
import { getCurrencies, toggleCurrency, setDefaultCurrency, getExchangeRates, updateExchangeRates } from '../../../services/bridge/currency';
import Card from '../../../components/bridge/ui/Card';
import Table from '../../../components/bridge/ui/Table';
import Badge from '../../../components/bridge/ui/Badge';
import Button from '../../../components/bridge/ui/Button';
import Input from '../../../components/bridge/ui/Input';
import Spinner from '../../../components/bridge/ui/Spinner';

export default function CurrencySettings() {
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRate, setNewRate] = useState({ from: 'USD', to: 'KES', rate: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getCurrencies(), getExchangeRates()])
      .then(([c, r]) => {
        setCurrencies(c.currencies || c.data || []);
        setRates(r.rates || r.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (id) => {
    try { await toggleCurrency(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleSetDefault = async (id) => {
    try { await setDefaultCurrency(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleAddRate = async () => {
    if (!newRate.rate || !newRate.from || !newRate.to) return;
    try {
      await updateExchangeRates({ rates: [{ fromCurrency: newRate.from, toCurrency: newRate.to, rate: Number(newRate.rate) }] });
      setNewRate({ from: 'USD', to: 'KES', rate: '' });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  const currencyColumns = [
    { key: 'code', label: 'Code', render: (row) => <span className="font-medium">{row.code || row.symbol}</span> },
    { key: 'symbol', label: 'Symbol', render: (row) => row.symbol || row.code },
    { key: 'isActive', label: 'Status', render: (row) => (
      <button onClick={() => handleToggle(row._id || row.id)}>
        {row.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}
      </button>
    )},
    { key: 'isDefault', label: 'Default', render: (row) => (
      row.isDefault ? <Badge variant="indigo">Default</Badge> : (
        <Button size="sm" variant="outline" onClick={() => handleSetDefault(row._id || row.id)}>Set Default</Button>
      )
    )},
  ];

  const rateColumns = [
    { key: 'fromCurrency', label: 'From', render: (row) => <span className="font-medium">{row.fromCurrency}</span> },
    { key: 'toCurrency', label: 'To', render: (row) => <span className="font-medium">{row.toCurrency}</span> },
    { key: 'rate', label: 'Rate', render: (row) => <span className="font-medium">{row.rate}</span> },
    { key: 'source', label: 'Source', render: (row) => <Badge variant={row.source === 'manual' ? 'indigo' : 'default'}>{row.source || 'manual'}</Badge> },
    { key: 'isActive', label: 'Status', render: (row) => row.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge> },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold mb-4">Currencies</h3>
        <Table columns={currencyColumns} data={currencies} emptyMessage="No currencies." />
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Exchange Rates</h3>
        <div className="flex gap-3 mb-4 items-end flex-wrap">
          <Input label="From" value={newRate.from} onChange={(e) => setNewRate(p => ({ ...p, from: e.target.value }))} placeholder="USD" />
          <Input label="To" value={newRate.to} onChange={(e) => setNewRate(p => ({ ...p, to: e.target.value }))} placeholder="KES" />
          <Input label="Rate" type="number" step="0.0001" value={newRate.rate} onChange={(e) => setNewRate(p => ({ ...p, rate: e.target.value }))} placeholder="130" />
          <Button onClick={handleAddRate} size="sm">Add Rate</Button>
        </div>
        <Table columns={rateColumns} data={rates} emptyMessage="No exchange rates." />
      </Card>
    </div>
  );
}
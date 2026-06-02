import { useEffect, useState } from 'react';
import { getPaymentSettingsAll, getPaymentSettings, updatePaymentSettings, togglePaymentMethod, getTransactions, getPaymentAnalytics } from '../../services/vibe/payments';
import Card from '../../components/vibe/ui/Card';
import Table from '../../components/vibe/ui/Table';
import Badge from '../../components/vibe/ui/Badge';
import Button from '../../components/vibe/ui/Button';
import Toggle from '../../components/vibe/ui/Toggle';
import Input from '../../components/vibe/ui/Input';
import Spinner from '../../components/vibe/ui/Spinner';
import Pagination from '../../components/vibe/ui/Pagination';
import { formatDate } from '../../utils/vibe/formatDate';
import { HiCheck, HiClock, HiX } from 'react-icons/hi';

const CURRENCIES = [
  { value: 'KSh', label: 'KSh', symbol: 'KSh' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
];

const METHOD_ICONS = { stripe: '💳', mpesa_stk: '📱', paypal: '🅿️', manual: '💵' };
const METHOD_LABELS = { stripe: 'Stripe (Credit/Debit Card)', mpesa_stk: 'M-Pesa STK Push', paypal: 'PayPal', manual: 'Manual M-Pesa' };

const MANUAL_SUB_METHODS = [
  { key: 'send_money', label: 'Send Money', field: 'phoneNumber', placeholder: '0768784909' },
  { key: 'paybill', label: 'Paybill', field: 'paybillNumber', placeholder: '247247' },
  { key: 'till', label: 'Till Number', field: 'tillNumber', placeholder: '123456' },
];

export default function Payments() {
  const [methods, setMethods] = useState([]);
  const [manualSettings, setManualSettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txMeta, setTxMeta] = useState({ total: 0, page: 1, pages: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getPaymentSettingsAll(),
      getPaymentSettings(),
      getTransactions({ page, limit: 20 }),
      getPaymentAnalytics(),
    ])
      .then(([all, manual, t, a]) => {
        setMethods(all.data || all || []);
        setManualSettings(manual.data || manual || {});
        setTransactions(t.data || []);
        setTxMeta({ total: t.total || 0, page: t.page || 1, pages: t.pages || 0 });
        setAnalytics(a.data || a);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleToggleMethod = async (method, enabled) => {
    try {
      await togglePaymentMethod(method, { enabled });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const updateMethodField = (method, field, value) => {
    setMethods(prev => prev.map(m => m.method === method ? { ...m, [field]: value } : m));
  };

  const updateMethodPlan = (method, plan, value) => {
    setMethods(prev => prev.map(m => m.method === method ? { ...m, plans: { ...m.plans, [plan]: { price: value } } } : m));
  };

  const updateManualField = (key, value) => {
    setManualSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateManualSubMethod = (index, field, value) => {
    setManualSettings(prev => {
      const subMethods = [...(prev.subMethods || [])];
      subMethods[index] = { ...subMethods[index], [field]: value };
      return { ...prev, subMethods };
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const m of methods) {
        await togglePaymentMethod(m.method, m);
      }
      if (manualSettings) {
        await updatePaymentSettings(manualSettings);
      }
      alert('All payment settings saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const formatPrice = (price, currency) => {
    const cur = CURRENCIES.find(c => c.value === currency);
    const symbol = cur?.symbol || '$';
    if (currency === 'KSh') return `${symbol} ${price?.toLocaleString() || 0}`;
    return `${symbol}${price || 0}`;
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  const txColumns = [
    { key: 'user', label: 'User', render: (row) => row.user?.username || row.user?.email || 'N/A' },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium">{formatPrice(row.amount, row.currency)}</span> },
    { key: 'method', label: 'Method', render: (row) => <Badge variant="gradient">{row.method?.replace(/_/g, ' ')}</Badge> },
    { key: 'plan', label: 'Plan', render: (row) => <span className="text-xs capitalize">{row.plan || row.type || '—'}</span> },
    { key: 'status', label: 'Status', render: (row) => {
      const icons = { completed: <HiCheck className="w-4 h-4 text-green-500" />, pending: <HiClock className="w-4 h-4 text-yellow-500" />, failed: <HiX className="w-4 h-4 text-red-500" /> };
      return <div className="flex items-center gap-1">{icons[row.status] || null}<span className="text-xs capitalize">{row.status}</span></div>;
    }},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payment Settings</h1>

      {/* System Methods */}
      <div className="space-y-4 mb-6">
        {methods.filter(m => m.method !== 'manual').map(m => (
          <Card key={m.method}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{METHOD_ICONS[m.method] || '💳'}</span>
                <h3 className="font-semibold text-[var(--text-primary)]">{METHOD_LABELS[m.method] || m.method}</h3>
              </div>
              <Toggle checked={m.enabled || false} onChange={(v) => handleToggleMethod(m.method, v)} />
            </div>
            {m.enabled && (
              <div className="ml-10 space-y-3">
                <div className="w-48">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Currency</label>
                  <select value={m.activeCurrency || 'USD'} onChange={(e) => updateMethodField(m.method, 'activeCurrency', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label={`Monthly`} type="number" step="0.01" value={m.plans?.monthly?.price || ''} onChange={(e) => updateMethodPlan(m.method, 'monthly', Number(e.target.value))} />
                  <Input label={`Yearly`} type="number" step="0.01" value={m.plans?.yearly?.price || ''} onChange={(e) => updateMethodPlan(m.method, 'yearly', Number(e.target.value))} />
                  <Input label={`Permanent`} type="number" step="0.01" value={m.plans?.permanent?.price || ''} onChange={(e) => updateMethodPlan(m.method, 'permanent', Number(e.target.value))} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Manual M-Pesa */}
      {methods.find(m => m.method === 'manual') && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{METHOD_ICONS.manual}</span>
              <h2 className="font-semibold text-[var(--text-primary)]">{METHOD_LABELS.manual}</h2>
            </div>
            <Toggle checked={manualSettings?.enabled || false} onChange={(v) => updateManualField('enabled', v)} />
          </div>
          {manualSettings?.enabled && (
            <div className="space-y-4 ml-10">
              {(manualSettings.subMethods || []).map((sm, i) => {
                const config = MANUAL_SUB_METHODS.find(m => m.key === sm.name);
                return (
                  <div key={sm.name} className="p-3 rounded-lg border border-[var(--border-color)]">
                    <Toggle
                      checked={sm.enabled || false}
                      onChange={(v) => updateManualSubMethod(i, 'enabled', v)}
                      label={config?.label || sm.name}
                    />
                    {sm.enabled && (
                      <div className="mt-3 ml-6 space-y-2">
                        {sm.name === 'send_money' && (
                          <Input label="Phone Number" value={sm.details?.phoneNumber || ''}
                            onChange={(e) => updateManualSubMethod(i, 'details', { ...sm.details, phoneNumber: e.target.value })}
                            placeholder="0768784909" />
                        )}
                        {sm.name === 'paybill' && (
                          <>
                            <Input label="Business Number" value={sm.details?.paybillNumber || ''}
                              onChange={(e) => updateManualSubMethod(i, 'details', { ...sm.details, paybillNumber: e.target.value })}
                              placeholder="247247" />
                            <Input label="Account Number" value={sm.details?.accountNumber || ''}
                              onChange={(e) => updateManualSubMethod(i, 'details', { ...sm.details, accountNumber: e.target.value })}
                              placeholder="123456" />
                          </>
                        )}
                        {sm.name === 'till' && (
                          <Input label="Till Number" value={sm.details?.tillNumber || ''}
                            onChange={(e) => updateManualSubMethod(i, 'details', { ...sm.details, tillNumber: e.target.value })}
                            placeholder="123456" />
                        )}
                        <Input label="Instructions" value={sm.instructions || ''}
                          onChange={(e) => updateManualSubMethod(i, 'instructions', e.target.value)}
                          placeholder="Payment instructions for users..." />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <div className="flex justify-end mb-6">
        <Button onClick={handleSaveAll} loading={saving} size="lg">💾 Save All</Button>
      </div>

      {/* Transactions */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Transactions</h2>
          <Badge variant="gradient">{txMeta.total} total</Badge>
        </div>
        <Table columns={txColumns} data={transactions} loading={loading} emptyMessage="No transactions yet." />
        <Pagination page={page} totalPages={txMeta.pages || 1} onPageChange={setPage} />
      </Card>

      {/* Analytics */}
      {analytics && (
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{formatPrice(analytics.totalRevenue || 0, 'USD')}</p>
              <p className="text-xs text-[var(--text-muted)]">Total Revenue</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{analytics.totalTransactions || txMeta.total}</p>
              <p className="text-xs text-[var(--text-muted)]">Transactions</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.completedCount || 0}</p>
              <p className="text-xs text-[var(--text-muted)]">Completed</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
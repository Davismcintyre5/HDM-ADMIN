import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../../services/spark/settings';
import { getActivations, approveActivation, rejectActivation } from '../../../services/spark/payments';
import { updateCurrency } from '../../../services/spark/currency';
import Input from '../../../components/spark/ui/Input';
import Toggle from '../../../components/spark/ui/Toggle';
import Button from '../../../components/spark/ui/Button';
import Spinner from '../../../components/spark/ui/Spinner';
import Card from '../../../components/spark/ui/Card';
import Table from '../../../components/spark/ui/Table';
import Badge from '../../../components/spark/ui/Badge';
import Modal from '../../../components/spark/ui/Modal';
import ConfirmDialog from '../../../components/spark/ui/ConfirmDialog';
import { formatDate } from '../../../utils/spark/formatDate';
import { HiCheck, HiX } from 'react-icons/hi';

const BASE_PRICES = { monthly: 4.99, yearly: 39.99, permanent: 99.99 };
const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'KES', label: 'KES (KSh)', symbol: 'KSh' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];
const SYMBOLS = { USD: '$', KES: 'KSh', EUR: '€', GBP: '£' };

export default function PaymentsSettings() {
  const [settings, setSettings] = useState(null);
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmCurrency, setConfirmCurrency] = useState({ open: false, currency: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getSettings(), getActivations()])
      .then(([s, a]) => {
        setSettings(s);
        setActivations(a.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const updatePaymentMethod = (key, value) => setSettings(prev => ({ ...prev, paymentMethods: { ...prev.paymentMethods, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsRes = await updateSettings(settings);
      const currencyRes = await updateCurrency({ currency: settings.planCurrency });
      
      setSettings(prev => ({
        ...prev,
        ...(settingsRes.data || settingsRes),
        planCurrency: currencyRes.data?.currency || settings.planCurrency,
        exchangeRates: currencyRes.data?.exchangeRates || prev.exchangeRates,
      }));
      
      alert('Settings saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleCurrencySelect = (currency) => {
    if (currency === settings.planCurrency) return;
    setConfirmCurrency({ open: true, currency });
  };

  const handleConfirmCurrency = async () => {
    setSaving(true);
    try {
      const currencyRes = await updateCurrency({ currency: confirmCurrency.currency });
      
      setSettings(prev => ({
        ...prev,
        planCurrency: currencyRes.data?.currency || confirmCurrency.currency,
        exchangeRates: currencyRes.data?.exchangeRates || prev.exchangeRates,
      }));
      
      setConfirmCurrency({ open: false, currency: '' });
      alert(`Currency changed to ${confirmCurrency.currency}`);
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleApprove = async (id) => {
    try { await approveActivation(id); const a = await getActivations(); setActivations(a.data || []); } catch (err) { alert(err.message); }
  };

  const handleReject = async () => {
    try { await rejectActivation(rejectModal.id, rejectModal.reason); setRejectModal({ open: false, id: null, reason: '' }); const a = await getActivations(); setActivations(a.data || []); } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  const exchangeRates = settings?.exchangeRates || { USD: 1, KES: 130, EUR: 0.92, GBP: 0.79 };
  const rate = exchangeRates[settings?.planCurrency] || 1;
  const symbol = SYMBOLS[settings?.planCurrency] || '$';

  const convertPrice = (base) => {
    const price = base * rate;
    if (settings?.planCurrency === 'KES') return `KSh ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `${symbol}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const actColumns = [
    { key: 'user.email', label: 'User', render: (row) => row.user?.email || 'N/A' },
    { key: 'plan', label: 'Plan', render: (row) => <Badge variant="sky">{row.plan}</Badge> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium">${row.amount}</span> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="success" onClick={() => handleApprove(row._id)}><HiCheck className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id, reason: '' })}><HiX className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Currency Selector */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Currency</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {CURRENCIES.map(c => (
            <button
              key={c.value}
              onClick={() => handleCurrencySelect(c.value)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                settings.planCurrency === c.value
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-sm'
                  : 'border-[var(--border-color)] hover:border-sky-300 bg-[var(--bg-secondary)]'
              }`}
            >
              <p className={`text-2xl font-bold ${settings.planCurrency === c.value ? 'text-sky-600 dark:text-sky-400' : 'text-[var(--text-primary)]'}`}>
                {c.symbol}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{c.label}</p>
              {settings.planCurrency === c.value && <Badge variant="sky" className="mt-2">Active</Badge>}
            </button>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[var(--text-muted)]">Converted Prices</p>
            <p className="text-xs text-[var(--text-muted)]">
              1 USD = {rate.toFixed(2)} {settings.planCurrency}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-muted)]">Monthly</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{convertPrice(settings.planMonthlyPrice || BASE_PRICES.monthly)}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-muted)]">Yearly</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{convertPrice(settings.planYearlyPrice || BASE_PRICES.yearly)}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-muted)]">Permanent</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{convertPrice(settings.planPermanentPrice || BASE_PRICES.permanent)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Pricing (USD)</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">Server stores all prices in USD. Converted prices shown in currency section above.</p>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Monthly ($)" type="number" step="0.01" value={settings.planMonthlyPrice || ''} onChange={(e) => updateField('planMonthlyPrice', Number(e.target.value))} />
          <Input label="Yearly ($)" type="number" step="0.01" value={settings.planYearlyPrice || ''} onChange={(e) => updateField('planYearlyPrice', Number(e.target.value))} />
          <Input label="Permanent ($)" type="number" step="0.01" value={settings.planPermanentPrice || ''} onChange={(e) => updateField('planPermanentPrice', Number(e.target.value))} />
        </div>
      </Card>

      {/* Payment Methods */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Payment Methods</h3>
        <div className="space-y-2">
          <Toggle label="Stripe" checked={settings.paymentMethods?.stripe || false} onChange={(v) => updatePaymentMethod('stripe', v)} />
          <Toggle label="M-Pesa STK Push" checked={settings.paymentMethods?.mpesaStkPush || false} onChange={(v) => updatePaymentMethod('mpesaStkPush', v)} />
          <Toggle label="M-Pesa Send Money" checked={settings.paymentMethods?.mpesaSendMoney || false} onChange={(v) => updatePaymentMethod('mpesaSendMoney', v)} />
          <Toggle label="M-Pesa Paybill" checked={settings.paymentMethods?.mpesaPaybill || false} onChange={(v) => updatePaymentMethod('mpesaPaybill', v)} />
          <Toggle label="M-Pesa Till" checked={settings.paymentMethods?.mpesaTill || false} onChange={(v) => updatePaymentMethod('mpesaTill', v)} />
          <Toggle label="PayPal" checked={settings.paymentMethods?.paypal || false} onChange={(v) => updatePaymentMethod('paypal', v)} />
        </div>
      </Card>

      {/* Pending Activations */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Pending Activations</h3>
        <Table columns={actColumns} data={activations} emptyMessage="No pending activations." />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Settings</Button>
      </div>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null, reason: '' })} title="Reject Activation" size="sm">
        <div className="space-y-4">
          <Input label="Reason" value={rejectModal.reason} onChange={(e) => setRejectModal(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for rejection" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal({ open: false, id: null, reason: '' })}>Cancel</Button>
            <Button variant="danger" onClick={handleReject}>Reject</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Currency Change */}
      <ConfirmDialog
        open={confirmCurrency.open}
        onClose={() => setConfirmCurrency({ open: false, currency: '' })}
        title="Change Currency"
        message={`Change system currency to ${confirmCurrency.currency}? This affects ALL users — prices will display in ${confirmCurrency.currency} immediately.`}
        confirmLabel={`Change to ${confirmCurrency.currency}`}
        variant="primary"
        onConfirm={handleConfirmCurrency}
        loading={saving}
      />
    </div>
  );
}
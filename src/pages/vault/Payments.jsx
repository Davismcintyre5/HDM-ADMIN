import { useEffect, useState } from 'react';
import { getSettings, updatePayments, updateCurrency } from '../../services/vault/settings';
import Toggle from '../../components/vault/ui/Toggle';
import Input from '../../components/vault/ui/Input';
import Button from '../../components/vault/ui/Button';
import Spinner from '../../components/vault/ui/Spinner';
import Card from '../../components/vault/ui/Card';
import ConfirmDialog from '../../components/vault/ui/ConfirmDialog';

const CURRENCIES = [
  { value: 'KSh', label: 'KSh (Kenyan Shilling)' },
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'GBP', label: 'GBP (British Pound)' },
];

export default function Payments() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencyChange, setCurrencyChange] = useState({ open: false, currency: '' });

  useEffect(() => {
    getSettings()
      .then(s => setSettings(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const payments = settings?.payments || {};
  const currency = settings?.currency || { activeCurrency: 'KSh' };

  const updatePayment = (path, value) => {
    setSettings(prev => {
      const parts = path.split('.');
      const newSettings = JSON.parse(JSON.stringify(prev));
      let obj = newSettings.payments;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try { await updatePayments(settings.payments); alert('Saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleCurrencySelect = (curr) => {
    if (curr === currency.activeCurrency) return;
    setCurrencyChange({ open: true, currency: curr });
  };

  const handleConfirmCurrency = async () => {
    setSaving(true);
    try {
      await updateCurrency({ activeCurrency: currencyChange.currency });
      setSettings(prev => ({ ...prev, currency: { activeCurrency: currencyChange.currency } }));
      setCurrencyChange({ open: false, currency: '' });
      alert('Currency updated');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payments</h1>
      <div className="space-y-6 max-w-2xl">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Currency</h3>
          <div className="grid grid-cols-2 gap-3">
            {CURRENCIES.map(c => (
              <button key={c.value} onClick={() => handleCurrencySelect(c.value)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${currency.activeCurrency === c.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-[var(--border-color)] hover:border-orange-300 bg-[var(--bg-secondary)]'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${currency.activeCurrency === c.value ? 'border-orange-500' : 'border-[var(--border-color)]'}`}>
                    {currency.activeCurrency === c.value && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{c.label}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <Toggle label="Stripe" description="Credit & debit card payments" checked={payments.stripe?.enabled || false} onChange={(v) => updatePayment('stripe.enabled', v)} />
        </Card>

        <Card>
          <Toggle label="M-Pesa" description="Mobile money payments (Kenya)" checked={payments.mpesa?.enabled || false} onChange={(v) => updatePayment('mpesa.enabled', v)} />
          {payments.mpesa?.enabled && (
            <div className="mt-3 ml-2 pl-4 border-l-2 border-green-300 dark:border-green-700 space-y-3">
              <Toggle label="STK Push" checked={payments.mpesa?.stkPush || false} onChange={(v) => updatePayment('mpesa.stkPush', v)} />
              <div>
                <Toggle label="Send Money" checked={payments.mpesa?.sendMoney?.enabled || false} onChange={(v) => updatePayment('mpesa.sendMoney.enabled', v)} />
                {payments.mpesa?.sendMoney?.enabled && <div className="ml-6 mt-2"><Input label="Receive Phone" value={payments.mpesa?.sendMoney?.receivePhone || ''} onChange={(e) => updatePayment('mpesa.sendMoney.receivePhone', e.target.value)} placeholder="0712345678" /></div>}
              </div>
              <div>
                <Toggle label="Paybill" checked={payments.mpesa?.paybill?.enabled || false} onChange={(v) => updatePayment('mpesa.paybill.enabled', v)} />
                {payments.mpesa?.paybill?.enabled && <div className="ml-6 mt-2 space-y-2"><Input label="Business Number" value={payments.mpesa?.paybill?.businessNumber || ''} onChange={(e) => updatePayment('mpesa.paybill.businessNumber', e.target.value)} placeholder="247247" /><Input label="Account Name" value={payments.mpesa?.paybill?.accountName || ''} onChange={(e) => updatePayment('mpesa.paybill.accountName', e.target.value)} placeholder="HDM Vault" /></div>}
              </div>
              <div>
                <Toggle label="Buy Goods / Till" checked={payments.mpesa?.till?.enabled || false} onChange={(v) => updatePayment('mpesa.till.enabled', v)} />
                {payments.mpesa?.till?.enabled && <div className="ml-6 mt-2 space-y-2"><Input label="Till Number" value={payments.mpesa?.till?.tillNumber || ''} onChange={(e) => updatePayment('mpesa.till.tillNumber', e.target.value)} /><Input label="Business Name" value={payments.mpesa?.till?.businessName || ''} onChange={(e) => updatePayment('mpesa.till.businessName', e.target.value)} /></div>}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <Toggle label="PayPal" description="International payments" checked={payments.paypal?.enabled || false} onChange={(v) => updatePayment('paypal.enabled', v)} />
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Manual Verification</h3>
          <Toggle label="Require payment proof upload" checked={payments.manualVerification?.requireProofUpload || false} onChange={(v) => updatePayment('manualVerification.requireProofUpload', v)} />
          <Toggle label="Auto-validate transaction ID" checked={payments.manualVerification?.autoValidateTxId || false} onChange={(v) => updatePayment('manualVerification.autoValidateTxId', v)} />
          <Toggle label="Prevent duplicate transaction IDs" checked={payments.manualVerification?.preventDuplicateTxId || false} onChange={(v) => updatePayment('manualVerification.preventDuplicateTxId', v)} />
        </Card>

        <Button onClick={handleSave} loading={saving}>Save Payment Settings</Button>

        <ConfirmDialog open={currencyChange.open} onClose={() => setCurrencyChange({ open: false, currency: '' })} title="Change Currency" message={`Change system currency to ${currencyChange.currency}?`} confirmLabel={`Change to ${currencyChange.currency}`} variant="primary" onConfirm={handleConfirmCurrency} loading={saving} />
      </div>
    </div>
  );
}
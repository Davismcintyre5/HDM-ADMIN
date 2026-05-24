import { useEffect, useState } from 'react';
import { getPaymentMethods, updatePaymentMethods } from '../../../services/smartpos/paymentMethods';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Input from '../../../components/smartpos/ui/Input';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

export default function PaymentMethodsSettings() {
  const [methods, setMethods] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPaymentMethods()
      .then(res => setMethods(res.methods))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setMethods(prev => ({ ...prev, [key]: value }));
  const updateMpesa = (key, value) => setMethods(prev => ({ ...prev, mpesaMethods: { ...prev.mpesaMethods, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try { await updatePaymentMethods(methods); alert('Payment methods saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!methods) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Stripe */}
      <div className="p-4 rounded-lg border border-[var(--border-color)]">
        <Toggle label="Stripe" description="Accept credit/debit card payments" checked={methods.stripeEnabled || false} onChange={(v) => updateField('stripeEnabled', v)} />
        {methods.stripeEnabled && (
          <div className="mt-3 pl-2 border-l-2 border-blue-300 dark:border-blue-700 space-y-3">
            <p className="text-xs text-[var(--text-muted)]">Leave empty to use server .env values</p>
            <Input label="Publishable Key" type="password" value={methods.stripePublishableKey || ''} onChange={(e) => updateField('stripePublishableKey', e.target.value)} placeholder="pk_live_..." />
            <Input label="Secret Key" type="password" value={methods.stripeSecretKey || ''} onChange={(e) => updateField('stripeSecretKey', e.target.value)} placeholder="sk_live_..." />
          </div>
        )}
      </div>

      {/* PayPal */}
      <div className="p-4 rounded-lg border border-[var(--border-color)]">
        <Toggle label="PayPal" description="Accept PayPal payments" checked={methods.paypalEnabled || false} onChange={(v) => updateField('paypalEnabled', v)} />
        {methods.paypalEnabled && (
          <div className="mt-3 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700 space-y-3">
            <p className="text-xs text-[var(--text-muted)]">Leave empty to use server .env values</p>
            <Input label="Client ID" type="password" value={methods.paypalClientId || ''} onChange={(e) => updateField('paypalClientId', e.target.value)} placeholder="AX..." />
            <Input label="Secret Key" type="password" value={methods.paypalSecretKey || ''} onChange={(e) => updateField('paypalSecretKey', e.target.value)} placeholder="EL..." />
          </div>
        )}
      </div>

      {/* M-Pesa */}
      <div className="p-4 rounded-lg border border-[var(--border-color)]">
        <Toggle label="M-Pesa" description="Accept mobile money payments" checked={methods.mpesaEnabled || false} onChange={(v) => updateField('mpesaEnabled', v)} />
        {methods.mpesaEnabled && (
          <div className="mt-3 pl-2 border-l-2 border-green-300 dark:border-green-700 space-y-4">
            <p className="text-xs text-[var(--text-muted)]">Leave empty to use server .env values</p>
            <Input label="Short Code" value={methods.mpesaShortCode || ''} onChange={(e) => updateField('mpesaShortCode', e.target.value)} placeholder="174379" />

            <div className="border-t pt-3 space-y-3">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase">Payment Methods</p>
              
              <Toggle label="STK Push" description="Popup payment prompt on customer phone" checked={methods.mpesaMethods?.stkPush || false} onChange={(v) => updateMpesa('stkPush', v)} />
              
              <Toggle label="Send Money" description="Customer sends to your number" checked={methods.mpesaMethods?.sendMoney || false} onChange={(v) => updateMpesa('sendMoney', v)} />
              {methods.mpesaMethods?.sendMoney && (
                <div className="ml-6">
                  <Input label="Phone Number" value={methods.mpesaMethods?.sendMoneyPhoneNumber || ''} onChange={(e) => updateMpesa('sendMoneyPhoneNumber', e.target.value)} placeholder="07xxxxxxxx" />
                </div>
              )}
              
              <Toggle label="Till Number" description="Customer pays via Till" checked={methods.mpesaMethods?.till || false} onChange={(v) => updateMpesa('till', v)} />
              {methods.mpesaMethods?.till && (
                <div className="ml-6 space-y-2">
                  <Input label="Till Number" value={methods.mpesaMethods?.tillNumber || ''} onChange={(e) => updateMpesa('tillNumber', e.target.value)} placeholder="123456" />
                  <Input label="Business Name" value={methods.mpesaMethods?.tillBusinessName || ''} onChange={(e) => updateMpesa('tillBusinessName', e.target.value)} placeholder="SmartPOS" />
                </div>
              )}
              
              <Toggle label="Paybill" description="Customer pays via Paybill" checked={methods.mpesaMethods?.paybill || false} onChange={(v) => updateMpesa('paybill', v)} />
              {methods.mpesaMethods?.paybill && (
                <div className="ml-6 space-y-2">
                  <Input label="Business Number" value={methods.mpesaMethods?.paybillBusinessNumber || ''} onChange={(e) => updateMpesa('paybillBusinessNumber', e.target.value)} placeholder="247247" />
                  <Input label="Account Name" value={methods.mpesaMethods?.paybillAccountName || ''} onChange={(e) => updateMpesa('paybillAccountName', e.target.value)} placeholder="SmartPOS" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}
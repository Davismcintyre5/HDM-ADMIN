import { useEffect, useState } from 'react';
import { getPaymentConfig, updatePaymentConfig } from '../../services/hdmerp/payments';
import Card from '../../components/hdmerp/ui/Card';
import Toggle from '../../components/hdmerp/ui/Toggle';
import Input from '../../components/hdmerp/ui/Input';
import Button from '../../components/hdmerp/ui/Button';
import Spinner from '../../components/hdmerp/ui/Spinner';

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({
    stripe: { enabled: false },
    mpesa: {
      enabled: false,
      stkPush: false,
      sendMoney: { enabled: false, phoneNumber: '' },
      paybill: { enabled: false, businessNumber: '', accountName: '' },
      till: { enabled: false, tillNumber: '', businessName: '' },
    },
    paypal: { enabled: false },
    currency: 'KSh',
    requireProof: false,
  });

  useEffect(() => {
    getPaymentConfig()
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setConfig(prev => ({
            ...prev,
            ...data,
            mpesa: { ...prev.mpesa, ...(data.mpesa || {}) },
            stripe: { ...prev.stripe, ...(data.stripe || {}) },
            paypal: { ...prev.paypal, ...(data.paypal || {}) },
          }));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const parts = path.split('.');
      const newConfig = JSON.parse(JSON.stringify(prev));
      let obj = newConfig;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return newConfig;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePaymentConfig(config);
      alert('Payment settings saved successfully');
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payment Methods</h1>
      
      <div className="space-y-6 max-w-3xl">
        {/* Stripe */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            Stripe
          </h2>
          <Toggle
            label="Enable Stripe"
            description="Accept credit/debit card payments via Stripe"
            checked={config.stripe?.enabled || false}
            onChange={(v) => updateConfig('stripe.enabled', v)}
          />
        </Card>

        {/* M-Pesa */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-500 rounded-full"></span>
            M-Pesa
          </h2>
          <Toggle
            label="Enable M-Pesa"
            description="Accept mobile money payments"
            checked={config.mpesa?.enabled || false}
            onChange={(v) => updateConfig('mpesa.enabled', v)}
          />
          
          {config.mpesa?.enabled && (
            <div className="mt-4 ml-2 pl-4 border-l-2 border-green-300 dark:border-green-700 space-y-4">
              {/* STK Push */}
              <Toggle
                label="STK Push"
                description="Direct popup payment on customer phone"
                checked={config.mpesa?.stkPush || false}
                onChange={(v) => updateConfig('mpesa.stkPush', v)}
              />

              {/* Send Money */}
              <div className="p-3 rounded-lg border border-[var(--border-color)]">
                <Toggle
                  label="Send Money"
                  description="Customer sends money to your number"
                  checked={config.mpesa?.sendMoney?.enabled || false}
                  onChange={(v) => updateConfig('mpesa.sendMoney.enabled', v)}
                />
                {config.mpesa?.sendMoney?.enabled && (
                  <div className="mt-3 pl-2">
                    <Input
                      label="Phone Number"
                      value={config.mpesa?.sendMoney?.phoneNumber || ''}
                      onChange={(e) => updateConfig('mpesa.sendMoney.phoneNumber', e.target.value)}
                      placeholder="07xxxxxxxx"
                    />
                  </div>
                )}
              </div>

              {/* Paybill */}
              <div className="p-3 rounded-lg border border-[var(--border-color)]">
                <Toggle
                  label="Paybill"
                  description="Customer pays via Paybill number"
                  checked={config.mpesa?.paybill?.enabled || false}
                  onChange={(v) => updateConfig('mpesa.paybill.enabled', v)}
                />
                {config.mpesa?.paybill?.enabled && (
                  <div className="mt-3 pl-2 space-y-3">
                    <Input
                      label="Business Number"
                      value={config.mpesa?.paybill?.businessNumber || ''}
                      onChange={(e) => updateConfig('mpesa.paybill.businessNumber', e.target.value)}
                      placeholder="247247"
                    />
                    <Input
                      label="Account Name"
                      value={config.mpesa?.paybill?.accountName || ''}
                      onChange={(e) => updateConfig('mpesa.paybill.accountName', e.target.value)}
                      placeholder="HDM ERP"
                    />
                  </div>
                )}
              </div>

              {/* Till Number */}
              <div className="p-3 rounded-lg border border-[var(--border-color)]">
                <Toggle
                  label="Till Number"
                  description="Customer pays via Till number"
                  checked={config.mpesa?.till?.enabled || false}
                  onChange={(v) => updateConfig('mpesa.till.enabled', v)}
                />
                {config.mpesa?.till?.enabled && (
                  <div className="mt-3 pl-2 space-y-3">
                    <Input
                      label="Till Number"
                      value={config.mpesa?.till?.tillNumber || ''}
                      onChange={(e) => updateConfig('mpesa.till.tillNumber', e.target.value)}
                      placeholder="123456"
                    />
                    <Input
                      label="Business Name"
                      value={config.mpesa?.till?.businessName || ''}
                      onChange={(e) => updateConfig('mpesa.till.businessName', e.target.value)}
                      placeholder="HDM ERP"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* PayPal */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
            PayPal
          </h2>
          <Toggle
            label="Enable PayPal"
            description="Accept payments via PayPal"
            checked={config.paypal?.enabled || false}
            onChange={(v) => updateConfig('paypal.enabled', v)}
          />
        </Card>

        {/* Currency & Settings */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-yellow-500 rounded-full"></span>
            Currency & Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Default Currency</label>
              <select
                value={config.currency || 'KSh'}
                onChange={(e) => updateConfig('currency', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="KSh">KSh (Kenya Shilling)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>
            <Toggle
              label="Require Payment Proof"
              description="Customers must upload proof of payment"
              checked={config.requireProof || false}
              onChange={(v) => updateConfig('requireProof', v)}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
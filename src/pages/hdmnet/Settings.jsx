import { useEffect, useState } from 'react';
import { getAllSettings, updateSetting } from '../../services/hdmnet/settings';
import Card from '../../components/hdmnet/ui/Card';
import Input from '../../components/hdmnet/ui/Input';
import Button from '../../components/hdmnet/ui/Button';
import Toggle from '../../components/hdmnet/ui/Toggle';
import Spinner from '../../components/hdmnet/ui/Spinner';
import { HiCog, HiCash, HiScale } from 'react-icons/hi';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'payment', label: 'Payment', icon: HiCash },
  { key: 'legal', label: 'Legal', icon: HiScale },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState({});
  const [success, setSuccess] = useState({});

  const fetchSettings = () => {
    setLoading(true);
    setError('');
    getAllSettings()
      .then((res) => {
        const data = res?.data || res || {};
        setSettings(data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load settings');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key, value) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    setSuccess((prev) => ({ ...prev, [key]: false }));
    try {
      await updateSetting(key, value ?? settings[key] ?? '');
      setSuccess((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setSuccess((prev) => ({ ...prev, [key]: false })), 2000);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setSaving((prev) => ({ ...prev, [key]: false }));
  };

  const handleToggle = async (key, checked) => {
    const value = checked ? 'true' : 'false';
    setSettings((prev) => ({ ...prev, [key]: value }));
    await handleSave(key, value);
  };

  const updateSettingValue = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    const keys = [
      'payments_mpesa_enabled', 'payments_mpesa_stk_push',
      'payments_mpesa_send_money_enabled', 'payments_mpesa_send_money_number',
      'payments_mpesa_paybill_enabled', 'payments_mpesa_paybill_number', 'payments_mpesa_paybill_account',
      'payments_mpesa_till_enabled', 'payments_mpesa_till_number', 'payments_mpesa_till_name',
      'payments_require_proof',
    ];
    for (const key of keys) {
      await handleSave(key, settings[key]);
    }
    alert('All payment settings saved!');
  };

  const isTrue = (val) => val === 'true' || val === true;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Settings</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Manage platform configuration</p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== GENERAL TAB ========== */}
      {activeTab === 'general' && (
        <Card className="space-y-6">
          <div>
            <Input
              label="System Name"
              value={settings.system_name || ''}
              onChange={(e) => updateSettingValue('system_name', e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              {success.system_name && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ Saved</span>
              )}
              <div className="flex-1" />
              <Button
                size="sm"
                onClick={() => handleSave('system_name')}
                loading={saving.system_name}
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <Input
              label="Support Email"
              type="email"
              value={settings.support_email || ''}
              onChange={(e) => updateSettingValue('support_email', e.target.value)}
              placeholder="support@hdmnet.com"
            />
            <div className="flex justify-between items-center mt-2">
              {success.support_email && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ Saved</span>
              )}
              <div className="flex-1" />
              <Button
                size="sm"
                onClick={() => handleSave('support_email')}
                loading={saving.support_email}
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <Input
              label="Support Phone"
              value={settings.support_phone || ''}
              onChange={(e) => updateSettingValue('support_phone', e.target.value)}
              placeholder="+254700000000"
            />
            <div className="flex justify-between items-center mt-2">
              {success.support_phone && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ Saved</span>
              )}
              <div className="flex-1" />
              <Button
                size="sm"
                onClick={() => handleSave('support_phone')}
                loading={saving.support_phone}
              >
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ========== PAYMENT TAB ========== */}
      {activeTab === 'payment' && (
        <Card className="space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Payment Configuration</h3>

          {/* M-Pesa Master */}
          <Toggle
            label="Enable M-Pesa Payments"
            checked={isTrue(settings.payments_mpesa_enabled)}
            onChange={(v) => handleToggle('payments_mpesa_enabled', v)}
            description="Master switch for all M-Pesa methods"
          />

          {isTrue(settings.payments_mpesa_enabled) && (
            <div className="ml-2 pl-4 border-l-2 border-cyan-300 dark:border-cyan-700 space-y-4">
              {/* STK Push */}
              <Toggle
                label="STK Push"
                checked={isTrue(settings.payments_mpesa_stk_push)}
                onChange={(v) => handleToggle('payments_mpesa_stk_push', v)}
                description="Instant popup payment on user's phone"
              />

              {/* Send Money */}
              <div className="border border-[var(--border-color)] rounded-lg p-3">
                <Toggle
                  label="Send Money"
                  checked={isTrue(settings.payments_mpesa_send_money_enabled)}
                  onChange={(v) => handleToggle('payments_mpesa_send_money_enabled', v)}
                  description="Manual Send Money payment option"
                />
                {isTrue(settings.payments_mpesa_send_money_enabled) && (
                  <div className="mt-3">
                    <Input
                      label="Send Money Phone Number"
                      value={settings.payments_mpesa_send_money_number || ''}
                      onChange={(e) => updateSettingValue('payments_mpesa_send_money_number', e.target.value)}
                      placeholder="0712345678"
                    />
                  </div>
                )}
              </div>

              {/* Paybill */}
              <div className="border border-[var(--border-color)] rounded-lg p-3">
                <Toggle
                  label="Paybill"
                  checked={isTrue(settings.payments_mpesa_paybill_enabled)}
                  onChange={(v) => handleToggle('payments_mpesa_paybill_enabled', v)}
                  description="Manual Paybill payment option"
                />
                {isTrue(settings.payments_mpesa_paybill_enabled) && (
                  <div className="mt-3 space-y-3">
                    <Input
                      label="Paybill Business Number"
                      value={settings.payments_mpesa_paybill_number || ''}
                      onChange={(e) => updateSettingValue('payments_mpesa_paybill_number', e.target.value)}
                      placeholder="247247"
                    />
                    <Input
                      label="Paybill Account Name"
                      value={settings.payments_mpesa_paybill_account || ''}
                      onChange={(e) => updateSettingValue('payments_mpesa_paybill_account', e.target.value)}
                      placeholder="HDM NET"
                    />
                  </div>
                )}
              </div>

              {/* Till */}
              <div className="border border-[var(--border-color)] rounded-lg p-3">
                <Toggle
                  label="Buy Goods / Till"
                  checked={isTrue(settings.payments_mpesa_till_enabled)}
                  onChange={(v) => handleToggle('payments_mpesa_till_enabled', v)}
                  description="Manual Till payment option"
                />
                {isTrue(settings.payments_mpesa_till_enabled) && (
                  <div className="mt-3 space-y-3">
                    <Input
                      label="Till Number"
                      value={settings.payments_mpesa_till_number || ''}
                      onChange={(e) => updateSettingValue('payments_mpesa_till_number', e.target.value)}
                      placeholder="5123456"
                    />
                    <Input
                      label="Till Business Name"
                      value={settings.payments_mpesa_till_name || ''}
                      onChange={(e) => updateSettingValue('payments_mpesa_till_name', e.target.value)}
                      placeholder="HDM NET"
                    />
                  </div>
                )}
              </div>

              {/* Require Proof */}
              <Toggle
                label="Require Payment Proof"
                checked={isTrue(settings.payments_require_proof)}
                onChange={(v) => handleToggle('payments_require_proof', v)}
                description="Force upload of screenshot/receipt for manual payments"
              />
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border-color)]">
            <Button onClick={handleSaveAll} loading={Object.values(saving).some(Boolean)}>
              Save All Payment Settings
            </Button>
          </div>
        </Card>
      )}

      {/* ========== LEGAL TAB ========== */}
      {activeTab === 'legal' && (
        <Card className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Terms & Conditions
            </label>
            <textarea
              value={settings.terms_and_conditions || ''}
              onChange={(e) => updateSettingValue('terms_and_conditions', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 resize-y text-sm"
            />
            <div className="flex justify-between items-center mt-2">
              {success.terms_and_conditions && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ Saved</span>
              )}
              <div className="flex-1" />
              <Button
                size="sm"
                onClick={() => handleSave('terms_and_conditions')}
                loading={saving.terms_and_conditions}
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Privacy Policy
            </label>
            <textarea
              value={settings.privacy_policy || ''}
              onChange={(e) => updateSettingValue('privacy_policy', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 resize-y text-sm"
            />
            <div className="flex justify-between items-center mt-2">
              {success.privacy_policy && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ Saved</span>
              )}
              <div className="flex-1" />
              <Button
                size="sm"
                onClick={() => handleSave('privacy_policy')}
                loading={saving.privacy_policy}
              >
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
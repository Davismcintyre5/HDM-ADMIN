import { useEffect, useState } from 'react';
import { HiSave } from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Spinner from '../../components/smartpos/ui/Spinner';
import Toggle from '../../components/smartpos/ui/Toggle';
import AiTab from './settings/AiTab';
import MpesaTab from './settings/MpesaTab';
import DownloadsTab from './settings/DownloadsTab';
import { useToast } from '../../context/smartpos/ToastContext';
import {
  getSettings,
  updateSettings,
  getFeatures,
  updateFeatures,
} from '../../services/smartpos/settings';

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'defaults', label: 'Defaults' },
  { key: 'features', label: 'Features' },
  { key: 'mpesa', label: 'M-Pesa' },
  { key: 'registration', label: 'Registration' },
  { key: 'limits', label: 'Limits' },
  { key: 'ai', label: 'AI' },
  { key: 'downloads', label: 'Downloads' },
];

const SELF_SAVING_TABS = ['ai', 'downloads', 'mpesa'];

export default function Settings() {
  const toast = useToast();
  const [tab, setTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSettings(), getFeatures()])
      .then(([s, f]) => {
        if (cancelled) return;
        setSettings(s?.data || s || {});
        setFeatures(f?.data || f || null);
      })
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      if (features) await updateFeatures(features);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const showGlobalSave = !SELF_SAVING_TABS.includes(tab);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Platform-wide configuration
          </p>
        </div>
        {showGlobalSave && (
          <Button
            icon={<HiSave className="w-4 h-4" />}
            onClick={save}
            loading={saving}
          >
            Save changes
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-[var(--border-color)] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              tab === t.key
                ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <Card title="General">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Platform name"
              value={settings.platform_name || ''}
              onChange={(e) => patch('platform_name', e.target.value)}
            />
            <Input
              label="Website"
              value={settings.platform_website || ''}
              onChange={(e) => patch('platform_website', e.target.value)}
            />
            <Input
              label="Support email"
              type="email"
              value={settings.support_email || ''}
              onChange={(e) => patch('support_email', e.target.value)}
            />
            <Input
              label="Support phone"
              value={settings.support_phone || ''}
              onChange={(e) => patch('support_phone', e.target.value)}
            />
            <Input
              label="Logo URL"
              className="md:col-span-2"
              value={settings.platform_logo_url || ''}
              onChange={(e) => patch('platform_logo_url', e.target.value)}
            />
          </div>
        </Card>
      )}

      {tab === 'defaults' && (
        <Card title="Defaults for new clients">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default currency"
              value={settings.default_currency || ''}
              onChange={(e) => patch('default_currency', e.target.value)}
            />
            <Input
              label="Default country code"
              value={settings.default_country || ''}
              onChange={(e) => patch('default_country', e.target.value)}
            />
            <Input
              label="Default tax rate (%)"
              type="number"
              value={settings.default_tax_rate ?? ''}
              onChange={(e) => patch('default_tax_rate', Number(e.target.value))}
            />
            <Input
              label="Minimum password length"
              type="number"
              value={settings.min_password_length ?? 8}
              onChange={(e) => patch('min_password_length', Number(e.target.value))}
            />
          </div>
        </Card>
      )}

      {tab === 'features' && features && (
        <Card title="Feature flags">
          <div className="space-y-1">
            {Object.entries(features).map(([key, val]) => (
              <Toggle
                key={key}
                label={key
                  .replace('feature_', '')
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                checked={!!val}
                onChange={(v) => setFeatures({ ...features, [key]: v })}
              />
            ))}
          </div>
        </Card>
      )}

      {tab === 'mpesa' && <MpesaTab />}

      {tab === 'registration' && (
        <Card title="Registration">
          <div className="space-y-1">
            <Toggle
              label="Open registration"
              description="Allow anyone to sign up"
              checked={settings.registration_open !== false}
              onChange={(v) => patch('registration_open', v)}
            />
            <Toggle
              label="Maintenance mode"
              description="Block all client and public API access"
              checked={settings.maintenance_mode === true}
              onChange={(v) => patch('maintenance_mode', v)}
            />
          </div>
        </Card>
      )}

      {tab === 'limits' && (
        <Card title="Cashier and user limits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max owners per client"
              type="number"
              value={settings.max_owners_per_tenant ?? 3}
              onChange={(e) => patch('max_owners_per_tenant', Number(e.target.value))}
            />
            <Input
              label="Cashier discount limit (%)"
              type="number"
              value={settings.cashier_discount_limit ?? 10}
              onChange={(e) =>
                patch('cashier_discount_limit', Number(e.target.value))
              }
            />
            <Input
              label="Cashier refund limit"
              type="number"
              value={settings.cashier_refund_limit ?? 0}
              onChange={(e) =>
                patch('cashier_refund_limit', Number(e.target.value))
              }
            />
            <div className="pt-6">
              <Toggle
                label="Manager can invite cashier"
                checked={settings.manager_can_invite_cashier === true}
                onChange={(v) => patch('manager_can_invite_cashier', v)}
              />
            </div>
          </div>
        </Card>
      )}

      {tab === 'ai' && <AiTab />}
      {tab === 'downloads' && <DownloadsTab />}
    </div>
  );
}
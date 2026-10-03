import { useEffect, useState } from 'react';
import { HiSave } from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Button from '../../components/pharmasys/ui/Button';
import Input from '../../components/pharmasys/ui/Input';
import Select from '../../components/pharmasys/ui/Select';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Toggle from '../../components/pharmasys/ui/Toggle';
import AiTab from './settings/AiTab';
import MpesaTab from './settings/MpesaTab';
import DownloadsTab from './settings/DownloadsTab';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getSettings,
  updateSettings,
  updateFeatures,
} from '../../services/pharmasys/settings';

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'features', label: 'Features' },
  { key: 'ai', label: 'AI' },
  { key: 'mpesa', label: 'M-Pesa' },
  { key: 'downloads', label: 'Downloads' },
];

const FEATURE_KEYS = [
  'feature_ai_insights',
  'feature_multi_branch',
  'feature_api',
  'feature_priority_support',
  'feature_custom_domain',
  'feature_prescriptions',
  'feature_interaction_check',
  'feature_sms',
];

const SELF_SAVING_TABS = ['ai', 'mpesa', 'downloads'];

export default function Settings() {
  const toast = useToast();
  const [tab, setTab] = useState('general');
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({});
  const [savingGeneral, setSavingGeneral] = useState(false);

  const [features, setFeatures] = useState({});
  const [savingFeatures, setSavingFeatures] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((s) => {
        if (cancelled) return;
        const data = s?.data || s || {};
        setSettings(data);

        const featureMap = {};
        FEATURE_KEYS.forEach((k) => {
          featureMap[k] = !!data[k];
        });
        setFeatures(featureMap);
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

  const patchSetting = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const saveGeneral = async () => {
    setSavingGeneral(true);
    try {
      await updateSettings(settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveFeatures = async () => {
    setSavingFeatures(true);
    try {
      await updateFeatures(features);
      toast.success('Features saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSavingFeatures(false);
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Platform-wide configuration
          </p>
        </div>
        {showGlobalSave && (
          <Button
            icon={<HiSave className="w-4 h-4" />}
            onClick={tab === 'general' ? saveGeneral : saveFeatures}
            loading={tab === 'general' ? savingGeneral : savingFeatures}
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
                ? 'border-rose-600 text-rose-700 dark:text-rose-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="space-y-6">
          <Card title="Platform">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Platform name"
                value={settings.platform_name || ''}
                onChange={(e) => patchSetting('platform_name', e.target.value)}
              />
              <Input
                label="Website"
                value={settings.platform_website || ''}
                onChange={(e) => patchSetting('platform_website', e.target.value)}
              />
              <Input
                label="Support email"
                type="email"
                value={settings.support_email || ''}
                onChange={(e) => patchSetting('support_email', e.target.value)}
              />
              <Input
                label="Support phone"
                value={settings.support_phone || ''}
                onChange={(e) => patchSetting('support_phone', e.target.value)}
              />
              <Input
                label="Support WhatsApp"
                value={settings.support_whatsapp || ''}
                onChange={(e) => patchSetting('support_whatsapp', e.target.value)}
              />
              <Input
                label="Logo URL"
                value={settings.platform_logo_url || ''}
                onChange={(e) => patchSetting('platform_logo_url', e.target.value)}
              />
            </div>
          </Card>

          <Card title="Defaults">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Default currency"
                value={settings.default_currency || 'KES'}
                onChange={(e) => patchSetting('default_currency', e.target.value)}
                options={['KES', 'USD', 'UGX', 'TZS', 'NGN', 'GHS', 'ZAR'].map(
                  (c) => ({ value: c, label: c })
                )}
              />
              <Input
                label="Default country code"
                value={settings.default_country || ''}
                onChange={(e) => patchSetting('default_country', e.target.value)}
                placeholder="KE"
              />
              <Input
                label="Default tax rate (%)"
                type="number"
                value={settings.default_tax_rate ?? ''}
                onChange={(e) =>
                  patchSetting('default_tax_rate', Number(e.target.value))
                }
              />
            </div>
          </Card>

          <Card title="Registration">
            <div className="space-y-1">
              <Toggle
                label="Open registration"
                description="Allow anyone to sign up"
                checked={settings.registration_open !== false}
                onChange={(v) => patchSetting('registration_open', v)}
              />
            </div>
          </Card>
        </div>
      )}

      {tab === 'features' && (
        <Card title="Feature flags">
          <div className="space-y-1">
            {FEATURE_KEYS.map((key) => (
              <Toggle
                key={key}
                label={key
                  .replace('feature_', '')
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                checked={!!features[key]}
                onChange={(v) => setFeatures((prev) => ({ ...prev, [key]: v }))}
              />
            ))}
          </div>
        </Card>
      )}

      {tab === 'ai' && <AiTab />}
      {tab === 'mpesa' && <MpesaTab />}
      {tab === 'downloads' && <DownloadsTab />}
    </div>
  );
}
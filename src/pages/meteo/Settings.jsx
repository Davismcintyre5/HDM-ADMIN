import { useEffect, useState } from 'react';
import {
  HiSave,
  HiCheckCircle,
  HiXCircle,
  HiLightningBolt,
  HiEye,
  HiEyeOff,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Button from '../../components/meteo/ui/Button';
import Input from '../../components/meteo/ui/Input';
import Select from '../../components/meteo/ui/Select';
import Toggle from '../../components/meteo/ui/Toggle';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import { useAuth } from '../../context/meteo/AuthContext';
import {
  getWeatherSettings,
  updateWeatherSettings,
  testWeatherProvider,
  getApiKeySettings,
  updateApiKeySettings,
  getBrandSettings,
  updateBrandSettings,
  getAiSettings,
} from '../../services/meteo/settings';
import { WEATHER_PROVIDERS, API_KEY_SCOPES } from '../../utils/meteo/constants';

const TABS = [
  { key: 'weather', label: 'Weather' },
  { key: 'apiKeys', label: 'API Keys' },
  { key: 'brand', label: 'Brand' },
  { key: 'ai', label: 'AI' },
];

const SELF_SAVING = ['weather', 'apiKeys', 'brand'];

export default function Settings() {
  const toast = useToast();
  const { isSuperAdmin } = useAuth();

  const [tab, setTab] = useState('weather');
  const [loading, setLoading] = useState(true);

  const [weather, setWeather] = useState(null);
  const [weatherSaving, setWeatherSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState({});
  const [showKeys, setShowKeys] = useState({});

  const [apiKeys, setApiKeys] = useState(null);
  const [apiKeysSaving, setApiKeysSaving] = useState(false);

  const [brand, setBrand] = useState(null);
  const [brandSaving, setBrandSaving] = useState(false);

  const [ai, setAi] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getWeatherSettings().catch(() => null),
      getApiKeySettings().catch(() => null),
      getBrandSettings().catch(() => null),
      getAiSettings().catch(() => null),
    ])
      .then(([w, a, b, aiRes]) => {
        if (cancelled) return;
        setWeather(w?.data?.weather || null);
        setApiKeys(a?.data?.apiKeys || null);
        setBrand(b?.data?.brand || null);
        setAi(aiRes?.data || null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const patchWeather = (key, value) =>
    setWeather((prev) => ({ ...prev, [key]: value }));
  const patchCred = (provider, key, value) =>
    setWeather((prev) => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [provider]: { ...prev.credentials?.[provider], [key]: value },
      },
    }));

  const patchBrand = (key, value) =>
    setBrand((prev) => ({ ...prev, [key]: value }));

  const saveWeather = async () => {
    setWeatherSaving(true);
    try {
      const body = {
        current: weather.current,
        fallbackToOpenMeteo: weather.fallbackToOpenMeteo,
        credentials: {},
      };
      ['openweather', 'weatherapi'].forEach((k) => {
        const c = weather.credentials?.[k];
        if (c && c.apiKey) {
          body.credentials[k] = { apiKey: c.apiKey, enabled: c.enabled };
        } else if (c && c.enabled !== undefined) {
          body.credentials[k] = { enabled: c.enabled };
        }
      });
      await updateWeatherSettings(body);
      toast.success('Weather settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setWeatherSaving(false);
    }
  };

  const testProvider = async (provider) => {
    setTesting(provider);
    setTestResult((prev) => ({ ...prev, [provider]: null }));
    try {
      const res = await testWeatherProvider({ provider });
      const data = res?.data || res;
      setTestResult((prev) => ({
        ...prev,
        [provider]: data.ok ? 'ok' : 'fail',
      }));
      if (data.ok) toast.success(`${provider} reachable`);
      else toast.error(`${provider}: ${data.error || 'unreachable'}`);
    } catch (err) {
      setTestResult((prev) => ({ ...prev, [provider]: 'fail' }));
      toast.error(err.message || 'Test failed');
    } finally {
      setTesting(null);
    }
  };

  const saveApiKeys = async () => {
    setApiKeysSaving(true);
    try {
      await updateApiKeySettings(apiKeys);
      toast.success('API key settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setApiKeysSaving(false);
    }
  };

  const saveBrand = async () => {
    setBrandSaving(true);
    try {
      await updateBrandSettings(brand);
      toast.success('Brand settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setBrandSaving(false);
    }
  };

  const toggleScope = (scope) => {
    const current = apiKeys.allowedScopes || [];
    const next = current.includes(scope)
      ? current.filter((s) => s !== scope)
      : [...current, scope];
    setApiKeys({ ...apiKeys, allowedScopes: next });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const showGlobalSave = !SELF_SAVING.includes(tab);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Platform configuration
          </p>
        </div>
        {tab === 'weather' && isSuperAdmin && (
          <Button
            icon={<HiSave className="w-4 h-4" />}
            onClick={saveWeather}
            loading={weatherSaving}
          >
            Save
          </Button>
        )}
        {tab === 'apiKeys' && isSuperAdmin && (
          <Button
            icon={<HiSave className="w-4 h-4" />}
            onClick={saveApiKeys}
            loading={apiKeysSaving}
          >
            Save
          </Button>
        )}
        {tab === 'brand' && isSuperAdmin && (
          <Button
            icon={<HiSave className="w-4 h-4" />}
            onClick={saveBrand}
            loading={brandSaving}
          >
            Save
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
                ? 'border-violet-600 text-violet-700 dark:text-violet-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {!isSuperAdmin && tab !== 'ai' && (
        <div className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg p-3">
          You can view these settings but only super admins can change them.
        </div>
      )}

      {tab === 'weather' && weather && (
        <div className="space-y-6">
          <Card title="Provider">
            <Select
              label="Current weather provider"
              value={weather.current || 'open_meteo'}
              onChange={(e) => patchWeather('current', e.target.value)}
              options={WEATHER_PROVIDERS}
              disabled={!isSuperAdmin}
            />
            <div className="mt-4">
              <Toggle
                label="Fallback to Open-Meteo"
                description="If the primary provider fails, fall back to Open-Meteo"
                checked={!!weather.fallbackToOpenMeteo}
                onChange={(v) => patchWeather('fallbackToOpenMeteo', v)}
              />
            </div>
          </Card>

          <Card title="Provider credentials">
            <div className="space-y-6">
              {['openweather', 'weatherapi'].map((provider) => {
                const cred = weather.credentials?.[provider] || {};
                const label = provider === 'openweather' ? 'OpenWeather' : 'WeatherAPI';
                const revealed = showKeys[provider];
                const isTesting = testing === provider;
                const result = testResult[provider];
                return (
                  <div
                    key={provider}
                    className="border border-[var(--border-color)] rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {label}
                        </span>
                        {cred.hasKey ? (
                          <span className="text-[10px] font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                            Key set
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                            No key
                          </span>
                        )}
                      </div>
                      <Toggle
                        checked={!!cred.enabled}
                        onChange={(v) => patchCred(provider, 'enabled', v)}
                      />
                    </div>

                    <div className="relative">
                      <Input
                        label="API key"
                        type={revealed ? 'text' : 'password'}
                        value={cred.apiKey || ''}
                        onChange={(e) => patchCred(provider, 'apiKey', e.target.value)}
                        placeholder={cred.hasKey ? '••••••••••••' : 'Paste key'}
                        disabled={!isSuperAdmin}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowKeys((s) => ({ ...s, [provider]: !s[provider] }))
                        }
                        className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {revealed ? (
                          <HiEyeOff className="w-4 h-4" />
                        ) : (
                          <HiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<HiLightningBolt className="w-3.5 h-3.5" />}
                        onClick={() => testProvider(provider)}
                        loading={isTesting}
                        disabled={!isSuperAdmin}
                      >
                        Test connection
                      </Button>
                      {result === 'ok' && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <HiCheckCircle className="w-3.5 h-3.5" /> Reachable
                        </span>
                      )}
                      {result === 'fail' && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600">
                          <HiXCircle className="w-3.5 h-3.5" /> Unreachable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === 'apiKeys' && apiKeys && (
        <Card title="API key policy">
          <div className="space-y-4">
            <Input
              label="Max keys per user"
              type="number"
              min="0"
              value={apiKeys.maxPerUser ?? 1}
              onChange={(e) =>
                setApiKeys({ ...apiKeys, maxPerUser: Number(e.target.value) })
              }
              disabled={!isSuperAdmin}
              hint="0 = unlimited"
            />
            <Input
              label="Default expiry (days)"
              type="number"
              value={apiKeys.defaultExpiryDays ?? ''}
              onChange={(e) =>
                setApiKeys({
                  ...apiKeys,
                  defaultExpiryDays:
                    e.target.value === '' ? null : Number(e.target.value),
                })
              }
              placeholder="Leave empty for no expiry"
              disabled={!isSuperAdmin}
            />
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                Allowed scopes
              </p>
              <div className="flex flex-wrap gap-2">
                {API_KEY_SCOPES.map((s) => {
                  const active = (apiKeys.allowedScopes || []).includes(s.value);
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => isSuperAdmin && toggleScope(s.value)}
                      disabled={!isSuperAdmin}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-violet-600 text-white'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                      } disabled:cursor-not-allowed`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <dl className="text-xs text-[var(--text-muted)] space-y-1 pt-2 border-t border-[var(--border-color)]">
              <div className="flex justify-between">
                <dt>Live prefix</dt>
                <dd className="font-mono">{apiKeys.livePrefix || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Test prefix</dt>
                <dd className="font-mono">{apiKeys.testPrefix || '—'}</dd>
              </div>
            </dl>
          </div>
        </Card>
      )}

      {tab === 'brand' && brand && (
        <Card title="Brand">
          <div className="space-y-4">
            <Input
              label="Platform name"
              value={brand.name || ''}
              onChange={(e) => patchBrand('name', e.target.value)}
              disabled={!isSuperAdmin}
            />
            <Input
              label="Logo URL"
              value={brand.logoUrl || ''}
              onChange={(e) => patchBrand('logoUrl', e.target.value)}
              disabled={!isSuperAdmin}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Primary color"
                type="color"
                value={brand.color || '#0F172A'}
                onChange={(e) => patchBrand('color', e.target.value)}
                disabled={!isSuperAdmin}
              />
              <Input
                label="Accent color"
                type="color"
                value={brand.accent || '#0EA5A4'}
                onChange={(e) => patchBrand('accent', e.target.value)}
                disabled={!isSuperAdmin}
              />
            </div>
            <Input
              label="Support email"
              type="email"
              value={brand.supportEmail || ''}
              onChange={(e) => patchBrand('supportEmail', e.target.value)}
              disabled={!isSuperAdmin}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Support phone"
                value={brand.supportPhone || ''}
                onChange={(e) => patchBrand('supportPhone', e.target.value)}
                disabled={!isSuperAdmin}
              />
              <Input
                label="Support WhatsApp"
                value={brand.supportWhatsapp || ''}
                onChange={(e) => patchBrand('supportWhatsapp', e.target.value)}
                disabled={!isSuperAdmin}
              />
            </div>
            <Input
              label="Website"
              value={brand.website || ''}
              onChange={(e) => patchBrand('website', e.target.value)}
              disabled={!isSuperAdmin}
            />
            <Input
              label="Address"
              value={brand.address || ''}
              onChange={(e) => patchBrand('address', e.target.value)}
              disabled={!isSuperAdmin}
            />
          </div>
        </Card>
      )}

      {tab === 'ai' && (
        <Card title="AI">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-primary)]">
              AI features are
            </span>
            <span
              className={`text-sm font-semibold ${
                ai?.enabled ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {ai?.enabled ? 'enabled' : 'disabled'}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            AI configuration is managed via server environment variables. Contact
            DevOps to change it.
          </p>
        </Card>
      )}
    </div>
  );
}
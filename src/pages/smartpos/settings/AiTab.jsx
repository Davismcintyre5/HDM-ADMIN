import { useEffect, useState } from 'react';
import {
  HiCheckCircle,
  HiXCircle,
  HiEye,
  HiEyeOff,
  HiLightningBolt,
} from 'react-icons/hi';
import Card from '../../../components/smartpos/ui/Card';
import Button from '../../../components/smartpos/ui/Button';
import Input from '../../../components/smartpos/ui/Input';
import Spinner from '../../../components/smartpos/ui/Spinner';
import Toggle from '../../../components/smartpos/ui/Toggle';
import { useToast } from '../../../context/smartpos/ToastContext';
import {
  getAiConfig,
  updateAiConfig,
  testAiProvider,
} from '../../../services/smartpos/aiConfig';

const DEFAULT_FEATURES = {
  landingAi: false,
  clientAi: false,
  fileUpload: false,
  outwardApiKeys: false,
};

export default function AiTab() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState([]);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [defaultProvider, setDefaultProvider] = useState('hdm');
  const [showKeys, setShowKeys] = useState({});
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});

  const load = () => {
    setLoading(true);
    getAiConfig()
      .then((cfg) => {
        const data = cfg?.data || cfg || {};
        setProviders(
          (data.providers || []).map((p) => ({
            key: p.key,
            label: p.label,
            baseUrl: p.baseUrl || '',
            apiKey: p.apiKey || '',
            hasKey: p.hasKey ?? Boolean(p.apiKey),
            enabled: p.enabled === true,
            dirty: false,
          }))
        );
        setFeatures({ ...DEFAULT_FEATURES, ...(data.features || {}) });
        setDefaultProvider(data.defaultProvider || 'hdm');
      })
      .catch((err) => toast.error(err.message || 'Failed to load AI settings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const masterEnabled =
    features.landingAi ||
    features.clientAi ||
    features.fileUpload ||
    features.outwardApiKeys;

  const setMasterEnabled = (on) => {
    setFeatures({
      landingAi: on,
      clientAi: on,
      fileUpload: on,
      outwardApiKeys: on,
    });
  };

  const toggleFeature = (key, value) => {
    setFeatures((prev) => ({ ...prev, [key]: value }));
  };

  const updateProvider = (key, patch) => {
    setProviders((prev) =>
      prev.map((p) => (p.key === key ? { ...p, ...patch, dirty: true } : p))
    );
  };

  const handleTest = async (key) => {
    setTesting((t) => ({ ...t, [key]: true }));
    setTestResults((t) => ({ ...t, [key]: null }));
    try {
      const res = await testAiProvider(key);
      const data = res?.data || res;
      setTestResults((t) => ({ ...t, [key]: data?.reachable ? 'ok' : 'fail' }));
      if (data?.reachable) toast.success('Provider reachable');
      else toast.error('Provider unreachable');
    } catch (err) {
      setTestResults((t) => ({ ...t, [key]: 'fail' }));
      toast.error(err.message || 'Test failed');
    } finally {
      setTesting((t) => ({ ...t, [key]: false }));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        features,
        defaultProvider,
        providers: providers.map((p) => ({
          key: p.key,
          baseUrl: p.baseUrl,
          apiKey: p.dirty ? p.apiKey : undefined,
          enabled: p.enabled,
        })),
      };
      await updateAiConfig(payload);
      toast.success('AI settings saved');
      load();
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

  return (
    <div className="space-y-6">
      <Card title="AI">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              AI enabled
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Master switch. Turning this on enables all four features below.
              You can disable individual features afterward.
            </p>
          </div>
          <Toggle
            checked={masterEnabled}
            onChange={setMasterEnabled}
          />
        </div>
      </Card>

      <Card title="Features">
        <div className="space-y-1">
          <Toggle
            label="Landing AI enabled"
            description="Public chat widget on the marketing site."
            checked={features.landingAi}
            onChange={(v) => toggleFeature('landingAi', v)}
          />
          <Toggle
            label="Client AI enabled"
            description="In-app AI assistant for tenants."
            checked={features.clientAi}
            onChange={(v) => toggleFeature('clientAi', v)}
          />
          <Toggle
            label="Enable file upload"
            description="Allow users to attach files to AI chats."
            checked={features.fileUpload}
            onChange={(v) => toggleFeature('fileUpload', v)}
          />
          <Toggle
            label="Outward API keys enabled"
            description="Allow tenants to generate external API keys."
            checked={features.outwardApiKeys}
            onChange={(v) => toggleFeature('outwardApiKeys', v)}
          />
        </div>
      </Card>

      <Card title="Default provider">
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Used when a request doesn&apos;t specify a provider.
        </p>
        <div className="max-w-xs">
          <select
            value={defaultProvider}
            onChange={(e) => setDefaultProvider(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {providers.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card title="Providers">
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Configure API keys and endpoints for each provider.
        </p>

        <div className="space-y-3">
          {providers.map((p) => {
            const revealed = showKeys[p.key];
            const isTesting = testing[p.key];
            const result = testResults[p.key];

            return (
              <div
                key={p.key}
                className="rounded-lg border border-[var(--border-color)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {p.label}
                    </span>
                    {p.hasKey ? (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600">
                        Key set
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                        No key
                      </span>
                    )}
                  </div>
                  <Toggle
                    checked={p.enabled}
                    onChange={(v) => updateProvider(p.key, { enabled: v })}
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Base URL"
                    value={p.baseUrl}
                    onChange={(e) =>
                      updateProvider(p.key, { baseUrl: e.target.value })
                    }
                    placeholder="https://api.example.com/v1"
                  />

                  <div className="relative">
                    <Input
                      label="API Key"
                      type={revealed ? 'text' : 'password'}
                      value={p.apiKey}
                      onChange={(e) =>
                        updateProvider(p.key, {
                          apiKey: e.target.value,
                          hasKey: e.target.value.length > 0,
                        })
                      }
                      placeholder={p.hasKey ? '••••••••••••' : 'Enter API key'}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowKeys((s) => ({ ...s, [p.key]: !s[p.key] }))
                      }
                      className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      aria-label={revealed ? 'Hide key' : 'Show key'}
                    >
                      {revealed ? (
                        <HiEyeOff className="w-4 h-4" />
                      ) : (
                        <HiEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<HiLightningBolt className="w-3.5 h-3.5" />}
                    onClick={() => handleTest(p.key)}
                    loading={isTesting}
                    disabled={!p.hasKey}
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

      <div className="flex justify-end">
        <Button onClick={save} loading={saving}>
          Save AI settings
        </Button>
      </div>
    </div>
  );
}
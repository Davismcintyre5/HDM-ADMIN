import { useState, useEffect } from 'react';
import { getAiSettings, updateAiSettings, testAiProvider } from '../../services/smartpos/ai';
import Card from '../../components/smartpos/ui/Card';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Select from '../../components/smartpos/ui/Select';
import Toggle from '../../components/smartpos/ui/Toggle';
import Spinner from '../../components/smartpos/ui/Spinner';
import {
  HiEye, HiEyeOff, HiCheckCircle, HiXCircle,
  HiSparkles, HiCloud, HiUpload, HiKey
} from 'react-icons/hi';

const PROVIDER_LABELS = {
  hdm: 'HDM AI',
  deepseek: 'DeepSeek',
  chatgpt: 'ChatGPT (OpenAI)',
  claude: 'Claude (Anthropic)',
  gemini: 'Gemini (Google)'
};

const FEATURES = [
  { key: 'landingAi',      label: 'Landing Page AI',  description: 'AI chatbot on the public landing page', icon: HiSparkles },
  { key: 'clientAi',       label: 'Client AI',         description: 'AI features inside client dashboards',  icon: HiCloud },
  { key: 'fileUpload',     label: 'File Upload',       description: 'Allow AI file analysis',               icon: HiUpload },
  { key: 'outwardApiKeys', label: 'Outward API Keys',  description: 'Allow clients to generate API keys',   icon: HiKey }
];

export default function Ai() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [revealed, setRevealed] = useState({});
  const [testing, setTesting] = useState({});
  const [testResult, setTestResult] = useState({});

  useEffect(() => {
    getAiSettings()
      .then((res) => setData(res?.data || res || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateProvider = (key, patch) => {
    setData((prev) => ({
      ...prev,
      providers: (prev.providers || []).map((p) =>
        p.key === key ? { ...p, ...patch } : p
      )
    }));
  };

  const updateFeature = (key, value) => {
    setData((prev) => ({
      ...prev,
      features: { ...(prev.features || {}), [key]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await updateAiSettings({
        providers: data.providers,
        defaultProvider: data.defaultProvider,
        features: data.features
      });
      setSuccess('Saved!');
      setTimeout(() => setSuccess(''), 2000);

      const res = await getAiSettings();
      setData(res?.data || res || {});
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleTest = async (key) => {
    setTesting((t) => ({ ...t, [key]: true }));
    setTestResult((r) => ({ ...r, [key]: null }));
    try {
      await testAiProvider(key);
      setTestResult((r) => ({ ...r, [key]: 'ok' }));
    } catch (err) {
      setTestResult((r) => ({ ...r, [key]: 'error' }));
    }
    setTesting((t) => ({ ...t, [key]: false }));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }
  if (!data) return null;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Configuration</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage AI providers and features across the platform.
        </p>
      </div>

      {success && (
        <div className="bg-[var(--accent)]/10 text-[var(--accent)] p-3 rounded-[var(--radius)] text-sm mb-4">
          {success}
        </div>
      )}

      {/* Providers */}
      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">AI Providers</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Configure credentials for each provider. Only enabled providers appear in client features.
          </p>
        </div>

        <div className="space-y-4">
          {(data.providers || []).map((p) => (
            <div
              key={p.key}
              className="border border-[var(--border-color)] rounded-[var(--radius)] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {PROVIDER_LABELS[p.key] || p.label}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    ({p.key})
                  </span>
                </div>
                <Toggle
                  checked={p.enabled}
                  onChange={(v) => updateProvider(p.key, { enabled: v })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Base URL"
                  value={p.baseUrl || ''}
                  onChange={(e) => updateProvider(p.key, { baseUrl: e.target.value })}
                  placeholder="https://..."
                />

                <div className="relative">
                  <Input
                    label="API Key"
                    type={revealed[p.key] ? 'text' : 'password'}
                    value={p.apiKey || ''}
                    onChange={(e) => updateProvider(p.key, { apiKey: e.target.value })}
                    placeholder={p.hasKey ? 'Leave masked to keep current' : 'Paste key'}
                  />
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => ({ ...r, [p.key]: !r[p.key] }))}
                    className="absolute right-3 top-[34px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    aria-label="Toggle visibility"
                  >
                    {revealed[p.key] ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleTest(p.key)}
                  loading={testing[p.key]}
                  disabled={!p.hasKey && !p.apiKey}
                >
                  Test connection
                </Button>

                {testResult[p.key] === 'ok' && (
                  <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                    <HiCheckCircle className="w-4 h-4" /> Reachable
                  </span>
                )}
                {testResult[p.key] === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-[var(--danger)]">
                    <HiXCircle className="w-4 h-4" /> Failed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Default Provider */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Default Provider</h2>
        <Select
          value={data.defaultProvider || 'hdm'}
          onChange={(e) => setData({ ...data, defaultProvider: e.target.value })}
          options={[
            { value: 'global', label: 'Global Default' },
            ...(data.providers || []).map((p) => ({
              value: p.key,
              label: PROVIDER_LABELS[p.key] || p.label
            }))
          ]}
        />
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Used when no other provider is explicitly selected.
        </p>
      </Card>

      {/* Features */}
      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Features</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Turn AI capabilities on or off globally.
          </p>
        </div>

        <div className="space-y-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.key}
                className="flex items-start justify-between gap-4 p-3 border border-[var(--border-color)] rounded-[var(--radius)]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Icon className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{f.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{f.description}</p>
                  </div>
                </div>
                <Toggle
                  checked={Boolean(data.features?.[f.key])}
                  onChange={(v) => updateFeature(f.key, v)}
                />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getAIConfig, updateAIConfig } from '../../services/hdmai/aiConfig';
import { getUsage } from '../../services/hdmai/stats';
import Card from '../../components/hdmai/ui/Card';
import Button from '../../components/hdmai/ui/Button';
import Spinner from '../../components/hdmai/ui/Spinner';

const PROVIDERS = [
  {
    key: 'groq',
    name: 'Groq',
    model: 'Llama 3.3 70B',
    modelValue: 'llama-3.3-70b-versatile',
    icon: '🦙',
    color: 'from-orange-500 to-rose-500',
  },
  {
    key: 'gemini',
    name: 'Gemini',
    model: 'Flash/Pro',
    modelValue: 'gemini-2.0-flash',
    icon: '🌐',
    color: 'from-blue-500 to-cyan-500',
  },
];

const GEMINI_MODELS = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (fast)' },
  { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro (powerful)' },
];

export default function AIConfigPage() {
  const [config, setConfig] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getAIConfig(), getUsage()])
      .then(([cfg, usg]) => {
        setConfig(cfg);
        setUsage(usg);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleProviderSwitch = async (provider) => {
    setSaving(true);
    try {
      const p = PROVIDERS.find(pr => pr.key === provider);
      await updateAIConfig({
        default_provider: provider,
        default_model: p.modelValue,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.max_tokens ?? 1024,
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAIConfig(config);
      alert('AI configuration saved');
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!config) return null;

  const activeProvider = PROVIDERS.find(p => p.key === config.default_provider);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">AI Configuration</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Active Provider */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeProvider?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-3xl shadow-lg`}>
              {activeProvider?.icon || '🤖'}
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Active Provider</p>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {activeProvider?.name || config.default_provider}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {activeProvider?.model || config.default_model}
              </p>
            </div>
          </div>

          {/* Provider Switches */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PROVIDERS.map(p => (
              <button
                key={p.key}
                onClick={() => handleProviderSwitch(p.key)}
                disabled={saving || config.default_provider === p.key}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  config.default_provider === p.key
                    ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20'
                    : 'border-[var(--border-color)] hover:border-fuchsia-300 bg-[var(--bg-secondary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <p className="font-medium text-[var(--text-primary)] text-sm">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.model}</p>
                  </div>
                  {config.default_provider === p.key && (
                    <span className="ml-auto w-3 h-3 rounded-full bg-fuchsia-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Model selector for Gemini */}
          {config.default_provider === 'gemini' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Model</label>
              <select
                value={config.default_model}
                onChange={(e) => updateConfig('default_model', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
              >
                {GEMINI_MODELS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Temperature Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Temperature</span>
              <span className="text-[var(--text-primary)] font-medium">{config.temperature ?? 0.7}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature ?? 0.7}
              onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-fuchsia-500"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>Precise (0.0)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Max Tokens</span>
              <span className="text-[var(--text-primary)] font-medium">{config.max_tokens ?? 1024}</span>
            </div>
            <input
              type="range"
              min="100"
              max="4096"
              step="100"
              value={config.max_tokens ?? 1024}
              onChange={(e) => updateConfig('max_tokens', parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-fuchsia-500"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>100</span>
              <span>4096</span>
            </div>
          </div>

          <Button onClick={handleSave} loading={saving}>Save Configuration</Button>
        </Card>

        {/* Usage Stats */}
        {usage && (
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Usage Today</h2>
            <div className="space-y-4">
              {Object.entries(usage.providers || {}).map(([key, p]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-primary)]">{p.name}</span>
                    <span className="text-[var(--text-secondary)]">
                      {p.limit === 'unlimited'
                        ? 'Unlimited'
                        : `${p.requests_today || 0}/${p.limit_requests_per_day || p.limit_flash_per_day || '?'} requests`}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${p.limit === 'unlimited' ? 'bg-green-500 w-full' : 'bg-fuchsia-500'}`}
                      style={p.limit !== 'unlimited' ? { width: `${Math.min(p.usage_percent_today || 0, 100)}%` } : {}}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {p.tokens_today?.toLocaleString() || 0} tokens today
                  </p>
                </div>
              ))}
            </div>
            {usage.overall && (
              <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">
                  Total: {usage.overall.total_requests_today} requests | {usage.overall.total_tokens_today?.toLocaleString()} tokens
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">{usage.overall.free_tier_savings}</span>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
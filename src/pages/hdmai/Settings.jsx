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
    bg: 'bg-gradient-to-br from-orange-400 to-rose-500',
    activeBg: 'bg-orange-50 dark:bg-orange-900/30',
    activeBorder: 'border-orange-500',
    activeText: 'text-orange-700 dark:text-orange-400',
    activeBadge: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40',
    dot: 'bg-orange-500',
    shadow: 'shadow-orange-500/20',
  },
  {
    key: 'gemini',
    name: 'Gemini',
    model: 'Gemini 2.5 Flash',
    modelValue: 'gemini-2.5-flash',
    icon: '🌐',
    bg: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    activeBg: 'bg-blue-50 dark:bg-blue-900/30',
    activeBorder: 'border-blue-500',
    activeText: 'text-blue-700 dark:text-blue-400',
    activeBadge: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
    dot: 'bg-blue-500',
    shadow: 'shadow-blue-500/20',
  },
];

const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (fast)' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (powerful)' },
];

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getAIConfig(), getUsage()])
      .then(([cfg, usg]) => {
        const c = cfg?.data || cfg;
        setConfig({
          defaultProvider: c?.defaultProvider || 'groq',
          defaultModel: c?.defaultModel || 'llama-3.3-70b-versatile',
          temperature: c?.temperature ?? 0.7,
          maxTokens: c?.maxTokens ?? 1024,
          maxApiKeysPerUser: c?.maxApiKeysPerUser ?? 5,
        });
        setUsage(usg?.data || usg);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleProviderSwitch = async (provider) => {
    setSaving(true);
    setSuccess('');
    try {
      const p = PROVIDERS.find(pr => pr.key === provider);
      await updateAIConfig({
        defaultProvider: provider,
        defaultModel: p.modelValue,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        maxApiKeysPerUser: config.maxApiKeysPerUser ?? 5,
      });
      setConfig(prev => ({
        ...prev,
        defaultProvider: provider,
        defaultModel: p.modelValue,
      }));
      setSuccess('Provider switched!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await updateAIConfig({
        defaultProvider: config.defaultProvider,
        defaultModel: config.defaultModel,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        maxApiKeysPerUser: config.maxApiKeysPerUser ?? 5,
      });
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setSaving(false);
  };

  const updateConfig = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!config) return null;

  const activeProvider = PROVIDERS.find(p => p.key === config.defaultProvider);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">AI Configuration</h1>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4 text-sm">{success}</div>
      )}

      <div className="space-y-6 max-w-3xl">
        <Card>
          {/* Active Provider Header */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-[var(--bg-secondary)]">
            <div className={`w-16 h-16 rounded-2xl ${activeProvider?.bg || 'bg-gradient-to-br from-gray-400 to-gray-500'} flex items-center justify-center text-3xl shadow-lg`}>
              {activeProvider?.icon || '🤖'}
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Active Provider</p>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{activeProvider?.name || config.defaultProvider}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{activeProvider?.model || config.defaultModel}</p>
            </div>
          </div>

          {/* Provider Cards */}
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">Select Provider</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PROVIDERS.map(p => {
              const isActive = config.defaultProvider === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => handleProviderSwitch(p.key)}
                  disabled={saving}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isActive
                      ? `${p.activeBorder} ${p.activeBg} shadow-lg ${p.shadow}`
                      : 'border-[var(--border-color)] bg-[var(--card-bg)] opacity-50 hover:opacity-80 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center text-xl ${isActive ? 'shadow-md' : 'grayscale opacity-60'}`}>
                      {p.icon}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isActive ? p.activeText : 'text-[var(--text-secondary)]'}`}>
                        {p.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{p.model}</p>
                    </div>
                    {isActive && (
                      <div className="ml-auto flex items-center gap-2">
                        <span className={`text-[10px] font-medium ${p.activeBadge} px-2 py-0.5 rounded-full`}>Active</span>
                        <div className={`w-3 h-3 rounded-full ${p.dot}`} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Gemini Model Selector */}
          {config.defaultProvider === 'gemini' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Model</label>
              <select
                value={config.defaultModel}
                onChange={(e) => updateConfig('defaultModel', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
              >
                {GEMINI_MODELS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Temperature */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Temperature</span>
              <span className="text-[var(--text-primary)] font-bold">{config.temperature}</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.1"
              value={config.temperature}
              onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-fuchsia-500"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>Precise (0.0)</span><span>Creative (1.0)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Max Tokens</span>
              <span className="text-[var(--text-primary)] font-bold">{config.maxTokens}</span>
            </div>
            <input
              type="range" min="100" max="4096" step="100"
              value={config.maxTokens}
              onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-fuchsia-500"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>100</span><span>4096</span>
            </div>
          </div>

          {/* Max API Keys Per User */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Max API Keys Per User</span>
              <span className="text-[var(--text-primary)] font-bold">{config.maxApiKeysPerUser ?? 5}</span>
            </div>
            <input
              type="range" min="1" max="20" step="1"
              value={config.maxApiKeysPerUser ?? 5}
              onChange={(e) => updateConfig('maxApiKeysPerUser', parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-fuchsia-500"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>1</span><span>20</span>
            </div>
          </div>

          <Button onClick={handleSave} loading={saving}>Save Configuration</Button>
        </Card>

        {/* Usage Today */}
        {usage && (
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Usage Today</h2>
            <div className="space-y-4">
              {Object.entries(usage.providers || {}).map(([key, p]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-primary)] font-medium">{p.name}</span>
                    <span className="text-[var(--text-secondary)] text-xs">
                      {p.limit === 'unlimited'
                        ? 'Unlimited'
                        : `${p.requests_today || 0}/${p.limit_requests_per_day || p.limit_flash_per_day || '?'} requests`}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        p.limit === 'unlimited'
                          ? 'bg-green-500 w-full'
                          : (p.usage_percent_today || 0) > 80
                            ? 'bg-red-500'
                            : (p.usage_percent_today || 0) > 50
                              ? 'bg-yellow-500'
                              : 'bg-fuchsia-500'
                      }`}
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
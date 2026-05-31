import { useEffect, useState } from 'react';
import { getUsage } from '../../services/hdmai/stats';
import { getAIConfig, updateAIConfig } from '../../services/hdmai/aiConfig';
import Card from '../../components/hdmai/ui/Card';
import Spinner from '../../components/hdmai/ui/Spinner';
import Badge from '../../components/hdmai/ui/Badge';
import Button from '../../components/hdmai/ui/Button';
import Input from '../../components/hdmai/ui/Input';

export default function Usage() {
  const [usage, setUsage] = useState(null);
  const [aiConfig, setAiConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingProvider, setSavingProvider] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [temp, setTemp] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);

  const fetchData = () => {
    Promise.all([getUsage(), getAIConfig()])
      .then(([u, a]) => {
        setUsage(u);
        setAiConfig(a);
        setTemp(a?.temperature ?? 0.7);
        setMaxTokens(a?.max_tokens ?? 1024);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getUsage().then(setUsage).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchProvider = async (provider) => {
    setSavingProvider(true);
    try {
      await updateAIConfig({ default_provider: provider });
      const a = await getAIConfig();
      setAiConfig(a);
      setTemp(a?.temperature ?? 0.7);
      setMaxTokens(a?.max_tokens ?? 1024);
    } catch (err) { alert(err.message); }
    setSavingProvider(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateAIConfig({ temperature: temp, max_tokens: maxTokens });
      alert('AI settings saved');
    } catch (err) { alert(err.message); }
    setSavingSettings(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;

  const getBarColor = (percent) => {
    if (percent > 80) return 'bg-red-500';
    if (percent > 50) return 'bg-yellow-500';
    return 'bg-fuchsia-500';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Usage & AI Configuration</h1>

      {/* AI Provider */}
      {aiConfig && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">🤖 AI Provider</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Active: <Badge variant="fuchsia">
                  {aiConfig.default_provider === 'groq' ? 'Groq (Llama 3.3 70B)' : aiConfig.default_provider === 'gemini' ? 'Gemini (Flash/Pro)' : aiConfig.default_provider}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={aiConfig.default_provider === 'groq' ? 'primary' : 'secondary'} onClick={() => handleSwitchProvider('groq')} loading={savingProvider}>Groq</Button>
              <Button size="sm" variant={aiConfig.default_provider === 'gemini' ? 'primary' : 'secondary'} onClick={() => handleSwitchProvider('gemini')} loading={savingProvider}>Gemini</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-secondary)]">Temperature</span>
                <span className="text-[var(--text-primary)] font-medium">{temp}</span>
              </div>
              <input type="range" min="0" max="1" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-fuchsia-500" />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>Precise (0.0)</span><span>Creative (1.0)</span></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-secondary)]">Max Tokens</span>
                <span className="text-[var(--text-primary)] font-medium">{maxTokens}</span>
              </div>
              <input type="range" min="100" max="4096" step="100" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-fuchsia-500" />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>100</span><span>4096</span></div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSaveSettings} loading={savingSettings} size="sm">Save Settings</Button>
          </div>
        </Card>
      )}

      {/* Usage by API Key */}
      {usage?.keys && (
        <Card className="mb-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">📊 Usage by API Key</h2>
          <div className="space-y-6">
            {Object.entries(usage.keys).map(([keyId, keyData]) => (
              <div key={keyId}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-[var(--text-primary)]">
                    🔑 {keyData.label}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{keyData.services}</span>
                </div>

                {/* Per-service bars */}
                <div className="space-y-2 mb-2">
                  {Object.entries(usage.services || {})
                    .filter(([, s]) => s.key === keyData.label)
                    .map(([svcKey, svc]) => (
                      <div key={svcKey}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-[var(--text-secondary)] capitalize">{svc.name}</span>
                          <span className="text-[var(--text-muted)]">{svc.requests_today}/{svc.limit_per_day || 1440} ({svc.usage_percent || 0}%)</span>
                        </div>
                        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${getBarColor(svc.usage_percent || 0)}`}
                            style={{ width: `${Math.min(svc.usage_percent || 0, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Key total bar */}
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Total {keyData.label}</span>
                  <span className="text-[var(--text-muted)]">{keyData.requests_today}/{keyData.limit_per_day} ({keyData.usage_percent}%)</span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full transition-all ${getBarColor(keyData.usage_percent)}`}
                    style={{ width: `${Math.min(keyData.usage_percent || 0, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Providers Totals */}
      {usage?.providers && (
        <Card className="mb-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">⚡ Provider Totals</h2>
          <div className="space-y-4">
            {Object.entries(usage.providers).map(([key, p]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-primary)] font-medium">{p.name}</span>
                  <span className="text-[var(--text-muted)]">
                    {p.limit === 'unlimited' ? 'Unlimited' : `${p.requests_today || 0}/${p.limit_requests_per_day || p.limit_flash_per_day || '?'}`}
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${p.limit === 'unlimited' ? 'bg-green-500 w-full' : getBarColor(p.usage_percent_today || 0)}`}
                    style={p.limit !== 'unlimited' ? { width: `${Math.min(p.usage_percent_today || 0, 100)}%` } : {}} />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {p.limit === 'unlimited' ? 'No limits' : `${(p.tokens_today || 0).toLocaleString()} tokens`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Overall Stats */}
      {usage?.overall && (
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">📈 Totals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{usage.overall.total_requests_today}</p>
              <p className="text-xs text-[var(--text-muted)]">Requests Today</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{usage.overall.total_tokens_today?.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Tokens Today</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{usage.overall.free_tier_savings}</p>
              <p className="text-xs text-[var(--text-muted)]">Free Tier Savings</p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center">Auto-refreshes every 60 seconds</p>
        </Card>
      )}
    </div>
  );
}
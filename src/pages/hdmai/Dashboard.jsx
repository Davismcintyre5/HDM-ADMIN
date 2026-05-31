import { useEffect, useState } from 'react';
import { getStats, getUsage } from '../../services/hdmai/stats';
import { getAIConfig, updateAIConfig } from '../../services/hdmai/aiConfig';
import Card from '../../components/hdmai/ui/Card';
import Spinner from '../../components/hdmai/ui/Spinner';
import Badge from '../../components/hdmai/ui/Badge';
import Button from '../../components/hdmai/ui/Button';
import { HiUsers, HiKey, HiLightningBolt, HiDatabase } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [usage, setUsage] = useState(null);
  const [aiConfig, setAiConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingProvider, setSavingProvider] = useState(false);

  const fetchData = () => {
    Promise.all([getStats(), getUsage(), getAIConfig()])
      .then(([s, u, a]) => { setStats(s); setUsage(u); setAiConfig(a); })
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
    } catch (err) { alert(err.message); }
    setSavingProvider(false);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/hdmai/usage')}>
          View Full Usage
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-[var(--text-secondary)]">Total Users</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats?.total_users || 0}</p></div>
            <HiUsers className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-[var(--text-secondary)]">Active API Keys</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats?.active_api_keys || 0}</p></div>
            <HiKey className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-[var(--text-secondary)]">Requests Today</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{usage?.overall?.total_requests_today || 0}</p></div>
            <HiLightningBolt className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-[var(--text-secondary)]">Tokens Today</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{usage?.overall?.total_tokens_today?.toLocaleString() || 0}</p></div>
            <HiDatabase className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* AI Provider */}
      {aiConfig && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">AI Provider</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Active: <Badge variant="fuchsia">{aiConfig.default_provider === 'groq' ? 'Groq (Llama 3.3 70B)' : 'Gemini (Flash/Pro)'}</Badge>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={aiConfig.default_provider === 'gemini' ? 'primary' : 'secondary'}
                onClick={() => handleSwitchProvider('gemini')}
                loading={savingProvider}
              >
                Switch to Gemini
              </Button>
              <Button
                size="sm"
                variant={aiConfig.default_provider === 'groq' ? 'primary' : 'secondary'}
                onClick={() => handleSwitchProvider('groq')}
                loading={savingProvider}
              >
                Switch to Groq
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">Temperature: </span>
              <span className="font-medium">{aiConfig.temperature ?? 0.7}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Max Tokens: </span>
              <span className="font-medium">{aiConfig.max_tokens ?? 1024}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Usage by Key Summary */}
      {usage?.keys && (
        <Card className="mb-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Usage by API Key</h2>
          <div className="space-y-4">
            {Object.entries(usage.keys).map(([keyId, keyData]) => (
              <div key={keyId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[var(--text-primary)]">
                    🔑 {keyData.label} — {keyData.services}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {keyData.requests_today}/{keyData.limit_per_day} ({keyData.usage_percent}%)
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getBarColor(keyData.usage_percent)}`}
                    style={{ width: `${Math.min(keyData.usage_percent || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Totals */}
      {usage?.overall && (
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Totals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[var(--text-primary)]">{usage.overall.total_requests_today}</p>
              <p className="text-xs text-[var(--text-muted)]">Requests Today</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[var(--text-primary)]">{usage.overall.total_tokens_today?.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Tokens Today</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-green-600">{usage.overall.free_tier_savings}</p>
              <p className="text-xs text-[var(--text-muted)]">Free Tier Savings</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
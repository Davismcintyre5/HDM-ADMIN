import { useEffect, useState, useCallback } from 'react';
import { getAdminHealth } from '../../services/hdmai/health';
import Card from '../../components/hdmai/ui/Card';
import Badge from '../../components/hdmai/ui/Badge';
import Button from '../../components/hdmai/ui/Button';
import Toggle from '../../components/hdmai/ui/Toggle';
import Spinner from '../../components/hdmai/ui/Spinner';
import { HiServer, HiChip, HiDatabase, HiLightningBolt, HiCode, HiRefresh, HiEye, HiEyeOff } from 'react-icons/hi';

function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return 'N/A';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const statusVariant = (status) => {
  if (!status) return 'default';
  if (['running', 'healthy', 'connected', 'local'].includes(status)) return 'success';
  if (['disabled', 'not configured', 'not_configured'].includes(status)) return 'default';
  return 'danger';
};

export default function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const countdownRef = useState(null);
  const intervalRef = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await getAdminHealth();
      setHealth(res?.data || res);
      setError('');
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to fetch health data');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  // Auto-refresh every 30s
  useEffect(() => {
    let timer;
    if (autoRefresh) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { fetchHealth(); return 30; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [autoRefresh, fetchHealth]);

  // Pause when tab inactive
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && autoRefresh) {
        setCountdown(30);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchHealth().finally(() => setLoading(false));
  };

  if (loading && !health) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const cards = [
    {
      key: 'server', title: 'MERN Server', icon: HiServer, color: 'text-fuchsia-500',
      fields: [
        { label: 'Status', value: health?.server, badge: true },
        { label: 'Version', value: health?.version },
        { label: 'Uptime', value: formatUptime(health?.uptime) },
        { label: 'Memory', value: health?.memory?.rss ? `${Math.round(health.memory.rss)} MB` : 'N/A' },
      ],
    },
    {
      key: 'python', title: 'Python AI Engine', icon: HiChip, color: 'text-green-500',
      fields: [
        { label: 'Status', value: health?.python?.status, badge: true },
        { label: 'Version', value: health?.python?.version },
        { label: 'Uptime', value: formatUptime(health?.python?.uptime) },
        { label: 'Memory', value: health?.python?.memory?.rss ? `${Math.round(health.python.memory.rss)} MB` : 'N/A' },
      ],
    },
    {
      key: 'mongodb', title: 'MongoDB', icon: HiDatabase, color: 'text-emerald-500',
      fields: [{ label: 'Status', value: health?.mongodb, badge: true }],
    },
    {
      key: 'redis', title: 'Redis', icon: HiLightningBolt, color: 'text-amber-500',
      fields: [{ label: 'Status', value: health?.redis || 'disabled', badge: true }],
    },
    {
      key: 'groq_api', title: 'Groq API', icon: () => <span className="text-2xl">🦙</span>, color: 'text-orange-500',
      fields: [{ label: 'Status', value: health?.groq_api || 'not configured', badge: true }],
    },
    {
      key: 'gemini_api', title: 'Gemini API', icon: () => <span className="text-2xl">🌐</span>, color: 'text-blue-500',
      fields: [{ label: 'Status', value: health?.gemini_api || 'not configured', badge: true }],
    },
    {
      key: 'code_execution', title: 'Code Execution', icon: HiCode, color: 'text-violet-500',
      fields: [{ label: 'Status', value: health?.code_execution || 'disabled', badge: true }],
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Health</h1>
          {lastRefresh && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {autoRefresh && (
            <span className="text-xs text-[var(--text-muted)]">Refresh in {countdown}s</span>
          )}
          <Button size="sm" variant="ghost" onClick={handleManualRefresh} title="Refresh now">
            <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Toggle checked={autoRefresh} onChange={setAutoRefresh} />
          <span className="text-xs text-[var(--text-muted)]">Auto</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <Button size="sm" variant="danger" onClick={handleManualRefresh}>Retry</Button>
        </div>
      )}

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <Card key={card.key}>
            <div className="flex items-center gap-3 mb-3">
              {typeof card.icon === 'function' ? card.icon() : <card.icon className={`w-6 h-6 ${card.color}`} />}
              <h2 className="font-semibold text-[var(--text-primary)] text-sm">{card.title}</h2>
            </div>
            <div className="space-y-2">
              {card.fields.map(f => (
                <div key={f.label} className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)] text-xs">{f.label}:</span>
                  {f.badge ? (
                    <Badge variant={statusVariant(f.value)}>{f.value || 'Unknown'}</Badge>
                  ) : (
                    <span className="text-[var(--text-primary)] text-xs font-medium">{f.value || '—'}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Details */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">📊 Server Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Environment:</span>
            <Badge variant={health?.environment === 'production' ? 'warning' : 'info'}>{health?.environment || 'N/A'}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Python URL:</span>
            <span className="text-[var(--text-primary)] text-xs">{health?.python_url || 'http://localhost:5002'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Internal Secret:</span>
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-primary)] text-xs font-mono">
                {showSecret ? (health?.internal_secret || '••••••••••••') : '••••••••••••'}
              </span>
              <button onClick={() => setShowSecret(!showSecret)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                {showSecret ? <HiEyeOff className="w-3 h-3" /> : <HiEye className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Uptime:</span>
            <span className="text-[var(--text-primary)] text-xs">
              Server {formatUptime(health?.uptime)} | Python {formatUptime(health?.python?.uptime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Auto-refresh:</span>
            <span className="text-[var(--text-primary)] text-xs">Every 30s {autoRefresh ? '(On)' : '(Off)'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
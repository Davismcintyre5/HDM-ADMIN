import { useEffect, useState } from 'react';
import { getSettings, updateAI } from '../../../services/vault/settings';
import Input from '../../../components/vault/ui/Input';
import Toggle from '../../../components/vault/ui/Toggle';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Card from '../../../components/vault/ui/Card';
import Badge from '../../../components/vault/ui/Badge';

const AI_FEATURES = [
  { key: 'publicChat', label: 'Public Chat', desc: 'Landing Page' },
  { key: 'privateChat', label: 'Private Chat', desc: 'Dashboard' },
  { key: 'securityOverview', label: 'Security Overview' },
  { key: 'redAlerts', label: 'Red Alerts' },
  { key: 'nlpCommands', label: 'NLP Commands' },
  { key: 'reportGeneration', label: 'Report Generation' },
  { key: 'scheduledReports', label: 'Scheduled Reports' },
  { key: 'semanticSearch', label: 'Semantic Search' },
  { key: 'autoCategorization', label: 'Auto Categorization' },
  { key: 'duplicateDetection', label: 'Duplicate Detection' },
  { key: 'threatSummary', label: 'Threat Summary' },
  { key: 'deviceAudit', label: 'Device Audit' },
  { key: 'predictiveBlocking', label: 'Predictive Blocking' },
  { key: 'phishingVisualAnalysis', label: 'Phishing Visual Analysis' },
];

export default function AISettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getSettings()
      .then(s => setConfig(s.ai || s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
  const updateFeature = (key, value) => setConfig(prev => ({ ...prev, features: { ...prev.features, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateAI(config);
      if (res.data) setConfig(res.data);
      alert('AI configuration saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const baseUrl = (config.url || 'https://hdmai-server.onrender.com').replace(/\/api\/v1\/?$/, '');
      const res = await fetch(baseUrl + '/health');
      const data = await res.json();
      if (data.status === 'healthy' || data.success) {
        alert('✅ Connection successful!');
        setConfig(prev => ({ ...prev, lastStatus: 'connected' }));
      } else {
        throw new Error('Unexpected response');
      }
    } catch {
      alert('❌ Connection failed. Check the URL and try again.');
      setConfig(prev => ({ ...prev, lastStatus: 'disconnected' }));
    }
    setTesting(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!config) return null;

  const isConnected = config.lastStatus === 'connected';

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">HDM AI Service</h3>
              <Badge variant={isConnected ? 'success' : 'danger'}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </Badge>
            </div>
          </div>
          <Toggle checked={config.enabled || false} onChange={(v) => updateField('enabled', v)} />
        </div>

        {config.enabled && (
          <div className="space-y-3">
            <Input
              label="AI URL"
              value={config.url || ''}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="https://hdmai-server.onrender.com/api/v1"
            />
            <Input
              label="API Key"
              type="password"
              value={config.key || ''}
              onChange={(e) => updateField('key', e.target.value)}
              placeholder="hdm_vau_..."
            />
            <Button variant="outline" size="sm" onClick={handleTestConnection} loading={testing}>
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        )}
      </Card>

      {config.enabled && (
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">AI Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AI_FEATURES.map(f => (
              <Toggle
                key={f.key}
                label={f.label}
                description={f.desc}
                checked={config.features?.[f.key] || false}
                onChange={(v) => updateFeature(f.key, v)}
              />
            ))}
          </div>
        </Card>
      )}

      <Button onClick={handleSave} loading={saving}>💾 Save AI Configuration</Button>
    </div>
  );
}
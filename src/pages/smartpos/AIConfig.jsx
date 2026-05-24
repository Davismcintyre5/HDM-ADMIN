import { useEffect, useState } from 'react';
import { getAIConfig, updateAIConfig } from '../../services/smartpos/aiConfig';
import Card from '../../components/smartpos/ui/Card';
import Input from '../../components/smartpos/ui/Input';
import Toggle from '../../components/smartpos/ui/Toggle';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';

const PROVIDER_INFO = {
  hdm: { label: 'HDM AI', needsBaseUrl: true, needsApiKey: true, defaultBaseUrl: 'https://hdmai-server.onrender.com/api/v1' },
  deepseek: { label: 'DeepSeek', needsBaseUrl: false, needsApiKey: true },
  chatgpt: { label: 'ChatGPT (OpenAI)', needsBaseUrl: false, needsApiKey: true },
  claude: { label: 'Claude (Anthropic)', needsBaseUrl: false, needsApiKey: true },
  gemini: { label: 'Gemini (Google)', needsBaseUrl: false, needsApiKey: true },
};

export default function AIConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAIConfig()
      .then(res => setConfig(res.config))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateProvider = (index, key, value) => {
    setConfig(prev => {
      const providers = [...prev.providers];
      providers[index] = { ...providers[index], [key]: value };
      return { ...prev, providers };
    });
  };

  const updateField = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateAIConfig(config); alert('AI config saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!config) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">AI Configuration</h1>
      <div className="space-y-6 max-w-3xl">
        {/* Providers */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Providers</h2>
          <div className="space-y-4">
            {config.providers?.map((p, i) => {
              const info = PROVIDER_INFO[p.name] || { label: p.name, needsBaseUrl: false, needsApiKey: true };
              return (
                <div key={p.name} className="p-4 border border-[var(--border-color)] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[var(--text-primary)]">{info.label}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-2 capitalize">({p.name})</span>
                    </div>
                    <Toggle checked={p.enabled || false} onChange={(v) => updateProvider(i, 'enabled', v)} />
                  </div>
                  {p.enabled && (
                    <div className="pl-2 border-l-2 border-blue-300 dark:border-blue-700 space-y-3">
                      {info.needsBaseUrl && (
                        <Input
                          label="Base URL"
                          value={p.baseUrl || info.defaultBaseUrl || ''}
                          onChange={(e) => updateProvider(i, 'baseUrl', e.target.value)}
                          placeholder={info.defaultBaseUrl || 'https://...'}
                        />
                      )}
                      {info.needsApiKey && (
                        <Input
                          label="API Key"
                          type="password"
                          value={p.apiKey || ''}
                          onChange={(e) => updateProvider(i, 'apiKey', e.target.value)}
                          placeholder="Enter API key..."
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Default Provider */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Default Provider</h2>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Global Default</label>
            <select
              value={config.globalDefault || 'hdm'}
              onChange={(e) => updateField('globalDefault', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {config.providers?.map(p => (
                <option key={p.name} value={p.name}>
                  {PROVIDER_INFO[p.name]?.label || p.name} {p.enabled ? '' : '(disabled)'}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Features</h2>
          <div className="space-y-2">
            <Toggle
              label="Landing Page AI"
              description="AI chatbot on the public landing page"
              checked={config.landingEnabled || false}
              onChange={(v) => updateField('landingEnabled', v)}
            />
            <Toggle
              label="Client AI"
              description="AI features inside client dashboards"
              checked={config.clientEnabled || false}
              onChange={(v) => updateField('clientEnabled', v)}
            />
            <Toggle
              label="File Upload"
              description="Allow AI file analysis"
              checked={config.fileUploadEnabled || false}
              onChange={(v) => updateField('fileUploadEnabled', v)}
            />
            <Toggle
              label="Outward API Keys"
              description="Allow clients to generate API keys"
              checked={config.outwardKeyEnabled || false}
              onChange={(v) => updateField('outwardKeyEnabled', v)}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">Save Configuration</Button>
        </div>
      </div>
    </div>
  );
}
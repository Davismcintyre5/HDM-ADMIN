import { useEffect, useState } from 'react';
import { getAIConfig, updateAIConfig } from '../../services/hdmerp/aiConfig';
import Card from '../../components/hdmerp/ui/Card';
import Input from '../../components/hdmerp/ui/Input';
import Toggle from '../../components/hdmerp/ui/Toggle';
import Button from '../../components/hdmerp/ui/Button';
import Spinner from '../../components/hdmerp/ui/Spinner';

const PROVIDERS = [
  { value: 'hdm-ai', label: 'HDM AI', baseUrl: 'https://hdmai-server.onrender.com/api/v1' },
  { value: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { value: 'anthropic', label: 'Anthropic (Claude)', baseUrl: 'https://api.anthropic.com/v1' },
  { value: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1' },
  { value: 'gemini', label: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  { value: 'mistral', label: 'Mistral AI', baseUrl: 'https://api.mistral.ai/v1' },
  { value: 'cohere', label: 'Cohere', baseUrl: 'https://api.cohere.ai/v1' },
];

const FEATURES = [
  { key: 'landingPageAI', label: 'Landing Page AI', desc: 'Chatbot on public landing page' },
  { key: 'clientAI', label: 'Client AI', desc: 'Sparkle button on tenant dashboards' },
  { key: 'proactiveAlerts', label: 'Proactive Alerts', desc: 'Auto alerts for low stock, overdue invoices' },
  { key: 'fileUpload', label: 'File Upload', desc: 'Tenants can upload files for AI analysis' },
  { key: 'outwardKeyGen', label: 'Outward Key Gen', desc: 'Tenants can generate outward API keys' },
];

export default function AIConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);

  const fetchConfig = () => {
    setLoading(true);
    setError('');
    getAIConfig()
      .then(data => setConfig(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConfig(); }, []);

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = newConfig;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') {
          obj[parts[i]] = {};
        }
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return newConfig;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAIConfig(config);
      alert('AI configuration saved successfully');
      fetchConfig();
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!config) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">AI Configuration</h1>
      <div className="space-y-6 max-w-3xl">
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-fuchsia-500 rounded-full"></span>
            AI Provider
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
              <select
                value={config.provider || 'hdm-ai'}
                onChange={(e) => {
                  const provider = PROVIDERS.find(p => p.value === e.target.value);
                  updateConfig('provider', e.target.value);
                  if (provider) updateConfig('baseUrl', provider.baseUrl);
                }}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              >
                {PROVIDERS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <Input label="Model" value={config.model || ''} onChange={(e) => updateConfig('model', e.target.value)} />
            <Input label="Base URL" value={config.baseUrl || ''} onChange={(e) => updateConfig('baseUrl', e.target.value)} />
            <Input label="API Key" type="password" value={config.apiKey || ''} onChange={(e) => updateConfig('apiKey', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-500 rounded-full"></span>
            Feature Toggles
          </h2>
          <div className="space-y-1">
            {FEATURES.map(feat => (
              <Toggle
                key={feat.key}
                label={feat.label}
                description={feat.desc}
                checked={!!config.features?.[feat.key]}
                onChange={(v) => updateConfig(`features.${feat.key}`, v)}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <Input
              label="Max File Size (MB)"
              type="number"
              value={config.features?.maxFileSizeMB ?? 5}
              onChange={(e) => updateConfig('features.maxFileSizeMB', Number(e.target.value))}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            Landing Chatbot
          </h2>
          <Toggle
            label="Enable Landing Chatbot"
            checked={!!config.landingChatbot?.enabled}
            onChange={(v) => updateConfig('landingChatbot.enabled', v)}
          />
          {config.landingChatbot?.enabled && (
            <div className="mt-4 ml-2 pl-4 border-l-2 border-fuchsia-300 dark:border-fuchsia-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
                <select
                  value={config.landingChatbot?.provider || 'hdm-ai'}
                  onChange={(e) => updateConfig('landingChatbot.provider', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                >
                  {PROVIDERS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <Input label="Model" value={config.landingChatbot?.model || ''} onChange={(e) => updateConfig('landingChatbot.model', e.target.value)} />
              <Input label="API Key" type="password" value={config.landingChatbot?.apiKey || ''} onChange={(e) => updateConfig('landingChatbot.apiKey', e.target.value)} />
              <Input label="Bot Name" value={config.landingChatbot?.botName || ''} onChange={(e) => updateConfig('landingChatbot.botName', e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Welcome Message</label>
                <textarea
                  value={config.landingChatbot?.welcomeMessage || ''}
                  onChange={(e) => updateConfig('landingChatbot.welcomeMessage', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.landingChatbot?.color || '#10B981'}
                    onChange={(e) => updateConfig('landingChatbot.color', e.target.value)}
                    className="h-10 w-16 rounded border border-[var(--border-color)] cursor-pointer"
                  />
                  <Input value={config.landingChatbot?.color || '#10B981'} onChange={(e) => updateConfig('landingChatbot.color', e.target.value)} className="flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Position</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="chatPosition" value="bottom-right"
                      checked={(config.landingChatbot?.position || 'bottom-right') === 'bottom-right'}
                      onChange={(e) => updateConfig('landingChatbot.position', e.target.value)}
                      className="text-fuchsia-600 focus:ring-fuchsia-500" />
                    <span className="text-sm text-[var(--text-primary)]">Bottom Right</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="chatPosition" value="bottom-left"
                      checked={config.landingChatbot?.position === 'bottom-left'}
                      onChange={(e) => updateConfig('landingChatbot.position', e.target.value)}
                      className="text-fuchsia-600 focus:ring-fuchsia-500" />
                    <span className="text-sm text-[var(--text-primary)]">Bottom Left</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
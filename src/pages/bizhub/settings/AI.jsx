import { useEffect, useState } from 'react';
import { getAISettings, updateAISettings, testAIConnection } from '../../../services/bizhub/chatbot';
import Input from '../../../components/bizhub/ui/Input';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';
import Card from '../../../components/bizhub/ui/Card';

const PROVIDERS = [
  { value: 'hdm-ai', label: 'HDM AI', needsUrl: true, needsKey: true },
  { value: 'openai', label: 'OpenAI', needsUrl: false, needsKey: true, baseUrl: 'https://api.openai.com/v1' },
  { value: 'groq', label: 'Groq', needsUrl: false, needsKey: true, baseUrl: 'https://api.groq.com/v1' },
  { value: 'anthropic', label: 'Anthropic (Claude)', needsUrl: false, needsKey: true, baseUrl: 'https://api.anthropic.com/v1' },
  { value: 'custom', label: 'Custom', needsUrl: true, needsKey: true },
];

export default function AISettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => { getAISettings().then(res => setSettings(res.data || res)).catch(console.error).finally(() => setLoading(false)); }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateAISettings(settings); alert('AI settings saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

const handleTest = async () => {
    setTesting(true);
    try {
      const baseUrl = (settings.baseUrl || '').replace(/\/$/, '');
      const apiKey = settings.apiKey || '';
      const provider = settings.provider || 'hdm-ai';
      
      // Different providers have different test endpoints
      let testUrl, testHeaders, testBody;
      
      if (provider === 'hdm-ai') {
        // HDM AI — test with a simple health or chat endpoint
        testUrl = baseUrl.replace(/\/api\/v1\/?$/, '') + '/health';
        const res = await fetch(testUrl);
        const data = await res.json().catch(() => ({}));
        if (data.status === 'healthy' || data.success || res.ok) {
          alert('✅ HDM AI server is reachable and healthy!');
        } else {
          alert('⚠️ Server reached but health check failed. API may still work.');
        }
      } else if (provider === 'openai') {
        testUrl = 'https://api.openai.com/v1/models';
        const res = await fetch(testUrl, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (res.ok) {
          alert('✅ OpenAI connection successful! API key is valid.');
        } else if (res.status === 401) {
          alert('❌ Invalid OpenAI API key.');
        } else {
          alert('❌ OpenAI API error: HTTP ' + res.status);
        }
      } else if (provider === 'groq') {
        testUrl = 'https://api.groq.com/openai/v1/models';
        const res = await fetch(testUrl, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (res.ok) {
          alert('✅ Groq connection successful! API key is valid.');
        } else if (res.status === 401) {
          alert('❌ Invalid Groq API key.');
        } else {
          alert('❌ Groq API error: HTTP ' + res.status);
        }
      } else if (provider === 'anthropic') {
        testUrl = 'https://api.anthropic.com/v1/messages';
        const res = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [{ role: 'user', content: 'test' }] }),
        });
        if (res.ok) {
          alert('✅ Anthropic connection successful! API key is valid.');
        } else if (res.status === 401 || res.status === 403) {
          alert('❌ Invalid Anthropic API key.');
        } else {
          alert('❌ Anthropic API error: HTTP ' + res.status);
        }
      } else {
        // Custom — just try to reach the base URL
        testUrl = baseUrl + '/health';
        const res = await fetch(testUrl).catch(() => null);
        if (res?.ok) {
          alert('✅ Custom server is reachable!');
        } else {
          // Try base URL directly
          const res2 = await fetch(baseUrl).catch(() => null);
          if (res2) {
            alert('⚠️ Server reached but no health endpoint found. API may still work.');
          } else {
            alert('❌ Cannot reach server. Check the Base URL.');
          }
        }
      }
    } catch (err) {
      alert('❌ Connection failed. Check the Base URL: ' + (settings.baseUrl || 'Not set'));
    }
    setTesting(false);
  };
  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  const provider = PROVIDERS.find(p => p.value === settings.provider);

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">AI Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
            <select value={settings.provider || 'hdm-ai'} onChange={(e) => {
              updateField('provider', e.target.value);
              const p = PROVIDERS.find(pr => pr.value === e.target.value);
              if (p?.baseUrl) updateField('baseUrl', p.baseUrl);
            }} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          {(provider?.needsUrl) && <Input label="Base URL" value={settings.baseUrl || ''} onChange={(e) => updateField('baseUrl', e.target.value)} />}
          {provider?.needsKey && <Input label="API Key" type="password" value={settings.apiKey || ''} onChange={(e) => updateField('apiKey', e.target.value)} placeholder="••••••••" />}
          <Input label="Model" value={settings.model || ''} onChange={(e) => updateField('model', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Tokens" type="number" value={settings.maxTokens || ''} onChange={(e) => updateField('maxTokens', Number(e.target.value))} />
            <Input label="Temperature" type="number" step="0.1" min="0" max="1" value={settings.temperature || ''} onChange={(e) => updateField('temperature', parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">System Prompt</label>
            <textarea value={settings.systemPrompt || ''} onChange={(e) => updateField('systemPrompt', e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y text-sm" />
          </div>
          <Button variant="outline" size="sm" onClick={handleTest} loading={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </Card>
      <Button onClick={handleSave} loading={saving}>Save AI Settings</Button>
    </div>
  );
}
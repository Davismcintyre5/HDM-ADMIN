import { useEffect, useState } from 'react';
import { getAISettings, updateAISettings } from '../../../services/bizhub/chatbot';
import Input from '../../../components/bizhub/ui/Input';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import Modal from '../../../components/bizhub/ui/Modal';
import Spinner from '../../../components/bizhub/ui/Spinner';
import Card from '../../../components/bizhub/ui/Card';

const PROVIDERS = [
  { value: 'hdm-ai', label: 'HDM AI', needsUrl: true, needsKey: true },
  { value: 'openai', label: 'OpenAI', needsUrl: false, needsKey: true, baseUrl: 'https://api.openai.com/v1' },
  { value: 'groq', label: 'Groq', needsUrl: false, needsKey: true, baseUrl: 'https://api.groq.com/v1' },
  { value: 'anthropic', label: 'Anthropic (Claude)', needsUrl: false, needsKey: true, baseUrl: 'https://api.anthropic.com/v1' },
  { value: 'custom', label: 'Custom', needsUrl: true, needsKey: true },
];

const MODULES = [
  { key: 'resto', label: 'RestoManagerKE', icon: '🍽️' },
  { key: 'pharma', label: 'PharmaSys', icon: '💊' },
  { key: 'electro', label: 'ElectroStore', icon: '📱' },
  { key: 'apartment', label: 'MyApartment', icon: '🏢' },
];

export default function AISettings() {
  const [settings, setSettings] = useState(null);
  const [moduleSettings, setModuleSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configModal, setConfigModal] = useState({ open: false, module: null, form: {} });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const globalRes = await getAISettings();
      setSettings(globalRes.data || globalRes);

      // Load per-module settings
      const moduleData = {};
      for (const mod of MODULES) {
        try {
          const token = localStorage.getItem('bizhub_token');
          const res = await fetch(`http://localhost:5000/api/admin/chatbot/ai/${mod.key}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await res.json();
          moduleData[mod.key] = data.data || data;
        } catch {
          moduleData[mod.key] = { enabled: false };
        }
      }
      setModuleSettings(moduleData);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateAISettings(settings); alert('Global AI settings saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleToggleModule = async (modKey, enabled) => {
    try {
      const token = localStorage.getItem('bizhub_token');
      await fetch(`http://localhost:5000/api/admin/chatbot/ai/${modKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ enabled }),
      });
      setModuleSettings(prev => ({ ...prev, [modKey]: { ...prev[modKey], enabled } }));
    } catch (err) { alert(err.message); }
  };

  const handleConfigureModule = (modKey) => {
    const modSettings = moduleSettings[modKey] || { enabled: false, provider: 'hdm-ai', baseUrl: '', apiKey: '', systemPrompt: '', model: '', maxTokens: 200, temperature: 0.7 };
    setConfigModal({ open: true, module: modKey, form: { ...modSettings } });
  };

  const handleSaveModuleConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('bizhub_token');
      await fetch(`http://localhost:5000/api/admin/chatbot/ai/${configModal.module}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(configModal.form),
      });
      setModuleSettings(prev => ({ ...prev, [configModal.module]: configModal.form }));
      setConfigModal({ open: false, module: null, form: {} });
      alert(`${MODULES.find(m => m.key === configModal.module)?.label} AI settings saved`);
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const baseUrl = (settings.baseUrl || '').replace(/\/$/, '');
      const provider = settings.provider || 'hdm-ai';
      if (provider === 'hdm-ai') {
        const res = await fetch(baseUrl.replace(/\/api\/v1\/?$/, '') + '/health');
        const data = await res.json().catch(() => ({}));
        if (data.status === 'healthy' || data.success || res.ok) {
          alert('✅ HDM AI server is reachable and healthy!');
        } else {
          alert('⚠️ Server reached but health check failed.');
        }
      } else if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', { headers: { 'Authorization': `Bearer ${settings.apiKey}` } });
        if (res.ok) alert('✅ OpenAI connection successful!');
        else if (res.status === 401) alert('❌ Invalid OpenAI API key.');
        else alert('❌ OpenAI API error: HTTP ' + res.status);
      } else if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': `Bearer ${settings.apiKey}` } });
        if (res.ok) alert('✅ Groq connection successful!');
        else if (res.status === 401) alert('❌ Invalid Groq API key.');
        else alert('❌ Groq API error: HTTP ' + res.status);
      } else if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [{ role: 'user', content: 'test' }] }),
        });
        if (res.ok) alert('✅ Anthropic connection successful!');
        else if (res.status === 401 || res.status === 403) alert('❌ Invalid Anthropic API key.');
        else alert('❌ Anthropic API error: HTTP ' + res.status);
      } else {
        const res = await fetch(baseUrl + '/health').catch(() => null);
        if (res?.ok) alert('✅ Custom server is reachable!');
        else alert('❌ Cannot reach server.');
      }
    } catch { alert('❌ Connection failed.'); }
    setTesting(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  const provider = PROVIDERS.find(p => p.value === settings.provider);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Global AI Config */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">🌐 Global AI Configuration</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">Default settings used when no module-specific AI is configured.</p>
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
          <Button variant="outline" size="sm" onClick={handleTest} loading={testing}>Test Connection</Button>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button onClick={handleSave} loading={saving}>Save Global AI Settings</Button>
        </div>
      </Card>

      {/* Per-Module AI Settings */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">📦 Per-Module AI Settings</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">Override global AI settings for specific modules. Falls back to global if not configured.</p>
        <div className="space-y-3">
          {MODULES.map(mod => {
            const modConfig = moduleSettings[mod.key] || { enabled: false };
            return (
              <div key={mod.key} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{mod.icon}</span>
                  <span className="font-medium text-[var(--text-primary)]">{mod.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={modConfig.enabled || false} onChange={(v) => handleToggleModule(mod.key, v)} />
                  <Button size="sm" variant="outline" onClick={() => handleConfigureModule(mod.key)}>Configure</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Module Config Modal */}
      <Modal
        open={configModal.open}
        onClose={() => setConfigModal({ open: false, module: null, form: {} })}
        title={`Configure ${MODULES.find(m => m.key === configModal.module)?.icon} ${MODULES.find(m => m.key === configModal.module)?.label} AI`}
        size="md"
      >
        <div className="space-y-4">
          <Toggle
            label="Enabled"
            checked={configModal.form.enabled || false}
            onChange={(v) => setConfigModal(prev => ({ ...prev, form: { ...prev.form, enabled: v } }))}
          />
          {configModal.form.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
                <select value={configModal.form.provider || 'hdm-ai'} onChange={(e) => {
                  const p = PROVIDERS.find(pr => pr.value === e.target.value);
                  setConfigModal(prev => ({ ...prev, form: { ...prev.form, provider: e.target.value, baseUrl: p?.baseUrl || '' } }));
                }} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                  {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              {(PROVIDERS.find(p => p.value === configModal.form.provider)?.needsUrl) && (
                <Input label="Base URL" value={configModal.form.baseUrl || ''} onChange={(e) => setConfigModal(prev => ({ ...prev, form: { ...prev.form, baseUrl: e.target.value } }))} />
              )}
              {(PROVIDERS.find(p => p.value === configModal.form.provider)?.needsKey) && (
                <Input label="API Key" type="password" value={configModal.form.apiKey || ''} onChange={(e) => setConfigModal(prev => ({ ...prev, form: { ...prev.form, apiKey: e.target.value } }))} placeholder="••••••••" />
              )}
              <Input label="Model" value={configModal.form.model || ''} onChange={(e) => setConfigModal(prev => ({ ...prev, form: { ...prev.form, model: e.target.value } }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Max Tokens" type="number" value={configModal.form.maxTokens || ''} onChange={(e) => setConfigModal(prev => ({ ...prev, form: { ...prev.form, maxTokens: Number(e.target.value) } }))} />
                <Input label="Temperature" type="number" step="0.1" value={configModal.form.temperature || ''} onChange={(e) => setConfigModal(prev => ({ ...prev, form: { ...prev.form, temperature: parseFloat(e.target.value) } }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">System Prompt</label>
                <textarea value={configModal.form.systemPrompt || ''} onChange={(e) => setConfigModal(prev => ({ ...prev, form: { ...prev.form, systemPrompt: e.target.value } }))} rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y text-sm" />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="secondary" onClick={() => setConfigModal({ open: false, module: null, form: {} })}>Cancel</Button>
            <Button onClick={handleSaveModuleConfig} loading={saving}>Save Module AI</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
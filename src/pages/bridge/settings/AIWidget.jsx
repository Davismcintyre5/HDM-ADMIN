import { useEffect, useState } from 'react';
import { getWidgetSettings, updateWidgetSettings, testWidgetConnection, toggleWidget } from '../../../services/bridge/aiWidget';
import Input from '../../../components/bridge/ui/Input';
import Toggle from '../../../components/bridge/ui/Toggle';
import Button from '../../../components/bridge/ui/Button';
import Spinner from '../../../components/bridge/ui/Spinner';
import Card from '../../../components/bridge/ui/Card';

const PROVIDERS = ['hdm', 'openai', 'groq', 'anthropic', 'custom'];

export default function AIWidgetSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getWidgetSettings()
      .then(res => setSettings(res.settings || res.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const updateAppearance = (key, value) => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
  const updateContext = (key, value) => setSettings(prev => ({ ...prev, contextInjection: { ...prev.contextInjection, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateWidgetSettings(settings); alert('AI Widget settings saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try { await testWidgetConnection(); alert('✅ Connection successful!'); }
    catch { alert('❌ Connection failed'); }
    setTesting(false);
  };

  const handleToggle = async () => {
    try { await toggleWidget(); setSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled })); }
    catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">AI Widget</h3>
          <Toggle checked={settings.isEnabled || false} onChange={handleToggle} />
        </div>
        {settings.isEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
              <select value={settings.provider || 'hdm'} onChange={(e) => updateField('provider', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {PROVIDERS.map(p => <option key={p} value={p}>{p === 'hdm' ? 'HDM AI' : p}</option>)}
              </select>
            </div>
            <Input label="Base URL" value={settings.baseUrl || ''} onChange={(e) => updateField('baseUrl', e.target.value)} placeholder="https://hdmai-server.onrender.com/api/v1" />
            <Input label="API Key" type="password" value={settings.apiKey || ''} onChange={(e) => updateField('apiKey', e.target.value)} placeholder="hdm_..." />
            <Input label="Model" value={settings.model || ''} onChange={(e) => updateField('model', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Temperature" type="number" step="0.1" value={settings.temperature || ''} onChange={(e) => updateField('temperature', parseFloat(e.target.value))} />
              <Input label="Max Tokens" type="number" value={settings.maxTokens || ''} onChange={(e) => updateField('maxTokens', Number(e.target.value))} />
            </div>
            <Input label="Rate Limit (per user/min)" type="number" value={settings.rateLimitPerUser || ''} onChange={(e) => updateField('rateLimitPerUser', Number(e.target.value))} />

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Appearance</h4>
              <Input label="Title" value={settings.appearance?.title || ''} onChange={(e) => updateAppearance('title', e.target.value)} />
              <Input label="Subtitle" value={settings.appearance?.subtitle || ''} onChange={(e) => updateAppearance('subtitle', e.target.value)} />
              <Input label="Welcome Message" value={settings.appearance?.welcomeMessage || ''} onChange={(e) => updateAppearance('welcomeMessage', e.target.value)} />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.appearance?.primaryColor || '#4F46E5'} onChange={(e) => updateAppearance('primaryColor', e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                    <Input value={settings.appearance?.primaryColor || ''} onChange={(e) => updateAppearance('primaryColor', e.target.value)} className="flex-1" />
                  </div>
                </div>
                <Input label="Height (px)" type="number" value={settings.appearance?.height || ''} onChange={(e) => updateAppearance('height', Number(e.target.value))} />
                <Input label="Width (px)" type="number" value={settings.appearance?.width || ''} onChange={(e) => updateAppearance('width', Number(e.target.value))} />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Position</label>
                <select value={settings.appearance?.position || 'bottom-right'} onChange={(e) => updateAppearance('position', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Context Injection</h4>
              <Toggle label="Include User Plan" checked={settings.contextInjection?.includeUserPlan || false} onChange={(v) => updateContext('includeUserPlan', v)} />
              <Toggle label="Include Usage Stats" checked={settings.contextInjection?.includeUsageStats || false} onChange={(v) => updateContext('includeUsageStats', v)} />
              <Toggle label="Include Subscription" checked={settings.contextInjection?.includeSubscription || false} onChange={(v) => updateContext('includeSubscription', v)} />
              <Toggle label="Include Recent Activity" checked={settings.contextInjection?.includeRecentActivity || false} onChange={(v) => updateContext('includeRecentActivity', v)} />
            </div>

            <Button variant="outline" size="sm" onClick={handleTest} loading={testing}>Test Connection</Button>
          </div>
        )}
      </Card>
      <Button onClick={handleSave} loading={saving}>Save AI Widget</Button>
    </div>
  );
}
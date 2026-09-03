import { useEffect, useState } from 'react';
import { getAISettings, updateAISettings } from '../../../services/rvnp/aiSettings';
import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Toggle from '../../../components/rvnp/ui/Toggle';
import Button from '../../../components/rvnp/ui/Button';
import Spinner from '../../../components/rvnp/ui/Spinner';

export default function AISettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    getAISettings()
      .then(res => setSettings(res?.data || res || {}))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true); setSuccess('');
    try {
      await updateAISettings(settings);
      setSuccess('Saved!'); setTimeout(() => setSuccess(''), 2000);
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Master Toggle */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">HDM AI</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Enable AI assistant for campus</p>
          </div>
          <Toggle checked={settings?.enabled || false} onChange={v => update('enabled', v)} />
        </div>
      </Card>

      {/* AI Identity */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Identity</h2>
        <div className="space-y-4">
          <Input label="AI Name" value={settings?.name || ''} onChange={e => update('name', e.target.value)} placeholder="HDM AI" />
          <div>
            <Input label="AI Avatar URL" value={settings?.avatarUrl || ''} onChange={e => update('avatarUrl', e.target.value)} placeholder="https://..." />
            {settings?.avatarUrl && (
              <div className="mt-2 p-3 bg-[var(--bg-secondary)] rounded-lg flex items-center gap-3">
                <img src={settings.avatarUrl} alt="AI Avatar" className="h-10 w-10 object-cover rounded-full" onError={e => e.target.style.display = 'none'} />
                <span className="text-xs text-[var(--text-muted)]">Avatar Preview</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <textarea value={settings?.description || ''} onChange={e => update('description', e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y"
              placeholder="Your campus AI assistant" />
          </div>
        </div>
      </Card>

      {/* API Configuration */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">API Configuration</h2>
        <div className="space-y-4">
          <Input label="Base URL" value={settings?.baseUrl || ''} onChange={e => update('baseUrl', e.target.value)} placeholder="https://api.hdm-ai.com" />
          <Input label="API Key" type="password" value={settings?.apiKey || ''} onChange={e => update('apiKey', e.target.value)} placeholder="hdm_xxxxxxxx" />
        </div>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Feature Toggles</h2>
        <div className="space-y-4">
          <Toggle label="Chat" checked={settings?.chatEnabled || false} onChange={v => update('chatEnabled', v)} description="Users can chat with AI" />
          <Toggle label="Content" checked={settings?.contentEnabled || false} onChange={v => update('contentEnabled', v)} description="AI helps generate content" />
          <Toggle label="Comment Analysis" checked={settings?.commentAnalysisEnabled || false} onChange={v => update('commentAnalysisEnabled', v)} description="AI analyzes comments" />
        </div>
      </Card>

      {success && <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm">{success}</div>}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Changes</Button>
      </div>
    </div>
  );
}
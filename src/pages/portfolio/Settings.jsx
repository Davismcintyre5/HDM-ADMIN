import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/portfolio/settings';
import Input from '../../components/portfolio/ui/Input';
import Toggle from '../../components/portfolio/ui/Toggle';
import Button from '../../components/portfolio/ui/Button';
import Spinner from '../../components/portfolio/ui/Spinner';
import Card from '../../components/portfolio/ui/Card';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(res => setSettings(res.data?.ai || res.ai || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSettings({ ai: settings }); alert('Saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="font-semibold mb-4">AI Chatbot</h3>
        <Toggle label="Enabled" checked={settings.enabled || false} onChange={(v) => updateField('enabled', v)} />
        {settings.enabled && (
          <div className="space-y-3 mt-3">
            <Input label="Base URL" value={settings.baseUrl || ''} onChange={(e) => updateField('baseUrl', e.target.value)} />
            <Input label="API Key" type="password" value={settings.apiKey || ''} onChange={(e) => updateField('apiKey', e.target.value)} />
            <Input label="Greeting" value={settings.greeting || ''} onChange={(e) => updateField('greeting', e.target.value)} />
            <Input label="Widget Color" type="color" value={settings.widgetColor || '#10B981'} onChange={(e) => updateField('widgetColor', e.target.value)} />
            <Input label="Widget Position" value={settings.widgetPosition || 'bottom-right'} onChange={(e) => updateField('widgetPosition', e.target.value)} />
          </div>
        )}
      </Card>
      <Button onClick={handleSave} loading={saving}>Save Settings</Button>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getSettings, bulkUpdateSettings } from '../../../services/bridge/system';
import Input from '../../../components/bridge/ui/Input';
import Toggle from '../../../components/bridge/ui/Toggle';
import Button from '../../../components/bridge/ui/Button';
import Spinner from '../../../components/bridge/ui/Spinner';
import Card from '../../../components/bridge/ui/Card';

export default function SystemSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(res => setSettings(res.settings || res.data?.settings || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await bulkUpdateSettings({ settings }); alert('Settings saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="font-semibold mb-4">General</h3>
        <div className="space-y-4">
          <Input label="App Name" value={settings.app_name || ''} onChange={(e) => updateField('app_name', e.target.value)} />
          <Input label="App Logo URL" value={settings.app_logo || ''} onChange={(e) => updateField('app_logo', e.target.value)} placeholder="/logo.png" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Contact & Support</h3>
        <div className="space-y-4">
          <Input label="Support Email" type="email" value={settings.support_email || ''} onChange={(e) => updateField('support_email', e.target.value)} placeholder="support@hdmbridge.com" />
          <Input label="Contact Phone" value={settings.contact_phone || ''} onChange={(e) => updateField('contact_phone', e.target.value)} placeholder="+254 700 000000" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Platform</h3>
        <div className="space-y-4">
          <Toggle label="Registration Open" checked={settings.registration_open || false} onChange={(v) => updateField('registration_open', v)} />
          <Toggle label="Maintenance Mode" checked={settings.maintenance_mode || false} onChange={(v) => updateField('maintenance_mode', v)} />
          {settings.maintenance_mode && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
              ⚠ Maintenance mode is ON. Public routes return 503. Admin routes remain accessible.
            </div>
          )}
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving}>Save System Settings</Button>
    </div>
  );
}
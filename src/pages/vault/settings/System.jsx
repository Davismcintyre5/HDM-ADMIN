import { useEffect, useState } from 'react';
import { getSettings, updateSystem } from '../../../services/vault/settings';
import Input from '../../../components/vault/ui/Input';
import Toggle from '../../../components/vault/ui/Toggle';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Card from '../../../components/vault/ui/Card';

const TIMEZONES = [
  'Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg', 'Africa/Cairo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Pacific/Auckland',
];

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(s => setSettings(s.settings?.system || s.system || s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSystem(settings); alert('Saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">⚙️ System Settings</h3>
        <div className="space-y-3">
          <Input label="App Name" value={settings.appName || ''} onChange={(e) => updateField('appName', e.target.value)} />
          <Input label="Tagline" value={settings.tagline || ''} onChange={(e) => updateField('tagline', e.target.value)} />
          <Input label="Support Email" type="email" value={settings.supportEmail || ''} onChange={(e) => updateField('supportEmail', e.target.value)} placeholder="support@hdmvault.com" />
          <Input label="Support Phone" value={settings.supportPhone || ''} onChange={(e) => updateField('supportPhone', e.target.value)} placeholder="+254 712 345 678" />
          <Input label="Location" value={settings.location || ''} onChange={(e) => updateField('location', e.target.value)} placeholder="Nairobi, Kenya" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Timezone</label>
            <select value={settings.timezone || 'Africa/Nairobi'} onChange={(e) => updateField('timezone', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <Input label="Logo URL" value={settings.logo || ''} onChange={(e) => updateField('logo', e.target.value)} placeholder="Cloudinary URL" />
          <Input label="Favicon URL" value={settings.favicon || ''} onChange={(e) => updateField('favicon', e.target.value)} placeholder="Cloudinary URL" />
          <Toggle label="Maintenance Mode" checked={settings.maintenanceMode || false} onChange={(v) => updateField('maintenanceMode', v)} />
          {settings.maintenanceMode && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
              ⚠ Maintenance mode is ON. Public routes return 503.
            </div>
          )}
        </div>
      </Card>
      <Button onClick={handleSave} loading={saving}>💾 Save System Settings</Button>
    </div>
  );
}
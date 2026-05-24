import { useEffect, useState } from 'react';
import { getSystem, updateSystem } from '../../../services/smartpos/system';
import Input from '../../../components/smartpos/ui/Input';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSystem()
      .then(res => setSettings(res.settings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSystem(settings); alert('Settings saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* General */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">General</h3>
        <Input label="App Name" value={settings.appName || ''} onChange={(e) => updateField('appName', e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Primary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={settings.primaryColor || '#2563eb'} onChange={(e) => updateField('primaryColor', e.target.value)} className="h-10 w-16 rounded border border-[var(--border-color)] cursor-pointer" />
            <Input value={settings.primaryColor || ''} onChange={(e) => updateField('primaryColor', e.target.value)} className="flex-1" />
          </div>
        </div>
        <Input label="Logo URL" value={settings.logoUrl || ''} onChange={(e) => updateField('logoUrl', e.target.value)} placeholder="https://cloudinary.com/logo.png" />
      </div>

      {/* Downloads */}
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">App Downloads</h3>
        <p className="text-xs text-[var(--text-muted)]">These appear on the public landing page</p>

        <div className="p-4 rounded-lg border border-[var(--border-color)] space-y-3">
          <Toggle
            label="Mobile App Download"
            description="Show mobile app download button on landing page"
            checked={settings.mobileAppEnabled || false}
            onChange={(v) => updateField('mobileAppEnabled', v)}
          />
          {settings.mobileAppEnabled && (
            <div className="pl-2 border-l-2 border-blue-300 dark:border-blue-700">
              <Input
                label="Mobile App URL"
                value={settings.mobileAppUrl || ''}
                onChange={(e) => updateField('mobileAppUrl', e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=com.smartpos"
              />
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg border border-[var(--border-color)] space-y-3">
          <Toggle
            label="Desktop App Download"
            description="Show desktop app download button on landing page"
            checked={settings.desktopAppEnabled || false}
            onChange={(v) => updateField('desktopAppEnabled', v)}
          />
          {settings.desktopAppEnabled && (
            <div className="pl-2 border-l-2 border-blue-300 dark:border-blue-700">
              <Input
                label="Desktop App URL"
                value={settings.desktopAppUrl || ''}
                onChange={(e) => updateField('desktopAppUrl', e.target.value)}
                placeholder="https://smartpos.com/downloads/smartpos-setup.exe"
              />
            </div>
          )}
        </div>
      </div>

      {/* Maintenance */}
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Maintenance</h3>
        <Toggle
          label="Maintenance Mode"
          description="Block public and client routes with 503"
          checked={settings.maintenanceMode || false}
          onChange={(v) => updateField('maintenanceMode', v)}
        />
        {settings.maintenanceMode && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
            ⚠ Maintenance mode is ON. All public and client routes return 503. Admin routes remain accessible.
          </div>
        )}
      </div>

      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}
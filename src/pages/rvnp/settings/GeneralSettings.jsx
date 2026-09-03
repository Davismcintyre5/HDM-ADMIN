import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Toggle from '../../../components/rvnp/ui/Toggle';
import Button from '../../../components/rvnp/ui/Button';

export default function GeneralSettings({ settings, setSettings, onSave, saving }) {
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave({
      appName: settings.appName,
      tagline: settings.tagline,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      emailLogoUrl: settings.emailLogoUrl,
      maintenanceMode: settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled,
      smsNotifications: settings.smsNotifications,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Platform</h2>
        <div className="space-y-4">
          <Input label="App Name" value={settings.appName || ''} onChange={e => update('appName', e.target.value)} placeholder="RVNP Campus Hub" />
          <Input label="Tagline" value={settings.tagline || ''} onChange={e => update('tagline', e.target.value)} placeholder="RVNP Connected" />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Support Email" type="email" value={settings.supportEmail || ''} onChange={e => update('supportEmail', e.target.value)} placeholder="support@rvnp.ac.ke" />
          <Input label="Support Phone" value={settings.supportPhone || ''} onChange={e => update('supportPhone', e.target.value)} placeholder="+254700000000" />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Branding</h2>
        <div className="space-y-4">
          <div>
            <Input label="Logo URL" value={settings.logoUrl || ''} onChange={e => update('logoUrl', e.target.value)} placeholder="https://..." />
            {settings.logoUrl && (
              <div className="mt-2 p-3 bg-[var(--bg-secondary)] rounded-lg flex items-center gap-3">
                <img src={settings.logoUrl} alt="Logo preview" className="h-10 object-contain rounded" onError={e => e.target.style.display = 'none'} />
                <span className="text-xs text-[var(--text-muted)]">Logo Preview</span>
              </div>
            )}
          </div>
          <Input label="Favicon URL" value={settings.faviconUrl || ''} onChange={e => update('faviconUrl', e.target.value)} placeholder="https://..." />
          <Input label="Email Logo URL" value={settings.emailLogoUrl || ''} onChange={e => update('emailLogoUrl', e.target.value)} placeholder="https://..." />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Access & Notifications</h2>
        <div className="space-y-4">
          <Toggle label="Maintenance Mode" checked={settings.maintenanceMode || false} onChange={v => update('maintenanceMode', v)} description="Take platform offline for maintenance" />
          <Toggle label="Registration Enabled" checked={settings.registrationEnabled || false} onChange={v => update('registrationEnabled', v)} description="Allow new user registrations" />
          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Notifications</h3>
            <div className="space-y-3">
              <Toggle label="SMS Notifications" checked={settings.smsNotifications || false} onChange={v => update('smsNotifications', v)} />
              <Toggle label="Email Notifications" checked={settings.emailNotifications || false} onChange={v => update('emailNotifications', v)} />
              <Toggle label="Push Notifications" checked={settings.pushNotifications || false} onChange={v => update('pushNotifications', v)} />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save General</Button>
      </div>
    </div>
  );
}
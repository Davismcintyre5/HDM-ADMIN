import Card from '../../../components/eduprime/ui/Card';
import Toggle from '../../../components/eduprime/ui/Toggle';
import Button from '../../../components/eduprime/ui/Button';

export default function TogglesSettings({ settings, setSettings, onSave, saving }) {
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave({
      email_enabled: settings.email_enabled,
      sms_enabled: settings.sms_enabled,
      redis_enabled: settings.redis_enabled,
      cloudinary_enabled: settings.cloudinary_enabled,
      socket_enabled: settings.socket_enabled,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Integrations</h2>
        <div className="space-y-4">
          <Toggle label="Email Enabled" checked={settings.email_enabled || false} onChange={v => update('email_enabled', v)} description="Enable email notifications" />
          <Toggle label="SMS Enabled" checked={settings.sms_enabled || false} onChange={v => update('sms_enabled', v)} description="Enable SMS notifications" />
          <Toggle label="Redis Enabled" checked={settings.redis_enabled || false} onChange={v => update('redis_enabled', v)} description="Enable Redis caching" />
          <Toggle label="Cloudinary Enabled" checked={settings.cloudinary_enabled || false} onChange={v => update('cloudinary_enabled', v)} description="Enable image uploads" />
          <Toggle label="Socket Enabled" checked={settings.socket_enabled || false} onChange={v => update('socket_enabled', v)} description="Enable real-time features" />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Toggles</Button>
      </div>
    </div>
  );
}
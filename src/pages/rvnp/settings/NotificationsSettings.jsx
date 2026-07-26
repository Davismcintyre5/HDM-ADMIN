import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Toggle from '../../../components/rvnp/ui/Toggle';
import Button from '../../../components/rvnp/ui/Button';

export default function NotificationsSettings({ settings, setSettings, onSave, saving }) {
  const email = settings.email || {};
  const sms = settings.sms || {};

  const setEmail = (key, value) => setSettings(prev => ({ ...prev, email: { ...prev.email, [key]: value } }));
  const setSms = (key, value) => setSettings(prev => ({ ...prev, sms: { ...prev.sms, [key]: value } }));

  const handleSave = () => onSave({ email: settings.email, sms: settings.sms });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Email */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Settings</h2>
        <div className="space-y-4">
          <Input label="Sender Name" value={email.senderName || ''} onChange={e => setEmail('senderName', e.target.value)} placeholder="RVNP Campus Hub" />
          <Input label="Sender Email" type="email" value={email.senderEmail || ''} onChange={e => setEmail('senderEmail', e.target.value)} />
        </div>
      </Card>

      {/* SMS */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">SMS Settings</h2>
        <div className="space-y-4">
          <Input label="Sender ID" value={sms.senderId || ''} onChange={e => setSms('senderId', e.target.value)} placeholder="HDM" />
          <Toggle label="Time Restriction" checked={sms.timeRestrictionEnabled || false} onChange={v => setSms('timeRestrictionEnabled', v)} description="Only send SMS during daytime hours" />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Notifications</Button>
      </div>
    </div>
  );
}
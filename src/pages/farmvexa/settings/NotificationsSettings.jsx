import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Button from '../../../components/farmvexa/ui/Button';

export default function NotificationsSettings({ settings, setSettings, onSave, saving }) {
  const email = settings.email || {};
  const sms = settings.sms || {};

  const updateEmail = (key, value) => setSettings(prev => ({ ...prev, email: { ...prev.email, [key]: value } }));
  const updateSms = (key, value) => setSettings(prev => ({ ...prev, sms: { ...prev.sms, [key]: value } }));

  const handleSave = () => onSave({ email: settings.email, sms: settings.sms });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Email */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Configuration</h2>
        <div className="space-y-4">
          <Toggle label="Enabled" checked={email.enabled || false} onChange={v => updateEmail('enabled', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="From Email" type="email" value={email.fromEmail || ''} onChange={e => updateEmail('fromEmail', e.target.value)} />
            <Input label="From Name" value={email.fromName || ''} onChange={e => updateEmail('fromName', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* SMS */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">SMS Configuration</h2>
        <div className="space-y-4">
          <Toggle label="Enabled" checked={sms.enabled || false} onChange={v => updateSms('enabled', v)} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
            <select value={sms.provider || 'brevo'} onChange={e => updateSms('provider', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['brevo', 'twilio', 'africastalking'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Input label="Sender ID" value={sms.senderId || ''} onChange={e => updateSms('senderId', e.target.value)} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Notifications</Button>
      </div>
    </div>
  );
}
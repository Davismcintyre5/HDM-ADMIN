import Card from '../../../components/marketbridge/ui/Card';
import Input from '../../../components/marketbridge/ui/Input';
import Button from '../../../components/marketbridge/ui/Button';

const PROVIDERS = ['brevo', 'hdmBridge'];

export default function EmailSmsSettings({ settings, setSettings, onSave, saving }) {
  const getVal = (key, fallback = '') => settings[key] || fallback;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
            <div className="flex gap-2">
              {PROVIDERS.map(p => (
                <Button key={p} size="sm" variant={getVal('email_provider') === p ? 'primary' : 'secondary'}
                  onClick={() => onSave('email_provider', p)}>
                  {p === 'brevo' ? 'Brevo' : 'HDM Bridge'}
                </Button>
              ))}
            </div>
          </div>
          <Input label="Sender Name" value={getVal('email_sender_name')} onChange={e => setSettings(prev => ({ ...prev, email_sender_name: e.target.value }))} />
          <Input label="Sender Email" type="email" value={getVal('email_sender_email')} onChange={e => setSettings(prev => ({ ...prev, email_sender_email: e.target.value }))} />
        </div>
        <Button className="mt-4" onClick={() => onSave('email_provider', settings.email_provider)} loading={saving}>Save Email</Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">SMS Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
            <div className="flex gap-2">
              {PROVIDERS.map(p => (
                <Button key={p} size="sm" variant={getVal('sms_provider') === p ? 'primary' : 'secondary'}
                  onClick={() => onSave('sms_provider', p)}>
                  {p === 'brevo' ? 'Brevo' : 'HDM Bridge'}
                </Button>
              ))}
            </div>
          </div>
          <Input label="Sender ID" value={getVal('sms_sender_id')} onChange={e => setSettings(prev => ({ ...prev, sms_sender_id: e.target.value }))} />
        </div>
        <Button className="mt-4" onClick={() => onSave('sms_provider', settings.sms_provider)} loading={saving}>Save SMS</Button>
      </Card>
    </div>
  );
}
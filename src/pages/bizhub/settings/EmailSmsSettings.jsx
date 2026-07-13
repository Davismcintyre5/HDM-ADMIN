import Card from '../../../components/bizhub/ui/Card';
import Input from '../../../components/bizhub/ui/Input';
import Button from '../../../components/bizhub/ui/Button';

const PROVIDERS = ['brevo', 'hdmBridge'];

export default function EmailSmsSettings({ settings, setSettings, onSave, saving }) {
  const getVal = (key, fallback = '') => settings[key] || fallback;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Email Configuration */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Provider</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
            <div className="flex gap-2">
              {PROVIDERS.map(p => (
                <Button
                  key={p}
                  size="sm"
                  variant={getVal('email_provider') === p ? 'primary' : 'secondary'}
                  onClick={() => onSave('email_provider', p)}
                >
                  {p === 'brevo' ? 'Brevo' : 'HDM Bridge'}
                </Button>
              ))}
            </div>
          </div>
          <Input
            label="Sender Name"
            value={getVal('sender_name')}
            onChange={e => setSettings(prev => ({ ...prev, sender_name: e.target.value }))}
            placeholder="BizHub"
          />
          <Input
            label="Sender Email"
            type="email"
            value={getVal('sender_email')}
            onChange={e => setSettings(prev => ({ ...prev, sender_email: e.target.value }))}
            placeholder="noreply@bizhub.co.ke"
          />
          <Button
            size="sm"
            onClick={async () => {
              await onSave('sender_name', settings.sender_name);
              await onSave('sender_email', settings.sender_email);
            }}
            loading={saving}
          >
            Save Email
          </Button>
        </div>
      </Card>

      {/* SMS Configuration */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">SMS Provider</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
            <div className="flex gap-2">
              {PROVIDERS.map(p => (
                <Button
                  key={p}
                  size="sm"
                  variant={getVal('sms_provider') === p ? 'primary' : 'secondary'}
                  onClick={() => onSave('sms_provider', p)}
                >
                  {p === 'brevo' ? 'Brevo' : 'HDM Bridge'}
                </Button>
              ))}
            </div>
          </div>
          <Input
            label="Sender ID"
            value={getVal('sms_sender_id')}
            onChange={e => setSettings(prev => ({ ...prev, sms_sender_id: e.target.value }))}
            placeholder="BizHub"
          />
          <Button
            size="sm"
            onClick={() => onSave('sms_sender_id', settings.sms_sender_id)}
            loading={saving}
          >
            Save SMS
          </Button>
        </div>
      </Card>
    </div>
  );
}
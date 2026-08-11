import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Button from '../../../components/farmvexa/ui/Button';

export default function EmailSettings({ settings, setSettings, onSave, saving }) {
  const email = settings.email || {};

  const update = (key, value) => setSettings(prev => ({ ...prev, email: { ...prev.email, [key]: value } }));
  const handleSave = () => onSave({ email: settings.email });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Configuration</h2>
        <div className="space-y-4">
          <Toggle label="Enabled" checked={email.enabled || false} onChange={v => update('enabled', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="From Email" type="email" value={email.fromEmail || ''} onChange={e => update('fromEmail', e.target.value)} />
            <Input label="From Name" value={email.fromName || ''} onChange={e => update('fromName', e.target.value)} />
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Email</Button>
      </div>
    </div>
  );
}
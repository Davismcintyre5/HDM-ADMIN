import Card from '../../../components/smartpos/ui/Card';
import Input from '../../../components/smartpos/ui/Input';
import Button from '../../../components/smartpos/ui/Button';

export default function GeneralSettings({ settings, setSettings, onSave, saving }) {
  const update = (section, key, value) => setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  const handleSave = () => onSave({ branding: settings.branding, email: settings.email, sms: settings.sms });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Platform</h2>
        <div className="space-y-4">
          <Input label="Platform Name" value={settings.branding?.platformName || ''} onChange={e => update('branding', 'platformName', e.target.value)} />
          <Input label="Support Email" type="email" value={settings.branding?.supportEmail || ''} onChange={e => update('branding', 'supportEmail', e.target.value)} />
          <Input label="Support Phone" value={settings.branding?.supportPhone || ''} onChange={e => update('branding', 'supportPhone', e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save</Button>
      </div>
    </div>
  );
}
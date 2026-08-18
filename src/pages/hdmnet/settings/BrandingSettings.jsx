import Card from '../../../components/hdmnet/ui/Card';
import Input from '../../../components/hdmnet/ui/Input';
import Button from '../../../components/hdmnet/ui/Button';

export default function BrandingSettings({ settings, setSettings, onSave, saving }) {
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleSave = () => onSave(settings, 'branding');

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Branding</h2>
        <div className="space-y-4">
          <Input label="Logo URL" value={settings.logo || ''} onChange={e => update('logo', e.target.value)} />
          <Input label="Favicon URL" value={settings.favicon || ''} onChange={e => update('favicon', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input label="Primary Color" value={settings.primaryColor || '#3B82F6'} onChange={e => update('primaryColor', e.target.value)} />
              <div className="mt-2 w-10 h-10 rounded-lg border" style={{ backgroundColor: settings.primaryColor || '#3B82F6' }} />
            </div>
            <div>
              <Input label="Secondary Color" value={settings.secondaryColor || '#1E293B'} onChange={e => update('secondaryColor', e.target.value)} />
              <div className="mt-2 w-10 h-10 rounded-lg border" style={{ backgroundColor: settings.secondaryColor || '#1E293B' }} />
            </div>
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Branding</Button>
      </div>
    </div>
  );
}
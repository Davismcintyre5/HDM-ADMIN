import Card from '../../../components/hdmnet/ui/Card';
import Input from '../../../components/hdmnet/ui/Input';
import Toggle from '../../../components/hdmnet/ui/Toggle';
import Button from '../../../components/hdmnet/ui/Button';

export default function MaintenanceSettings({ settings, setSettings, onSave, saving }) {
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleSave = () => onSave(settings, 'maintenance');

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Maintenance</h2>
        <div className="space-y-4">
          <Toggle label="Maintenance Mode" checked={settings.maintenanceMode || false} onChange={v => update('maintenanceMode', v)} />
          <Input label="Maintenance Message" value={settings.maintenanceMessage || ''} onChange={e => update('maintenanceMessage', e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Maintenance</Button>
      </div>
    </div>
  );
}
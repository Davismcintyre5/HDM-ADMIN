import Card from '../../../components/hdmnet/ui/Card';
import Input from '../../../components/hdmnet/ui/Input';
import Button from '../../../components/hdmnet/ui/Button';

export default function CommissionSettings({ settings, setSettings, onSave, saving }) {
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleSave = () => onSave(settings, 'commission');

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Commission</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Commission Rate (%)" type="number" value={settings.commissionRate || ''} onChange={e => update('commissionRate', +e.target.value)} />
          <Input label="Minimum Commission" type="number" value={settings.minimumCommission || ''} onChange={e => update('minimumCommission', +e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Commission</Button>
      </div>
    </div>
  );
}
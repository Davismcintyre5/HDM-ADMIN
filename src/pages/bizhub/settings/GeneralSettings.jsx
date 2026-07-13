import Card from '../../../components/bizhub/ui/Card';
import Input from '../../../components/bizhub/ui/Input';
import Button from '../../../components/bizhub/ui/Button';

export default function GeneralSettings({ settings, setSettings, onSave, saving }) {
  const getVal = (key, fallback = '') => settings[key] || fallback;

  const handleSaveAll = () => {
    const keys = ['system_name', 'support_email', 'support_phone', 'address'];
    keys.forEach(k => onSave(k, settings[k], 'general', true));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Platform Identity</h2>
        <div className="space-y-4">
          <Input label="Platform Name" value={getVal('system_name')} onChange={e => setSettings(prev => ({ ...prev, system_name: e.target.value }))} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Contact</h2>
        <div className="space-y-4">
          <Input label="Support Email" type="email" value={getVal('support_email')} onChange={e => setSettings(prev => ({ ...prev, support_email: e.target.value }))} />
          <Input label="Support Phone" value={getVal('support_phone')} onChange={e => setSettings(prev => ({ ...prev, support_phone: e.target.value }))} />
          <Input label="Address" value={getVal('address')} onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))} />
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Platform name & contact details</span>
          <Button size="sm" onClick={handleSaveAll} loading={saving}>Save General</Button>
        </div>
      </Card>
    </div>
  );
}
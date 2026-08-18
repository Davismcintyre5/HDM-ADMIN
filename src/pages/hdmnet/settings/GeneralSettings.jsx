import Card from '../../../components/hdmnet/ui/Card';
import Input from '../../../components/hdmnet/ui/Input';
import Toggle from '../../../components/hdmnet/ui/Toggle';
import Button from '../../../components/hdmnet/ui/Button';

export default function GeneralSettings({ settings, setSettings, onSave, saving }) {
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleSave = () => onSave(settings);

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">General</h2>
        <div className="space-y-4">
          <Input label="Platform Name" value={settings.platformName || ''} onChange={e => update('platformName', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Support Email" type="email" value={settings.supportEmail || ''} onChange={e => update('supportEmail', e.target.value)} />
            <Input label="Support Phone" value={settings.supportPhone || ''} onChange={e => update('supportPhone', e.target.value)} />
          </div>
          <Input label="Footer Text" value={settings.footerText || ''} onChange={e => update('footerText', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Upload Provider</label>
            <select value={settings.uploadProvider || 'local'} onChange={e => update('uploadProvider', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['local', 'cloudinary'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Toggle label="Email Enabled" checked={settings.emailEnabled || false} onChange={v => update('emailEnabled', v)} />
            <Toggle label="SMS Enabled" checked={settings.smsEnabled || false} onChange={v => update('smsEnabled', v)} />
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save General</Button>
      </div>
    </div>
  );
}
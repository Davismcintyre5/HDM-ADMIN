import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Button from '../../../components/farmvexa/ui/Button';

export default function SystemSettings({ settings, setSettings, onSave, saving }) {
  const system = settings.system || {};

  const update = (key, value) => setSettings(prev => ({ ...prev, system: { ...prev.system, [key]: value } }));
  const handleSave = () => onSave({ system: settings.system });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">General</h2>
        <div className="space-y-4">
          <Input label="App Name" value={system.appName || ''} onChange={e => update('appName', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Support Phone" value={system.supportPhone || ''} onChange={e => update('supportPhone', e.target.value)} />
            <Input label="Support Email" type="email" value={system.supportEmail || ''} onChange={e => update('supportEmail', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">WhatsApp</h2>
        <div className="space-y-4">
          <Input label="WhatsApp Number" value={system.whatsappNumber || ''} onChange={e => update('whatsappNumber', e.target.value)} placeholder="+254768784909" />
          <Toggle label="Show WhatsApp Button" checked={system.showWhatsapp || false} onChange={v => update('showWhatsapp', v)} description="Show floating WhatsApp button on farmer dashboard" />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Configuration</h2>
        <div className="space-y-4">
          <Input label="Data Retention (days)" type="number" value={system.dataRetentionDays || ''} onChange={e => update('dataRetentionDays', +e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Timezone</label>
              <select value={system.timezone || 'Africa/Nairobi'} onChange={e => update('timezone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['Africa/Nairobi', 'Africa/Lagos', 'UTC'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Language</label>
              <select value={system.language || 'en'} onChange={e => update('language', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['en', 'sw'].map(l => <option key={l} value={l}>{l === 'en' ? 'English' : 'Kiswahili'}</option>)}
              </select>
            </div>
          </div>
          <Toggle label="Allow Self Registration" checked={system.allowSelfRegistration || false} onChange={v => update('allowSelfRegistration', v)} />
          <Toggle label="Auto Backup" checked={system.autoBackup || false} onChange={v => update('autoBackup', v)} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save System</Button>
      </div>
    </div>
  );
}
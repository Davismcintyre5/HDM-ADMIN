import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Button from '../../../components/rvnp/ui/Button';

export default function GeneralSettings({ settings, setSettings, onSave, saving }) {
  const general = settings.general || {};

  const setGeneral = (key, value) => setSettings(prev => ({ ...prev, general: { ...prev.general, [key]: value } }));

  const handleSave = () => onSave({ general: settings.general });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Platform Identity</h2>
        <div className="space-y-4">
          <Input label="System Name" value={general.systemName || ''} onChange={e => setGeneral('systemName', e.target.value)} placeholder="RVNP Campus Hub" />
          <Input label="Tagline" value={general.tagline || ''} onChange={e => setGeneral('tagline', e.target.value)} placeholder="The Digital Quad of Rift Valley National Polytechnic" />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Contact</h2>
        <div className="space-y-4">
          <Input label="Support Email" type="email" value={general.supportEmail || ''} onChange={e => setGeneral('supportEmail', e.target.value)} />
          <Input label="Support Phone" value={general.supportPhone || ''} onChange={e => setGeneral('supportPhone', e.target.value)} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Localization</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Language</label>
            <select value={general.language || 'en'} onChange={e => setGeneral('language', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['en', 'sw'].map(l => <option key={l} value={l}>{l === 'en' ? 'English' : 'Kiswahili'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Timezone</label>
            <select value={general.timezone || 'Africa/Nairobi'} onChange={e => setGeneral('timezone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg', 'UTC'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Branding</h2>
        <div className="space-y-4">
          <Input label="Logo URL" value={general.logo || ''} onChange={e => setGeneral('logo', e.target.value)} />
          <Input label="Favicon URL" value={general.favicon || ''} onChange={e => setGeneral('favicon', e.target.value)} />
          <Input label="Maintenance Message" value={general.maintenanceMessage || ''} onChange={e => setGeneral('maintenanceMessage', e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save General</Button>
      </div>
    </div>
  );
}
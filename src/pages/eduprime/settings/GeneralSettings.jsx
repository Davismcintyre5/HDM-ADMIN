import Card from '../../../components/eduprime/ui/Card';
import Input from '../../../components/eduprime/ui/Input';
import Toggle from '../../../components/eduprime/ui/Toggle';
import Button from '../../../components/eduprime/ui/Button';

export default function GeneralSettings({ settings, setSettings, onSave, saving }) {
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave({
      app_name: settings.app_name,
      support_email: settings.support_email,
      support_phone: settings.support_phone,
      default_currency: settings.default_currency,
      default_country: settings.default_country,
      max_schools: settings.max_schools,
      allow_self_registration: settings.allow_self_registration,
      maintenance_mode: settings.maintenance_mode,
      trial_days: settings.trial_days,
      timezone: settings.timezone,
      date_format: settings.date_format,
      logo_url: settings.logo_url,
      favicon_url: settings.favicon_url,
      primary_color: settings.primary_color,
      accent_color: settings.accent_color,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Platform</h2>
        <div className="space-y-4">
          <Input label="App Name" value={settings.app_name || ''} onChange={e => update('app_name', e.target.value)} />
          <div>
            <Input label="Logo URL" value={settings.logo_url || ''} onChange={e => update('logo_url', e.target.value)} />
            {settings.logo_url && (
              <div className="mt-2 p-3 bg-[var(--bg-secondary)] rounded-lg flex items-center gap-3">
                <img src={settings.logo_url} alt="Logo preview" className="h-10 object-contain rounded" onError={e => e.target.style.display = 'none'} />
                <span className="text-xs text-[var(--text-muted)]">Logo Preview</span>
              </div>
            )}
          </div>
          <div>
            <Input label="Favicon URL" value={settings.favicon_url || ''} onChange={e => update('favicon_url', e.target.value)} />
            {settings.favicon_url && (
              <div className="mt-2 p-3 bg-[var(--bg-secondary)] rounded-lg flex items-center gap-3">
                <img src={settings.favicon_url} alt="Favicon preview" className="h-6 w-6 object-contain rounded" onError={e => e.target.style.display = 'none'} />
                <span className="text-xs text-[var(--text-muted)]">Favicon Preview</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Contact</h2>
        <div className="space-y-4">
          <Input label="Support Email" type="email" value={settings.support_email || ''} onChange={e => update('support_email', e.target.value)} />
          <Input label="Support Phone" value={settings.support_phone || ''} onChange={e => update('support_phone', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Defaults</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Default Currency</label>
            <select value={settings.default_currency || 'KES'} onChange={e => update('default_currency', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['KES', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Default Country" value={settings.default_country || ''} onChange={e => update('default_country', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Timezone</label>
            <select value={settings.timezone || 'Africa/Nairobi'} onChange={e => update('timezone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg', 'UTC'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Date Format" value={settings.date_format || 'DD/MM/YYYY'} onChange={e => update('date_format', e.target.value)} />
        </div>
        <div className="mt-4">
          <Input label="Trial Days" type="number" value={settings.trial_days || 0} onChange={e => update('trial_days', +e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Limits & Access</h2>
        <div className="space-y-4">
          <Input label="Max Schools (0 = unlimited)" type="number" value={settings.max_schools || 0} onChange={e => update('max_schools', +e.target.value)} />
          <Toggle label="Allow Self Registration" checked={settings.allow_self_registration || false} onChange={v => update('allow_self_registration', v)} />
          <Toggle label="Maintenance Mode" checked={settings.maintenance_mode || false} onChange={v => update('maintenance_mode', v)} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Theme</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input label="Primary Color" value={settings.primary_color || '#0d1b2a'} onChange={e => update('primary_color', e.target.value)} />
            <div className="mt-2 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg border border-[var(--border-color)]" style={{ backgroundColor: settings.primary_color || '#0d1b2a' }} />
              <span className="text-xs text-[var(--text-muted)]">{settings.primary_color || '#0d1b2a'}</span>
            </div>
          </div>
          <div>
            <Input label="Accent Color" value={settings.accent_color || '#f0a500'} onChange={e => update('accent_color', e.target.value)} />
            <div className="mt-2 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg border border-[var(--border-color)]" style={{ backgroundColor: settings.accent_color || '#f0a500' }} />
              <span className="text-xs text-[var(--text-muted)]">{settings.accent_color || '#f0a500'}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save General</Button>
      </div>
    </div>
  );
}
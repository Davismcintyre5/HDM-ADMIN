import Card from '../../../components/nexguard/ui/Card';
import Input from '../../../components/nexguard/ui/Input';
import Toggle from '../../../components/nexguard/ui/Toggle';
import Button from '../../../components/nexguard/ui/Button';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR', 'GHS', 'TZS', 'UGX'];

export default function GeneralSettings({ settings, setSettings, onSave, saving }) {
  const getVal = (key, fallback = '') => settings[key] ?? fallback;

  const handleSave = () => {
    onSave({
      appName: settings.appName,
      logo: settings.logo,
      favicon: settings.favicon,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      currency: settings.currency,
      rateLimitWindow: settings.rateLimitWindow,
      rateLimitMax: settings.rateLimitMax,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Platform Identity</h2>
        <div className="space-y-4">
          <Input
            label="App Name"
            value={getVal('appName')}
            onChange={e => setSettings(prev => ({ ...prev, appName: e.target.value }))}
          />
          <Input
            label="Logo URL"
            value={getVal('logo')}
            onChange={e => setSettings(prev => ({ ...prev, logo: e.target.value }))}
          />
          <Input
            label="Favicon URL"
            value={getVal('favicon')}
            onChange={e => setSettings(prev => ({ ...prev, favicon: e.target.value }))}
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Contact</h2>
        <div className="space-y-4">
          <Input
            label="Support Email"
            type="email"
            value={getVal('supportEmail')}
            onChange={e => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
          />
          <Input
            label="Support Phone"
            value={getVal('supportPhone')}
            onChange={e => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Localization</h2>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Currency</label>
          <select
            value={getVal('currency', 'USD')}
            onChange={e => setSettings(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]"
          >
            {CURRENCIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Rate Limits</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Window (minutes)"
            type="number"
            value={getVal('rateLimitWindow', '15')}
            onChange={e => setSettings(prev => ({ ...prev, rateLimitWindow: e.target.value }))}
          />
          <Input
            label="Max Requests"
            type="number"
            value={getVal('rateLimitMax', '100')}
            onChange={e => setSettings(prev => ({ ...prev, rateLimitMax: e.target.value }))}
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Maintenance Mode</h2>
        <Toggle
          label="Maintenance Mode"
          checked={getVal('maintenanceMode') === true || getVal('maintenanceMode') === 'true'}
          onChange={v => setSettings(prev => ({ ...prev, maintenanceMode: v }))}
          description="Enable to take site offline for users"
        />
        {getVal('maintenanceMode') === true || getVal('maintenanceMode') === 'true' ? (
          <div className="mt-3">
            <Input
              label="Maintenance Message"
              value={getVal('maintenanceMessage')}
              onChange={e => setSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
            />
          </div>
        ) : null}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save General</Button>
      </div>
    </div>
  );
}
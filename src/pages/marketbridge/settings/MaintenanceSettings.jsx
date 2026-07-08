import Card from '../../../components/marketbridge/ui/Card';
import Toggle from '../../../components/marketbridge/ui/Toggle';

export default function MaintenanceSettings({ settings, setSettings, onToggle }) {
  const getVal = (key) => settings[key] || '';
  const isTrue = (key) => getVal(key) === 'true' || getVal(key) === true;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Maintenance Mode</h2>
        <Toggle label="Enable Maintenance Mode" checked={isTrue('maintenance_mode')} onChange={v => onToggle('maintenance_mode', v)}
          description="When enabled, only admins can access the site. Users see a maintenance page." />
        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Maintenance Message</label>
          <textarea value={getVal('maintenance_message')} onChange={e => setSettings(prev => ({ ...prev, maintenance_message: e.target.value }))} rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-violet-500 resize-y text-sm"
            placeholder="We'll be back shortly..." />
        </div>
      </Card>
    </div>
  );
}
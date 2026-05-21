import { useEffect, useState } from 'react';
import { getMaintenanceSettings, updateMaintenanceSettings } from '../../../services/hdmerp/settings';
import Input from '../../../components/hdmerp/ui/Input';
import Toggle from '../../../components/hdmerp/ui/Toggle';
import Button from '../../../components/hdmerp/ui/Button';
import Spinner from '../../../components/hdmerp/ui/Spinner';

export default function MaintenanceSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMaintenanceSettings()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMaintenanceSettings(data);
      alert('Maintenance settings saved');
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="p-4 rounded-lg border border-[var(--border-color)]">
        <Toggle
          label="Maintenance Mode"
          description="When enabled, all tenants will see the maintenance page instead of their dashboard."
          checked={data.maintenanceMode || false}
          onChange={(v) => setData(prev => ({ ...prev, maintenanceMode: v }))}
        />

        {data.maintenanceMode && (
          <div className="mt-4 pl-2 border-l-2 border-yellow-500 space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Maintenance Message
              </label>
              <textarea
                value={data.maintenanceMessage || ''}
                onChange={(e) => setData(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                placeholder="We are currently performing scheduled maintenance. Please check back soon."
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                This message will be shown to all users while maintenance mode is active.
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase mb-2">
                Preview — Maintenance Page
              </p>
              <div className="text-center py-4">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-1">
                  Under Maintenance
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {data.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}
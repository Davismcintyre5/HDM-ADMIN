import { useEffect, useState } from 'react';
import { getFeatureFlags, updateSetting, bulkUpdateSettings } from '../../../services/bizhub/settings';
import Card from '../../../components/bizhub/ui/Card';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';

const MODULES = [
  { key: 'module_resto', label: '🍽️ RestoManagerKE', icon: '🍽️' },
  { key: 'module_pharma', label: '💊 PharmaSys', icon: '💊' },
  { key: 'module_apartment', label: '🏢 MyApartment', icon: '🏢' },
  { key: 'module_electro', label: '🔌 ElectroStore', icon: '🔌' },
  { key: 'module_cyber', label: '💻 DigitalManager', icon: '💻' },
];

const MAINTENANCE = [
  { key: 'maintenance_platform', label: '🌐 Full Platform', scope: 'Everything except admin & health' },
  { key: 'maintenance_landing', label: '🏠 Landing Page', scope: 'Public website only' },
  { key: 'maintenance_resto', label: '🍽️ RestoManagerKE', scope: 'Restaurant module only' },
  { key: 'maintenance_pharma', label: '💊 PharmaSys', scope: 'Pharmacy module only' },
  { key: 'maintenance_apartment', label: '🏢 MyApartment', scope: 'Apartment module only' },
  { key: 'maintenance_electro', label: '🔌 ElectroStore', scope: 'Electronics module only' },
  { key: 'maintenance_cyber', label: '💻 DigitalManager', scope: 'Cyber module only' },
];

const STORAGE_OPTIONS = ['local', 'cloudinary'];

export default function FeatureFlagsSettings() {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFeatureFlags()
      .then(res => {
        const d = res?.data || res || [];
        const map = {};
        (Array.isArray(d) ? d : []).forEach(s => { map[s.key] = s.value; });
        setFlags(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isTrue = (key) => flags[key] === 'true' || flags[key] === true;

  const handleToggle = async (key, checked) => {
    const value = checked ? 'true' : 'false';
    setFlags(prev => ({ ...prev, [key]: value }));
    try {
      await updateSetting({ key, value, category: 'features' });
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleStorageChange = async (value) => {
    setFlags(prev => ({ ...prev, storage_provider: value }));
    try {
      await updateSetting({ key: 'storage_provider', value, category: 'features' });
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const handleBulkModules = async () => {
    setSaving(true);
    try {
      const updates = MODULES.map(m => ({
        key: m.key,
        value: flags[m.key] || 'false',
        category: 'features',
      }));
      await bulkUpdateSettings({ settings: updates });
      alert('Modules saved!');
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleBulkMaintenance = async () => {
    setSaving(true);
    try {
      const updates = MAINTENANCE.map(m => ({
        key: m.key,
        value: flags[m.key] || 'false',
        category: 'features',
      }));
      await bulkUpdateSettings({ settings: updates });
      alert('Maintenance settings saved!');
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="md" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Section 1: Platform */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Platform</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Storage Provider</label>
            <div className="flex gap-2">
              {STORAGE_OPTIONS.map(opt => (
                <Button
                  key={opt}
                  size="sm"
                  variant={flags.storage_provider === opt ? 'primary' : 'secondary'}
                  onClick={() => handleStorageChange(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
          <Toggle
            label="SMS Enabled"
            checked={isTrue('sms_enabled')}
            onChange={v => handleToggle('sms_enabled', v)}
            description="Global SMS on/off"
          />
        </div>
      </Card>

      {/* Section 2: Module Availability */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Module Availability</h2>
        <div className="space-y-2">
          {MODULES.map(m => (
            <Toggle
              key={m.key}
              label={m.label}
              checked={isTrue(m.key)}
              onChange={v => handleToggle(m.key, v)}
            />
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Enable/disable modules for new tenants</span>
          <Button size="sm" onClick={handleBulkModules} loading={saving}>Save Modules</Button>
        </div>
      </Card>

      {/* Section 3: Maintenance Mode */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Maintenance Mode</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">All independent — turning one ON doesn't affect others.</p>
        <div className="space-y-2">
          {MAINTENANCE.map(m => (
            <Toggle
              key={m.key}
              label={m.label}
              checked={isTrue(m.key)}
              onChange={v => handleToggle(m.key, v)}
              description={m.scope}
            />
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Maintenance mode per module</span>
          <Button size="sm" onClick={handleBulkMaintenance} loading={saving}>Save Maintenance</Button>
        </div>
      </Card>
    </div>
  );
}
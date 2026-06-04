import { useEffect, useState } from 'react';
import { getMaintenance, updateMaintenance } from '../../../services/bizhub/maintenance';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Input from '../../../components/bizhub/ui/Input';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';
import Card from '../../../components/bizhub/ui/Card';

const TOGGLES = [
  { key: 'global', label: 'Global', desc: 'All systems' },
  { key: 'landing', label: 'Landing Page', desc: 'Public website' },
  { key: 'pharma', label: 'PharmaSys', desc: 'Pharmacy module' },
  { key: 'electro', label: 'ElectroStore', desc: 'Electronics module' },
  { key: 'resto', label: 'RestoManagerKE', desc: 'Restaurant module' },
  { key: 'apartment', label: 'MyApartment', desc: 'Property module' },
];

export default function MaintenanceSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getMaintenance().then(res => setSettings(res.data || res)).catch(console.error).finally(() => setLoading(false)); }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateMaintenance(settings); alert('Maintenance settings saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Maintenance Mode Toggles</h3>
        <div className="space-y-2">
          {TOGGLES.map(t => (
            <Toggle key={t.key} label={t.label} description={t.desc} checked={settings[t.key] || false} onChange={(v) => updateField(t.key, v)} />
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Maintenance Message</h3>
        <Input label="Message" value={settings.message || ''} onChange={(e) => updateField('message', e.target.value)} placeholder="We're currently under maintenance..." />
        <div className="mt-3">
          <Toggle label="Allow Admin Access" checked={settings.allowAdminAccess !== false} onChange={(v) => updateField('allowAdminAccess', v)} />
        </div>
      </Card>
      <Button onClick={handleSave} loading={saving}>Save Maintenance Settings</Button>
    </div>
  );
}
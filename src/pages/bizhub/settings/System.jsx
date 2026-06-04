import { useEffect, useState } from 'react';
import { getSystems, updateSystems } from '../../../services/bizhub/systems';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';
import Card from '../../../components/bizhub/ui/Card';

const MODULES = [
  { key: 'pharma', label: 'PharmaSys', desc: 'Pharmacy Management System', icon: '💊' },
  { key: 'electro', label: 'ElectroStore', desc: 'Electronics Store Management', icon: '📱' },
  { key: 'resto', label: 'RestoManagerKE', desc: 'Restaurant Management System', icon: '🍽️' },
  { key: 'apartment', label: 'MyApartment', desc: 'Property Management System', icon: '🏢' },
];

export default function SystemSettings() {
  const [systems, setSystems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getSystems().then(res => setSystems(res.data || res)).catch(console.error).finally(() => setLoading(false)); }, []);

  const updateField = (key, value) => setSystems(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSystems(systems); alert('System settings saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!systems) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <h3 className="font-semibold text-[var(--text-primary)]">Enable/Disable Modules</h3>
      <p className="text-xs text-[var(--text-muted)]">Toggle business modules on or off for the entire platform.</p>
      {MODULES.map(m => (
        <Card key={m.key}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{m.icon}</span>
              <div>
                <p className="font-medium text-[var(--text-primary)]">{m.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{m.desc}</p>
              </div>
            </div>
            <Toggle checked={systems[m.key] || false} onChange={(v) => updateField(m.key, v)} />
          </div>
        </Card>
      ))}
      <Button onClick={handleSave} loading={saving}>Save System Settings</Button>
    </div>
  );
}
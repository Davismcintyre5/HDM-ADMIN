import { useState, useEffect } from 'react';
import { getFeatureFlags, updateFeatureFlags } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

const FLAGS = [
  { key: 'apiAccess', label: 'API Access' },
  { key: 'loyalty', label: 'Loyalty Program' },
  { key: 'multiLocation', label: 'Multi-Location' },
  { key: 'maintenanceMode', label: 'Maintenance Mode' },
];

export default function FeatureFlagsSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFeatureFlags().then(res => setData(res?.data || res || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateFeatureFlags(data); alert('Saved!'); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Feature Flags</h2>
        <div className="space-y-4">
          {FLAGS.map(f => (
            <Toggle key={f.key} label={f.label} checked={data?.[f.key] || false} onChange={v => update(f.key, v)} />
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Flags</Button>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../../services/spark/settings';
import Input from '../../../components/spark/ui/Input';
import Toggle from '../../../components/spark/ui/Toggle';
import Button from '../../../components/spark/ui/Button';
import Spinner from '../../../components/spark/ui/Spinner';

export default function GeneralSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getSettings().then(setSettings).catch(console.error).finally(() => setLoading(false)); }, []);
  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleSave = async () => { setSaving(true); try { await updateSettings(settings); alert('Saved'); } catch (err) { alert(err.message); } setSaving(false); };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <Input label="App Name" value={settings.appName || ''} onChange={(e) => updateField('appName', e.target.value)} />
      <Input label="Description" value={settings.appDescription || ''} onChange={(e) => updateField('appDescription', e.target.value)} />
      <Input label="Contact Email" value={settings.contactEmail || ''} onChange={(e) => updateField('contactEmail', e.target.value)} />
      <Input label="Timezone" value={settings.timezone || ''} onChange={(e) => updateField('timezone', e.target.value)} />
      <Toggle label="Maintenance Mode" checked={settings.isMaintenanceMode || false} onChange={(v) => updateField('isMaintenanceMode', v)} />
      {settings.isMaintenanceMode && <Input label="Maintenance Message" value={settings.maintenanceMessage || ''} onChange={(e) => updateField('maintenanceMessage', e.target.value)} />}
      <Button onClick={handleSave} loading={saving}>Save</Button>
    </div>
  );
}
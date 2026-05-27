import { useEffect, useState } from 'react';
import { getSettings, updateSecurity } from '../../../services/vault/settings';
import Input from '../../../components/vault/ui/Input';
import Toggle from '../../../components/vault/ui/Toggle';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';

export default function SecuritySettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getSettings().then(s => setSettings(s.settings || s)).catch(console.error).finally(() => setLoading(false)); }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleSave = async () => { setSaving(true); try { await updateSecurity(settings); alert('Saved'); } catch (err) { alert(err.message); } setSaving(false); };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <Toggle label="Require 2FA" checked={settings.require2FA || false} onChange={(v) => updateField('require2FA', v)} />
      <Input label="Session Timeout (minutes)" type="number" value={settings.sessionTimeout || ''} onChange={(e) => updateField('sessionTimeout', Number(e.target.value))} />
      <Input label="Max Failed Logins" type="number" value={settings.maxFailedLogins || ''} onChange={(e) => updateField('maxFailedLogins', Number(e.target.value))} />
      <Button onClick={handleSave} loading={saving}>Save</Button>
    </div>
  );
}
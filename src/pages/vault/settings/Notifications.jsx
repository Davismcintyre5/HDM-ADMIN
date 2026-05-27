import { useEffect, useState } from 'react';
import { getSettings, updateNotifications } from '../../../services/vault/settings';
import Toggle from '../../../components/vault/ui/Toggle';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Card from '../../../components/vault/ui/Card';

const NOTIFICATION_TOGGLES = [
  { key: 'welcomeEmail', label: 'Welcome email', desc: 'After registration' },
  { key: 'trialReminders', label: 'Trial reminders', desc: 'Day 7, 3, and 1 before expiry' },
  { key: 'activationSMS', label: 'Activation SMS', desc: 'License key delivery' },
  { key: 'paymentConfirmation', label: 'Payment confirmation email' },
  { key: 'newDeviceAlert', label: 'New device login alert' },
  { key: 'upgradeConfirmation', label: 'Upgrade confirmation' },
];

export default function NotificationsSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(s => setSettings(s.settings?.notifications || s.notifications || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateNotifications(settings); alert('Saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-3 max-w-2xl">
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Email & SMS Notifications</h3>
        {NOTIFICATION_TOGGLES.map(n => (
          <Toggle
            key={n.key}
            label={n.label}
            description={n.desc}
            checked={settings[n.key] || false}
            onChange={(v) => updateField(n.key, v)}
          />
        ))}
      </Card>
      <Button onClick={handleSave} loading={saving}>Save</Button>
    </div>
  );
}
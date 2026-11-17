import { useEffect, useState } from 'react';
import { getSettings, bulkUpdateSettings } from '../../../services/bridge/system';
import Input from '../../../components/bridge/ui/Input';
import Toggle from '../../../components/bridge/ui/Toggle';
import Button from '../../../components/bridge/ui/Button';
import Spinner from '../../../components/bridge/ui/Spinner';
import Card from '../../../components/bridge/ui/Card';
import Badge from '../../../components/bridge/ui/Badge';

export default function SystemSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(res => setSettings(res.settings || res.data?.settings || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const numericChecks = [
      ['sms_rate_kes', 'SMS rate'],
      ['sms_min_topup_kes', 'Minimum top-up'],
      ['sms_low_balance_kes', 'Low balance threshold'],
    ];
    for (const [k, label] of numericChecks) {
      const v = settings[k];
      if (v === '' || v === undefined || v === null) continue;
      if (isNaN(Number(v)) || Number(v) < 0) {
        alert(`${label} must be a non-negative number`);
        return;
      }
    }
    if (settings.sms_rate_kes !== undefined && Number(settings.sms_rate_kes) <= 0) {
      alert('SMS rate must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      await bulkUpdateSettings({ settings });
      alert('Settings saved');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  const smsEnabled = settings.sms_enabled === true;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="font-semibold mb-4">General</h3>
        <div className="space-y-4">
          <Input label="App Name" value={settings.app_name || ''} onChange={(e) => updateField('app_name', e.target.value)} />
          <Input label="App Logo URL" value={settings.app_logo || ''} onChange={(e) => updateField('app_logo', e.target.value)} placeholder="/logo.png" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Contact & Support</h3>
        <div className="space-y-4">
          <Input label="Support Email" type="email" value={settings.support_email || ''} onChange={(e) => updateField('support_email', e.target.value)} placeholder="support@hdmbridge.com" />
          <Input label="Contact Phone" value={settings.contact_phone || ''} onChange={(e) => updateField('contact_phone', e.target.value)} placeholder="+254 700 000000" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Platform</h3>
        <div className="space-y-4">
          <Toggle label="Registration Open" checked={settings.registration_open || false} onChange={(v) => updateField('registration_open', v)} />
          <Toggle label="Maintenance Mode" checked={settings.maintenance_mode || false} onChange={(v) => updateField('maintenance_mode', v)} />
          {settings.maintenance_mode && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
              ⚠ Maintenance mode is ON. Public routes return 503. Admin routes remain accessible.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">SMS</h3>
            <Badge variant={smsEnabled ? 'success' : 'warning'}>
              {smsEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <Toggle
            label="Enable SMS service"
            checked={smsEnabled}
            onChange={(v) => updateField('sms_enabled', v)}
          />
          <p className="text-xs text-[var(--text-muted)] -mt-2">
            Master switch. When OFF, all SMS send endpoints return <span className="font-mono">503 SMS_DISABLED</span>.
            Reading logs, balances, and top-ups remain available.
          </p>

          {!smsEnabled && (
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-xs text-[var(--text-muted)]">
              SMS is currently off. Turn on the switch above to start sending. Requires
              <span className="font-mono mx-1">AT_USERNAME</span> and
              <span className="font-mono mx-1">AT_API_KEY</span> in <span className="font-mono">.env</span>.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Rate (KES per SMS)"
              type="number"
              step="0.01"
              min="0.01"
              value={settings.sms_rate_kes ?? 1}
              onChange={(e) => {
                const raw = e.target.value;
                updateField('sms_rate_kes', raw === '' ? '' : Number(raw));
              }}
            />
            <Input
              label="Minimum top-up (KES)"
              type="number"
              step="1"
              min="1"
              value={settings.sms_min_topup_kes ?? 10}
              onChange={(e) => {
                const raw = e.target.value;
                updateField('sms_min_topup_kes', raw === '' ? '' : Number(raw));
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Low balance threshold (KES)"
              type="number"
              step="1"
              min="0"
              value={settings.sms_low_balance_kes ?? 10}
              onChange={(e) => {
                const raw = e.target.value;
                updateField('sms_low_balance_kes', raw === '' ? '' : Number(raw));
              }}
            />
            <Input
              label="Default sender ID"
              value={settings.sms_default_sender || ''}
              onChange={(e) => updateField('sms_default_sender', e.target.value)}
              placeholder="Blank → AT default"
            />
          </div>

          <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-xs text-[var(--text-muted)] space-y-1">
            <p><strong className="text-[var(--text-secondary)]">Rate:</strong> what users pay per SMS. Must be greater than 0.</p>
            <p><strong className="text-[var(--text-secondary)]">Min top-up:</strong> smallest amount users can add to their wallet.</p>
            <p><strong className="text-[var(--text-secondary)]">Low balance:</strong> users below this get a reminder email (checked daily).</p>
            <p><strong className="text-[var(--text-secondary)]">Default sender:</strong> used when a request doesn't specify a sender. Blank falls back to <span className="font-mono">AT_SENDER_ID</span> from <span className="font-mono">.env</span>, then to AT's default.</p>
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving}>Save System Settings</Button>
    </div>
  );
}
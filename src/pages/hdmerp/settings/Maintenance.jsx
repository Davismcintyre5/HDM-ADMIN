import { useEffect, useState } from 'react';
import { getMaintenanceSettings, updateMaintenanceSettings } from '../../../services/hdmerp/settings';
import Input from '../../../components/hdmerp/ui/Input';
import Toggle from '../../../components/hdmerp/ui/Toggle';
import Button from '../../../components/hdmerp/ui/Button';
import Spinner from '../../../components/hdmerp/ui/Spinner';
import Card from '../../../components/hdmerp/ui/Card';

function toLocalDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function toUTC(localDateTime) {
  if (!localDateTime) return null;
  return new Date(localDateTime).toISOString();
}

export default function MaintenanceSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getMaintenanceSettings()
      .then(res => setSettings(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  // Save only the schedule fields (message, start, end)
  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await updateMaintenanceSettings({
        maintenanceMessage: settings.maintenanceMessage,
        maintenanceStart: settings.maintenanceStart,
        maintenanceEnd: settings.maintenanceEnd,
      });
      alert('Schedule saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  // Toggle auto-saves immediately (mode only)
  const handleToggleMaintenance = async (enabled) => {
    if (enabled && !settings.maintenanceMessage) {
      alert('Please enter a maintenance message first');
      return;
    }
    if (enabled) {
      if (!window.confirm('Enable maintenance mode? Tenants will receive a "Maintenance Started" email.')) return;
    } else {
      if (!window.confirm('Disable maintenance mode? Tenants will receive a "Maintenance Completed" email.')) return;
    }
    setToggling(true);
    try {
      await updateMaintenanceSettings({ maintenanceMode: enabled });
      updateField('maintenanceMode', enabled);
    } catch (err) { alert(err.message); }
    setToggling(false);
  };

  const handleSendAnnouncement = async () => {
    if (!settings.maintenanceMessage) {
      alert('Please enter a maintenance message first');
      return;
    }
    if (!settings.maintenanceStart || !settings.maintenanceEnd) {
      alert('Please set both start and end times');
      return;
    }
    if (window.confirm('Send maintenance announcement to all tenants?')) {
      setSendingAnnouncement(true);
      try {
        await updateMaintenanceSettings({
          sendAnnouncement: true,
          maintenanceMessage: settings.maintenanceMessage,
          maintenanceStart: settings.maintenanceStart,
          maintenanceEnd: settings.maintenanceEnd,
        });
        setSettings(prev => ({ ...prev, maintenanceSent: true }));
        alert('Announcement sent to all tenants!');
      } catch (err) { alert(err.message); }
      setSendingAnnouncement(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Schedule Maintenance</h3>

        {/* Fields always editable (not disabled by maintenance mode) */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message to Tenants</label>
            <textarea
              value={settings.maintenanceMessage || ''}
              onChange={(e) => updateField('maintenanceMessage', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-green-500 resize-y text-sm"
              placeholder="We are currently performing scheduled maintenance. Please check back soon."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={toLocalDateTime(settings.maintenanceStart)}
              onChange={(e) => updateField('maintenanceStart', toUTC(e.target.value))}
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={toLocalDateTime(settings.maintenanceEnd)}
              onChange={(e) => updateField('maintenanceEnd', toUTC(e.target.value))}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveSchedule} loading={saving}>
              💾 Save Schedule
            </Button>
            <Button
              variant="outline"
              onClick={handleSendAnnouncement}
              loading={sendingAnnouncement}
              disabled={settings.maintenanceSent}
            >
              📢 {settings.maintenanceSent ? 'Announcement Sent' : 'Send Announcement'}
            </Button>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Save Schedule: stores message and times. Send Announcement: emails tenants the schedule without enabling maintenance.
          </p>
        </div>

        {/* Toggle auto-saves immediately */}
        <div className="border-t pt-4">
          <Toggle
            label="Maintenance Mode"
            description="Auto-saves immediately. ON: blocks API + emails tenants. OFF: restores access + sends completion email."
            checked={settings.maintenanceMode || false}
            onChange={(v) => handleToggleMaintenance(v)}
            disabled={toggling}
          />
          {toggling && <p className="text-sm text-blue-600 mt-2">Processing...</p>}
          {settings.maintenanceMode && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
              ⚠ Maintenance mode is ON. All tenants see the maintenance page. Toggle OFF to send completion email.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getSystem, updateSystem, enableMaintenance, disableMaintenance } from '../../../services/smartpos/system';
import Input from '../../../components/smartpos/ui/Input';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';
import Card from '../../../components/smartpos/ui/Card';
import { formatDate } from '../../../utils/smartpos/formatDate';

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceAction, setMaintenanceAction] = useState(false);

  useEffect(() => {
    getSystem()
      .then(res => setSettings(res.settings || res.data?.settings || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleMaintenanceToggle = async (enabled) => {
    if (!enabled && settings.maintenanceMode) {
      if (window.confirm('Disable maintenance mode? Users will receive a completion email.')) {
        setMaintenanceAction(true);
        try {
          await disableMaintenance({ sendCompletionEmail: true });
          updateField('maintenanceMode', false);
          alert('Maintenance disabled. Completion email sent to users.');
        } catch (err) { alert('Failed to disable maintenance: ' + err.message); }
        finally { setMaintenanceAction(false); }
      }
    } else if (enabled && !settings.maintenanceMode) {
      if (!settings.maintenanceReason) { alert('Please enter a maintenance reason first'); return; }
      if (window.confirm('Enable maintenance mode? All users will receive an email notification.')) {
        setMaintenanceAction(true);
        try {
          await enableMaintenance({
            reason: settings.maintenanceReason,
            durationHours: parseInt(settings.estimatedDuration) || 2,
            message: settings.maintenanceMessage
          });
          updateField('maintenanceMode', true);
          alert('Maintenance enabled. Notification emails sent to all users.');
        } catch (err) { alert('Failed to enable maintenance: ' + err.message); }
        finally { setMaintenanceAction(false); }
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try { await updateSystem(settings); alert('Settings saved'); }
    catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* General */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">General</h3>
        <div className="space-y-4">
          <Input label="App Name" value={settings.appName || ''} onChange={(e) => updateField('appName', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={settings.primaryColor || '#2563eb'} onChange={(e) => updateField('primaryColor', e.target.value)} className="h-10 w-16 rounded border border-[var(--border-color)] cursor-pointer" />
              <Input value={settings.primaryColor || ''} onChange={(e) => updateField('primaryColor', e.target.value)} className="flex-1" />
            </div>
          </div>
          <Input label="Logo URL" value={settings.logoUrl || ''} onChange={(e) => updateField('logoUrl', e.target.value)} placeholder="https://cloudinary.com/logo.png" />
        </div>
      </Card>

      {/* Downloads */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">App Downloads</h3>
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-[var(--border-color)]">
            <Toggle label="Mobile App Download" checked={settings.mobileAppEnabled || false} onChange={(v) => updateField('mobileAppEnabled', v)} />
            {settings.mobileAppEnabled && <div className="mt-2 ml-6"><Input label="Mobile App URL" value={settings.mobileAppUrl || ''} onChange={(e) => updateField('mobileAppUrl', e.target.value)} placeholder="https://..." /></div>}
          </div>
          <div className="p-3 rounded-lg border border-[var(--border-color)]">
            <Toggle label="Desktop App Download" checked={settings.desktopAppEnabled || false} onChange={(v) => updateField('desktopAppEnabled', v)} />
            {settings.desktopAppEnabled && <div className="mt-2 ml-6"><Input label="Desktop App URL" value={settings.desktopAppUrl || ''} onChange={(e) => updateField('desktopAppUrl', e.target.value)} placeholder="https://..." /></div>}
          </div>
        </div>
      </Card>

      {/* Maintenance */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Maintenance</h3>

        {/* Fields ALWAYS visible — fill BEFORE toggling */}
        <div className="space-y-3 mb-4">
          <Input
            label="Maintenance Reason"
            value={settings.maintenanceReason || ''}
            onChange={(e) => updateField('maintenanceReason', e.target.value)}
            placeholder="e.g., Database upgrade, Server migration"
            required
            disabled={settings.maintenanceMode}
          />
          <Input
            label="Message to Users"
            value={settings.maintenanceMessage || ''}
            onChange={(e) => updateField('maintenanceMessage', e.target.value)}
            placeholder="We are upgrading our database for better performance..."
            disabled={settings.maintenanceMode}
          />
          <Input
            label="Estimated Duration (hours)"
            value={settings.estimatedDuration || ''}
            onChange={(e) => updateField('estimatedDuration', e.target.value)}
            placeholder="2"
            disabled={settings.maintenanceMode}
          />
          {settings.maintenanceStartTime && (
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <p>Started: {formatDate(settings.maintenanceStartTime, 'full')}</p>
              {settings.maintenanceEndTime && <p>Expected End: {formatDate(settings.maintenanceEndTime, 'full')}</p>}
            </div>
          )}
        </div>

        {/* Toggle comes AFTER fields */}
        <Toggle
          label="Maintenance Mode"
          description="When enabled: emails sent to users, API blocked, maintenance page shown"
          checked={settings.maintenanceMode || false}
          onChange={(v) => {
            if (v && !settings.maintenanceReason) {
              alert('Please enter a maintenance reason first');
              return;
            }
            handleMaintenanceToggle(v);
          }}
          disabled={maintenanceAction}
        />
        {maintenanceAction && (
          <p className="text-sm text-blue-600 mt-2">Sending email notifications to users...</p>
        )}
      </Card>

      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}

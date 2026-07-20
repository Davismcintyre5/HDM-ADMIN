import Card from '../../../components/nexguard/ui/Card';
import Input from '../../../components/nexguard/ui/Input';
import Toggle from '../../../components/nexguard/ui/Toggle';
import Button from '../../../components/nexguard/ui/Button';

const EMAIL_TOGGLES = [
  { key: 'welcomeEmail', label: 'Welcome Email', desc: 'New user registration' },
  { key: 'verifyEmail', label: 'Verify Email', desc: 'Email verification' },
  { key: 'passwordReset', label: 'Password Reset', desc: 'Password reset request' },
  { key: 'passwordChanged', label: 'Password Changed', desc: 'Password changed' },
  { key: 'newDeviceLogin', label: 'New Device Login', desc: 'Login from new device' },
  { key: 'accountLocked', label: 'Account Locked', desc: 'Account locked' },
  { key: 'accountDeleted', label: 'Account Deleted', desc: 'Account deleted' },
  { key: 'accountSuspended', label: 'Account Suspended', desc: 'Account suspended' },
  { key: 'accountReactivated', label: 'Account Reactivated', desc: 'Account reactivated' },
  { key: 'accountDeactivated', label: 'Account Deactivated', desc: 'Account deactivated' },
  { key: 'trialRegistration', label: 'Trial Registration', desc: 'Trial started' },
  { key: 'trialExpiring', label: 'Trial Expiring', desc: 'Trial expiring (10/5/3 days)' },
  { key: 'trialExpired', label: 'Trial Expired', desc: 'Trial ended' },
  { key: 'paymentReceived', label: 'Payment Received', desc: 'Payment submitted' },
  { key: 'paymentApproved', label: 'Payment Approved', desc: 'Payment approved' },
  { key: 'vpnConnected', label: 'VPN Connected', desc: 'VPN session started' },
  { key: 'backupCompleted', label: 'Backup Completed', desc: 'Backup finished' },
  { key: 'systemHealthAlert', label: 'System Health Alert', desc: 'System component down' },
  { key: 'criticalThreatAlert', label: 'Critical Threat Alert', desc: 'Critical threat detected' },
  { key: 'newUserRegistration', label: 'New User Registration', desc: 'New user (to admin)' },
  { key: 'paymentPendingApproval', label: 'Payment Pending Approval', desc: 'Payment pending (to admin)' },
];

export default function EmailSettings({ settings, setSettings, onSave, saving }) {
  const email = settings.email || {};
  const toggles = email.toggles || {};

  const setEmail = (key, value) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
  };

  const setEmailToggle = (key, value) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, toggles: { ...prev.email?.toggles, [key]: value } },
    }));
  };

  const handleSave = () => {
    onSave({ email: settings.email });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Server</h2>
        <div className="space-y-4">
          <Input
            label="Base URL"
            value={email.baseUrl || ''}
            onChange={e => setEmail('baseUrl', e.target.value)}
            placeholder="https://hdmbridgeserver.pxxl.click/api"
          />
          <Input
            label="API Key"
            type="password"
            value={email.apiKey || ''}
            onChange={e => setEmail('apiKey', e.target.value)}
            placeholder="hdm_xxxxxxxxxxxxxxxx"
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Sender Identity</h2>
        <div className="space-y-4">
          <Input
            label="Sender Name"
            value={email.senderName || ''}
            onChange={e => setEmail('senderName', e.target.value)}
          />
          <Input
            label="Sender Email"
            type="email"
            value={email.senderEmail || ''}
            onChange={e => setEmail('senderEmail', e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Notifications</h2>
        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          {EMAIL_TOGGLES.map(item => (
            <div key={item.key} className="pt-4 first:pt-0">
              <Toggle
                label={item.label}
                checked={toggles[item.key] || false}
                onChange={v => setEmailToggle(item.key, v)}
                description={item.desc}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Email Settings</Button>
      </div>
    </div>
  );
}
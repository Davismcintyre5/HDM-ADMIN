import Card from '../../../components/hdmnet/ui/Card';
import Toggle from '../../../components/hdmnet/ui/Toggle';
import Button from '../../../components/hdmnet/ui/Button';

const TEMPLATES = [
  'subscriptionConfirmation', 'accountCreated', 'voucherSent', 'providerWalletLow',
  'providerWalletDepleted', 'providerWalletTopup', 'providerSuspended', 'providerActivated',
  'routerOffline', 'providerPendingApproval', 'providerApproved', 'providerRejected',
  'adminNewProviderAlert', 'providerAccountDeleted', 'customerSuspended', 'customerReactivated',
  'paymentReceipt', 'routerProvisioned', 'routerProvisioningFailed',
];

export default function EmailTogglesSettings({ settings, setSettings, onSave, saving }) {
  const emailToggles = settings.emailToggles || {};
  const setET = (key, value) => setSettings(prev => ({ ...prev, emailToggles: { ...prev.emailToggles, [key]: value } }));
  const handleSave = () => onSave({ emailToggles: settings.emailToggles });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Templates</h2>
        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          {TEMPLATES.map(key => (
            <div key={key} className="pt-4 first:pt-0">
              <Toggle label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                checked={emailToggles[key] || false} onChange={v => setET(key, v)} />
            </div>
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Email Toggles</Button>
      </div>
    </div>
  );
}
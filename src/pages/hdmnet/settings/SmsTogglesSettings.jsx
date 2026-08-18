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

export default function SmsTogglesSettings({ settings, setSettings, onSave, saving }) {
  const smsToggles = settings.smsToggles || {};
  const setST = (key, value) => setSettings(prev => ({ ...prev, smsToggles: { ...prev.smsToggles, [key]: value } }));
  const handleSave = () => onSave({ smsToggles: settings.smsToggles });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">SMS Templates</h2>
        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          {TEMPLATES.map(key => (
            <div key={key} className="pt-4 first:pt-0">
              <Toggle label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                checked={smsToggles[key] || false} onChange={v => setST(key, v)} />
            </div>
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save SMS Toggles</Button>
      </div>
    </div>
  );
}
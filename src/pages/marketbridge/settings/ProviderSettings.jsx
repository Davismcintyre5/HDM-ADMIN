import Card from '../../../components/marketbridge/ui/Card';
import Toggle from '../../../components/marketbridge/ui/Toggle';
import Button from '../../../components/marketbridge/ui/Button';

const PROVIDERS = ['brevo', 'hdmBridge'];
const TOGGLES = [
  { key: 'ai_enabled', label: 'AI Chatbot' },
  { key: 'mpesa_enabled', label: 'M-Pesa Payments' },
  { key: 'coins_enabled', label: 'Loyalty Coins' },
  { key: 'reviews_enabled', label: 'Product Reviews' },
  { key: 'wishlist_enabled', label: 'Wishlist' },
  { key: 'guest_checkout', label: 'Guest Checkout' },
  { key: 'registration_open', label: 'Registration Open' },
  { key: 'redis_enabled', label: 'Redis Cache' },
  { key: 'backup_enabled', label: 'Auto Backup' },
];

export default function ProviderSettings({ settings, onToggle, onSave }) {
  const getVal = (key) => settings[key] || '';
  const isTrue = (key) => getVal(key) === 'true' || getVal(key) === true;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Service Providers</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Provider</label>
            <div className="flex gap-2">
              {PROVIDERS.map(p => (
                <Button key={p} size="sm" variant={getVal('email_provider') === p ? 'primary' : 'secondary'}
                  onClick={() => onSave('email_provider', p)}>
                  {p === 'brevo' ? 'Brevo' : 'HDM Bridge'}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">SMS Provider</label>
            <div className="flex gap-2">
              {PROVIDERS.map(p => (
                <Button key={p} size="sm" variant={getVal('sms_provider') === p ? 'primary' : 'secondary'}
                  onClick={() => onSave('sms_provider', p)}>
                  {p === 'brevo' ? 'Brevo' : 'HDM Bridge'}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">File Upload Provider</label>
            <div className="flex gap-2">
              {['local', 'cloudinary'].map(p => (
                <Button key={p} size="sm" variant={getVal('file_upload_provider') === p ? 'primary' : 'secondary'}
                  onClick={() => onSave('file_upload_provider', p)}>{p}</Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-2">Feature Toggles</h2>
        <div className="space-y-1">
          {TOGGLES.map(s => (
            <Toggle key={s.key} label={s.label} checked={isTrue(s.key)} onChange={v => onToggle(s.key, v)} />
          ))}
        </div>
      </Card>
    </div>
  );
}
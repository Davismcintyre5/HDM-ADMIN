import Card from '../../../components/nexguard/ui/Card';
import Toggle from '../../../components/nexguard/ui/Toggle';
import Button from '../../../components/nexguard/ui/Button';

export default function FeaturesSettings({ settings, setSettings, onSave, saving }) {
  const features = settings.features || {};

  const setFeature = (key, value) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value },
    }));
  };

  const handleSave = () => {
    onSave({ features: settings.features });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Feature Toggles</h2>
        <div className="space-y-4">
          <Toggle
            label="VPN"
            checked={features.vpn || false}
            onChange={v => setFeature('vpn', v)}
            description="Enable VPN functionality for clients"
          />
          <Toggle
            label="Firewall"
            checked={features.firewall || false}
            onChange={v => setFeature('firewall', v)}
            description="Enable firewall protection features"
          />
          <Toggle
            label="Real-time Protection"
            checked={features.realtimeProtection || false}
            onChange={v => setFeature('realtimeProtection', v)}
            description="Active real-time threat monitoring"
          />
          <Toggle
            label="Two-Factor Auth"
            checked={features.twoFactorAuth || false}
            onChange={v => setFeature('twoFactorAuth', v)}
            description="Require 2FA for all users"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Features</Button>
      </div>
    </div>
  );
}
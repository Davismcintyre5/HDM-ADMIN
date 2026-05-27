import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../../services/spark/settings';
import Input from '../../../components/spark/ui/Input';
import Button from '../../../components/spark/ui/Button';
import Spinner from '../../../components/spark/ui/Spinner';

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getSettings().then(setSettings).catch(console.error).finally(() => setLoading(false)); }, []);
  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleSave = async () => { setSaving(true); try { await updateSettings(settings); alert('Saved'); } catch (err) { alert(err.message); } setSaving(false); };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold mb-3">HDM AI</h3>
        <div className="space-y-3">
          <Input label="AI URL" value={settings.hdmAiUrl || ''} onChange={(e) => updateField('hdmAiUrl', e.target.value)} />
          <Input label="AI Key" type="password" value={settings.hdmAiKey || ''} onChange={(e) => updateField('hdmAiKey', e.target.value)} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Stripe</h3>
        <div className="space-y-3">
          <Input label="Secret Key" type="password" value={settings.stripeSecretKey || ''} onChange={(e) => updateField('stripeSecretKey', e.target.value)} />
          <Input label="Webhook Secret" type="password" value={settings.stripeWebhookSecret || ''} onChange={(e) => updateField('stripeWebhookSecret', e.target.value)} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">M-Pesa</h3>
        <div className="space-y-3">
          <Input label="Consumer Key" type="password" value={settings.mpesaConsumerKey || ''} onChange={(e) => updateField('mpesaConsumerKey', e.target.value)} />
          <Input label="Consumer Secret" type="password" value={settings.mpesaConsumerSecret || ''} onChange={(e) => updateField('mpesaConsumerSecret', e.target.value)} />
          <Input label="Passkey" type="password" value={settings.mpesaPasskey || ''} onChange={(e) => updateField('mpesaPasskey', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Shortcode" value={settings.mpesaShortcode || ''} onChange={(e) => updateField('mpesaShortcode', e.target.value)} />
            <Input label="Receive Phone" value={settings.mpesaReceivePhone || ''} onChange={(e) => updateField('mpesaReceivePhone', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Paybill Number" value={settings.mpesaPaybillNumber || ''} onChange={(e) => updateField('mpesaPaybillNumber', e.target.value)} />
            <Input label="Till Number" value={settings.mpesaTillNumber || ''} onChange={(e) => updateField('mpesaTillNumber', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Limits</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Group Max Members" type="number" value={settings.groupMaxMembers || ''} onChange={(e) => updateField('groupMaxMembers', Number(e.target.value))} />
          <Input label="Session Max Devices" type="number" value={settings.sessionMaxDevices || ''} onChange={(e) => updateField('sessionMaxDevices', Number(e.target.value))} />
          <Input label="Message Edit Window (min)" type="number" value={settings.messageEditWindowMinutes || ''} onChange={(e) => updateField('messageEditWindowMinutes', Number(e.target.value))} />
          <Input label="Message Delete Window (hrs)" type="number" value={settings.messageDeleteWindowHours || ''} onChange={(e) => updateField('messageDeleteWindowHours', Number(e.target.value))} />
          <Input label="Status Expire (hrs)" type="number" value={settings.statusExpireHours || ''} onChange={(e) => updateField('statusExpireHours', Number(e.target.value))} />
        </div>
      </div>

      <Button onClick={handleSave} loading={saving}>Save Settings</Button>
    </div>
  );
}
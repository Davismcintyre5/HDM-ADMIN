import { useEffect, useState } from 'react';
import { getSettings, updateBranding, updateContact, updateSecurity, updateUssd, updateNotifications } from '../../services/flax/settings';
import Card from '../../components/flax/ui/Card';
import Input from '../../components/flax/ui/Input';
import Button from '../../components/flax/ui/Button';
import Toggle from '../../components/flax/ui/Toggle';
import Spinner from '../../components/flax/ui/Spinner';
import { HiPhotograph, HiPhone, HiShieldCheck, HiTerminal, HiBell } from 'react-icons/hi';

const TABS = [
  { key: 'branding', label: 'Branding', icon: HiPhotograph },
  { key: 'contact', label: 'Contact', icon: HiPhone },
  { key: 'security', label: 'Security', icon: HiShieldCheck },
  { key: 'ussd', label: 'USSD', icon: HiTerminal },
  { key: 'notifications', label: 'Notifications', icon: HiBell },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('branding');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((res) => setSettings(res?.data?.settings || res?.settings || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (updateFn, data) => {
    setSaving(true);
    try { await updateFn(data); alert('Saved!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!settings) return null;

  const b = settings.branding || {};
  const c = settings.contact || {};
  const s = settings.security || {};
  const u = settings.ussd || {};
  const n = settings.notifications || {};

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'branding' && (
        <Card className="space-y-4">
          <Input label="App Name" value={b.appName || ''} onChange={(e) => setSettings({ ...settings, branding: { ...b, appName: e.target.value } })} />
          <Input label="Tagline" value={b.tagline || ''} onChange={(e) => setSettings({ ...settings, branding: { ...b, tagline: e.target.value } })} />
          {b.logo && <img src={b.logo} alt="Logo" className="h-10 rounded" />}
          {b.favicon && <img src={b.favicon} alt="Favicon" className="h-6 rounded" />}
          <Button onClick={() => handleSave(updateBranding, { appName: b.appName, tagline: b.tagline })} loading={saving}>Save Branding</Button>
        </Card>
      )}

      {activeTab === 'contact' && (
        <Card className="space-y-4">
          <Input label="Support Email" type="email" value={c.supportEmail || ''} onChange={(e) => setSettings({ ...settings, contact: { ...c, supportEmail: e.target.value } })} />
          <Input label="Support Phone" value={c.supportPhone || ''} onChange={(e) => setSettings({ ...settings, contact: { ...c, supportPhone: e.target.value } })} />
          <Input label="WhatsApp Number" value={c.whatsappNumber || ''} onChange={(e) => setSettings({ ...settings, contact: { ...c, whatsappNumber: e.target.value } })} />
          <Input label="Physical Address" value={c.physicalAddress || ''} onChange={(e) => setSettings({ ...settings, contact: { ...c, physicalAddress: e.target.value } })} />
          <Button onClick={() => handleSave(updateContact, c)} loading={saving}>Save Contact</Button>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="space-y-4">
          <Input label="PIN Length" type="number" value={s.pinLength || 4} onChange={(e) => setSettings({ ...settings, security: { ...s, pinLength: +e.target.value } })} />
          <Input label="Max PIN Attempts" type="number" value={s.maxPinAttempts || 3} onChange={(e) => setSettings({ ...settings, security: { ...s, maxPinAttempts: +e.target.value } })} />
          <Input label="Session Timeout (min)" type="number" value={s.sessionTimeoutMinutes || 5} onChange={(e) => setSettings({ ...settings, security: { ...s, sessionTimeoutMinutes: +e.target.value } })} />
          <Input label="Rate Limit (/min)" type="number" value={s.rateLimitPerMinute || 10} onChange={(e) => setSettings({ ...settings, security: { ...s, rateLimitPerMinute: +e.target.value } })} />
          <Button onClick={() => handleSave(updateSecurity, s)} loading={saving}>Save Security</Button>
        </Card>
      )}

      {activeTab === 'ussd' && (
        <Card className="space-y-4">
          <Input label="Short Code" value={u.shortCode || ''} onChange={(e) => setSettings({ ...settings, ussd: { ...u, shortCode: e.target.value } })} placeholder="*384#" />
          <Input label="Gateway Provider" value={u.gatewayProvider || ''} onChange={(e) => setSettings({ ...settings, ussd: { ...u, gatewayProvider: e.target.value } })} />
          <Input label="API Key" type="password" value={u.apiKey || ''} onChange={(e) => setSettings({ ...settings, ussd: { ...u, apiKey: e.target.value } })} />
          <Input label="Callback URL" value={u.callbackUrl || ''} onChange={(e) => setSettings({ ...settings, ussd: { ...u, callbackUrl: e.target.value } })} />
          <Button onClick={() => handleSave(updateUssd, u)} loading={saving}>Save USSD</Button>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="space-y-4">
          <Input label="SMS Provider" value={n.smsProvider || ''} onChange={(e) => setSettings({ ...settings, notifications: { ...n, smsProvider: e.target.value } })} />
          <Input label="SMS Sender ID" value={n.smsSenderId || ''} onChange={(e) => setSettings({ ...settings, notifications: { ...n, smsSenderId: e.target.value } })} />
          <Toggle label="Transaction Receipts" checked={n.transactionReceipts || false} onChange={(v) => setSettings({ ...settings, notifications: { ...n, transactionReceipts: v } })} />
          <Input label="Alert Email" type="email" value={n.alertEmail || ''} onChange={(e) => setSettings({ ...settings, notifications: { ...n, alertEmail: e.target.value } })} />
          <Button onClick={() => handleSave(updateNotifications, n)} loading={saving}>Save Notifications</Button>
        </Card>
      )}
    </div>
  );
}
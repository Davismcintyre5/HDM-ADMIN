import { useEffect, useState } from 'react';
import { getConfig, updateConfig, toggleMaintenance } from '../../services/farmwise/system';
import Card from '../../components/farmwise/ui/Card';
import Input from '../../components/farmwise/ui/Input';
import Button from '../../components/farmwise/ui/Button';
import Toggle from '../../components/farmwise/ui/Toggle';
import Spinner from '../../components/farmwise/ui/Spinner';
import { HiCog, HiChip, HiMail, HiBell } from 'react-icons/hi';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'ai', label: 'AI Config', icon: HiChip },
  { key: 'email', label: 'Email', icon: HiMail },
  { key: 'notifications', label: 'Notifications', icon: HiBell },
];

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getConfig()
      .then(res => setConfig(res?.data || res || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try { await updateConfig(data); alert('Saved!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleToggleMaintenance = async () => {
    setSaving(true);
    try { await toggleMaintenance(); alert('Toggled!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!config) return null;

  const c = config;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <Card className="space-y-4">
          <Input label="Platform Name" value={c.platformName || ''} onChange={e => setConfig({ ...c, platformName: e.target.value })} />
          <Input label="Tagline" value={c.tagline || ''} onChange={e => setConfig({ ...c, tagline: e.target.value })} />
          <Input label="Support Email" type="email" value={c.supportEmail || ''} onChange={e => setConfig({ ...c, supportEmail: e.target.value })} />
          <Input label="Support Phone" value={c.supportPhone || ''} onChange={e => setConfig({ ...c, supportPhone: e.target.value })} />
          <Toggle label="Maintenance Mode" checked={c.maintenanceMode || false} onChange={handleToggleMaintenance} />
          <Button onClick={() => handleSave(c)} loading={saving}>Save General</Button>
        </Card>
      )}

      {activeTab === 'ai' && (
        <Card className="space-y-4">
          <Input label="System Prompt" value={c.systemPrompt || ''} onChange={e => setConfig({ ...c, systemPrompt: e.target.value })} />
          <Input label="Model" value={c.model || ''} onChange={e => setConfig({ ...c, model: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Temperature: {c.temperature ?? 0.7}</label>
            <input type="range" min="0" max="1" step="0.1" value={c.temperature ?? 0.7} onChange={e => setConfig({ ...c, temperature: +e.target.value })} className="w-full accent-emerald-600" />
          </div>
          <Toggle label="AI Features" checked={c.aiEnabled || false} onChange={v => setConfig({ ...c, aiEnabled: v })} />
          <Button onClick={() => handleSave(c)} loading={saving}>Save AI Config</Button>
        </Card>
      )}

      {activeTab === 'email' && (
        <Card className="space-y-4">
          <Input label="HDM Bridge API Key" type="password" value={c.bridgeApiKey || ''} onChange={e => setConfig({ ...c, bridgeApiKey: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Template</label>
            <textarea value={c.emailTemplate || ''} onChange={e => setConfig({ ...c, emailTemplate: e.target.value })} rows={4}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500 resize-y text-sm" />
          </div>
          <Button onClick={() => handleSave(c)} loading={saving}>Save Email</Button>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="space-y-4">
          <Input label="SMS Provider" value={c.smsProvider || ''} onChange={e => setConfig({ ...c, smsProvider: e.target.value })} />
          <Input label="Briefing Time" value={c.briefingTime || ''} onChange={e => setConfig({ ...c, briefingTime: e.target.value })} placeholder="08:00" />
          <Button onClick={() => handleSave(c)} loading={saving}>Save Notifications</Button>
        </Card>
      )}
    </div>
  );
}
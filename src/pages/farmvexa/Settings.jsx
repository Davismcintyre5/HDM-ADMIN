import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/farmvexa/settings';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { HiChip, HiBell, HiMail, HiDeviceMobile, HiSwitchHorizontal, HiCog, HiShieldCheck, HiDownload } from 'react-icons/hi';
import AISettings from './settings/AISettings';
import AlertsSettings from './settings/AlertsSettings';
import EmailSettings from './settings/EmailSettings';
import SMSSettings from './settings/SMSSettings';
import TogglesSettings from './settings/TogglesSettings';
import SystemSettings from './settings/SystemSettings';
import AdminsSettings from './settings/AdminsSettings';
import DownloadsSettings from './settings/DownloadsSettings';

const TABS = [
  { key: 'ai', label: 'AI & Limits', icon: HiChip },
  { key: 'alerts', label: 'Alerts', icon: HiBell },
  { key: 'email', label: 'Email', icon: HiMail },
  { key: 'sms', label: 'SMS', icon: HiDeviceMobile },
  { key: 'toggles', label: 'Toggles', icon: HiSwitchHorizontal },
  { key: 'system', label: 'System', icon: HiCog },
  { key: 'downloads', label: 'Downloads', icon: HiDownload },
  { key: 'admins', label: 'Admins', icon: HiShieldCheck },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    getSettings()
      .then(res => setSettings(res?.data?.settings || res?.data || {}))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (sectionData) => {
    setSaving(true); setSuccess('');
    try {
      const current = await getSettings();
      const currentSettings = current?.data?.settings || current?.data || {};
      const merged = { ...currentSettings, ...sectionData };
      await updateSettings(merged);
      setSettings(merged);
      setSuccess('Saved!'); setTimeout(() => setSuccess(''), 2000);
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      {success && <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg mb-4 text-sm">{success}</div>}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'ai' && <AISettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'alerts' && <AlertsSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'email' && <EmailSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'sms' && <SMSSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'toggles' && <TogglesSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'system' && <SystemSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'downloads' && <DownloadsSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'admins' && <AdminsSettings />}
    </div>
  );
}
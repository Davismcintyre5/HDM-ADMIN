import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/farmvexa/settings';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { HiChip, HiBell, HiMail, HiSwitchHorizontal, HiCog, HiDownload,HiCamera , HiChat, HiScale } from 'react-icons/hi';
import AISettings from './settings/AISettings';
import AlertsSettings from './settings/AlertsSettings';
import NotificationsSettings from './settings/NotificationsSettings';
import TogglesSettings from './settings/TogglesSettings';
import SystemSettings from './settings/SystemSettings';
import DownloadsSettings from './settings/DownloadsSettings';
import ChatbotSettings from './settings/ChatbotSettings';
import LegalsSettings from './settings/LegalsSettings';
import FieldScanSettings from './settings/FieldScanSettings';

const TABS = [
  { key: 'ai', label: 'AI & Limits', icon: HiChip },
  { key: 'alerts', label: 'Alerts', icon: HiBell },
  { key: 'notifications', label: 'Notifications', icon: HiMail },
  { key: 'toggles', label: 'Toggles', icon: HiSwitchHorizontal },
  { key: 'system', label: 'System', icon: HiCog },
  { key: 'downloads', label: 'Downloads', icon: HiDownload },
  { key: 'chatbot', label: 'Chatbot', icon: HiChat },
  { key: 'fieldScan', label: 'Field Scan', icon: HiCamera },
  { key: 'legals', label: 'Legals', icon: HiScale },
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
      // Deep merge nested system object
      if (sectionData.system && currentSettings.system) {
        merged.system = { ...currentSettings.system, ...sectionData.system };
      }
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
      {activeTab === 'notifications' && <NotificationsSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'toggles' && <TogglesSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'system' && <SystemSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'downloads' && <DownloadsSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'chatbot' && <ChatbotSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'fieldScan' && <FieldScanSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'legals' && <LegalsSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
    </div>
  );
}
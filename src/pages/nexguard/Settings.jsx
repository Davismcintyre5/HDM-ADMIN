import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/nexguard/settings';
import Spinner from '../../components/nexguard/ui/Spinner';
import { HiCog, HiSwitchHorizontal, HiChip, HiMail, HiDownload, HiShieldCheck, HiClipboardList } from 'react-icons/hi';
import GeneralSettings from './settings/GeneralSettings';
import FeaturesSettings from './settings/FeaturesSettings';
import AISettings from './settings/AISettings';
import EmailSettings from './settings/EmailSettings';
import DownloadsSettings from './settings/DownloadsSettings';
import AdminsSettings from './settings/AdminsSettings';
import AuditLogsSettings from './settings/AuditLogsSettings';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'features', label: 'Features', icon: HiSwitchHorizontal },
  { key: 'ai', label: 'AI', icon: HiChip },
  { key: 'email', label: 'Email', icon: HiMail },
  { key: 'downloads', label: 'Downloads', icon: HiDownload },
  { key: 'admins', label: 'Admins', icon: HiShieldCheck },
  { key: 'auditLogs', label: 'Audit Logs', icon: HiClipboardList },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    getSettings()
      .then(res => {
        const data = res?.data || res || {};
        setSettings(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (updatedSettings) => {
    setSaving(true);
    setSuccess('');
    try {
      await updateSettings(updatedSettings);
      setSettings(prev => ({ ...prev, ...updatedSettings }));
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <GeneralSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />
      )}
      {activeTab === 'features' && (
        <FeaturesSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />
      )}
      {activeTab === 'ai' && (
        <AISettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />
      )}
      {activeTab === 'email' && (
        <EmailSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />
      )}
      {activeTab === 'downloads' && (
        <DownloadsSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />
      )}
      {activeTab === 'admins' && (
        <AdminsSettings />
      )}
      {activeTab === 'auditLogs' && (
        <AuditLogsSettings />
      )}
    </div>
  );
}
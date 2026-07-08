import { useEffect, useState } from 'react';
import { getSettings, updateSetting } from '../../services/marketbridge/settings';
import Spinner from '../../components/marketbridge/ui/Spinner';
import GeneralSettings from './settings/GeneralSettings';
import LegalSettings from './settings/LegalSettings';
import ProviderSettings from './settings/ProviderSettings';
import AISettings from './settings/AISettings';
import EmailSmsSettings from './settings/EmailSmsSettings';
import MaintenanceSettings from './settings/MaintenanceSettings';
import BackupSettings from './settings/BackupSettings';
import { HiCog, HiScale, HiCloud, HiChip, HiMail, HiShieldCheck, HiArchive } from 'react-icons/hi';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'legal', label: 'Legal', icon: HiScale },
  { key: 'providers', label: 'Providers', icon: HiCloud },
  { key: 'ai', label: 'AI', icon: HiChip },
  { key: 'email', label: 'Email & SMS', icon: HiMail },
  { key: 'maintenance', label: 'Maintenance', icon: HiShieldCheck },
  { key: 'backup', label: 'Backup', icon: HiArchive },
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
        const d = res?.data || res || {};
        const map = {};
        if (Array.isArray(d)) d.forEach(s => { map[s.key || s._id] = s.value; });
        else Object.entries(d).forEach(([k, v]) => { map[k] = typeof v === 'object' ? v.value : v; });
        setSettings(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key, value) => {
    setSaving(true);
    setSuccess('');
    try {
      await updateSetting(key, value ?? settings[key]);
      setSettings(prev => ({ ...prev, [key]: value ?? prev[key] }));
      setSuccess(`Saved!`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleToggle = (key, checked) => {
    const value = checked ? 'true' : 'false';
    setSettings(prev => ({ ...prev, [key]: value }));
    handleSave(key, value);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4 text-sm">{success}</div>
      )}

      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-violet-600 text-violet-600 dark:text-violet-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && <GeneralSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'legal' && <LegalSettings settings={settings} onSave={handleSave} saving={saving} />}
      {activeTab === 'providers' && <ProviderSettings settings={settings} onToggle={handleToggle} onSave={handleSave} />}
      {activeTab === 'ai' && <AISettings settings={settings} setSettings={setSettings} onToggle={handleToggle} onSave={handleSave} saving={saving} />}
      {activeTab === 'email' && <EmailSmsSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'maintenance' && <MaintenanceSettings settings={settings} setSettings={setSettings} onToggle={handleToggle} />}
      {activeTab === 'backup' && <BackupSettings settings={settings} setSettings={setSettings} onSave={handleSave} />}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/eduprime/settings';
import Spinner from '../../components/eduprime/ui/Spinner';
import { HiCog, HiSwitchHorizontal } from 'react-icons/hi';
import GeneralSettings from './settings/GeneralSettings';
import TogglesSettings from './settings/TogglesSettings';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'toggles', label: 'Toggles', icon: HiSwitchHorizontal },
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
      .then(res => setSettings(res?.data || res || {}))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (data) => {
    setSaving(true); setSuccess('');
    try {
      await updateSettings(data);
      setSettings(prev => ({ ...prev, ...data }));
      setSuccess('Saved!'); setTimeout(() => setSuccess(''), 2000);
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      {success && <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-3 rounded-lg mb-4 text-sm">{success}</div>}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-amber-600 text-amber-600 dark:text-amber-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && <GeneralSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'toggles' && <TogglesSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
    </div>
  );
}
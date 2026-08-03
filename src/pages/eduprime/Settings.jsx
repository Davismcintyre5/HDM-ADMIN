import { useEffect, useState } from 'react';
import { getSettings, getLandingSettings, getChatSettings, updateSettings, updateSettingsSection } from '../../services/eduprime/settings';
import Spinner from '../../components/eduprime/ui/Spinner';
import { HiCog, HiSwitchHorizontal, HiTemplate, HiChat } from 'react-icons/hi';
import GeneralSettings from './settings/GeneralSettings';
import TogglesSettings from './settings/TogglesSettings';
import LandingSettings from './settings/LandingSettings';
import ChatSettings from './settings/ChatSettings';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'toggles', label: 'Toggles', icon: HiSwitchHorizontal },
  { key: 'landing', label: 'Landing', icon: HiTemplate },
  { key: 'chat', label: 'AI Chat', icon: HiChat },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([getSettings(), getLandingSettings(), getChatSettings()])
      .then(([main, landing, chat]) => {
        const mainData = main?.data || main || {};
        const landingData = landing?.data || landing || {};
        const chatData = chat?.data || chat || {};

        // Parse JSON strings for landing arrays
        ['landing_features', 'landing_downloads', 'landing_testimonials'].forEach(key => {
          if (typeof landingData[key] === 'string') {
            try { landingData[key] = JSON.parse(landingData[key]); } catch { landingData[key] = []; }
          }
          if (!Array.isArray(landingData[key])) landingData[key] = [];
        });

        setSettings({ ...mainData, landing: landingData, chat: chatData });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data) => {
    setSaving(true); setSuccess('');
    try {
      if (data.chat) {
        await updateSettingsSection('chat', data.chat);
        const fresh = await getChatSettings();
        setSettings(prev => ({ ...prev, chat: fresh?.data || fresh }));
      } else if (data.landing) {
        await updateSettingsSection('landing', data.landing);
        const fresh = await getLandingSettings();
        const landingData = fresh?.data || fresh || {};
        ['landing_features', 'landing_downloads', 'landing_testimonials'].forEach(key => {
          if (typeof landingData[key] === 'string') {
            try { landingData[key] = JSON.parse(landingData[key]); } catch { landingData[key] = []; }
          }
          if (!Array.isArray(landingData[key])) landingData[key] = [];
        });
        setSettings(prev => ({ ...prev, landing: landingData }));
      } else {
        await updateSettings(data);
        setSettings(prev => ({ ...prev, ...data }));
      }
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
      {activeTab === 'landing' && <LandingSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'chat' && <ChatSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
    </div>
  );
}
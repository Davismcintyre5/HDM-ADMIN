import { useEffect, useState } from 'react';
import { getSettings, updateSettings, updateBranding, updateCommission, updateMaintenance } from '../../services/hdmnet/settings';
import Spinner from '../../components/hdmnet/ui/Spinner';
import { HiCog, HiColorSwatch, HiCash, HiMail, HiDeviceMobile, HiExclamation } from 'react-icons/hi';
import GeneralSettings from './settings/GeneralSettings';
import BrandingSettings from './settings/BrandingSettings';
import CommissionSettings from './settings/CommissionSettings';
import EmailTogglesSettings from './settings/EmailTogglesSettings';
import SmsTogglesSettings from './settings/SmsTogglesSettings';
import MaintenanceSettings from './settings/MaintenanceSettings';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'branding', label: 'Branding', icon: HiColorSwatch },
  { key: 'commission', label: 'Commission', icon: HiCash },
  { key: 'email', label: 'Email Toggles', icon: HiMail },
  { key: 'sms', label: 'SMS Toggles', icon: HiDeviceMobile },
  { key: 'maintenance', label: 'Maintenance', icon: HiExclamation },
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
      .then(res => setSettings(res?.data?.settings || res?.data || {}))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (data, endpoint = 'settings') => {
    setSaving(true); setSuccess('');
    try {
      if (endpoint === 'branding') await updateBranding(data);
      else if (endpoint === 'commission') await updateCommission(data);
      else if (endpoint === 'maintenance') await updateMaintenance(data);
      else await updateSettings(data);
      setSettings(prev => ({ ...prev, ...data }));
      setSuccess('Saved!'); setTimeout(() => setSuccess(''), 2000);
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      {success && <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-lg mb-4 text-sm">{success}</div>}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && <GeneralSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'branding' && <BrandingSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'commission' && <CommissionSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'email' && <EmailTogglesSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'sms' && <SmsTogglesSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'maintenance' && <MaintenanceSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getGeneralSettings, updateGeneralSettings } from '../../services/rvnp/settings';
import Spinner from '../../components/rvnp/ui/Spinner';
import { HiCog, HiChip, HiOfficeBuilding, HiAcademicCap } from 'react-icons/hi';
import GeneralSettings from './settings/GeneralSettings';
import AISettings from './settings/AISettings';
import CampusesSettings from './settings/CampusesSettings';
import DepartmentsSettings from './settings/DepartmentsSettings';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'ai', label: 'AI', icon: HiChip },
  { key: 'campuses', label: 'Campuses', icon: HiOfficeBuilding },
  { key: 'departments', label: 'Departments', icon: HiAcademicCap },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    getGeneralSettings()
      .then(res => setSettings(res?.data || res || {}))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (data) => {
    setSaving(true); setSuccess('');
    try {
      await updateGeneralSettings(data);
      setSettings(prev => ({ ...prev, ...data }));
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

      {activeTab === 'general' && <GeneralSettings settings={settings} setSettings={setSettings} onSave={handleSave} saving={saving} />}
      {activeTab === 'ai' && <AISettings />}
      {activeTab === 'campuses' && <CampusesSettings />}
      {activeTab === 'departments' && <DepartmentsSettings />}
    </div>
  );
}
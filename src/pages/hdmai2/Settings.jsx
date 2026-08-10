import { useEffect, useState } from 'react';
import { getSettings, createSetting, updateSetting, deleteSetting } from '../../services/hdmai2/settings';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { HiCog, HiCube, HiMail, HiUpload, HiCreditCard,HiSupport  } from 'react-icons/hi';
import GeneralSettings from './settings/GeneralSettings';
import ModelSettings from './settings/ModelSettings';
import EmailSettings from './settings/EmailSettings';
import UploadSettings from './settings/UploadSettings';
import PaymentMethodsSettings from './settings/PaymentMethodsSettings';
import SupportContentSettings from './settings/SupportContentSettings';

const TABS = [
  { key: 'general', label: 'General', icon: HiCog },
  { key: 'model', label: 'Model', icon: HiCube },
  { key: 'email', label: 'Email', icon: HiMail },
  { key: 'upload', label: 'Upload', icon: HiUpload },
  { key: 'payments', label: 'Payments', icon: HiCreditCard },
  { key: 'support', label: 'Support', icon: HiSupport },
];

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchSettings = (category) => {
    setLoading(true);
    const params = category ? { category } : {};
    getSettings(params)
      .then(res => setSettings(res?.data?.settings || res?.data || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeTab !== 'payments') fetchSettings(activeTab);
    else setLoading(false);
  }, [activeTab]);

  const handleSave = async (key, value, category, description) => {
    setSaving(true); setSuccess('');
    try {
      const exists = settings.find(s => s.key === key);
      if (exists) {
        await updateSetting(key, { value, category, description });
      } else {
        await createSetting({ key, value, category, description });
      }
      await fetchSettings(activeTab);
      setSuccess('Saved!'); setTimeout(() => setSuccess(''), 2000);
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleDelete = async (key) => {
    if (!window.confirm(`Delete setting "${key}"?`)) return;
    setSaving(true);
    try {
      await deleteSetting(key);
      await fetchSettings(activeTab);
      setSuccess('Deleted!'); setTimeout(() => setSuccess(''), 2000);
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

      {activeTab === 'general' && <GeneralSettings settings={settings} onSave={handleSave} onDelete={handleDelete} saving={saving} />}
      {activeTab === 'model' && <ModelSettings settings={settings} onSave={handleSave} onDelete={handleDelete} saving={saving} />}
      {activeTab === 'email' && <EmailSettings settings={settings} onSave={handleSave} onDelete={handleDelete} saving={saving} />}
      {activeTab === 'upload' && <UploadSettings settings={settings} onSave={handleSave} onDelete={handleDelete} saving={saving} />}
      {activeTab === 'payments' && <PaymentMethodsSettings />}
      {activeTab === 'support' && <SupportContentSettings />}
    </div>
  );
}
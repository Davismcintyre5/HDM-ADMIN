import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/docusoft/settings';
import Input from '../../components/docusoft/ui/Input';
import Toggle from '../../components/docusoft/ui/Toggle';
import Button from '../../components/docusoft/ui/Button';
import Spinner from '../../components/docusoft/ui/Spinner';
import Card from '../../components/docusoft/ui/Card';
import { HiOfficeBuilding, HiCreditCard, HiClock, HiDocumentText, HiSave, HiSparkles } from 'react-icons/hi';

const TABS = [
  { id: 'general', label: 'General', icon: HiOfficeBuilding },
  { id: 'payment', label: 'Payment', icon: HiCreditCard },
  { id: 'hours', label: 'Business Hours', icon: HiClock },
  { id: 'legal', label: 'Legal', icon: HiDocumentText },
  { id: 'ai', label: 'AI Chatbot', icon: HiSparkles },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    getSettings()
      .then(res => setSettings(res.data || res))
      .catch(() => setMessage({ type: 'error', text: 'Failed to load settings' }))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const updateHours = (day, value) => setSettings(prev => ({ ...prev, businessHours: { ...prev.businessHours, [day]: value } }));
  const updateTerms = (value) => setSettings(prev => ({ ...prev, termsAndConditions: { ...prev.termsAndConditions, content: value } }));
  const updatePrivacy = (value) => setSettings(prev => ({ ...prev, privacyPolicy: { ...prev.privacyPolicy, content: value } }));
  const updateAI = (key, value) => setSettings(prev => ({ ...prev, ai: { ...prev.ai, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Save failed' });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Configure your store settings</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b border-[var(--border-color)] mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/10'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <Input label="Business Name" value={settings.businessName || ''} onChange={(e) => updateField('businessName', e.target.value)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Business Phone Number" value={settings.businessPhoneNumber || ''} onChange={(e) => updateField('businessPhoneNumber', e.target.value)} />
                <Input label="WhatsApp Number" value={settings.whatsappNumber || ''} onChange={(e) => updateField('whatsappNumber', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Contact Email" type="email" value={settings.contactEmail || ''} onChange={(e) => updateField('contactEmail', e.target.value)} />
                <Input label="Physical Address" value={settings.address || ''} onChange={(e) => updateField('address', e.target.value)} />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Facebook URL" value={settings.facebook || ''} onChange={(e) => updateField('facebook', e.target.value)} placeholder="https://facebook.com/yourpage" />
                  <Input label="Twitter URL" value={settings.twitter || ''} onChange={(e) => updateField('twitter', e.target.value)} placeholder="https://twitter.com/yourhandle" />
                  <Input label="Instagram URL" value={settings.instagram || ''} onChange={(e) => updateField('instagram', e.target.value)} placeholder="https://instagram.com/yourhandle" />
                </div>
              </div>
            </>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <>
              <Toggle label="Enable STK Push (Auto-generated)" checked={settings.enableSTKPush || false} onChange={(v) => updateField('enableSTKPush', v)} />
              <Toggle label="Enable Manual Payment" checked={settings.enableManualPayment || false} onChange={(v) => updateField('enableManualPayment', v)} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payment Instructions</label>
                <textarea
                  value={settings.paymentInstructions || ''}
                  onChange={(e) => updateField('paymentInstructions', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y text-sm"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Use {'{businessNumber}'} to insert business phone number</p>
              </div>
            </>
          )}

          {/* Hours Tab */}
          {activeTab === 'hours' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DAYS.map(day => (
                <Input
                  key={day}
                  label={day.charAt(0).toUpperCase() + day.slice(1)}
                  value={settings.businessHours?.[day] || ''}
                  onChange={(e) => updateHours(day, e.target.value)}
                />
              ))}
            </div>
          )}

          {/* Legal Tab */}
          {activeTab === 'legal' && (
            <>
              <Toggle label="Require Terms & Privacy acceptance on registration" checked={settings.requireTermsAcceptance || false} onChange={(v) => updateField('requireTermsAcceptance', v)} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Terms & Conditions</label>
                <textarea
                  value={settings.termsAndConditions?.content || ''}
                  onChange={(e) => updateTerms(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Privacy Policy</label>
                <textarea
                  value={settings.privacyPolicy?.content || ''}
                  onChange={(e) => updatePrivacy(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y font-mono text-sm"
                />
              </div>
            </>
          )}

          {/* AI Chatbot Tab */}
          {activeTab === 'ai' && (
            <>
              <Toggle label="Enable AI Chatbot" checked={settings.ai?.enabled || false} onChange={(v) => updateAI('enabled', v)} />
         {settings.ai?.enabled && (
  <div className="pl-2 border-l-2 border-purple-300 dark:border-purple-700 space-y-4">
    <Input label="AI Base URL" value={settings.ai?.baseUrl || ''} onChange={(e) => updateAI('baseUrl', e.target.value)} placeholder="https://hdmai-server.onrender.com/api/v1" />
    <Input 
      label="API Key" 
      type="password" 
      value={settings.ai?.apiKey || ''} 
      onChange={(e) => updateAI('apiKey', e.target.value)} 
      placeholder={settings.ai?.enabled && !settings.ai?.apiKey ? "•••••••••••• (saved on server)" : "Enter API key"}
    />
    <Input label="Greeting Message" value={settings.ai?.greeting || ''} onChange={(e) => updateAI('greeting', e.target.value)} placeholder="Hello! How can I help you today?" />
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Widget Color</label>
        <div className="flex items-center gap-3">
          <input type="color" value={settings.ai?.widgetColor || '#8B5CF6'} onChange={(e) => updateAI('widgetColor', e.target.value)} className="h-10 w-16 rounded border border-[var(--border-color)] cursor-pointer" />
          <Input value={settings.ai?.widgetColor || '#8B5CF6'} onChange={(e) => updateAI('widgetColor', e.target.value)} className="flex-1" />
        </div>
      </div>
      <Input label="Widget Position" value={settings.ai?.widgetPosition || 'bottom-right'} onChange={(e) => updateAI('widgetPosition', e.target.value)} placeholder="bottom-right" />
    </div>
  </div>
)}
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            <HiSave className="w-5 h-5 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
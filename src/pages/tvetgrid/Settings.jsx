import { useEffect, useState } from 'react';
import { HiSave, HiPlus, HiTrash } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getSettings,
  updateSettings,
} from '../../services/tvetgrid/settings';

const SOCIALS = ['facebook', 'twitter', 'instagram', 'tiktok', 'youtube'];

export default function Settings() {
  const toast = useToast();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [appName, setAppName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [social, setSocial] = useState({});
  const [faq, setFaq] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      const s = res?.data || res;
      setSettings(s);
      setAppName(s.appName || '');
      setLogoUrl(s.logoUrl || '');
      setSupportEmail(s.supportEmail || '');
      setSupportPhone(s.supportPhone || '');
      setContactAddress(s.contactAddress || '');
      setSocial(s.socialLinks || {});
      setFaq(Array.isArray(s.faq) ? s.faq : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateSettings({
        appName: appName.trim(),
        logoUrl: logoUrl.trim(),
        supportEmail: supportEmail.trim(),
        supportPhone: supportPhone.trim(),
        contactAddress: contactAddress.trim(),
        socialLinks: social,
        faq,
      });
      const updated = res?.data || res;
      if (updated) setSettings(updated);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addFaq = () => {
    setFaq([...faq, { q: '', a: '' }]);
  };

  const updateFaq = (i, key, value) => {
    const next = [...faq];
    next[i] = { ...next[i], [key]: value };
    setFaq(next);
  };

  const removeFaq = (i) => {
    setFaq(faq.filter((_, j) => j !== i));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Platform configuration · changes reflect on the public site
            immediately
          </p>
        </div>
        <Button
          icon={<HiSave className="w-4 h-4" />}
          onClick={handleSave}
          loading={saving}
        >
          Save changes
        </Button>
      </div>

      <Card title="General">
        <div className="space-y-4">
          <Input
            label="App name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
          <Input
            label="Logo URL"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
          />
          {logoUrl && (
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Logo preview"
                className="h-12 max-w-[160px] object-contain bg-[var(--bg-secondary)] p-1 rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-xs text-[var(--text-muted)]">Preview</span>
            </div>
          )}
        </div>
      </Card>

      <Card title="Support">
        <div className="space-y-4">
          <Input
            label="Support email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="support@tvetgrid.co.ke"
          />
          <Input
            label="Support phone"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
            placeholder="+254700000000"
          />
          <Input
            label="Contact address"
            value={contactAddress}
            onChange={(e) => setContactAddress(e.target.value)}
            placeholder="Nairobi, Kenya"
          />
        </div>
      </Card>

      <Card title="Social links">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIALS.map((s) => (
            <Input
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              value={social[s] || ''}
              onChange={(e) => setSocial({ ...social, [s]: e.target.value })}
              placeholder={`https://${s}.com/...`}
            />
          ))}
        </div>
      </Card>

      <Card
        title="FAQ"
        actions={
          <Button size="sm" icon={<HiPlus className="w-4 h-4" />} onClick={addFaq}>
            Add FAQ
          </Button>
        }
      >
        {faq.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">
            No FAQ entries yet
          </p>
        ) : (
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div
                key={i}
                className="border border-[var(--border-color)] rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  label="Question"
                  value={item.q || ''}
                  onChange={(e) => updateFaq(i, 'q', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Answer
                  </label>
                  <textarea
                    value={item.a || ''}
                    onChange={(e) => updateFaq(i, 'a', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
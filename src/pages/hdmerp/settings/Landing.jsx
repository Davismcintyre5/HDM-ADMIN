import { useEffect, useState } from 'react';
import { getLandingSettings, updateLandingSettings } from '../../../services/hdmerp/settings';
import Input from '../../../components/hdmerp/ui/Input';
import Button from '../../../components/hdmerp/ui/Button';
import Spinner from '../../../components/hdmerp/ui/Spinner';

export default function LandingSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getLandingSettings()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateFooter = (key, value) => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLandingSettings(data);
      alert('Landing page settings saved');
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <Input label="Hero Headline" name="heroHeadline" value={data.heroHeadline || ''} onChange={handleChange} />
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Hero Subtext</label>
        <textarea name="heroSubtext" value={data.heroSubtext || ''} onChange={handleChange} rows={3}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Module Tags (comma separated)</label>
        <input value={(data.moduleTags || []).join(', ')}
          onChange={(e) => setData(prev => ({ ...prev, moduleTags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Launch Button Label" name="launchButtonLabel" value={data.launchButtonLabel || ''} onChange={handleChange} />
        <Input label="Register Button Label" name="registerButtonLabel" value={data.registerButtonLabel || ''} onChange={handleChange} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">About Text</label>
        <textarea name="aboutText" value={data.aboutText || ''} onChange={handleChange} rows={5}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="border-t pt-4 space-y-3">
        <h3 className="font-semibold text-[var(--text-primary)]">Footer</h3>
        <Input label="Copyright" value={data.footer?.copyright || ''} onChange={(e) => updateFooter('copyright', e.target.value)} />
        <Input label="Privacy Policy URL" value={data.footer?.privacyPolicyUrl || ''} onChange={(e) => updateFooter('privacyPolicyUrl', e.target.value)} />
        <Input label="Terms of Service URL" value={data.footer?.termsOfServiceUrl || ''} onChange={(e) => updateFooter('termsOfServiceUrl', e.target.value)} />
        <Input label="License URL" value={data.footer?.licenseUrl || ''} onChange={(e) => updateFooter('licenseUrl', e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Support Email" type="email" value={data.footer?.supportEmail || ''} onChange={(e) => updateFooter('supportEmail', e.target.value)} />
          <Input label="Support Phone" value={data.footer?.supportPhone || ''} onChange={(e) => updateFooter('supportPhone', e.target.value)} />
        </div>
      </div>
      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}
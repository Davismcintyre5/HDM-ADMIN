import { useState, useEffect } from 'react';
import { getBranding, updateBranding } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Input from '../../../components/smartpos/ui/Input';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';
import { HiPhotograph } from 'react-icons/hi';

export default function BrandingSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    getBranding()
      .then(res => setSettings(res?.data || res || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleLogoChange = (value) => {
    setLogoError(false);
    update('logoUrl', value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBranding(settings);
      alert('Saved!');
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const logoUrl = settings?.logoUrl;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Branding</h2>

        <div className="space-y-4">
          <Input
            label="Platform Name"
            value={settings?.platformName || ''}
            onChange={e => update('platformName', e.target.value)}
          />

          <div>
            <Input
              label="Logo URL"
              value={settings?.logoUrl || ''}
              onChange={e => handleLogoChange(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
            />

            <div className="mt-3 flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                {logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                    onError={() => setLogoError(true)}
                    onLoad={() => setLogoError(false)}
                  />
                ) : (
                  <HiPhotograph className="w-8 h-8 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {logoUrl && !logoError ? (
                  <p>Preview of the uploaded logo</p>
                ) : logoError ? (
                  <p className="text-red-500">Could not load image — check the URL</p>
                ) : (
                  <p>Paste a logo URL to see a preview</p>
                )}
              </div>
            </div>
          </div>

          <Input
            label="Support Email"
            type="email"
            value={settings?.supportEmail || ''}
            onChange={e => update('supportEmail', e.target.value)}
          />
          <Input
            label="Support Phone"
            value={settings?.supportPhone || ''}
            onChange={e => update('supportPhone', e.target.value)}
          />
          <Input
            label="Terms URL"
            value={settings?.termsUrl || ''}
            onChange={e => update('termsUrl', e.target.value)}
          />
          <Input
            label="Privacy URL"
            value={settings?.privacyUrl || ''}
            onChange={e => update('privacyUrl', e.target.value)}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Branding</Button>
      </div>
    </div>
  );
}
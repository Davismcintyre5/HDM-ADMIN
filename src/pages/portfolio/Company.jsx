import { useEffect, useState } from 'react';
import {
  getCompany,
  updateCompany,
  uploadLogo,
  uploadLogoDark,
  uploadFavicon,
} from '../../services/portfolio/company';
import Input from '../../components/portfolio/ui/Input';
import Toggle from '../../components/portfolio/ui/Toggle';
import Button from '../../components/portfolio/ui/Button';
import Spinner from '../../components/portfolio/ui/Spinner';
import Card from '../../components/portfolio/ui/Card';
import { useToast } from '../../context/portfolio/ToastContext';

export default function Company() {
  const toast = useToast();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    getCompany()
      .then((res) => setCompany(res.data || res))
      .catch((err) => toast.error(err.message || 'Failed to load company'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key, value) =>
    setCompany((prev) => ({ ...prev, [key]: value }));

  const updateSocial = (key, value) =>
    setCompany((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: value },
    }));

  const updateHero = (key, value) =>
    setCompany((prev) => ({
      ...prev,
      hero: { ...prev.hero, [key]: value },
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCompany(company);
      toast.success('Company saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (type, file) => {
    if (!file) return;
    const formData = new FormData();
    if (type === 'favicon') formData.append('icon', file);
    else formData.append('logo', file);

    setUploading((p) => ({ ...p, [type]: true }));
    try {
      const fn =
        type === 'logoDark'
          ? uploadLogoDark
          : type === 'favicon'
          ? uploadFavicon
          : uploadLogo;
      const res = await fn(formData);
      const url = res.data?.logo || res.data?.icon || res.data?.url;
      if (url) {
        const key = type === 'favicon' ? 'favicon' : type;
        setCompany((prev) => ({ ...prev, [key]: url }));
      }
      toast.success(`${type} uploaded`);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading((p) => ({ ...p, [type]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!company) return null;

  const socialKeys = [
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'github',
    'youtube',
    'discord',
    'stackoverflow',
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">
          Company Info
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={company.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <Input
              label="Tagline"
              value={company.tagline || ''}
              onChange={(e) => updateField('tagline', e.target.value)}
            />
          </div>
          <Input
            label="Description"
            value={company.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Email"
              value={company.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <Input
              label="Phone"
              value={company.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <Input
              label="WhatsApp"
              value={company.whatsapp || ''}
              onChange={(e) => updateField('whatsapp', e.target.value)}
            />
          </div>
          <Input
            label="WhatsApp Message"
            value={company.whatsappMessage || ''}
            onChange={(e) => updateField('whatsappMessage', e.target.value)}
            placeholder="Hello HDM!"
          />
          <Input
            label="Address"
            value={company.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={company.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
            />
            <Input
              label="Country"
              value={company.country || ''}
              onChange={(e) => updateField('country', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <ImageUpload
              label="Logo"
              value={company.logo}
              uploading={uploading.logo}
              onUpload={(f) => handleUpload('logo', f)}
            />
            <ImageUpload
              label="Dark Logo"
              value={company.logoDark}
              uploading={uploading.logoDark}
              onUpload={(f) => handleUpload('logoDark', f)}
            />
            <ImageUpload
              label="Favicon"
              value={company.favicon}
              uploading={uploading.favicon}
              onUpload={(f) => handleUpload('favicon', f)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Primary Color"
              type="color"
              value={company.primaryColor || '#0a1628'}
              onChange={(e) => updateField('primaryColor', e.target.value)}
            />
            <Input
              label="Secondary Color"
              type="color"
              value={company.secondaryColor || '#30dd0e'}
              onChange={(e) => updateField('secondaryColor', e.target.value)}
            />
            <Input
              label="Accent Color"
              type="color"
              value={company.accentColor || '#1e6ef0'}
              onChange={(e) => updateField('accentColor', e.target.value)}
            />
          </div>

          <Input
            label="Font Family"
            value={company.fontFamily || ''}
            onChange={(e) => updateField('fontFamily', e.target.value)}
            placeholder="Inter"
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">
          Hero Section
        </h3>
        <div className="space-y-3">
          <Toggle
            label="Hero Enabled"
            checked={company.hero?.enabled !== false}
            onChange={(v) => updateHero('enabled', v)}
          />
          <Input
            label="Title"
            value={company.hero?.title || ''}
            onChange={(e) => updateHero('title', e.target.value)}
          />
          <Input
            label="Subtitle"
            value={company.hero?.subtitle || ''}
            onChange={(e) => updateHero('subtitle', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CTA Primary Text"
              value={company.hero?.ctaPrimary || ''}
              onChange={(e) => updateHero('ctaPrimary', e.target.value)}
            />
            <Input
              label="CTA Primary Link"
              value={company.hero?.ctaPrimaryLink || ''}
              onChange={(e) => updateHero('ctaPrimaryLink', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Typing text (one per line)
            </label>
            <textarea
              value={(company.hero?.typingText || []).join('\n')}
              onChange={(e) =>
                updateHero(
                  'typingText',
                  e.target.value.split('\n').filter(Boolean)
                )
              }
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-green-500 resize-y text-sm"
              placeholder={'Web Apps\nMobile Apps\nAI Solutions'}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">
          Social Links
        </h3>
        <div className="space-y-3">
          {socialKeys.map((s) => {
            const entry = company.social?.[s];
            const url = typeof entry === 'string' ? entry : entry?.url || '';
            const show =
              typeof entry === 'object' ? entry?.show !== false : !!url;
            return (
              <div
                key={s}
                className="grid grid-cols-[1fr_auto] gap-3 items-end"
              >
                <Input
                  label={s.charAt(0).toUpperCase() + s.slice(1)}
                  value={url}
                  onChange={(e) =>
                    updateSocial(s, {
                      url: e.target.value,
                      show: entry?.show !== false,
                    })
                  }
                />
                <Toggle
                  label="Show"
                  checked={show}
                  onChange={(v) =>
                    updateSocial(s, { url, show: v })
                  }
                />
              </div>
            );
          })}
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving}>
        Save Company
      </Button>
    </div>
  );
}

function ImageUpload({ label, value, onUpload, uploading }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt={label}
            className="w-12 h-12 rounded-lg object-contain bg-[var(--bg-secondary)] p-1"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] text-xs">
            None
          </div>
        )}
        <label className="cursor-pointer flex-1">
          <span className="inline-flex items-center justify-center w-full px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
            {uploading ? 'Uploading…' : 'Upload'}
          </span>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = '';
            }}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getCompany, updateCompany, uploadLogo } from '../../services/portfolio/company';
import Input from '../../components/portfolio/ui/Input';
import Toggle from '../../components/portfolio/ui/Toggle';
import Button from '../../components/portfolio/ui/Button';
import Spinner from '../../components/portfolio/ui/Spinner';
import Card from '../../components/portfolio/ui/Card';

export default function Company() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCompany()
      .then(res => setCompany(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setCompany(prev => ({ ...prev, [key]: value }));
  const updateSocial = (key, value) => setCompany(prev => ({ ...prev, social: { ...prev.social, [key]: value } }));
  const updateHero = (key, value) => setCompany(prev => ({ ...prev, hero: { ...prev.hero, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateCompany(company); alert('Saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try { const res = await uploadLogo(formData); setCompany(prev => ({ ...prev, logo: res.data?.logo || prev.logo })); alert('Logo uploaded'); }
    catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!company) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <h3 className="font-semibold mb-4">Company Info</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={company.name || ''} onChange={(e) => updateField('name', e.target.value)} />
            <Input label="Tagline" value={company.tagline || ''} onChange={(e) => updateField('tagline', e.target.value)} />
          </div>
          <Input label="Description" value={company.description || ''} onChange={(e) => updateField('description', e.target.value)} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Email" value={company.email || ''} onChange={(e) => updateField('email', e.target.value)} />
            <Input label="Phone" value={company.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
            <Input label="WhatsApp" value={company.whatsapp || ''} onChange={(e) => updateField('whatsapp', e.target.value)} />
          </div>
          <Input label="Address" value={company.address || ''} onChange={(e) => updateField('address', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Logo</label>
            <div className="flex items-center gap-3">
              {company.logo && <img src={company.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />}
              <label className="cursor-pointer">
                <Button as="span" variant="outline" size="sm">Upload Logo</Button>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Social Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['github', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'website'].map(s => (
            <Input key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={company.social?.[s] || ''} onChange={(e) => updateSocial(s, e.target.value)} />
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Hero Section</h3>
        <div className="space-y-3">
          <Input label="Title" value={company.hero?.title || ''} onChange={(e) => updateHero('title', e.target.value)} />
          <Input label="Subtitle" value={company.hero?.subtitle || ''} onChange={(e) => updateHero('subtitle', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Text" value={company.hero?.ctaText || ''} onChange={(e) => updateHero('ctaText', e.target.value)} />
            <Input label="CTA Link" value={company.hero?.ctaLink || ''} onChange={(e) => updateHero('ctaLink', e.target.value)} />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving}>Save Company</Button>
    </div>
  );
}
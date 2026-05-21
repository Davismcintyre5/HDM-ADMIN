import { useEffect, useState } from 'react';
import { getBrandingSettings, updateBrandingSettings } from '../../../services/hdmerp/settings';
import Input from '../../../components/hdmerp/ui/Input';
import Button from '../../../components/hdmerp/ui/Button';
import Spinner from '../../../components/hdmerp/ui/Spinner';

export default function BrandingSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getBrandingSettings()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBrandingSettings(data);
      alert('Branding settings saved');
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
      <Input label="Logo URL (Navbar)" name="logoNavbar" value={data.logoNavbar || ''} onChange={handleChange} placeholder="https://example.com/logo.png" />
      <Input label="Favicon URL" name="logoFavicon" value={data.logoFavicon || ''} onChange={handleChange} placeholder="https://example.com/favicon.ico" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Primary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" name="primaryColor" value={data.primaryColor || '#10B981'} onChange={handleChange} className="h-10 w-20 rounded border border-[var(--border-color)] cursor-pointer" />
            <Input name="primaryColor" value={data.primaryColor || ''} onChange={handleChange} className="flex-1" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Secondary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" name="secondaryColor" value={data.secondaryColor || '#1E3A5F'} onChange={handleChange} className="h-10 w-20 rounded border border-[var(--border-color)] cursor-pointer" />
            <Input name="secondaryColor" value={data.secondaryColor || ''} onChange={handleChange} className="flex-1" />
          </div>
        </div>
      </div>
      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}
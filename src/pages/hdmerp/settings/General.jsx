import { useEffect, useState } from 'react';
import { getGeneralSettings, updateGeneralSettings } from '../../../services/hdmerp/settings';
import Input from '../../../components/hdmerp/ui/Input';
import Button from '../../../components/hdmerp/ui/Button';
import Spinner from '../../../components/hdmerp/ui/Spinner';

export default function GeneralSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getGeneralSettings()
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
      await updateGeneralSettings(data);
      alert('General settings saved');
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
      <Input label="System Name" name="systemName" value={data.systemName || ''} onChange={handleChange} />
      <Input label="Tagline" name="tagline" value={data.tagline || ''} onChange={handleChange} />
      <Input label="Contact Email" name="contactEmail" type="email" value={data.contactEmail || ''} onChange={handleChange} />
      <Input label="Contact Phone" name="contactPhone" value={data.contactPhone || ''} onChange={handleChange} />
      <Input label="Address" name="address" value={data.address || ''} onChange={handleChange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Timezone" name="timezone" value={data.timezone || ''} onChange={handleChange} placeholder="Africa/Nairobi" />
        <Input label="Date Format" name="dateFormat" value={data.dateFormat || ''} onChange={handleChange} placeholder="DD/MM/YYYY" />
      </div>
      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}
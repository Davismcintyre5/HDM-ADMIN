import { useEffect, useState } from 'react';
import { getDownloadsSettings, updateDownloadsSettings } from '../../../services/hdmerp/settings';
import Input from '../../../components/hdmerp/ui/Input';
import Toggle from '../../../components/hdmerp/ui/Toggle';
import Button from '../../../components/hdmerp/ui/Button';
import Spinner from '../../../components/hdmerp/ui/Spinner';

export default function DownloadsSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDownloadsSettings()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateDesktop = (key, value) => setData(prev => ({ ...prev, desktop: { ...prev.desktop, [key]: value } }));
  const updateMobile = (key, value) => setData(prev => ({ ...prev, mobile: { ...prev.mobile, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDownloadsSettings(data);
      alert('Download settings saved');
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="p-4 rounded-lg border border-[var(--border-color)]">
        <h3 className="font-semibold mb-3">Desktop App</h3>
        <Toggle label="Enabled" checked={data.desktop?.enabled || false} onChange={(v) => updateDesktop('enabled', v)} />
        {data.desktop?.enabled && (
          <div className="space-y-3 mt-3">
            <Input label="Download URL" value={data.desktop?.url || ''} onChange={(e) => updateDesktop('url', e.target.value)} />
            <Input label="Label" value={data.desktop?.label || ''} onChange={(e) => updateDesktop('label', e.target.value)} />
          </div>
        )}
      </div>
      <div className="p-4 rounded-lg border border-[var(--border-color)]">
        <h3 className="font-semibold mb-3">Mobile App</h3>
        <Toggle label="Enabled" checked={data.mobile?.enabled || false} onChange={(v) => updateMobile('enabled', v)} />
        {data.mobile?.enabled && (
          <div className="space-y-3 mt-3">
            <Input label="Download URL" value={data.mobile?.url || ''} onChange={(e) => updateMobile('url', e.target.value)} />
            <Input label="Label" value={data.mobile?.label || ''} onChange={(e) => updateMobile('label', e.target.value)} />
          </div>
        )}
      </div>
      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}
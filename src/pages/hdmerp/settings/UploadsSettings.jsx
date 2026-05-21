import { useEffect, useState } from 'react';
import { getUploadsSettings, updateUploadsSettings } from '../../../services/hdmerp/settings';
import Input from '../../../components/hdmerp/ui/Input';
import Button from '../../../components/hdmerp/ui/Button';
import Spinner from '../../../components/hdmerp/ui/Spinner';

export default function UploadsSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUploadsSettings()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUploadsSettings(data);
      alert('Upload settings saved');
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
      <Input label="Max File Size (MB)" type="number" value={data.maxFileSizeMB || ''}
        onChange={(e) => setData(prev => ({ ...prev, maxFileSizeMB: Number(e.target.value) }))} />
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Allowed Types (comma separated)</label>
        <input value={(data.allowedTypes || []).join(', ')}
          onChange={(e) => setData(prev => ({ ...prev, allowedTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="image/png, image/jpeg, application/pdf" />
      </div>
      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
}
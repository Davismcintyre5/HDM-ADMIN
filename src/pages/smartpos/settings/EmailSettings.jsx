import { useState, useEffect } from 'react';
import { getEmailSettings, updateEmailSettings } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Input from '../../../components/smartpos/ui/Input';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

export default function EmailSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEmailSettings().then(res => setData(res?.data || res || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateEmailSettings(data); alert('Saved!'); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Sender</h2>
        <div className="space-y-4">
          <Input label="From Name" value={data?.fromName || ''} onChange={e => update('fromName', e.target.value)} />
          <Input label="From Address" type="email" value={data?.fromAddress || ''} onChange={e => update('fromAddress', e.target.value)} />
          <Input label="Reply To" type="email" value={data?.replyTo || ''} onChange={e => update('replyTo', e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Email</Button>
      </div>
    </div>
  );
}
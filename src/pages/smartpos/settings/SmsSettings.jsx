import { useState, useEffect } from 'react';
import { getSmsSettings, updateSmsSettings } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Input from '../../../components/smartpos/ui/Input';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

export default function SmsSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSmsSettings().then(res => setData(res?.data || res || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSmsSettings(data); alert('Saved!'); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">SMS Configuration</h2>
        <div className="space-y-4">
          <Toggle label="Enabled" checked={data?.enabled || false} onChange={v => update('enabled', v)} />
          <Input label="Sender ID" value={data?.senderId || ''} onChange={e => update('senderId', e.target.value)} placeholder="SmartPOS" />
          <Input label="Daily Limit" type="number" value={data?.dailyLimit || 0} onChange={e => update('dailyLimit', +e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save SMS</Button>
      </div>
    </div>
  );
}
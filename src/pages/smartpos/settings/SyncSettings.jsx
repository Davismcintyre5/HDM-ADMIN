import { useState, useEffect } from 'react';
import { getSync, updateSync } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Input from '../../../components/smartpos/ui/Input';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

export default function SyncSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSync().then(res => setData(res?.data || res || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSync(data); alert('Saved!'); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Electron Sync</h2>
        <div className="space-y-4">
          <Input label="Interval (seconds)" type="number" value={data?.intervalSeconds || 30} onChange={e => update('intervalSeconds', +e.target.value)} />
          <Input label="Pull Batch Size" type="number" value={data?.pullBatchSize || 200} onChange={e => update('pullBatchSize', +e.target.value)} />
          <Input label="Max Outbox Retries" type="number" value={data?.maxOutboxRetries || 10} onChange={e => update('maxOutboxRetries', +e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Sync</Button>
      </div>
    </div>
  );
}
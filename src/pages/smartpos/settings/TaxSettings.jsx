import { useState, useEffect } from 'react';
import { getTax, updateTax } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Input from '../../../components/smartpos/ui/Input';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

export default function TaxSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTax().then(res => setData(res?.data || res || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateTax(data); alert('Saved!'); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Tax Configuration</h2>
        <div className="space-y-4">
          <Input label="Default Rate (%)" type="number" value={data?.defaultRate || 0} onChange={e => update('defaultRate', +e.target.value)} />
          <Input label="Label" value={data?.label || ''} onChange={e => update('label', e.target.value)} placeholder="VAT" />
          <Toggle label="Tax Inclusive" checked={data?.inclusive || false} onChange={v => update('inclusive', v)} description="Prices include tax" />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Tax</Button>
      </div>
    </div>
  );
}
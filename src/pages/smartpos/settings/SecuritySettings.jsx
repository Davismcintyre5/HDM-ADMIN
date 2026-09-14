import { useState, useEffect } from 'react';
import { getSecurity, updateSecurity } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Input from '../../../components/smartpos/ui/Input';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

export default function SecuritySettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSecurity().then(res => setData(res?.data || res || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSecurity(data); alert('Saved!'); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Security</h2>
        <div className="space-y-4">
          <Input label="Access Token (minutes)" type="number" value={data?.accessTokenMinutes || 15} onChange={e => update('accessTokenMinutes', +e.target.value)} />
          <Input label="Refresh Token (days)" type="number" value={data?.refreshTokenDays || 7} onChange={e => update('refreshTokenDays', +e.target.value)} />
          <Input label="Min Password Length" type="number" value={data?.minPasswordLength || 8} onChange={e => update('minPasswordLength', +e.target.value)} />
          <Toggle label="Require 2FA for Admin" checked={data?.require2FAForAdmin || false} onChange={v => update('require2FAForAdmin', v)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Security</Button>
      </div>
    </div>
  );
}
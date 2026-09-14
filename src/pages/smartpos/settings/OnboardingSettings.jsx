import { useState, useEffect } from 'react';
import { getOnboarding, updateOnboarding } from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Input from '../../../components/smartpos/ui/Input';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Button from '../../../components/smartpos/ui/Button';
import Spinner from '../../../components/smartpos/ui/Spinner';

export default function OnboardingSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOnboarding().then(res => setData(res?.data || res || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateOnboarding(data); alert('Saved!'); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Onboarding</h2>
        <div className="space-y-4">
          <Input label="Default Plan" value={data?.defaultPlan || 'trial'} onChange={e => update('defaultPlan', e.target.value)} />
          <Toggle label="Require Email Verification" checked={data?.requireEmailVerification || false} onChange={v => update('requireEmailVerification', v)} />
          <Toggle label="Require Admin Approval" checked={data?.requireAdminApproval || false} onChange={v => update('requireAdminApproval', v)} />
          <Input label="Trial Days" type="number" value={data?.trialDays || 14} onChange={e => update('trialDays', +e.target.value)} />
          <Input label="Grace Days" type="number" value={data?.graceDays || 14} onChange={e => update('graceDays', +e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Onboarding</Button>
      </div>
    </div>
  );
}
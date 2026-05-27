import { useEffect, useState } from 'react';
import { getPlans, updatePlans, updatePlanTier } from '../../../services/vault/plans';
import Input from '../../../components/vault/ui/Input';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Card from '../../../components/vault/ui/Card';
import { CURRENCIES } from '../../../utils/vault/constants';

export default function PlansSettings() {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getPlans().then(setPlans).catch(console.error).finally(() => setLoading(false)); }, []);

  const updateTrial = (key, value) => setPlans(prev => ({ ...prev, [key]: value }));
  const updateTier = (tier, key, value) => setPlans(prev => ({ ...prev, [tier]: { ...prev[tier], [key]: value } }));
  const updatePricing = (tier, currency, cycle, value) => setPlans(prev => ({
    ...prev, [tier]: { ...prev[tier], pricing: { ...prev[tier]?.pricing, [currency]: { ...prev[tier]?.pricing?.[currency], [cycle]: value } } }
  }));

  const handleSave = async () => { setSaving(true); try { await updatePlans(plans); alert('Saved'); } catch (err) { alert(err.message); } setSaving(false); };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!plans) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <h3 className="font-semibold mb-4">Trial</h3>
        <Input label="Trial Duration (Days)" type="number" value={plans.trialDurationDays || ''} onChange={(e) => updateTrial('trialDurationDays', Number(e.target.value))} />
      </Card>
      {['standard', 'pro'].map(tier => (
        <Card key={tier}>
          <h3 className="font-semibold mb-4 capitalize">{tier} Plan</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Max Users" type="number" value={plans[tier]?.maxUsers || ''} onChange={(e) => updateTier(tier, 'maxUsers', Number(e.target.value))} />
            <Input label="Max Storage (GB)" type="number" value={plans[tier]?.maxStorageGB || ''} onChange={(e) => updateTier(tier, 'maxStorageGB', Number(e.target.value))} />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Pricing (KSh)</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Monthly" type="number" value={plans[tier]?.pricing?.KSh?.monthly || ''} onChange={(e) => updatePricing(tier, 'KSh', 'monthly', Number(e.target.value))} />
              <Input label="Yearly" type="number" value={plans[tier]?.pricing?.KSh?.yearly || ''} onChange={(e) => updatePricing(tier, 'KSh', 'yearly', Number(e.target.value))} />
              <Input label="Permanent" type="number" value={plans[tier]?.pricing?.KSh?.permanent || ''} onChange={(e) => updatePricing(tier, 'KSh', 'permanent', Number(e.target.value))} />
            </div>
          </div>
        </Card>
      ))}
      <Button onClick={handleSave} loading={saving}>Save Plans</Button>
    </div>
  );
}
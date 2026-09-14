import { useState, useEffect } from 'react';
import { getPlans, updatePlan, togglePlan, syncStripePlan } from '../../services/smartpos/plans';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Toggle from '../../components/smartpos/ui/Toggle';
import Modal from '../../components/smartpos/ui/Modal';
import Spinner from '../../components/smartpos/ui/Spinner';
import { HiPencil, HiRefresh } from 'react-icons/hi';

const SUPPORTED_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP'];

const planColor = (id) => {
  switch (id) {
    case 'trial':   return 'from-blue-500 to-blue-600';
    case 'starter': return 'from-emerald-500 to-green-600';
    case 'pro':     return 'from-purple-500 to-purple-600';
    case 'ent':     return 'from-amber-500 to-orange-600';
    default:        return 'from-gray-500 to-gray-600';
  }
};

const billingLabel = (plan) => {
  if (plan.billingType === 'recurring') return `Billed ${plan.cycle}`;
  if (plan.billingType === 'free') return 'Free';
  if (plan.billingType === 'one-time') return 'One-time purchase';
  return '';
};

const formatPrice = (minor) => ((minor || 0) / 100).toLocaleString();

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, plan: null });
  const [form, setForm] = useState({ name: '', description: '', prices: {}, active: true });

  const fetchPlans = () => {
    setLoading(true);
    getPlans({ limit: 100 })
      .then(res => setPlans(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openEdit = (plan) => {
    setForm({
      name: plan.name,
      description: plan.description || '',
      prices: plan.prices || {},
      active: plan.active !== false
    });
    setModal({ open: true, plan });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      await updatePlan(modal.plan._id || modal.plan.id, form);
      setModal({ open: false, plan: null });
      fetchPlans();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleToggle = async (id) => {
    setActionLoading(true);
    try { await togglePlan(id); fetchPlans(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleSync = async (id) => {
    setActionLoading(true);
    try {
      const res = await syncStripePlan(id);
      fetchPlans();
      const synced = Object.keys(res?.data || {}).join(', ');
      alert(synced ? `Synced: ${synced}` : 'Nothing to sync');
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => {
          const id = plan._id || plan.id;
          return (
            <Card key={id} className="relative overflow-hidden">
              <div className={`bg-gradient-to-r ${planColor(id)} -mx-6 -mt-6 mb-4 p-4 text-white`}>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-white/80 text-sm">{plan.description}</p>
                <p className="text-white/60 text-xs mt-1">{billingLabel(plan)}</p>
              </div>

              {id === 'trial' ? (
                <p className="text-lg font-bold text-[var(--text-primary)] py-2 mb-4">Free</p>
              ) : (
                <div className="space-y-1 text-sm mb-4">
                  {SUPPORTED_CURRENCIES.map(currency => (
                    <div key={currency} className="flex justify-between">
                      <span className="text-[var(--text-muted)]">{currency}</span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {formatPrice(plan.prices?.[currency])}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Badge variant={plan.active ? 'success' : 'default'}>
                  {plan.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex gap-1">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(plan)}>
                  <HiPencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleToggle(id)}>
                  {plan.active ? 'Disable' : 'Enable'}
                </Button>
                {plan.billingType === 'recurring' && (
                  <Button size="sm" variant="info" onClick={() => handleSync(id)} title="Sync Stripe">
                    <HiRefresh className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, plan: null })}
        title={`Edit Plan — ${modal.plan?.name || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
              {modal.plan?.billingType === 'one-time' ? 'One-time price' : 'Prices'}
              <span className="text-xs text-[var(--text-muted)] font-normal ml-2">
                (whole units — e.g. 2500 = KES 2,500)
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {SUPPORTED_CURRENCIES.map(cur => (
                <Input
                  key={cur}
                  label={cur}
                  type="number"
                  step="0.01"
                  value={((form.prices?.[cur] ?? 0) / 100).toString()}
                  onChange={e => setForm({
                    ...form,
                    prices: {
                      ...form.prices,
                      [cur]: Math.round(parseFloat(e.target.value || 0) * 100)
                    }
                  })}
                />
              ))}
            </div>
          </div>

          <Toggle
            label="Active"
            checked={form.active}
            onChange={v => setForm({ ...form, active: v })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, plan: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
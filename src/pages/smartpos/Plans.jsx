import { useEffect, useState } from 'react';
import { HiPencil, HiTrash, HiCheck } from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Button from '../../components/smartpos/ui/Button';
import Badge from '../../components/smartpos/ui/Badge';
import Spinner from '../../components/smartpos/ui/Spinner';
import Modal from '../../components/smartpos/ui/Modal';
import Input from '../../components/smartpos/ui/Input';
import Select from '../../components/smartpos/ui/Select';
import Toggle from '../../components/smartpos/ui/Toggle';
import { useToast } from '../../context/smartpos/ToastContext';
import {
  getPlans,
  updatePlan,
  deactivatePlan,
  deletePlan,
} from '../../services/smartpos/plans';

function emptyDraft(plan) {
  return {
    name: plan.name,
    description: plan.description || '',
    priceAmount: plan.price?.amount ?? 0,
    priceCurrency: plan.price?.currency || 'KES',
    priceInterval: plan.price?.interval || 'month',
    maxOwners: plan.limits?.maxOwners ?? 0,
    maxManagers: plan.limits?.maxManagers ?? 0,
    maxCashiers: plan.limits?.maxCashiers ?? 0,
    maxProducts: plan.limits?.maxProducts ?? 0,
    maxTransactionsPerMonth: plan.limits?.maxTransactionsPerMonth ?? 0,
    maxAiCallsPerDay: plan.limits?.maxAiCallsPerDay ?? 0,
    aiInsights: !!plan.features?.aiInsights,
    multiLocation: !!plan.features?.multiLocation,
    api: !!plan.features?.api,
    prioritySupport: !!plan.features?.prioritySupport,
    customDomain: !!plan.features?.customDomain,
    isPublic: plan.isPublic !== false,
    isActive: plan.isActive !== false,
    sortOrder: plan.sortOrder ?? 0,
    trialDays: plan.trialDays ?? 0,
  };
}

export default function Plans() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      const data = res?.data || res;
      setPlans(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (plan) => {
    setEditTarget(plan);
    setDraft(emptyDraft(plan));
  };

  const closeEdit = () => {
    setEditTarget(null);
    setDraft(null);
  };

  const patch = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const saveEdit = async () => {
    if (!editTarget || !draft) return;
    setSaving(true);
    try {
      await updatePlan(editTarget._id || editTarget.id, {
        name: draft.name,
        description: draft.description,
        price: {
          amount: Number(draft.priceAmount),
          currency: draft.priceCurrency,
          interval: draft.priceInterval,
        },
        limits: {
          maxOwners: Number(draft.maxOwners),
          maxManagers: Number(draft.maxManagers),
          maxCashiers: Number(draft.maxCashiers),
          maxProducts: Number(draft.maxProducts),
          maxTransactionsPerMonth: Number(draft.maxTransactionsPerMonth),
          maxAiCallsPerDay: Number(draft.maxAiCallsPerDay),
        },
        features: {
          aiInsights: draft.aiInsights,
          multiLocation: draft.multiLocation,
          api: draft.api,
          prioritySupport: draft.prioritySupport,
          customDomain: draft.customDomain,
        },
        isPublic: draft.isPublic,
        isActive: draft.isActive,
        sortOrder: Number(draft.sortOrder),
        trialDays: Number(draft.trialDays),
      });
      toast.success('Plan updated');
      closeEdit();
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan) => {
    try {
      if (plan.isActive) {
        await deactivatePlan(plan._id || plan.id);
      } else {
        await updatePlan(plan._id || plan.id, { isActive: true });
      }
      toast.success('Plan updated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deletePlan(deleteTarget._id || deleteTarget.id);
      toast.success('Plan deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {plans.length} plans configured
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const id = plan._id || plan.id;
          const isFree = (plan.price?.amount ?? 0) === 0;
          return (
            <Card key={id} title={plan.name} description={plan.description}>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {isFree
                      ? 'Free'
                      : `${plan.price?.currency} ${(plan.price?.amount ?? 0).toLocaleString()}`}
                  </p>
                  {!isFree && (
                    <p className="text-xs text-[var(--text-muted)]">
                      {plan.price?.interval === 'once'
                        ? 'one-time'
                        : plan.price?.interval === 'year'
                        ? 'per year'
                        : 'per month'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={plan.isActive ? 'success' : 'default'} dot>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {plan.isPublic && <Badge variant="info">Public</Badge>}
                  {plan.trialDays > 0 && (
                    <Badge variant="info">{plan.trialDays}-day trial</Badge>
                  )}
                </div>

                <div className="border-t border-[var(--border-color)] pt-3">
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Limits
                  </p>
                  <ul className="space-y-1 text-sm text-[var(--text-primary)]">
                    <li>{plan.limits?.maxOwners ?? 0} owners</li>
                    <li>{plan.limits?.maxManagers ?? 0} managers</li>
                    <li>{plan.limits?.maxCashiers ?? 0} cashiers</li>
                    <li>{(plan.limits?.maxProducts ?? 0).toLocaleString()} products</li>
                    <li>
                      {plan.limits?.maxTransactionsPerMonth === 0
                        ? 'Unlimited transactions'
                        : `${(plan.limits?.maxTransactionsPerMonth ?? 0).toLocaleString()} trans / month`}
                    </li>
                    <li>
                      {(plan.limits?.maxAiCallsPerDay ?? 0).toLocaleString()} AI calls /
                      day
                    </li>
                  </ul>
                </div>

                <div className="border-t border-[var(--border-color)] pt-3">
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Features
                  </p>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(plan.features || {}).map(([key, val]) => (
                      <li
                        key={key}
                        className={
                          val
                            ? 'text-[var(--text-primary)]'
                            : 'text-[var(--text-muted)] line-through'
                        }
                      >
                        {val && <HiCheck className="w-3 h-3 inline mr-1" />}
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<HiPencil className="w-3.5 h-3.5" />}
                    onClick={() => openEdit(plan)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<HiTrash className="w-3.5 h-3.5" />}
                    onClick={() => setDeleteTarget(plan)}
                  />
                </div>

                <Button
                  variant={plan.isActive ? 'ghost' : 'primary'}
                  size="sm"
                  fullWidth
                  onClick={() => toggleActive(plan)}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!editTarget}
        onClose={closeEdit}
        title={`Edit ${editTarget?.name || 'plan'}`}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit} loading={saving}>
              Save changes
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Name"
                value={draft.name}
                onChange={(e) => patch('name', e.target.value)}
              />
              <Input
                label="Description"
                value={draft.description}
                onChange={(e) => patch('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Amount"
                type="number"
                value={draft.priceAmount}
                onChange={(e) => patch('priceAmount', e.target.value)}
              />
              <Select
                label="Currency"
                value={draft.priceCurrency}
                onChange={(e) => patch('priceCurrency', e.target.value)}
                options={['KES', 'USD', 'UGX', 'TZS', 'NGN', 'GHS', 'ZAR'].map((c) => ({
                  value: c,
                  label: c,
                }))}
              />
              <Select
                label="Interval"
                value={draft.priceInterval}
                onChange={(e) => patch('priceInterval', e.target.value)}
                options={[
                  { value: 'once', label: 'One-time' },
                  { value: 'month', label: 'Monthly' },
                  { value: 'year', label: 'Annual' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input
                label="Max owners"
                type="number"
                value={draft.maxOwners}
                onChange={(e) => patch('maxOwners', e.target.value)}
              />
              <Input
                label="Max managers"
                type="number"
                value={draft.maxManagers}
                onChange={(e) => patch('maxManagers', e.target.value)}
              />
              <Input
                label="Max cashiers"
                type="number"
                value={draft.maxCashiers}
                onChange={(e) => patch('maxCashiers', e.target.value)}
              />
              <Input
                label="Max products"
                type="number"
                value={draft.maxProducts}
                onChange={(e) => patch('maxProducts', e.target.value)}
              />
              <Input
                label="Transactions / month"
                type="number"
                hint="0 = unlimited"
                value={draft.maxTransactionsPerMonth}
                onChange={(e) => patch('maxTransactionsPerMonth', e.target.value)}
              />
              <Input
                label="AI calls / day"
                type="number"
                value={draft.maxAiCallsPerDay}
                onChange={(e) => patch('maxAiCallsPerDay', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Toggle
                label="AI Insights"
                checked={draft.aiInsights}
                onChange={(v) => patch('aiInsights', v)}
              />
              <Toggle
                label="Multi-Location"
                checked={draft.multiLocation}
                onChange={(v) => patch('multiLocation', v)}
              />
              <Toggle
                label="API Access"
                checked={draft.api}
                onChange={(v) => patch('api', v)}
              />
              <Toggle
                label="Priority Support"
                checked={draft.prioritySupport}
                onChange={(v) => patch('prioritySupport', v)}
              />
              <Toggle
                label="Custom Domain"
                checked={draft.customDomain}
                onChange={(v) => patch('customDomain', v)}
              />
            </div>

            <div className="space-y-1">
              <Toggle
                label="Public"
                description="Show on the register page"
                checked={draft.isPublic}
                onChange={(v) => patch('isPublic', v)}
              />
              <Toggle
                label="Active"
                description="Clients can be assigned to this plan"
                checked={draft.isActive}
                onChange={(v) => patch('isActive', v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sort order"
                hint="Lower shows first"
                type="number"
                value={draft.sortOrder}
                onChange={(e) => patch('sortOrder', e.target.value)}
              />
              <Input
                label="Trial days"
                hint="0 = no trial"
                type="number"
                value={draft.trialDays}
                onChange={(e) => patch('trialDays', e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete plan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doDelete} loading={busy}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Permanently delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          Plans in use by clients cannot be deleted.
        </p>
      </Modal>
    </div>
  );
}
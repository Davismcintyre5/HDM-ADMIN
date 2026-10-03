import { useEffect, useState } from 'react';
import { HiPencil, HiTrash, HiCheck, HiPlus } from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Button from '../../components/pharmasys/ui/Button';
import Badge from '../../components/pharmasys/ui/Badge';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Modal from '../../components/pharmasys/ui/Modal';
import Input from '../../components/pharmasys/ui/Input';
import Select from '../../components/pharmasys/ui/Select';
import Toggle from '../../components/pharmasys/ui/Toggle';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getPlans,
  createPlan,
  updatePlan,
  deactivatePlan,
  deletePlan,
} from '../../services/pharmasys/plans';
import {
  PLAN_INTERVALS,
  PLAN_FEATURES,
  PLAN_LIMITS,
} from '../../utils/pharmasys/constants';

const EMPTY_DRAFT = {
  code: '',
  name: '',
  description: '',
  priceAmount: 0,
  priceCurrency: 'KES',
  priceInterval: 'month',
  maxOwners: 1,
  maxBranches: 1,
  maxManagersPerBranch: 1,
  maxCashiersPerBranch: 3,
  maxProducts: 1000,
  maxTransactionsPerMonth: 10000,
  maxAiCallsPerDay: 50,
  maxSmsPerMonth: 200,
  aiInsights: true,
  multiBranch: false,
  api: false,
  prioritySupport: false,
  customDomain: false,
  prescriptions: true,
  interactionCheck: false,
  isPublic: true,
  isActive: true,
  sortOrder: 0,
  trialDays: 14,
};

function toDraft(plan) {
  return {
    code: plan.code || '',
    name: plan.name || '',
    description: plan.description || '',
    priceAmount: plan.price?.amount ?? 0,
    priceCurrency: plan.price?.currency || 'KES',
    priceInterval: plan.price?.interval || 'month',
    maxOwners: plan.limits?.maxOwners ?? 1,
    maxBranches: plan.limits?.maxBranches ?? 1,
    maxManagersPerBranch: plan.limits?.maxManagersPerBranch ?? 1,
    maxCashiersPerBranch: plan.limits?.maxCashiersPerBranch ?? 3,
    maxProducts: plan.limits?.maxProducts ?? 1000,
    maxTransactionsPerMonth: plan.limits?.maxTransactionsPerMonth ?? 10000,
    maxAiCallsPerDay: plan.limits?.maxAiCallsPerDay ?? 50,
    maxSmsPerMonth: plan.limits?.maxSmsPerMonth ?? 200,
    aiInsights: !!plan.features?.aiInsights,
    multiBranch: !!plan.features?.multiBranch,
    api: !!plan.features?.api,
    prioritySupport: !!plan.features?.prioritySupport,
    customDomain: !!plan.features?.customDomain,
    prescriptions: !!plan.features?.prescriptions,
    interactionCheck: !!plan.features?.interactionCheck,
    isPublic: plan.isPublic !== false,
    isActive: plan.isActive !== false,
    sortOrder: plan.sortOrder ?? 0,
    trialDays: plan.trialDays ?? 0,
  };
}

function fromDraft(draft, includeCode) {
  const base = {
    name: draft.name,
    description: draft.description,
    price: {
      amount: Number(draft.priceAmount),
      currency: draft.priceCurrency,
      interval: draft.priceInterval,
    },
    limits: {
      maxOwners: Number(draft.maxOwners),
      maxBranches: Number(draft.maxBranches),
      maxManagersPerBranch: Number(draft.maxManagersPerBranch),
      maxCashiersPerBranch: Number(draft.maxCashiersPerBranch),
      maxProducts: Number(draft.maxProducts),
      maxTransactionsPerMonth: Number(draft.maxTransactionsPerMonth),
      maxAiCallsPerDay: Number(draft.maxAiCallsPerDay),
      maxSmsPerMonth: Number(draft.maxSmsPerMonth),
    },
    features: {
      aiInsights: draft.aiInsights,
      multiBranch: draft.multiBranch,
      api: draft.api,
      prioritySupport: draft.prioritySupport,
      customDomain: draft.customDomain,
      prescriptions: draft.prescriptions,
      interactionCheck: draft.interactionCheck,
    },
    isPublic: draft.isPublic,
    isActive: draft.isActive,
    sortOrder: Number(draft.sortOrder),
    trialDays: Number(draft.trialDays),
  };
  if (includeCode) base.code = draft.code;
  return base;
}

export default function Plans() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      const data = res?.data || res;
      setPlans(Array.isArray(data) ? data : []);
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

  const openCreate = () => {
    setCreating(true);
    setEditTarget(null);
    setDraft({ ...EMPTY_DRAFT });
  };

  const openEdit = (plan) => {
    setEditTarget(plan);
    setCreating(false);
    setDraft(toDraft(plan));
  };

  const closeModal = () => {
    setEditTarget(null);
    setCreating(false);
    setDraft(null);
  };

  const patch = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const saveDraft = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (creating && !draft.code.trim()) {
      toast.error('Code is required');
      return;
    }
    setSaving(true);
    try {
      if (creating) {
        await createPlan(fromDraft(draft, true));
        toast.success('Plan created');
      } else {
        await updatePlan(editTarget._id || editTarget.id, fromDraft(draft, false));
        toast.success('Plan updated');
      }
      closeModal();
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {plans.length} plans configured
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
          Create plan
        </Button>
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
                  {plan.code && (
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                      {plan.code}
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
                    <li>{plan.limits?.maxBranches ?? 0} branches</li>
                    <li>{plan.limits?.maxManagersPerBranch ?? 0} managers / branch</li>
                    <li>{plan.limits?.maxCashiersPerBranch ?? 0} cashiers / branch</li>
                    <li>{(plan.limits?.maxProducts ?? 0).toLocaleString()} products</li>
                    <li>
                      {plan.limits?.maxTransactionsPerMonth === 0
                        ? 'Unlimited transactions'
                        : `${(plan.limits?.maxTransactionsPerMonth ?? 0).toLocaleString()} trans / month`}
                    </li>
                    <li>
                      {(plan.limits?.maxSmsPerMonth ?? 0).toLocaleString()} SMS / month
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
        open={!!draft}
        onClose={closeModal}
        title={creating ? 'Create plan' : `Edit ${editTarget?.name || 'plan'}`}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={saveDraft} loading={saving}>
              {creating ? 'Create' : 'Save changes'}
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creating && (
                <Input
                  label="Code"
                  hint="Unique identifier, e.g. starter"
                  value={draft.code}
                  onChange={(e) => patch('code', e.target.value)}
                />
              )}
              <Input
                label="Name"
                value={draft.name}
                onChange={(e) => patch('name', e.target.value)}
              />
            </div>

            <Input
              label="Description"
              value={draft.description}
              onChange={(e) => patch('description', e.target.value)}
            />

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
                options={['KES', 'USD', 'UGX', 'TZS', 'NGN', 'GHS', 'ZAR'].map(
                  (c) => ({ value: c, label: c })
                )}
              />
              <Select
                label="Interval"
                value={draft.priceInterval}
                onChange={(e) => patch('priceInterval', e.target.value)}
                options={PLAN_INTERVALS}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                Limits
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PLAN_LIMITS.map((limit) => (
                  <Input
                    key={limit.key}
                    label={limit.label}
                    hint={limit.hint}
                    type="number"
                    value={draft[limit.key]}
                    onChange={(e) => patch(limit.key, e.target.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                Features
              </p>
              <div className="space-y-1">
                {PLAN_FEATURES.map((f) => (
                  <Toggle
                    key={f.key}
                    label={f.label}
                    checked={draft[f.key]}
                    onChange={(v) => patch(f.key, v)}
                  />
                ))}
              </div>
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
                description="Tenants can be assigned to this plan"
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
          Permanently delete <strong>{deleteTarget?.name}</strong>? This cannot
          be undone. Plans in use by tenants cannot be deleted.
        </p>
      </Modal>
    </div>
  );
}
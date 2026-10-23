import { useEffect, useState } from 'react';
import { HiPencil, HiTrash, HiCheck, HiPlus } from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Button from '../../components/meteo/ui/Button';
import Badge from '../../components/meteo/ui/Badge';
import Modal from '../../components/meteo/ui/Modal';
import Input from '../../components/meteo/ui/Input';
import Select from '../../components/meteo/ui/Select';
import Toggle from '../../components/meteo/ui/Toggle';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import {
  getPlans,
  createPlan,
  updatePlan,
  deactivatePlan,
  deletePlan,
} from '../../services/meteo/plans';
import { PLAN_INTERVALS, PLAN_FEATURES } from '../../utils/meteo/constants';
import { formatMoneyMajor } from '../../utils/meteo/formatMoney';

const EMPTY = {
  code: '',
  name: '',
  description: '',
  priceAmount: 0,
  priceCurrency: 'KES',
  priceInterval: 'month',
  currentWeather: true,
  forecast: true,
  aiSummary: false,
  historical: false,
  alerts: false,
  bulkLookup: false,
  isPublic: true,
  isActive: true,
  sortOrder: 0,
  trialDays: 0,
};

function toForm(p) {
  const f = p.features || {};
  return {
    code: p.code || '',
    name: p.name || '',
    description: p.description || '',
    priceAmount: p.price?.amount ?? 0,
    priceCurrency: p.price?.currency || 'KES',
    priceInterval: p.price?.interval || 'month',
    currentWeather: !!f.currentWeather,
    forecast: !!f.forecast,
    aiSummary: !!f.aiSummary,
    historical: !!f.historical,
    alerts: !!f.alerts,
    bulkLookup: !!f.bulkLookup,
    isPublic: p.isPublic !== false,
    isActive: p.isActive !== false,
    sortOrder: p.sortOrder ?? 0,
    trialDays: p.trialDays ?? 0,
  };
}

export default function Plans() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [modal, setModal] = useState({ open: false, mode: 'create', plan: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, plan: null });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      const data = res?.data || res;
      setPlans(data?.plans || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setModal({ open: true, mode: 'create', plan: null });
  };

  const openEdit = (p) => {
    setForm(toForm(p));
    setModal({ open: true, mode: 'edit', plan: p });
  };

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and name are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: {
          amount: Number(form.priceAmount),
          currency: form.priceCurrency,
          interval: form.priceInterval,
        },
        features: {
          currentWeather: form.currentWeather,
          forecast: form.forecast,
          aiSummary: form.aiSummary,
          historical: form.historical,
          alerts: form.alerts,
          bulkLookup: form.bulkLookup,
        },
        isPublic: form.isPublic,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
        trialDays: Number(form.trialDays),
      };
      if (modal.mode === 'create') {
        payload.code = form.code.trim();
        await createPlan(payload);
        toast.success('Plan created');
      } else {
        await updatePlan(modal.plan._id || modal.plan.id, payload);
        toast.success('Plan updated');
      }
      setModal({ open: false, mode: 'create', plan: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (p) => {
    try {
      await deactivatePlan(p._id || p.id);
      toast.success('Plan deactivated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.plan) return;
    setBusy(true);
    try {
      await deletePlan(confirmDelete.plan._id || confirmDelete.plan.id);
      toast.success('Plan deleted');
      setConfirmDelete({ open: false, plan: null });
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Plans
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {plans.length} plan{plans.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
          Create plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => {
          const id = p._id || p.id;
          const isFree = (p.price?.amount ?? 0) === 0;
          return (
            <Card key={id} title={p.name} description={p.description}>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {isFree
                      ? 'Free'
                      : formatMoneyMajor(p.price?.amount ?? 0, p.price?.currency)}
                  </p>
                  {!isFree && (
                    <p className="text-xs text-[var(--text-muted)]">
                      {p.price?.interval === 'year'
                        ? 'per year'
                        : p.price?.interval === 'once'
                        ? 'one-time'
                        : 'per month'}
                    </p>
                  )}
                  <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
                    {p.code}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={p.isActive ? 'success' : 'default'} dot>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {p.isPublic && <Badge variant="info">Public</Badge>}
                  {p.trialDays > 0 && (
                    <Badge variant="info">{p.trialDays}-day trial</Badge>
                  )}
                </div>

                <div className="border-t border-[var(--border-color)] pt-3">
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Features
                  </p>
                  <ul className="space-y-1 text-sm">
                    {PLAN_FEATURES.map((f) => {
                      const val = !!p.features?.[f.key];
                      return (
                        <li
                          key={f.key}
                          className={
                            val
                              ? 'text-[var(--text-primary)]'
                              : 'text-[var(--text-muted)] line-through'
                          }
                        >
                          {val && <HiCheck className="w-3 h-3 inline mr-1" />}
                          {f.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<HiPencil className="w-3.5 h-3.5" />}
                    onClick={() => openEdit(p)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<HiTrash className="w-3.5 h-3.5" />}
                    onClick={() => setConfirmDelete({ open: true, plan: p })}
                  />
                </div>

                {p.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => handleDeactivate(p)}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', plan: null })}
        title={modal.mode === 'create' ? 'Create plan' : `Edit ${modal.plan?.name || 'plan'}`}
        size="xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModal({ open: false, mode: 'create', plan: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {modal.mode === 'create' ? 'Create' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Code *"
              value={form.code}
              onChange={(e) => patch('code', e.target.value)}
              disabled={modal.mode === 'edit'}
              placeholder="monthly"
              hint={modal.mode === 'edit' ? 'Code cannot be changed' : undefined}
            />
            <Input
              label="Name *"
              value={form.name}
              onChange={(e) => patch('name', e.target.value)}
            />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => patch('description', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Amount"
              type="number"
              value={form.priceAmount}
              onChange={(e) => patch('priceAmount', e.target.value)}
            />
            <Select
              label="Currency"
              value={form.priceCurrency}
              onChange={(e) => patch('priceCurrency', e.target.value)}
              options={['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX', 'NGN', 'GHS'].map(
                (c) => ({ value: c, label: c })
              )}
            />
            <Select
              label="Interval"
              value={form.priceInterval}
              onChange={(e) => patch('priceInterval', e.target.value)}
              options={PLAN_INTERVALS}
            />
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
                  checked={form[f.key]}
                  onChange={(v) => patch(f.key, v)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Toggle
              label="Public"
              description="Show on the pricing page"
              checked={form.isPublic}
              onChange={(v) => patch('isPublic', v)}
            />
            <Toggle
              label="Active"
              description="Tenants can be assigned this plan"
              checked={form.isActive}
              onChange={(v) => patch('isActive', v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sort order"
              type="number"
              hint="Lower shows first"
              value={form.sortOrder}
              onChange={(e) => patch('sortOrder', e.target.value)}
            />
            <Input
              label="Trial days"
              type="number"
              hint="0 = no trial"
              value={form.trialDays}
              onChange={(e) => patch('trialDays', e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, plan: null })}
        title="Delete plan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete({ open: false, plan: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={busy}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Permanently delete <strong>{confirmDelete.plan?.name}</strong>? This
          cannot be undone. Tenants using this plan must be reassigned first or
          they will be orphaned.
        </p>
      </Modal>
    </div>
  );
}
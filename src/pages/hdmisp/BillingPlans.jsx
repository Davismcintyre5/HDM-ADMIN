import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiCheck } from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Select from '../../components/hdmisp/ui/Select';
import Modal from '../../components/hdmisp/ui/Modal';
import ConfirmDialog from '../../components/hdmisp/ui/ConfirmDialog';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import {
  getBillingPlans,
  createBillingPlan,
  updateBillingPlan,
  deleteBillingPlan,
} from '../../services/hdmisp/billingPlans';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';
import { BILLING_CYCLES, statusLabel } from '../../utils/hdmisp/constants';

const ALL_FEATURES = ['hotspot', 'pppoe', 'vouchers', 'sms', 'email', 'reports', 'priority', 'api'];

const EMPTY = {
  name: '',
  description: '',
  price: 0,
  currency: 'KES',
  billingCycle: 'monthly',
  trialDays: 0,
  features: ['hotspot', 'pppoe'],
  status: 'active',
};

export default function BillingPlans() {
  const toast = useToast();
  const { isSuperadmin } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [modal, setModal] = useState({ open: false, mode: 'create', plan: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBillingPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY });
    setModal({ open: true, mode: 'create', plan: null });
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price ?? 0,
      currency: p.currency || 'KES',
      billingCycle: p.billingCycle || 'monthly',
      trialDays: p.trialDays ?? 0,
      features: Array.isArray(p.features) ? p.features : [],
      status: p.status || 'active',
    });
    setModal({ open: true, mode: 'edit', plan: p });
  };

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleFeature = (f) => {
    const current = form.features || [];
    patch('features', current.includes(f) ? current.filter((x) => x !== f) : [...current, f]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (form.billingCycle === 'trial' && (!form.trialDays || Number(form.trialDays) < 1)) {
      toast.error('Trial days is required for trial plans');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: form.billingCycle === 'trial' ? 0 : Number(form.price) || 0,
        currency: form.currency,
        billingCycle: form.billingCycle,
        trialDays: form.billingCycle === 'trial' ? Number(form.trialDays) || 0 : 0,
        features: form.features || [],
      };
      if (modal.mode === 'create') {
        await createBillingPlan(payload);
        toast.success('Plan created');
      } else {
        await updateBillingPlan(modal.plan._id, { ...payload, status: form.status });
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

  const doDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteBillingPlan(confirmDelete._id);
      toast.success('Plan deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Billing Plans</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {plans.length} plan{plans.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        {isSuperadmin && (
          <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
            New plan
          </Button>
        )}
      </div>

      {plans.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No plans configured yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <Card key={p._id} title={p.name} description={p.description}>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {formatMoneyMajor(p.price ?? 0, p.currency || 'KES')}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {p.billingCycle === 'trial' && p.trialDays
                      ? `${p.trialDays} days trial`
                      : `per ${p.billingCycle || 'month'}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={p.status === 'active' ? 'success' : 'default'} dot>
                    {statusLabel(p.status)}
                  </Badge>
                  <Badge variant="info">{statusLabel(p.billingCycle)}</Badge>
                </div>
                {(p.features || []).length > 0 && (
                  <div className="border-t border-[var(--border-color)] pt-3">
                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {p.features.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-[10px] font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {isSuperadmin && (
                  <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(p)}>
                      <HiPencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmDelete(p)}>
                      <HiTrash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', plan: null })}
        title={modal.mode === 'create' ? 'Create plan' : 'Edit plan'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', plan: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => patch('name', e.target.value)} placeholder="Monthly" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => patch('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm resize-y"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => patch('price', e.target.value)}
              disabled={form.billingCycle === 'trial'}
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={(e) => patch('currency', e.target.value)}
              options={['KES', 'USD', 'UGX', 'TZS', 'NGN', 'GHS', 'ZAR'].map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Cycle"
              value={form.billingCycle}
              onChange={(e) => patch('billingCycle', e.target.value)}
              options={BILLING_CYCLES.map((c) => ({ value: c, label: statusLabel(c) }))}
            />
          </div>
          {form.billingCycle === 'trial' && (
            <Input
              label="Trial days *"
              type="number"
              value={form.trialDays}
              onChange={(e) => patch('trialDays', e.target.value)}
              placeholder="14"
            />
          )}
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {ALL_FEATURES.map((f) => {
                const active = (form.features || []).includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active ? 'bg-cyan-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {active && <HiCheck className="w-3 h-3 inline mr-1" />}{f}
                  </button>
                );
              })}
            </div>
          </div>
          {modal.mode === 'edit' && (
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => patch('status', e.target.value)}
              options={[{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }]}
            />
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={doDelete}
        title="Delete plan"
        message={`Permanently delete "${confirmDelete?.name}"? Providers on this plan must be reassigned first.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busy}
      />
    </div>
  );
}
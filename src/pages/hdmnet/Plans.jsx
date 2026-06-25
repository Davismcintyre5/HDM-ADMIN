import { useState, useEffect } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../services/hdmnet/plans';
import Card from '../../components/hdmnet/ui/Card';
import Table from '../../components/hdmnet/ui/Table';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import Input from '../../components/hdmnet/ui/Input';
import Toggle from '../../components/hdmnet/ui/Toggle';
import Modal from '../../components/hdmnet/ui/Modal';
import ConfirmDialog from '../../components/hdmnet/ui/ConfirmDialog';
import Spinner from '../../components/hdmnet/ui/Spinner';
import { HiPlus } from 'react-icons/hi';

const PLAN_TYPES = [
  { value: 'free_trial', label: 'Free Trial' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One Time' },
];

function getEmptyForm() {
  return {
    name: '', description: '', plan_type: 'monthly', price: 0,
    duration_days: 30, max_networks: 1, max_plans: 5, max_vouchers: 100,
    platform_fee_percent: 10, white_label: false, priority_support: false,
  };
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState(getEmptyForm());

  const fetchPlans = () => {
    setLoading(true);
    getPlans()
      .then((res) => setPlans(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => { setForm(getEmptyForm()); setModal({ open: true, mode: 'create', data: null }); };

  const openEdit = (plan) => {
    setForm({
      name: plan.name || '', description: plan.description || '',
      plan_type: plan.plan_type || 'monthly', price: plan.price || 0,
      duration_days: plan.duration_days || 30, max_networks: plan.max_networks || 1,
      max_plans: plan.max_plans || 5, max_vouchers: plan.max_vouchers || 100,
      platform_fee_percent: plan.platform_fee_percent ?? 10,
      white_label: plan.white_label || false, priority_support: plan.priority_support || false,
    });
    setModal({ open: true, mode: 'edit', data: plan });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createPlan(form);
      else await updatePlan(modal.data._id || modal.data.id, form);
      setModal({ open: false, mode: 'create', data: null });
      fetchPlans();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deletePlan(confirm.id); fetchPlans(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null });
  };

  const columns = [
    { key: 'name', label: 'Plan Name', render: (row) => <span className="font-medium text-[var(--text-primary)]">{row.name}</span> },
    { key: 'plan_type', label: 'Type', render: (row) => <Badge variant="info">{row.plan_type?.replace('_', ' ') || 'N/A'}</Badge> },
    { key: 'price', label: 'Price', render: (row) => <span className="text-[var(--text-primary)]">KES {(row.price || 0).toLocaleString()}</span> },
    { key: 'duration_days', label: 'Duration (Days)' },
    { key: 'max_networks', label: 'Max Networks' },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id || row.id })}>Delete</Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>
      <Card>
        <Table columns={columns} data={plans} loading={loading} emptyMessage="No plans found." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Plan' : 'Edit Plan'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Plan Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Plan Type</label>
              <select value={form.plan_type} onChange={(e) => setForm({ ...form, plan_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
                {PLAN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price (KES)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
            <Input label="Duration (Days)" type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: +e.target.value })} />
            <Input label="Platform Fee %" type="number" value={form.platform_fee_percent} onChange={(e) => setForm({ ...form, platform_fee_percent: +e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Max Networks" type="number" value={form.max_networks} onChange={(e) => setForm({ ...form, max_networks: +e.target.value })} />
            <Input label="Max Plans" type="number" value={form.max_plans} onChange={(e) => setForm({ ...form, max_plans: +e.target.value })} />
            <Input label="Max Vouchers" type="number" value={form.max_vouchers} onChange={(e) => setForm({ ...form, max_vouchers: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Toggle label="White Label" checked={form.white_label} onChange={(v) => setForm({ ...form, white_label: v })} />
            <Toggle label="Priority Support" checked={form.priority_support} onChange={(v) => setForm({ ...form, priority_support: v })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete}
        title="Delete Plan" message="Are you sure you want to delete this plan?" confirmLabel="Delete" variant="danger" loading={actionLoading}
      />
    </div>
  );
}
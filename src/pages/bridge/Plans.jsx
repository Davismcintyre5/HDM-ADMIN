import { useEffect, useState } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan, togglePlan } from '../../services/bridge/plans';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import Toggle from '../../components/bridge/ui/Toggle';
import ConfirmDialog from '../../components/bridge/ui/ConfirmDialog';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, plan: null });
  const [form, setForm] = useState({ name: '', description: '', tier: 'pro', price: { amount: 0, currency: 'USD', interval: 'month' } });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchPlans = () => {
    setLoading(true);
    getPlans()
      .then(res => setPlans(res.plans || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => { setForm({ name: '', description: '', tier: 'pro', price: { amount: 0, currency: 'USD', interval: 'month' } }); setModal({ open: true, plan: null }); };
  const openEdit = (p) => { setForm({ name: p.name, description: p.description, tier: p.tier, price: p.price }); setModal({ open: true, plan: p }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.plan) await updatePlan(modal.plan._id || modal.plan.id, form);
      else await createPlan(form);
      setModal({ open: false, plan: null });
      fetchPlans();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleToggle = async (id) => {
    try { await togglePlan(id); fetchPlans(); } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    try { await deletePlan(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchPlans(); }
    catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'tier', label: 'Tier', render: (row) => <Badge variant="indigo">{row.tier}</Badge> },
    { key: 'price.amount', label: 'Price', render: (row) => <span className="font-medium">${row.price?.amount} / {row.price?.interval}</span> },
    { key: 'isActive', label: 'Status', render: (row) => (
      <button onClick={() => handleToggle(row._id || row.id)}>
        {row.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}
      </button>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id || row.id })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>
      <Card>
        <Table columns={columns} data={plans} loading={loading} emptyMessage="No plans." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, plan: null })} title={modal.plan ? 'Edit Plan' : 'New Plan'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm focus:ring-2 focus:ring-indigo-500 resize-y" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tier</label>
            <select value={form.tier} onChange={(e) => setForm(p => ({ ...p, tier: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="free">Free</option><option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Price" type="number" value={form.price.amount} onChange={(e) => setForm(p => ({ ...p, price: { ...p.price, amount: Number(e.target.value) } }))} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Currency</label>
              <select value={form.price.currency} onChange={(e) => setForm(p => ({ ...p, price: { ...p.price, currency: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                <option value="USD">USD</option><option value="KES">KES</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Interval</label>
              <select value={form.price.interval} onChange={(e) => setForm(p => ({ ...p, price: { ...p.price, interval: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                <option value="month">Monthly</option><option value="year">Yearly</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, plan: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Plan" message="Delete this plan?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}
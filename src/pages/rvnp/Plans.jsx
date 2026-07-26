import { useState, useEffect } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan, togglePlan } from '../../services/rvnp/plans';
import Card from '../../components/rvnp/ui/Card';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Toggle from '../../components/rvnp/ui/Toggle';
import Modal from '../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../components/rvnp/ui/ConfirmDialog';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatCurrency } from '../../utils/rvnp/formatters';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const emptyForm = {
  name: '', slug: '', description: '', price: 0, duration: 30, durationLabel: 'monthly',
  features: [], includesVerification: false, maxListings: 5, maxGroups: 3, prioritySupport: false,
  earlyFeatures: false, customProfile: false, color: '#059669', sortOrder: 0,
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState(emptyForm);
  const [featuresInput, setFeaturesInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchPlans = () => {
    setLoading(true);
    getPlans().then(res => setPlans(Array.isArray(res.data) ? res.data : [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => { setForm(emptyForm); setFeaturesInput(''); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (plan) => {
    setForm({
      name: plan.name, slug: plan.slug, description: plan.description || '', price: plan.price,
      duration: plan.duration, durationLabel: plan.durationLabel, features: plan.features || [],
      includesVerification: plan.includesVerification, maxListings: plan.maxListings, maxGroups: plan.maxGroups,
      prioritySupport: plan.prioritySupport, earlyFeatures: plan.earlyFeatures, customProfile: plan.customProfile,
      color: plan.color || '#059669', sortOrder: plan.sortOrder || 0,
    });
    setFeaturesInput((plan.features || []).join(', '));
    setModal({ open: true, mode: 'edit', data: plan });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const data = { ...form, features: featuresInput.split(',').map(f => f.trim()).filter(Boolean) };
      if (modal.mode === 'create') await createPlan(data);
      else await updatePlan(modal.data._id, data);
      setModal({ open: false, mode: 'create', data: null }); fetchPlans();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleToggle = async (id) => { try { await togglePlan(id); fetchPlans(); } catch (err) { alert(err.message); } };
  const handleDelete = async () => { setActionLoading(true); try { await deletePlan(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchPlans(); } catch (err) { alert(err.message); } setActionLoading(false); };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <Card key={plan._id} className="relative">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: plan.color }}>{plan.name}</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                {formatCurrency(plan.price, 'KES')}<span className="text-sm text-[var(--text-secondary)]">/{plan.durationLabel}</span>
              </p>
            </div>
            <div className="space-y-1 text-sm mb-4">
              {plan.features?.map((f, i) => <p key={i} className="text-[var(--text-secondary)]">✓ {f}</p>)}
            </div>
            <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(plan)}><HiPencil className="w-4 h-4 mr-1" /> Edit</Button>
              <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: plan._id, name: plan.name })}><HiTrash className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Plan' : 'Edit Plan'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
          </div>
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price (KES)" type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} />
            <Input label="Duration (days)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} />
            <Input label="Label" value={form.durationLabel} onChange={e => setForm({ ...form, durationLabel: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Max Listings" type="number" value={form.maxListings} onChange={e => setForm({ ...form, maxListings: +e.target.value })} />
            <Input label="Max Groups" type="number" value={form.maxGroups} onChange={e => setForm({ ...form, maxGroups: +e.target.value })} />
            <Input label="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Features (comma separated)</label>
            <textarea value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Verification" checked={form.includesVerification} onChange={v => setForm({ ...form, includesVerification: v })} />
            <Toggle label="Priority Support" checked={form.prioritySupport} onChange={v => setForm({ ...form, prioritySupport: v })} />
            <Toggle label="Early Features" checked={form.earlyFeatures} onChange={v => setForm({ ...form, earlyFeatures: v })} />
            <Toggle label="Custom Profile" checked={form.customProfile} onChange={v => setForm({ ...form, customProfile: v })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Plan" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
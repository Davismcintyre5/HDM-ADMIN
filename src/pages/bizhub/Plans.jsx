import { useState, useEffect } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan, togglePlan } from '../../services/bizhub/plans';
import Card from '../../components/bizhub/ui/Card';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Input from '../../components/bizhub/ui/Input';
import Toggle from '../../components/bizhub/ui/Toggle';
import Modal from '../../components/bizhub/ui/Modal';
import ConfirmDialog from '../../components/bizhub/ui/ConfirmDialog';
import Spinner from '../../components/bizhub/ui/Spinner';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';

const CYCLES = ['trial', 'monthly', 'yearly', 'permanent'];
const CYCLE_COLORS = { trial: 'info', monthly: 'success', yearly: 'info', permanent: 'warning' };

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState(getEmptyForm());

  function getEmptyForm() {
    return { name: '', slug: '', cycle: 'monthly', price: 0, maxUsers: 5, maxStorageMB: 2048, features: [], isActive: true, highlighted: false, sortOrder: 0 };
  }

  const fetchPlans = () => {
    setLoading(true);
    getPlans()
      .then(res => setPlans(res?.data || res || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => { setForm(getEmptyForm()); setModal({ open: true, mode: 'create', data: null }); };

  const openEdit = (plan) => {
    setForm({
      name: plan.name || '', slug: plan.slug || '', cycle: plan.cycle || 'monthly',
      price: plan.price || 0, maxUsers: plan.maxUsers ?? 5, maxStorageMB: plan.maxStorageMB ?? 2048,
      features: plan.features || [], isActive: plan.isActive !== false, highlighted: plan.highlighted || false,
      sortOrder: plan.sortOrder || 0,
    });
    setModal({ open: true, mode: 'edit', data: plan });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Plan name is required');
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createPlan(form);
      else await updatePlan(modal.data._id, form);
      setModal({ open: false, mode: 'create', data: null });
      fetchPlans();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleToggle = async (id) => {
    try { await togglePlan(id); fetchPlans(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deletePlan(confirm.id); fetchPlans(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, name: '' });
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] });
  const updateFeature = (i, val) => {
    const f = [...form.features]; f[i] = val; setForm({ ...form, features: f });
  };
  const removeFeature = (i) => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });

  const formatStorage = (mb) => {
    if (mb === -1) return 'Unlimited';
    if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
    return `${mb} MB`;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => (
          <Card key={plan._id} className={`relative ${plan.highlighted ? 'ring-2 ring-teal-500' : ''}`}>
            {plan.highlighted && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs px-3 py-0.5 rounded-full">Recommended</div>
            )}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  {plan.price === 0 ? 'Free' : `KSh ${plan.price.toLocaleString()}`}
                </span>
                {plan.cycle !== 'permanent' && plan.cycle !== 'trial' && (
                  <span className="text-sm text-[var(--text-secondary)]">/{plan.cycle === 'yearly' ? 'yr' : 'mo'}</span>
                )}
              </div>
              <Badge variant={CYCLE_COLORS[plan.cycle] || 'default'} className="mt-1">{plan.cycle}</Badge>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Users:</span>
                <span className="text-[var(--text-primary)] font-medium">{plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Storage:</span>
                <span className="text-[var(--text-primary)] font-medium">{formatStorage(plan.maxStorageMB)}</span>
              </div>
              {(plan.features || []).slice(0, 3).map((f, i) => (
                <div key={i} className="text-xs text-[var(--text-muted)]">✓ {f}</div>
              ))}
              {(plan.features || []).length > 3 && (
                <div className="text-xs text-[var(--text-muted)]">+{plan.features.length - 3} more</div>
              )}
            </div>
            <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(plan)}><HiPencil className="w-4 h-4 mr-1" /> Edit</Button>
              <Button size="sm" variant={plan.isActive ? 'warning' : 'success'} onClick={() => handleToggle(plan._id)}>
                {plan.isActive ? 'Disable' : 'Enable'}
              </Button>
              <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: plan._id, name: plan.name })}><HiTrash className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card><p className="text-sm text-[var(--text-muted)] py-8 text-center">No plans yet. Click "Add Plan" to create one.</p></Card>
      )}

      {/* Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Plan' : 'Edit Plan'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="standard" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cycle</label>
              <select value={form.cycle} onChange={e => setForm({ ...form, cycle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Price (KES)" type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Users (-1 = unlimited)" type="number" value={form.maxUsers} onChange={e => setForm({ ...form, maxUsers: +e.target.value })} />
            <Input label="Max Storage MB (-1 = unlimited)" type="number" value={form.maxStorageMB} onChange={e => setForm({ ...form, maxStorageMB: +e.target.value })} />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Features</label>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={f} onChange={e => updateFeature(i, e.target.value)} placeholder={`Feature ${i + 1}`} className="flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => removeFeature(i)}><HiX className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addFeature}>+ Add Feature</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Toggle label="Active" checked={form.isActive} onChange={v => setForm({ ...form, isActive: v })} />
            <Toggle label="Highlighted (Recommended)" checked={form.highlighted} onChange={v => setForm({ ...form, highlighted: v })} />
          </div>
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} />

          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>{modal.mode === 'create' ? 'Create' : 'Save Changes'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Plan" message={`Delete ${confirm.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
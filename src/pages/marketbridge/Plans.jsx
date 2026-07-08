import { useState, useEffect } from 'react';
import { getPlans, createPlan, updatePlan } from '../../services/marketbridge/subscriptions';
import Card from '../../components/marketbridge/ui/Card';
import Table from '../../components/marketbridge/ui/Table';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Input from '../../components/marketbridge/ui/Input';
import Toggle from '../../components/marketbridge/ui/Toggle';
import Modal from '../../components/marketbridge/ui/Modal';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { HiPlus, HiPencil, HiCheck, HiX } from 'react-icons/hi';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      name: '', price: 0, isActive: true,
      features: {
        maxProducts: 50, commissionDiscount: 0,
        canCreateVouchers: false, canCreateHotDeals: false,
        canRunFlashSales: false, maxHotDealsSlots: 0,
        canBoostNewArrivals: false,
      },
    };
  }

  const fetchPlans = () => {
    setLoading(true);
    getPlans()
      .then(res => setPlans(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => { setForm(getEmptyForm()); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (plan) => {
    setForm({
      name: plan.name || '', price: plan.price || 0, isActive: plan.isActive !== false,
      features: {
        maxProducts: plan.features?.maxProducts ?? 50,
        commissionDiscount: plan.features?.commissionDiscount ?? 0,
        canCreateVouchers: plan.features?.canCreateVouchers || false,
        canCreateHotDeals: plan.features?.canCreateHotDeals || false,
        canRunFlashSales: plan.features?.canRunFlashSales || false,
        maxHotDealsSlots: plan.features?.maxHotDealsSlots ?? 0,
        canBoostNewArrivals: plan.features?.canBoostNewArrivals || false,
      },
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

  const columns = [
    { key: 'name', label: 'Plan', render: row => <span className="font-medium text-[var(--text-primary)] capitalize">{row.name}</span> },
    { key: 'price', label: 'Price', render: row => row.price === 0 ? <Badge variant="success">Free</Badge> : <span className="font-medium">KES {(row.price || 0).toLocaleString()}/mo</span> },
    { key: 'features.maxProducts', label: 'Max Products', render: row => row.features?.maxProducts === 999999 ? 'Unlimited' : (row.features?.maxProducts || 0).toLocaleString() },
    { key: 'features.commissionDiscount', label: 'Commission', render: row => `${row.features?.commissionDiscount || 0}% discount` },
    { key: 'isActive', label: 'Status', render: row => <Badge variant={row.isActive ? 'success' : 'default'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', label: 'Actions', render: row => (
      <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4 mr-1" /> Edit</Button>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Subscription Plans</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>
      <Card>
        <Table columns={columns} data={plans} loading={loading} emptyMessage="No plans found." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Plan' : 'Edit Plan'} size="xl">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Plan Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Monthly Price (KES)" type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Max Products" type="number" value={form.features.maxProducts} onChange={e => setForm({ ...form, features: { ...form.features, maxProducts: +e.target.value } })} />
              <Input label="Commission Discount (%)" type="number" value={form.features.commissionDiscount} onChange={e => setForm({ ...form, features: { ...form.features, commissionDiscount: +e.target.value } })} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Features</h3>
            <div className="space-y-2">
              <Toggle label="Can Create Vouchers" checked={form.features.canCreateVouchers} onChange={v => setForm({ ...form, features: { ...form.features, canCreateVouchers: v } })} />
              <Toggle label="Can Create Hot Deals" checked={form.features.canCreateHotDeals} onChange={v => setForm({ ...form, features: { ...form.features, canCreateHotDeals: v } })} />
              {form.features.canCreateHotDeals && (
                <Input label="Max Hot Deal Slots" type="number" value={form.features.maxHotDealsSlots} onChange={e => setForm({ ...form, features: { ...form.features, maxHotDealsSlots: +e.target.value } })} />
              )}
              <Toggle label="Can Run Flash Sales" checked={form.features.canRunFlashSales} onChange={v => setForm({ ...form, features: { ...form.features, canRunFlashSales: v } })} />
              <Toggle label="Can Boost New Arrivals" checked={form.features.canBoostNewArrivals} onChange={v => setForm({ ...form, features: { ...form.features, canBoostNewArrivals: v } })} />
            </div>
          </div>

          <Toggle label="Active" checked={form.isActive} onChange={v => setForm({ ...form, isActive: v })} />

          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan, togglePlan } from '../../services/bridge/plans';
import { getCurrencies } from '../../services/bridge/currency';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import ConfirmDialog from '../../components/bridge/ui/ConfirmDialog';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi';

const TIERS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'proplus', label: 'Pro+' },
  { value: 'enterprise', label: 'Enterprise' },
];

const INTERVALS = [
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

function formatPrice(amount, currencyCode, currencies) {
  const c = currencies.find((x) => x.code === currencyCode);
  const symbol = c?.symbol || currencyCode || '$';
  const decimals = c?.decimalPlaces ?? 2;
  const thousands = c?.thousandsSeparator ?? ',';
  const decimal = c?.decimalSeparator ?? '.';
  const num = Number(amount || 0);
  const parts = num.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  const formatted = parts.join(decimal);
  return c?.symbolPosition === 'after' ? `${formatted}${symbol}` : `${symbol}${formatted}`;
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, plan: null });
  const [form, setForm] = useState({ name: '', description: '', tier: 'pro', price: { amount: 0, currency: 'USD', interval: 'month' } });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const defaultCurrencyCode = () => {
    const def = currencies.find((c) => c.isDefault && c.isActive);
    if (def) return def.code;
    const first = currencies.find((c) => c.isActive);
    return first?.code || 'USD';
  };

  const emptyForm = () => ({
    name: '',
    description: '',
    tier: 'pro',
    price: { amount: 0, currency: defaultCurrencyCode(), interval: 'month' },
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [plansRes, currenciesRes] = await Promise.all([
        getPlans().catch(() => ({ plans: [] })),
        getCurrencies().catch(() => ({ currencies: [] })),
      ]);
      setPlans(plansRes.plans || plansRes.data || []);
      setCurrencies(currenciesRes.currencies || currenciesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setModal({ open: true, plan: null });
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      tier: p.tier,
      price: p.price || { amount: 0, currency: defaultCurrencyCode(), interval: 'month' },
    });
    setModal({ open: true, plan: p });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: { ...form.price, amount: Number(form.price.amount) },
      };
      if (modal.plan) await updatePlan(modal.plan._id || modal.plan.id, payload);
      else await createPlan(payload);
      setModal({ open: false, plan: null });
      fetchAll();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleToggle = async (id) => {
    try { await togglePlan(id); fetchAll(); } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    try { await deletePlan(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchAll(); }
    catch (err) { alert(err.message); }
  };

  const activeCurrencies = currencies.filter((c) => c.isActive);

  const currencyOptionsFor = (currentCode) => {
    const list = activeCurrencies.slice();
    if (currentCode && !list.some((c) => c.code === currentCode)) {
      const used = currencies.find((c) => c.code === currentCode);
      if (used) list.push(used);
    }
    return list;
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'tier', label: 'Tier', render: (row) => <Badge variant="indigo">{row.tier}</Badge> },
    {
      key: 'price.amount',
      label: 'Price',
      render: (row) => (
        <span className="font-medium">
          {formatPrice(row.price?.amount, row.price?.currency, currencies)} / {row.price?.interval}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <button onClick={() => handleToggle(row._id || row.id)}>
          {row.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id || row.id })}><HiTrash className="w-4 h-4" /></Button>
        </div>
      ),
    },
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
              {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Price" type="number" value={form.price.amount} onChange={(e) => setForm(p => ({ ...p, price: { ...p.price, amount: e.target.value } }))} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Currency</label>
              <select value={form.price.currency} onChange={(e) => setForm(p => ({ ...p, price: { ...p.price, currency: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {currencyOptionsFor(form.price.currency).map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Interval</label>
              <select value={form.price.interval} onChange={(e) => setForm(p => ({ ...p, price: { ...p.price, interval: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
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
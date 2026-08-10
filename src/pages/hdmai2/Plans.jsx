import { useState, useEffect } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../services/hdmai2/plans';
import { getCurrency, updateCurrency } from '../../services/hdmai2/settings';
import Card from '../../components/hdmai2/ui/Card';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Input from '../../components/hdmai2/ui/Input';
import Toggle from '../../components/hdmai2/ui/Toggle';
import Modal from '../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../components/hdmai2/ui/ConfirmDialog';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { HiPlus, HiPencil, HiTrash, HiCog } from 'react-icons/hi';

const FEATURES = ['chat', 'classification', 'summarization', 'generation', 'sentiment', 'qa', 'priority', 'dedicatedSupport'];

const emptyForm = {
  name: '', displayName: '', description: '',
  price: { monthly: 0, yearly: 0, currency: 'USD' },
  limits: { requestsPerDay: 1000, requestsPerMinute: 60, models: 1, batchSize: 10, maxKeys: 1 },
  features: {},
  status: 'active', isDefault: false,
};

const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', name: 'US Dollar' });
  const [supportedCurrencies, setSupportedCurrencies] = useState(SUPPORTED_CURRENCIES);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const [currencyModal, setCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getPlans(), getCurrency()])
      .then(([p, c]) => {
        const planData = p?.data?.plans || p?.data || p || [];
        setPlans(Array.isArray(planData) ? planData : []);
        const cur = c?.data || c || {};
        setCurrency(cur);
        setSelectedCurrency(cur.code || 'USD');
        if (cur.supported) setSupportedCurrencies(cur.supported);
      }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (plan) => { setForm(plan); setModal({ open: true, mode: 'edit', data: plan }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createPlan(form);
      else await updatePlan(modal.data._id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deletePlan(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleCurrencySave = async () => {
    setActionLoading(true);
    try {
      await updateCurrency({ currency: selectedCurrency });
      setCurrencyModal(false);
      fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const planColor = (name) => {
    if (name?.includes('free')) return 'from-green-500 to-emerald-600';
    if (name?.includes('pro')) return 'from-blue-500 to-blue-600';
    if (name?.includes('enterprise')) return 'from-purple-500 to-purple-600';
    return 'from-gray-500 to-gray-600';
  };

  const getPrice = (plan) => {
    if (plan.convertedPrice) {
      return {
        monthly: plan.convertedPrice.monthlyFormatted || plan.convertedPrice.monthly,
        yearly: plan.convertedPrice.yearlyFormatted || plan.convertedPrice.yearly,
      };
    }
    if (plan.priceFormatted) {
      return {
        monthly: plan.priceFormatted.monthly,
        yearly: plan.priceFormatted.yearly,
      };
    }
    if (currency.position === 'prefix') {
      return {
        monthly: `${currency.symbol || currency.code} ${plan.price?.monthly || 0}`,
        yearly: `${currency.symbol || currency.code} ${plan.price?.yearly || 0}`,
      };
    }
    return {
      monthly: `${plan.price?.monthly || 0} ${currency.symbol || currency.code}`,
      yearly: `${plan.price?.yearly || 0} ${currency.symbol || currency.code}`,
    };
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
          <button onClick={() => { setSelectedCurrency(currency.code); setCurrencyModal(true); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <HiCog className="w-3 h-3" /> {currency.code} {currency.symbol}
          </button>
        </div>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => {
          const price = getPrice(plan);
          return (
            <Card key={plan._id} className="relative overflow-hidden">
              {plan.isDefault && <div className="absolute top-2 right-2"><Badge variant="success">Default</Badge></div>}
              <div className={`bg-gradient-to-r ${planColor(plan.name)} -mx-6 -mt-6 mb-4 p-4 text-white`}>
                <h3 className="text-lg font-bold">{plan.displayName || plan.name}</h3>
                <p className="text-white/80 text-sm">{plan.description}</p>
              </div>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-[var(--text-primary)]">{price.monthly}<span className="text-sm text-[var(--text-muted)]">/mo</span></p>
                <p className="text-xs text-[var(--text-muted)]">{price.yearly}/year</p>
              </div>
              <div className="space-y-1 text-sm mb-4">
                <Row label="Requests/Day" value={plan.limits?.requestsPerDay?.toLocaleString()} />
                <Row label="Models" value={plan.limits?.models} />
                <Row label="API Keys" value={plan.limits?.maxKeys} />
                <Row label="Batch Size" value={plan.limits?.batchSize} />
                <Row label="Status" value={<Badge variant={plan.status === 'active' ? 'success' : 'warning'}>{plan.status}</Badge>} />
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(plan)}><HiPencil className="w-3 h-3 mr-1" /> Edit</Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: plan._id, name: plan.displayName || plan.name })}><HiTrash className="w-3 h-3" /></Button>
              </div>
            </Card>
          );
        })}
        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text-muted)]">No plans created yet.</div>
        )}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Plan' : 'Edit Plan'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name (slug)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="pro" />
            <Input label="Display Name" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} placeholder="Pro" />
          </div>
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Monthly Price (USD)" type="number" value={form.price?.monthly} onChange={e => setForm({ ...form, price: { ...form.price, monthly: +e.target.value } })} />
            <Input label="Yearly Price (USD)" type="number" value={form.price?.yearly} onChange={e => setForm({ ...form, price: { ...form.price, yearly: +e.target.value } })} />
          </div>
          <p className="text-xs text-[var(--text-muted)]">Prices stored in USD. Display converted to {currency.code} on frontend.</p>
          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Requests/Day" type="number" value={form.limits?.requestsPerDay} onChange={e => setForm({ ...form, limits: { ...form.limits, requestsPerDay: +e.target.value } })} />
              <Input label="Requests/Min" type="number" value={form.limits?.requestsPerMinute} onChange={e => setForm({ ...form, limits: { ...form.limits, requestsPerMinute: +e.target.value } })} />
              <Input label="Models" type="number" value={form.limits?.models} onChange={e => setForm({ ...form, limits: { ...form.limits, models: +e.target.value } })} />
              <Input label="Max API Keys" type="number" value={form.limits?.maxKeys} onChange={e => setForm({ ...form, limits: { ...form.limits, maxKeys: +e.target.value } })} />
              <Input label="Batch Size" type="number" value={form.limits?.batchSize} onChange={e => setForm({ ...form, limits: { ...form.limits, batchSize: +e.target.value } })} />
            </div>
          </div>
          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map(f => (
                <Toggle key={f} label={f} checked={form.features?.[f] || false} onChange={v => setForm({ ...form, features: { ...form.features, [f]: v } })} />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['active', 'inactive', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1"><Toggle label="Default Plan" checked={form.isDefault} onChange={v => setForm({ ...form, isDefault: v })} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={currencyModal} onClose={() => setCurrencyModal(false)} title="Global Currency" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select Currency</label>
            <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {supportedCurrencies.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-sm">
            <p className="text-[var(--text-secondary)]">Current: <span className="text-[var(--text-primary)] font-medium">{currency.symbol} {currency.code} — {currency.name}</span></p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCurrencyModal(false)}>Cancel</Button>
            <Button onClick={handleCurrencySave} loading={actionLoading}>Save Currency</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Plan" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-muted)] text-xs">{label}</span>
      <span className="text-[var(--text-primary)] text-xs font-medium">{typeof value === 'object' ? value : value ?? '—'}</span>
    </div>
  );
}
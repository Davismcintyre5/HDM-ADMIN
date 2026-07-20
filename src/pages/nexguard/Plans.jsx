import { useState, useEffect } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../services/nexguard/plans';
import { useSettings } from '../../context/nexguard/SettingsContext';
import Card from '../../components/nexguard/ui/Card';
import Badge from '../../components/nexguard/ui/Badge';
import Button from '../../components/nexguard/ui/Button';
import Input from '../../components/nexguard/ui/Input';
import Toggle from '../../components/nexguard/ui/Toggle';
import Modal from '../../components/nexguard/ui/Modal';
import ConfirmDialog from '../../components/nexguard/ui/ConfirmDialog';
import Spinner from '../../components/nexguard/ui/Spinner';
import { formatCurrency } from '../../utils/nexguard/formatters';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const INTERVALS = ['monthly', 'yearly', 'oneTime'];

const emptyForm = {
  name: '',
  pricing: { monthly: 0, yearly: 0, oneTime: 0 },
  trialDays: 0,
  deviceLimit: 3,
  scansPerDay: 100,
  vpnIncluded: false,
  bandwidthLimitGB: 100,
  features: [],
  isActive: true,
  isPopular: false,
  sortOrder: 0,
};

export default function Plans() {
  const { currency } = useSettings();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [featuresInput, setFeaturesInput] = useState('');
  const [activeInterval, setActiveInterval] = useState('monthly');

  const fetchPlans = () => {
    setLoading(true);
    getPlans()
      .then(res => setPlans(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setFeaturesInput('');
    setModal({ open: true, mode: 'create', data: null });
  };

  const openEdit = (plan) => {
    setForm({
      name: plan.name || '',
      pricing: {
        monthly: plan.pricing?.monthly ?? 0,
        yearly: plan.pricing?.yearly ?? 0,
        oneTime: plan.pricing?.oneTime ?? 0,
      },
      trialDays: plan.trialDays ?? 0,
      deviceLimit: plan.deviceLimit ?? 3,
      scansPerDay: plan.scansPerDay ?? 100,
      vpnIncluded: plan.vpnIncluded ?? false,
      bandwidthLimitGB: plan.bandwidthLimitGB ?? 100,
      features: plan.features || [],
      isActive: plan.isActive !== false,
      isPopular: plan.isPopular ?? false,
      sortOrder: plan.sortOrder ?? 0,
    });
    setFeaturesInput((plan.features || []).join(', '));
    setModal({ open: true, mode: 'edit', data: plan });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const data = {
        ...form,
        features: featuresInput.split(',').map(f => f.trim()).filter(Boolean),
      };
      if (modal.mode === 'create') await createPlan(data);
      else await updatePlan(modal.data._id || modal.data.id, data);
      setModal({ open: false, mode: 'create', data: null });
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deletePlan(confirm.id);
      fetchPlans();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
    setConfirm({ open: false, id: null, name: '' });
  };

  const getPrice = (plan) => plan.pricing?.[activeInterval] ?? plan.price ?? 0;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>

      {/* Interval Tabs */}
      <div className="flex gap-2 mb-6">
        {INTERVALS.map(interval => (
          <button
            key={interval}
            onClick={() => setActiveInterval(interval)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeInterval === interval
                ? 'bg-cyan-600 text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
            }`}
          >
            {interval === 'oneTime' ? 'One-Time' : interval.charAt(0).toUpperCase() + interval.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => (
          <Card key={plan._id || plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-cyan-500' : ''}`}>
            {plan.isPopular && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs px-3 py-0.5 rounded-full">
                Popular
              </div>
            )}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                {formatCurrency(getPrice(plan), currency)}
                <span className="text-sm text-[var(--text-secondary)]">
                  /{activeInterval === 'oneTime' ? 'once' : activeInterval}
                </span>
              </p>
              {plan.trialDays > 0 && (
                <p className="text-xs text-cyan-600 mt-1">{plan.trialDays} day free trial</p>
              )}
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Devices:</span>
                <span className="text-[var(--text-primary)]">{plan.deviceLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Scans/day:</span>
                <span className="text-[var(--text-primary)]">{plan.scansPerDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Bandwidth:</span>
                <span className="text-[var(--text-primary)]">{plan.bandwidthLimitGB} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">VPN:</span>
                <Badge variant={plan.vpnIncluded ? 'success' : 'default'}>
                  {plan.vpnIncluded ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            {/* Features List */}
            {plan.features?.length > 0 && (
              <ul className="text-xs text-[var(--text-secondary)] space-y-1 mb-4 pb-4 border-t border-[var(--border-color)] pt-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-cyan-600">✓</span> {f}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(plan)}>
                <HiPencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirm({ open: true, id: plan._id || plan.id, name: plan.name })}
              >
                <HiTrash className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', data: null })}
        title={modal.mode === 'create' ? 'Create Plan' : 'Edit Plan'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Free Trial / Pro / Enterprise"
            required
          />

      {/* Pricing */}
<div>
  <h3 className="font-semibold text-[var(--text-primary)] mb-3">Pricing</h3>
  <div className="grid grid-cols-3 gap-4">
    {INTERVALS.map(interval => {
      const usdValue = form.pricing[interval] || 0;
      const EXCHANGE_RATES = {
        USD: 1, EUR: 0.92, GBP: 0.79, KES: 130, NGN: 1550, ZAR: 18.5, GHS: 15.5, TZS: 2650, UGX: 3750,
      };
      const rate = EXCHANGE_RATES[currency] || 1;
      const localValue = usdValue * rate;
      const NO_DECIMAL = ['KES', 'UGX', 'TZS', 'NGN', 'GHS'].includes(currency);

      const handleLocalChange = (value) => {
        const num = Number(value);
        if (isNaN(num)) return;
        const usd = num / rate;
        setForm({
          ...form,
          pricing: { ...form.pricing, [interval]: Math.round(usd * 100) / 100 },
        });
      };

      return (
        <div key={interval} className="space-y-2">
          <Input
            label={`${interval === 'oneTime' ? 'One-Time' : interval.charAt(0).toUpperCase() + interval.slice(1)} (${currency})`}
            type="number"
            value={NO_DECIMAL ? Math.round(localValue) : localValue.toFixed(2)}
            onChange={e => handleLocalChange(e.target.value)}
            step={NO_DECIMAL ? '1' : '0.01'}
            min="0"
          />
          <Input
            label="USD (stored)"
            value={`$${usdValue.toFixed(2)}`}
            readOnly
            className="opacity-60 text-sm"
          />
        </div>
      );
    })}
  </div>
  <p className="text-xs text-[var(--text-muted)] mt-2">Edit in {currency}. Values stored as USD on server.</p>
</div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Device Limit"
              type="number"
              value={form.deviceLimit}
              onChange={e => setForm({ ...form, deviceLimit: +e.target.value })}
            />
            <Input
              label="Scans/Day"
              type="number"
              value={form.scansPerDay}
              onChange={e => setForm({ ...form, scansPerDay: +e.target.value })}
            />
            <Input
              label="Bandwidth (GB)"
              type="number"
              value={form.bandwidthLimitGB}
              onChange={e => setForm({ ...form, bandwidthLimitGB: +e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Trial Days"
              type="number"
              value={form.trialDays}
              onChange={e => setForm({ ...form, trialDays: +e.target.value })}
            />
            <div className="flex items-center pt-6">
              <Toggle
                label="VPN Included"
                checked={form.vpnIncluded}
                onChange={v => setForm({ ...form, vpnIncluded: v })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Toggle
              label="Active"
              checked={form.isActive}
              onChange={v => setForm({ ...form, isActive: v })}
            />
            <Toggle
              label="Popular"
              checked={form.isPopular}
              onChange={v => setForm({ ...form, isPopular: v })}
            />
          </div>

          <Input
            label="Sort Order"
            type="number"
            value={form.sortOrder}
            onChange={e => setForm({ ...form, sortOrder: +e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Features (comma separated)
            </label>
            <textarea
              value={featuresInput}
              onChange={e => setFeaturesInput(e.target.value)}
              rows={3}
              placeholder="Unlimited Scans, VPN Included, Advanced Firewall..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setModal({ open: false, mode: 'create', data: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Plan"
        message={`Delete ${confirm.name}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../services/hdmerp/plans';
import { getPaymentConfig } from '../../services/hdmerp/payments';
import Card from '../../components/hdmerp/ui/Card';
import Badge from '../../components/hdmerp/ui/Badge';
import Button from '../../components/hdmerp/ui/Button';
import Modal from '../../components/hdmerp/ui/Modal';
import Input from '../../components/hdmerp/ui/Input';
import Toggle from '../../components/hdmerp/ui/Toggle';
import Spinner from '../../components/hdmerp/ui/Spinner';
import ConfirmDialog from '../../components/hdmerp/ui/ConfirmDialog';
import { HiPencil, HiTrash, HiUsers, HiDatabase, HiSupport } from 'react-icons/hi';

const CURRENCY_SYMBOLS = { KSh: 'KSh', USD: '$', EUR: '€', GBP: '£' };

const EXCHANGE_RATES = { KSh: 154, USD: 1, EUR: 0.92, GBP: 0.79 };

const MODULE_KEYS = [
  'finance', 'hr', 'sales', 'inventory', 'supplyChain', 'orders',
  'manufacturing', 'contacts', 'products', 'reports', 'settings',
  'dashboard', 'landingPage', 'aiSparkle', 'aiFileUpload', 'outwardApiKeys',
];

const MODULE_LABELS = {
  finance: 'Finance', hr: 'HR', sales: 'Sales', inventory: 'Inventory',
  supplyChain: 'Supply Chain', orders: 'Orders', manufacturing: 'Manufacturing',
  contacts: 'Contacts', products: 'Products', reports: 'Reports',
  settings: 'Settings', dashboard: 'Dashboard', landingPage: 'Landing Page',
  aiSparkle: 'AI Sparkle', aiFileUpload: 'AI File Upload', outwardApiKeys: 'Outward API Keys',
};

const SUPPORT_LEVELS = ['community', 'email_chat', 'dedicated'];
const SUPPORT_LABELS = { community: 'Community', email_chat: 'Email/Chat', dedicated: 'Dedicated' };

function formatPrice(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency || '';
  if (currency === 'KSh') return `KSh ${amount?.toLocaleString() || 0}`;
  return `${symbol}${amount || 0}`;
}

function usdToLocal(usdAmount, currency) {
  const rate = EXCHANGE_RATES[currency] || 1;
  return Math.round(usdAmount * rate);
}

function localToUsd(localAmount, currency) {
  const rate = EXCHANGE_RATES[currency] || 1;
  return Math.round(localAmount / rate);
}

const defaultForm = {
  name: '', displayName: '', enabled: true, trialDays: 0, sortOrder: 1,
  pricing: { monthly: 0, yearly: 0, permanent: 0, stripePriceId: '' },
  modules: Object.fromEntries(MODULE_KEYS.map(k => [k, false])),
  limits: {
    maxUsers: 1, maxStorageGB: 0.5, maxCustomReports: 1,
    aiWrite: false, aiOutwardKeys: 0, whiteLabel: false,
    multiCompany: false, dedicatedDatabase: false,
    supportLevel: 'community',
  },
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [modal, setModal] = useState({ open: false, plan: null });
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getPaymentConfig()
      .then(config => { if (config?.currency) setCurrency(config.currency); })
      .catch(() => {});
    fetchPlans();
  }, []);

  const fetchPlans = () => {
    setLoading(true);
    getPlans()
      .then(setPlans)
      .catch(err => console.error(err.message))
      .finally(() => setLoading(false));
  };

  const openEdit = (plan) => {
    setForm({
      ...JSON.parse(JSON.stringify(plan)),
      pricing: {
        monthly: usdToLocal(plan.pricing?.monthly || 0, currency),
        yearly: usdToLocal(plan.pricing?.yearly || 0, currency),
        permanent: usdToLocal(plan.pricing?.permanent || 0, currency),
        stripePriceId: plan.pricing?.stripePriceId || '',
      },
    });
    setModal({ open: true, plan });
  };

  const openCreate = () => {
    setForm({ ...defaultForm, name: '', displayName: '' });
    setModal({ open: true, plan: null });
  };

  const updateForm = (path, value) => {
    setForm(prev => {
      const parts = path.split('.');
      const newForm = JSON.parse(JSON.stringify(prev));
      let obj = newForm;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return newForm;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...form,
        pricing: {
          monthly: localToUsd(form.pricing?.monthly || 0, currency),
          yearly: localToUsd(form.pricing?.yearly || 0, currency),
          permanent: localToUsd(form.pricing?.permanent || 0, currency),
          stripePriceId: form.pricing?.stripePriceId || '',
        },
      };
      if (modal.plan) await updatePlan(modal.plan._id, dataToSave);
      else await createPlan(dataToSave);
      setModal({ open: false, plan: null });
      fetchPlans();
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deletePlan(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchPlans();
    } catch (err) {
      alert(err.message);
    }
    setDeleteLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
          <p className="text-sm text-[var(--text-muted)]">System currency: {currency}</p>
        </div>
        <Button onClick={openCreate}>Create Plan</Button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map(plan => (
            <Card key={plan._id} className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{plan.displayName || plan.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="purple">{plan.name}</Badge>
                    {plan.enabled ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge>Disabled</Badge>
                    )}
                  </div>
                </div>
                {plan.trialDays > 0 && (
                  <span className="text-xs text-[var(--text-muted)]">{plan.trialDays}d trial</span>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 mb-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Monthly</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatPrice(plan.pricing?.monthly, plan.displayCurrency || currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Yearly</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatPrice(plan.pricing?.yearly, plan.displayCurrency || currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Once</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatPrice(plan.pricing?.permanent, plan.displayCurrency || currency)}</span>
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <HiUsers className="w-3.5 h-3.5" />
                  <span>{plan.limits?.maxUsers || 0} users</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <HiDatabase className="w-3.5 h-3.5" />
                  <span>{plan.limits?.maxStorageGB || 0} GB</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <HiSupport className="w-3.5 h-3.5" />
                  <span>{SUPPORT_LABELS[plan.limits?.supportLevel] || plan.limits?.supportLevel}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(plan)}>
                  <HiPencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: plan._id })}>
                  <HiTrash className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
      </div>

      {/* Edit/Create Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, plan: null })}
        title={modal.plan ? `Edit Plan: ${modal.plan.displayName || modal.plan.name}` : 'Create Plan'}
        size="xl"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Display Name" value={form.displayName || ''} onChange={(e) => updateForm('displayName', e.target.value)} />
            {!modal.plan && <Input label="Plan Key (unique)" value={form.name || ''} onChange={(e) => updateForm('name', e.target.value)} />}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Sort Order" type="number" value={form.sortOrder || ''} onChange={(e) => updateForm('sortOrder', Number(e.target.value))} />
            <Input label="Trial Days" type="number" value={form.trialDays || ''} onChange={(e) => updateForm('trialDays', Number(e.target.value))} />
            <div className="flex items-end pb-1">
              <Toggle label="Enabled" checked={form.enabled || false} onChange={(v) => updateForm('enabled', v)} />
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Pricing (USD)</h3>
              <span className="text-xs text-[var(--text-muted)]">Server stores in USD</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Monthly ({currency})</label>
                <input type="number" value={form.pricing?.monthly || ''} onChange={(e) => updateForm('pricing.monthly', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">→ ${localToUsd(form.pricing?.monthly || 0, currency)} USD</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Yearly ({currency})</label>
                <input type="number" value={form.pricing?.yearly || ''} onChange={(e) => updateForm('pricing.yearly', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">→ ${localToUsd(form.pricing?.yearly || 0, currency)} USD</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Permanent ({currency})</label>
                <input type="number" value={form.pricing?.permanent || ''} onChange={(e) => updateForm('pricing.permanent', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">→ ${localToUsd(form.pricing?.permanent || 0, currency)} USD</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Stripe Price ID</label>
                <input type="text" value={form.pricing?.stripePriceId || ''} onChange={(e) => updateForm('pricing.stripePriceId', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="price_..." />
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Modules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MODULE_KEYS.map(key => (
                <Toggle
                  key={key}
                  label={MODULE_LABELS[key] || key}
                  checked={form.modules?.[key] || false}
                  onChange={(v) => updateForm(`modules.${key}`, v)}
                />
              ))}
            </div>
          </div>

          {/* Limits */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Limits</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input label="Max Users" type="number" value={form.limits?.maxUsers || ''} onChange={(e) => updateForm('limits.maxUsers', Number(e.target.value))} />
              <Input label="Max Storage (GB)" type="number" value={form.limits?.maxStorageGB || ''} onChange={(e) => updateForm('limits.maxStorageGB', Number(e.target.value))} />
              <Input label="Max Reports" type="number" value={form.limits?.maxCustomReports || ''} onChange={(e) => updateForm('limits.maxCustomReports', Number(e.target.value))} />
              <Input label="Outward Keys" type="number" value={form.limits?.aiOutwardKeys || ''} onChange={(e) => updateForm('limits.aiOutwardKeys', Number(e.target.value))} />
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Support Level</label>
                <select value={form.limits?.supportLevel || 'community'} onChange={(e) => updateForm('limits.supportLevel', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {SUPPORT_LEVELS.map(l => <option key={l} value={l}>{SUPPORT_LABELS[l]}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
              <Toggle label="AI Write" checked={form.limits?.aiWrite || false} onChange={(v) => updateForm('limits.aiWrite', v)} />
              <Toggle label="White Label" checked={form.limits?.whiteLabel || false} onChange={(v) => updateForm('limits.whiteLabel', v)} />
              <Toggle label="Multi-Company" checked={form.limits?.multiCompany || false} onChange={(v) => updateForm('limits.multiCompany', v)} />
              <Toggle label="Dedicated DB" checked={form.limits?.dedicatedDatabase || false} onChange={(v) => updateForm('limits.dedicatedDatabase', v)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setModal({ open: false, plan: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Plan</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Plan"
        message="Permanently delete this plan? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
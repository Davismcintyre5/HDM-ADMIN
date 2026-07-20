import { useState, useEffect } from 'react';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../../services/nexguard/paymentMethods';
import Card from '../../components/nexguard/ui/Card';
import Badge from '../../components/nexguard/ui/Badge';
import Toggle from '../../components/nexguard/ui/Toggle';
import Input from '../../components/nexguard/ui/Input';
import Button from '../../components/nexguard/ui/Button';
import Modal from '../../components/nexguard/ui/Modal';
import ConfirmDialog from '../../components/nexguard/ui/ConfirmDialog';
import Spinner from '../../components/nexguard/ui/Spinner';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const TYPES = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'mpesa_stk_push', label: 'M-Pesa STK Push' },
  { value: 'mpesa_send_money', label: 'M-Pesa Send Money' },
  { value: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { value: 'mpesa_till', label: 'M-Pesa Till' },
];

const MODES = [
  { value: 'sandbox', label: 'Sandbox' },
  { value: 'live', label: 'Live' },
];

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR', 'GHS', 'TZS', 'UGX'];

const getDefaultConfig = (type) => {
  switch (type) {
    case 'stripe':
      return { publicKey: '', secretKey: '', webhookSecret: '', mode: 'sandbox' };
    case 'paypal':
      return { publicKey: '', secretKey: '', mode: 'sandbox' };
    case 'mpesa_stk_push':
      return { publicKey: '', secretKey: '', passkey: '', shortcode: '', mode: 'sandbox' };
    case 'mpesa_send_money':
      return { phoneNumber: '', mode: 'live' };
    case 'mpesa_paybill':
      return { businessNumber: '', accountNumber: '', mode: 'live' };
    case 'mpesa_till':
      return { businessNumber: '', mode: 'live' };
    default:
      return { mode: 'sandbox' };
  }
};

const emptyForm = {
  name: '',
  type: 'stripe',
  isActive: true,
  requireProof: false,
  displayName: '',
  instructions: '',
  supportedCurrencies: ['USD'],
  config: getDefaultConfig('stripe'),
};

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchMethods = () => {
    setLoading(true);
    getPaymentMethods()
      .then(res => setMethods(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMethods(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: 'create', data: null });
  };

  const openEdit = (method) => {
    setForm({
      name: method.name || '',
      type: method.type || 'stripe',
      isActive: method.isActive ?? true,
      requireProof: method.requireProof ?? false,
      displayName: method.displayName || '',
      instructions: method.instructions || '',
      supportedCurrencies: method.supportedCurrencies || ['USD'],
      config: { ...getDefaultConfig(method.type), ...method.config },
    });
    setModal({ open: true, mode: 'edit', data: method });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const { type, name, ...editableFields } = form;

      if (modal.mode === 'create') {
        await createPaymentMethod({ name, type, ...editableFields });
      } else {
        await updatePaymentMethod(modal.data._id || modal.data.id, editableFields);
      }

      setModal({ open: false, mode: 'create', data: null });
      fetchMethods();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deletePaymentMethod(confirm.id);
      fetchMethods();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
    setConfirm({ open: false, id: null, name: '' });
  };

  const handleTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      type,
      name: '',
      config: getDefaultConfig(type),
    }));
  };

  const setConfig = (key, value) => {
    setForm(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const toggleCurrency = (currency) => {
    setForm(prev => ({
      ...prev,
      supportedCurrencies: prev.supportedCurrencies.includes(currency)
        ? prev.supportedCurrencies.filter(c => c !== currency)
        : [...prev.supportedCurrencies, currency],
    }));
  };

  const renderConfigFields = () => {
    switch (form.type) {
      case 'stripe':
        return (
          <div className="space-y-3">
            <Input label="Public Key" value={form.config.publicKey || ''} onChange={e => setConfig('publicKey', e.target.value)} />
            <Input label="Secret Key" type="password" value={form.config.secretKey || ''} onChange={e => setConfig('secretKey', e.target.value)} />
            <Input label="Webhook Secret" type="password" value={form.config.webhookSecret || ''} onChange={e => setConfig('webhookSecret', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
              <select value={form.config.mode} onChange={e => setConfig('mode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]">
                {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        );
      case 'paypal':
        return (
          <div className="space-y-3">
            <Input label="Client ID (Public Key)" value={form.config.publicKey || ''} onChange={e => setConfig('publicKey', e.target.value)} />
            <Input label="Secret Key" type="password" value={form.config.secretKey || ''} onChange={e => setConfig('secretKey', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
              <select value={form.config.mode} onChange={e => setConfig('mode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]">
                {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        );
      case 'mpesa_stk_push':
        return (
          <div className="space-y-3">
            <Input label="Consumer Key (Public Key)" value={form.config.publicKey || ''} onChange={e => setConfig('publicKey', e.target.value)} />
            <Input label="Consumer Secret" type="password" value={form.config.secretKey || ''} onChange={e => setConfig('secretKey', e.target.value)} />
            <Input label="Passkey" type="password" value={form.config.passkey || ''} onChange={e => setConfig('passkey', e.target.value)} />
            <Input label="Shortcode" value={form.config.shortcode || ''} onChange={e => setConfig('shortcode', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
              <select value={form.config.mode} onChange={e => setConfig('mode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]">
                {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        );
      case 'mpesa_send_money':
        return (
          <div className="space-y-3">
            <Input label="Phone Number" value={form.config.phoneNumber || ''} onChange={e => setConfig('phoneNumber', e.target.value)} placeholder="+254XXXXXXXXX" />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
              <select value={form.config.mode} onChange={e => setConfig('mode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]">
                {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        );
      case 'mpesa_paybill':
        return (
          <div className="space-y-3">
            <Input label="Business Number" value={form.config.businessNumber || ''} onChange={e => setConfig('businessNumber', e.target.value)} />
            <Input label="Account Number" value={form.config.accountNumber || ''} onChange={e => setConfig('accountNumber', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
              <select value={form.config.mode} onChange={e => setConfig('mode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]">
                {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        );
      case 'mpesa_till':
        return (
          <div className="space-y-3">
            <Input label="Business Number" value={form.config.businessNumber || ''} onChange={e => setConfig('businessNumber', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
              <select value={form.config.mode} onChange={e => setConfig('mode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]">
                {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const typeBadge = {
    stripe: 'info',
    paypal: 'warning',
    mpesa_stk_push: 'success',
    mpesa_send_money: 'success',
    mpesa_paybill: 'success',
    mpesa_till: 'success',
  };

  const typeLabel = {
    stripe: 'Stripe',
    paypal: 'PayPal',
    mpesa_stk_push: 'M-Pesa STK',
    mpesa_send_money: 'M-Pesa Send',
    mpesa_paybill: 'M-Pesa Paybill',
    mpesa_till: 'M-Pesa Till',
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment Methods</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Method</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map(m => (
          <Card key={m._id || m.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--text-primary)]">{m.displayName || m.name}</h3>
                <Badge variant={typeBadge[m.type] || 'default'}>{typeLabel[m.type] || m.type}</Badge>
              </div>
            </div>
            <div className="text-xs text-[var(--text-muted)] space-y-1 mb-3">
              <p>Mode: <span className="font-medium">{m.config?.mode || 'sandbox'}</span></p>
              <p>Proof Required: <span className="font-medium">{m.requireProof ? 'Yes' : 'No'}</span></p>
              <p>Currencies: <span className="font-medium">{(m.supportedCurrencies || []).join(', ')}</span></p>
              {m.instructions && <p className="italic text-[var(--text-muted)]">{m.instructions}</p>}
            </div>
            <div className="flex items-center justify-between">
              <Toggle
                checked={m.isActive}
                onChange={async () => {
                  try {
                    await updatePaymentMethod(m._id || m.id, { isActive: !m.isActive });
                    fetchMethods();
                  } catch (err) { alert(err.message); }
                }}
                label={m.isActive ? 'Active' : 'Inactive'}
              />
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>
                  <HiPencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setConfirm({ open: true, id: m._id || m.id, name: m.displayName || m.name })}
                >
                  <HiTrash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {methods.length === 0 && (
          <div className="col-span-full text-center py-10 text-[var(--text-muted)]">
            No payment methods configured.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', data: null })}
        title={modal.mode === 'create' ? 'Add Payment Method' : 'Edit Payment Method'}
        size="lg"
      >
        <div className="space-y-4">
          {modal.mode === 'create' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]"
                >
                  {TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Input label="Display Name" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Instructions</label>
            <textarea
              value={form.instructions}
              onChange={e => setForm({ ...form, instructions: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Toggle label="Active" checked={form.isActive} onChange={v => setForm({ ...form, isActive: v })} />
            <Toggle label="Require Proof" checked={form.requireProof} onChange={v => setForm({ ...form, requireProof: v })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Supported Currencies</label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_CURRENCIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCurrency(c)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    form.supportedCurrencies.includes(c)
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-color)] hover:border-cyan-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Card className="!p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">API Configuration</h3>
            {renderConfigFields()}
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={actionLoading}>
              {modal.mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Payment Method"
        message={`Delete ${confirm.name}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
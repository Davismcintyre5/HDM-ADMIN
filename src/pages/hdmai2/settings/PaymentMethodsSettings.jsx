import { useState, useEffect } from 'react';
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, togglePaymentMethod, deletePaymentMethod } from '../../../services/hdmai2/paymentMethods';
import Card from '../../../components/hdmai2/ui/Card';
import Badge from '../../../components/hdmai2/ui/Badge';
import Button from '../../../components/hdmai2/ui/Button';
import Input from '../../../components/hdmai2/ui/Input';
import Toggle from '../../../components/hdmai2/ui/Toggle';
import Modal from '../../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../../components/hdmai2/ui/ConfirmDialog';
import Spinner from '../../../components/hdmai2/ui/Spinner';
import { HiPlus, HiPencil, HiTrash, HiCreditCard } from 'react-icons/hi';

const METHODS = [
  { value: 'mpesa', label: 'M-Pesa', type: 'mobile_money' },
  { value: 'stripe', label: 'Stripe', type: 'card' },
  { value: 'paypal', label: 'PayPal', type: 'digital_wallet' },
  { value: 'bank', label: 'Bank Transfer', type: 'bank' },
  { value: 'crypto', label: 'Crypto', type: 'crypto' },
  { value: 'airtel', label: 'Airtel Money', type: 'mobile_money' },
  { value: 'equitel', label: 'Equitel', type: 'mobile_money' },
];

const CURRENCIES = ['USD', 'KES', 'EUR', 'GBP', 'NGN', 'ZAR'];

export default function PaymentMethodsSettings() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({
    name: 'mpesa', displayName: '', type: 'mobile_money', config: {}, currencies: [], instructions: '', isDefault: false,
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

 const fetchMethods = () => {
  setLoading(true);
  getPaymentMethods()
    .then(res => {
      const data = res?.data?.methods || res?.data || [];
      setMethods(Array.isArray(data) ? data : []);
    })
    .catch(console.error).finally(() => setLoading(false));
};

  useEffect(() => { fetchMethods(); }, []);

  const openCreate = () => {
    setForm({ name: 'mpesa', displayName: '', type: 'mobile_money', config: {}, currencies: [], instructions: '', isDefault: false });
    setModal({ open: true, mode: 'create', data: null });
  };
  const openEdit = (m) => { setForm(m); setModal({ open: true, mode: 'edit', data: m }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createPaymentMethod(form);
      else await updatePaymentMethod(modal.data._id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchMethods();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleToggle = async (id) => {
    try { await togglePaymentMethod(id); fetchMethods(); } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deletePaymentMethod(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchMethods(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const renderConfig = () => {
    switch (form.name) {
      case 'mpesa':
        return (
          <div className="space-y-3">
            <Input label="Consumer Key" value={form.config?.consumerKey || ''} onChange={e => setForm({ ...form, config: { ...form.config, consumerKey: e.target.value } })} />
            <Input label="Consumer Secret" type="password" value={form.config?.consumerSecret || ''} onChange={e => setForm({ ...form, config: { ...form.config, consumerSecret: e.target.value } })} />
            <Input label="Passkey" type="password" value={form.config?.passkey || ''} onChange={e => setForm({ ...form, config: { ...form.config, passkey: e.target.value } })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Shortcode" value={form.config?.shortcode || ''} onChange={e => setForm({ ...form, config: { ...form.config, shortcode: e.target.value } })} />
              <Input label="Till Number" value={form.config?.tillNumber || ''} onChange={e => setForm({ ...form, config: { ...form.config, tillNumber: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Environment</label>
              <select value={form.config?.environment || 'sandbox'} onChange={e => setForm({ ...form, config: { ...form.config, environment: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['sandbox', 'production'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        );
      case 'stripe':
        return (
          <div className="space-y-3">
            <Input label="Publishable Key" value={form.config?.publishableKey || ''} onChange={e => setForm({ ...form, config: { ...form.config, publishableKey: e.target.value } })} />
            <Input label="Secret Key" type="password" value={form.config?.secretKey || ''} onChange={e => setForm({ ...form, config: { ...form.config, secretKey: e.target.value } })} />
            <Input label="Webhook Secret" type="password" value={form.config?.webhookSecret || ''} onChange={e => setForm({ ...form, config: { ...form.config, webhookSecret: e.target.value } })} />
          </div>
        );
      case 'paypal':
        return (
          <div className="space-y-3">
            <Input label="Client ID" value={form.config?.clientId || ''} onChange={e => setForm({ ...form, config: { ...form.config, clientId: e.target.value } })} />
            <Input label="Client Secret" type="password" value={form.config?.clientSecret || ''} onChange={e => setForm({ ...form, config: { ...form.config, clientSecret: e.target.value } })} />
          </div>
        );
      case 'bank':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Account Name" value={form.config?.accountName || ''} onChange={e => setForm({ ...form, config: { ...form.config, accountName: e.target.value } })} />
              <Input label="Account Number" value={form.config?.accountNumber || ''} onChange={e => setForm({ ...form, config: { ...form.config, accountNumber: e.target.value } })} />
            </div>
            <Input label="Bank Name" value={form.config?.bankName || ''} onChange={e => setForm({ ...form, config: { ...form.config, bankName: e.target.value } })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Branch Code" value={form.config?.branchCode || ''} onChange={e => setForm({ ...form, config: { ...form.config, branchCode: e.target.value } })} />
              <Input label="SWIFT Code" value={form.config?.swiftCode || ''} onChange={e => setForm({ ...form, config: { ...form.config, swiftCode: e.target.value } })} />
            </div>
          </div>
        );
      case 'crypto':
        return (
          <div className="space-y-3">
            <Input label="Wallet Address" value={form.config?.walletAddress || ''} onChange={e => setForm({ ...form, config: { ...form.config, walletAddress: e.target.value } })} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Network</label>
              <select value={form.config?.network || 'BTC'} onChange={e => setForm({ ...form, config: { ...form.config, network: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['BTC', 'ETH', 'USDT', 'SOL'].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Payment Methods</h2>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Method</Button>
      </div>

      <div className="space-y-3">
        {methods.map(m => (
          <Card key={m._id} className="!p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HiCreditCard className={`w-8 h-8 ${m.status === 'active' ? 'text-green-500' : 'text-red-400'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">{m.displayName || m.name}</h3>
                    <Badge variant={m.status === 'active' ? 'success' : 'danger'}>{m.status}</Badge>
                    {m.isDefault && <Badge variant="info">Default</Badge>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{METHODS.find(x => x.value === m.name)?.label || m.name} · {m.currencies?.join(', ') || 'No currencies'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={m.status === 'active'} onChange={() => handleToggle(m._id)} />
                <Button size="sm" variant="secondary" onClick={() => openEdit(m)}><HiPencil className="w-3 h-3" /></Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: m._id, name: m.displayName || m.name })}><HiTrash className="w-3 h-3" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {methods.length === 0 && <Card><p className="text-sm text-[var(--text-muted)] text-center py-8">No payment methods configured.</p></Card>}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Payment Method' : 'Edit Payment Method'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Method</label>
            <select value={form.name} onChange={e => {
              const method = METHODS.find(x => x.value === e.target.value);
              setForm({ ...form, name: e.target.value, type: method?.type || 'mobile_money', displayName: method?.label || '' });
            }} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <Input label="Display Name" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Currencies</label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map(c => (
                <button key={c} type="button" onClick={() => {
                  const currs = form.currencies || [];
                  setForm({ ...form, currencies: currs.includes(c) ? currs.filter(x => x !== c) : [...currs, c] });
                }} className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  (form.currencies || []).includes(c)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-color)] hover:border-blue-600'
                }`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Configuration</h3>
            {renderConfig()}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Instructions</label>
            <textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y" />
          </div>

          <Toggle label="Set as default" checked={form.isDefault} onChange={v => setForm({ ...form, isDefault: v })} />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Method" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
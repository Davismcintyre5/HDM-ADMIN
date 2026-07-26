import { useState, useEffect } from 'react';
import { getPayments, verifyPayment, refundPayment } from '../../services/rvnp/payments';
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethod } from '../../services/rvnp/paymentMethods';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Toggle from '../../components/rvnp/ui/Toggle';
import Modal from '../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../components/rvnp/ui/ConfirmDialog';
import Pagination from '../../components/rvnp/ui/Pagination';
import { formatDate } from '../../utils/rvnp/formatDate';
import { formatCurrency } from '../../utils/rvnp/formatters';
import { HiCheck, HiEye, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const TABS = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'methods', label: 'Payment Methods' },
];

const statusVariant = { completed: 'success', pending: 'warning', failed: 'danger', paid: 'success' };

const emptyMethodForm = {
  name: '', slug: '', type: 'mpesa', isActive: true, isDefault: false,
  minAmount: 10, maxAmount: 150000, instructions: '', processingFee: 0, config: {},
};

export default function Payments() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, payment: null });
  const [methodModal, setMethodModal] = useState({ open: false, mode: 'create', data: null });
  const [methodForm, setMethodForm] = useState(emptyMethodForm);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchPayments = () => {
    setLoading(true);
    getPayments({ page, limit: 20 })
      .then(res => {
        setPayments(Array.isArray(res.data) ? res.data : res.payments || []);
        setPagination(res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  const fetchMethods = () => {
    setLoading(true);
    getPaymentMethods().then(res => setMethods(Array.isArray(res.data) ? res.data : [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { activeTab === 'transactions' ? fetchPayments() : fetchMethods(); }, [page, activeTab]);

  const handleVerify = async (id) => { setActionLoading(true); try { await verifyPayment(id); fetchPayments(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleRefund = async (id) => { if (!window.confirm('Refund this payment?')) return; setActionLoading(true); try { await refundPayment(id, { reason: 'Admin refund' }); fetchPayments(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const openMethodCreate = () => { setMethodForm(emptyMethodForm); setMethodModal({ open: true, mode: 'create', data: null }); };

  const openMethodEdit = (m) => {
    setMethodForm({
      name: m.name, slug: m.slug, type: m.type, isActive: m.isActive,
      isDefault: m.isDefault || false, minAmount: m.minAmount || 10,
      maxAmount: m.maxAmount || 150000, instructions: m.instructions || '',
      processingFee: m.processingFee || 0, config: m.config || {},
    });
    setMethodModal({ open: true, mode: 'edit', data: m });
  };

  const handleMethodSave = async () => {
    setActionLoading(true);
    try {
      const data = { ...methodForm };
      if (methodModal.mode === 'create') await createPaymentMethod(data);
      else await updatePaymentMethod(methodModal.data._id, data);
      setMethodModal({ open: false, mode: 'create', data: null }); fetchMethods();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleToggle = async (id) => { try { await togglePaymentMethod(id); fetchMethods(); } catch (err) { alert(err.message); } };
  const handleMethodDelete = async () => { setActionLoading(true); try { await deletePaymentMethod(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchMethods(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const paymentColumns = [
    { key: 'user', label: 'User', render: row => row.user?.firstName ? `${row.user.firstName} ${row.user.lastName}` : '—' },
    { key: 'amount', label: 'Amount', render: row => <span className="font-medium">{formatCurrency(row.amount, row.currency)}</span> },
    { key: 'purpose', label: 'Purpose', render: row => <Badge variant="info">{row.purpose || '—'}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, payment: row })}><HiEye className="w-4 h-4" /></Button>
        {row.status === 'pending' && <Button size="sm" variant="success" onClick={() => handleVerify(row._id)}><HiCheck className="w-4 h-4" /></Button>}
        {row.status === 'paid' && <Button size="sm" variant="warning" onClick={() => handleRefund(row._id)}>Refund</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payments</h1>
      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' && (
        <Card>
          <Table columns={paymentColumns} data={payments} loading={loading} emptyMessage="No transactions found." />
          <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
        </Card>
      )}

      {activeTab === 'methods' && (
        <div>
          <div className="flex justify-end mb-4"><Button onClick={openMethodCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Method</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {methods.map(m => (
              <Card key={m._id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">{m.name}</h3>
                    {m.isDefault && <Badge variant="success">Default</Badge>}
                  </div>
                  <Badge variant="info">{m.type}</Badge>
                </div>
                <div className="text-xs text-[var(--text-muted)] space-y-1 mb-3">
                  <p>Slug: <span className="font-mono">{m.slug}</span></p>
                  <p>Limits: {m.minAmount?.toLocaleString()} – {m.maxAmount?.toLocaleString()}</p>
                  {m.processingFee > 0 && <p>Fee: {m.processingFee}%</p>}
                  {m.config?.phoneNumber && <p>Phone: <span className="font-mono">{m.config.phoneNumber}</span></p>}
                  {m.config?.tillNumber && <p>Till: <span className="font-mono">{m.config.tillNumber}</span></p>}
                  {m.config?.paybillNumber && (
                    <p>Paybill: <span className="font-mono">{m.config.paybillNumber}</span>
                      {m.config?.accountNumber && <> · Account: <span className="font-mono">{m.config.accountNumber}</span></>}
                    </p>
                  )}
                  {m.instructions && <p className="line-clamp-2 italic mt-1">{m.instructions}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <Toggle checked={m.isActive} onChange={() => handleToggle(m._id)} label={m.isActive ? 'Active' : 'Inactive'} />
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => openMethodEdit(m)}><HiPencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: m._id, name: m.name })}><HiTrash className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
            {methods.length === 0 && (
              <div className="col-span-full text-center py-8 text-[var(--text-muted)]">No payment methods configured.</div>
            )}
          </div>
        </div>
      )}

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, payment: null })} title="Payment Details">
        {viewModal.payment && (
          <div className="space-y-2 text-sm">
            <Row label="Amount" value={formatCurrency(viewModal.payment.amount, viewModal.payment.currency)} bold />
            <Row label="Purpose" value={viewModal.payment.purpose} />
            <Row label="Status" value={viewModal.payment.status} />
            <Row label="Date" value={formatDate(viewModal.payment.createdAt, 'full')} />
          </div>
        )}
      </Modal>

      <Modal open={methodModal.open} onClose={() => setMethodModal({ open: false, mode: 'create', data: null })} title={methodModal.mode === 'create' ? 'Add Method' : 'Edit Method'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={methodForm.name} onChange={e => setMethodForm({ ...methodForm, name: e.target.value })} required />
            <Input label="Slug" value={methodForm.slug} onChange={e => setMethodForm({ ...methodForm, slug: e.target.value })} placeholder="mpesa-stkpush" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select value={methodForm.type} onChange={e => setMethodForm({ ...methodForm, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['mpesa', 'stripe', 'paypal'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-4 pb-1">
              <Toggle label="Active" checked={methodForm.isActive} onChange={v => setMethodForm({ ...methodForm, isActive: v })} />
              <Toggle label="Default" checked={methodForm.isDefault} onChange={v => setMethodForm({ ...methodForm, isDefault: v })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Min Amount" type="number" value={methodForm.minAmount} onChange={e => setMethodForm({ ...methodForm, minAmount: +e.target.value })} />
            <Input label="Max Amount" type="number" value={methodForm.maxAmount} onChange={e => setMethodForm({ ...methodForm, maxAmount: +e.target.value })} />
            <Input label="Processing Fee %" type="number" value={methodForm.processingFee} onChange={e => setMethodForm({ ...methodForm, processingFee: +e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Instructions</label>
            <textarea value={methodForm.instructions} onChange={e => setMethodForm({ ...methodForm, instructions: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y"
              placeholder="Payment instructions shown to users..." />
          </div>

          {/* M-Pesa Config */}
          {methodForm.type === 'mpesa' && (
            <Card className="!p-4 !bg-[var(--bg-secondary)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">M-Pesa Configuration</h3>
              <div className="space-y-3">
                {(methodForm.slug.includes('sendmoney') || methodForm.slug.includes('send-money')) && (
                  <Input label="Phone Number" value={methodForm.config?.phoneNumber || ''}
                    onChange={e => setMethodForm({ ...methodForm, config: { ...methodForm.config, phoneNumber: e.target.value } })}
                    placeholder="07XX XXXXXX" />
                )}
                {methodForm.slug.includes('till') && (
                  <Input label="Till Number" value={methodForm.config?.tillNumber || ''}
                    onChange={e => setMethodForm({ ...methodForm, config: { ...methodForm.config, tillNumber: e.target.value } })} />
                )}
                {methodForm.slug.includes('paybill') && (
                  <>
                    <Input label="Paybill Business Number" value={methodForm.config?.paybillNumber || ''}
                      onChange={e => setMethodForm({ ...methodForm, config: { ...methodForm.config, paybillNumber: e.target.value } })} />
                    <Input label="Account Number" value={methodForm.config?.accountNumber || ''}
                      onChange={e => setMethodForm({ ...methodForm, config: { ...methodForm.config, accountNumber: e.target.value } })} />
                  </>
                )}
                {!methodForm.slug.includes('sendmoney') && !methodForm.slug.includes('send-money') && !methodForm.slug.includes('till') && !methodForm.slug.includes('paybill') && (
                  <p className="text-xs text-[var(--text-muted)]">Config fields will appear based on slug (sendmoney, till, paybill).</p>
                )}
              </div>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setMethodModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleMethodSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleMethodDelete}
        title="Delete Method" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value, bold }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span></div>;
}
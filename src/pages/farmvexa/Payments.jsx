import { useState, useEffect } from 'react';
import { getPayments, verifyPayment, rejectPayment } from '../../services/farmvexa/payments';
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, togglePaymentMethod, deletePaymentMethod } from '../../services/farmvexa/paymentMethods';
import { getPaymentModels, createPaymentModel, updatePaymentModel, togglePaymentModel, deletePaymentModel } from '../../services/farmvexa/paymentModels';
import Card from '../../components/farmvexa/ui/Card';
import Table from '../../components/farmvexa/ui/Table';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Input from '../../components/farmvexa/ui/Input';
import Toggle from '../../components/farmvexa/ui/Toggle';
import Modal from '../../components/farmvexa/ui/Modal';
import ConfirmDialog from '../../components/farmvexa/ui/ConfirmDialog';
import Pagination from '../../components/farmvexa/ui/Pagination';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { formatDate } from '../../utils/farmvexa/formatDate';
import { HiPlus, HiPencil, HiTrash, HiEye, HiCheck, HiX } from 'react-icons/hi';

const TABS = [
  { key: 'payments', label: 'Payments' },
  { key: 'methods', label: 'Payment Methods' },
  { key: 'models', label: 'Subscription Plans' },
];

const METHOD_TYPES = [
  { value: 'mpesa_stk', label: 'M-Pesa STK Push' },
  { value: 'mpesa_send_money', label: 'M-Pesa Send Money' },
  { value: 'mpesa_till', label: 'M-Pesa Till' },
  { value: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'card', label: 'Card Payment' },
  { value: 'other', label: 'Other' },
];

const INTERVALS = ['one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

const paymentStatusVariant = { completed: 'success', pending: 'warning', verified: 'success', rejected: 'danger', pending_verification: 'warning', failed: 'danger' };

export default function Payments() {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({});
  const [methods, setMethods] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [viewModal, setViewModal] = useState({ open: false, payment: null });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');

  const [methodModal, setMethodModal] = useState({ open: false, mode: 'create', data: null });
  const [methodForm, setMethodForm] = useState({ name: '', type: 'mpesa_stk', details: {}, enabled: true, isDefault: false });
  const [methodDelete, setMethodDelete] = useState({ open: false, id: null, name: '' });

  const [modelModal, setModelModal] = useState({ open: false, mode: 'create', data: null });
  const [modelForm, setModelForm] = useState({ name: '', price: 0, currency: 'KES', interval: 'monthly', features: '', maxFarms: 1, maxDevices: 1, aiRequestsPerDay: 50, enabled: true, isDefault: false });
  const [modelDelete, setModelDelete] = useState({ open: false, id: null, name: '' });

  const fetchData = () => {
    setLoading(true);
    if (activeTab === 'payments') {
      getPayments({ page, limit: 20 })
        .then(res => {
          setPayments(res?.data?.payments || []);
          setPagination(res?.data?.pagination || { page: 1, pages: 1 });
          const s = res?.data?.stats || {};
          setPaymentStats({
            totalPayments: s.totalCount,
            pending: s.pendingCount,
            verified: s.completedCount,
            totalRevenue: s.totalAmount,
          });
        })
        .catch(console.error).finally(() => setLoading(false));
    } else if (activeTab === 'methods') {
      getPaymentMethods().then(res => {
        const data = res?.data?.methods || res?.data || [];
        setMethods(Array.isArray(data) ? data : []);
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      getPaymentModels().then(res => {
        const data = res?.data?.models || res?.data || [];
        setModels(Array.isArray(data) ? data : []);
      }).catch(console.error).finally(() => setLoading(false));
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, page]);

  const handleVerify = async (id) => {
    if (!window.confirm('Verify this payment?')) return;
    setActionLoading(true);
    try { await verifyPayment(id); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRejectPayment = async () => {
    setActionLoading(true);
    try { await rejectPayment(rejectModal.id, { reason: rejectReason }); setRejectModal({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const openMethodCreate = () => { setMethodForm({ name: '', type: 'mpesa_stk', details: {}, enabled: true, isDefault: false }); setMethodModal({ open: true, mode: 'create', data: null }); };
  const openMethodEdit = (m) => { setMethodForm(m); setMethodModal({ open: true, mode: 'edit', data: m }); };
  const handleMethodSave = async () => {
    setActionLoading(true);
    try {
      if (methodModal.mode === 'create') await createPaymentMethod(methodForm);
      else await updatePaymentMethod(methodModal.data._id || methodModal.data.id, methodForm);
      setMethodModal({ open: false, mode: 'create', data: null }); fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };
  const handleMethodToggle = async (id) => { try { await togglePaymentMethod(id); fetchData(); } catch (err) { alert(err.message); } };
  const handleMethodDelete = async () => { setActionLoading(true); try { await deletePaymentMethod(methodDelete.id); setMethodDelete({ open: false, id: null, name: '' }); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const openModelCreate = () => { setModelForm({ name: '', price: 0, currency: 'KES', interval: 'monthly', features: '', maxFarms: 1, maxDevices: 1, aiRequestsPerDay: 50, enabled: true, isDefault: false }); setModelModal({ open: true, mode: 'create', data: null }); };
  const openModelEdit = (m) => { setModelForm({ ...m, features: m.features?.join(', ') || '' }); setModelModal({ open: true, mode: 'edit', data: m }); };
  const handleModelSave = async () => {
    setActionLoading(true);
    try {
      const data = { ...modelForm, features: modelForm.features.split(',').map(s => s.trim()).filter(Boolean) };
      if (modelModal.mode === 'create') await createPaymentModel(data);
      else await updatePaymentModel(modelModal.data._id || modelModal.data.id, data);
      setModelModal({ open: false, mode: 'create', data: null }); fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };
  const handleModelToggle = async (id) => { try { await togglePaymentModel(id); fetchData(); } catch (err) { alert(err.message); } };
  const handleModelDelete = async () => { setActionLoading(true); try { await deletePaymentModel(modelDelete.id); setModelDelete({ open: false, id: null, name: '' }); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const renderMethodConfig = () => {
    if (methodForm.type === 'mpesa_stk') {
      return <p className="text-xs text-[var(--text-muted)]">STK Push credentials are configured server-side in environment variables.</p>;
    }
    switch (methodForm.type) {
      case 'mpesa_till':
        return <Input label="Till Number" value={methodForm.details?.tillNumber || ''} onChange={e => setMethodForm({ ...methodForm, details: { ...methodForm.details, tillNumber: e.target.value } })} />;
      case 'mpesa_paybill':
        return (
          <div className="space-y-3">
            <Input label="Paybill Number" value={methodForm.details?.paybill || ''} onChange={e => setMethodForm({ ...methodForm, details: { ...methodForm.details, paybill: e.target.value } })} />
            <Input label="Account Number" value={methodForm.details?.accountNumber || ''} onChange={e => setMethodForm({ ...methodForm, details: { ...methodForm.details, accountNumber: e.target.value } })} />
          </div>
        );
      case 'mpesa_send_money':
        return <Input label="Phone Number" value={methodForm.details?.phoneNumber || ''} onChange={e => setMethodForm({ ...methodForm, details: { ...methodForm.details, phoneNumber: e.target.value } })} />;
      case 'bank':
        return (
          <div className="space-y-3">
            <Input label="Account Name" value={methodForm.details?.accountName || ''} onChange={e => setMethodForm({ ...methodForm, details: { ...methodForm.details, accountName: e.target.value } })} />
            <Input label="Account Number" value={methodForm.details?.accountNumber || ''} onChange={e => setMethodForm({ ...methodForm, details: { ...methodForm.details, accountNumber: e.target.value } })} />
            <Input label="Bank Name" value={methodForm.details?.bankName || ''} onChange={e => setMethodForm({ ...methodForm, details: { ...methodForm.details, bankName: e.target.value } })} />
            <Input label="Branch" value={methodForm.details?.branch || ''} onChange={e => setMethodForm({ ...methodForm, details: { ...methodForm.details, branch: e.target.value } })} />
          </div>
        );
      default: return null;
    }
  };

  const paymentColumns = [
    { key: 'farmer', label: 'Farmer', render: row => (
      <button onClick={() => setViewModal({ open: true, payment: row })} className="text-emerald-600 hover:underline font-medium text-sm">
        {row.user?.name || row.farmer?.name || '—'}
      </button>
    )},
    { key: 'amount', label: 'Amount', render: row => <span className="font-medium">KES {row.amount}</span> },
    { key: 'plan', label: 'Plan', render: row => <Badge variant="info">{row.plan || '—'}</Badge> },
    { key: 'method', label: 'Method', render: row => <span className="text-sm">{row.methodType || '—'}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={paymentStatusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, payment: row })}><HiEye className="w-3 h-3" /></Button>
        {(row.status === 'pending' || row.status === 'pending_verification') && (
          <>
            <Button size="sm" variant="success" onClick={() => handleVerify(row._id)}><HiCheck className="w-3 h-3" /></Button>
            <Button size="sm" variant="danger" onClick={() => { setRejectReason(''); setRejectModal({ open: true, id: row._id, name: row.user?.name }); }}><HiX className="w-3 h-3" /></Button>
          </>
        )}
      </div>
    )},
  ];

  const methodColumns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type', render: row => <Badge variant="info">{row.type}</Badge> },
    { key: 'status', label: 'Status', render: row => (
      <button onClick={() => handleMethodToggle(row._id || row.id)}>
        <Badge variant={row.enabled ? 'success' : 'danger'}>{row.enabled ? 'Active' : 'Inactive'}</Badge>
      </button>
    )},
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openMethodEdit(row)}><HiPencil className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setMethodDelete({ open: true, id: row._id || row.id, name: row.name })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

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

      {activeTab === 'payments' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatBadge label="Total Payments" value={paymentStats.totalPayments} />
            <StatBadge label="Pending" value={paymentStats.pending} />
            <StatBadge label="Verified" value={paymentStats.verified} />
            <StatBadge label="Total Revenue" value={`KES ${paymentStats.totalRevenue || 0}`} />
          </div>
          <Card>
            <Table columns={paymentColumns} data={payments} loading={loading} emptyMessage="No payments found." />
            <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
          </Card>
        </div>
      )}

      {activeTab === 'methods' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={openMethodCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Method</Button>
          </div>
          <Card>
            <Table columns={methodColumns} data={methods} loading={loading} emptyMessage="No payment methods configured." />
          </Card>
        </div>
      )}

      {activeTab === 'models' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={openModelCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Plan</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map(plan => (
              <Card key={plan._id || plan.id} className="relative overflow-hidden">
                {plan.isDefault && <div className="absolute top-2 right-2"><Badge variant="success">Default</Badge></div>}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
                  <p className="text-3xl font-bold text-emerald-500 mt-2">
                    {plan.currency} {plan.price}<span className="text-sm text-[var(--text-muted)]">/{plan.interval}</span>
                  </p>
                </div>
                <div className="space-y-1 text-sm mb-4">
                  <Row label="Farms" value={plan.maxFarms} />
                  <Row label="Devices" value={plan.maxDevices} />
                  <Row label="AI Requests/day" value={plan.aiRequestsPerDay} />
                </div>
                {plan.features?.length > 0 && (
                  <div className="mb-4">
                    {plan.features.map((f, i) => (
                      <p key={i} className="text-xs text-[var(--text-muted)]">✓ {f}</p>
                    ))}
                  </div>
                )}
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => openModelEdit(plan)}><HiPencil className="w-3 h-3 mr-1" /> Edit</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleModelToggle(plan._id || plan.id)}>
                    {plan.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setModelDelete({ open: true, id: plan._id || plan.id, name: plan.name })}><HiTrash className="w-3 h-3" /></Button>
                </div>
              </Card>
            ))}
            {models.length === 0 && <div className="col-span-full text-center py-12 text-[var(--text-muted)]">No plans created yet.</div>}
          </div>
        </div>
      )}

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, payment: null })} title="Payment Details" size="md">
        {viewModal.payment && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
            <Row label="Farmer" value={viewModal.payment.user?.name} />
            <Row label="Email" value={viewModal.payment.user?.email || viewModal.payment.email} />
            <Row label="Amount" value={`KES ${viewModal.payment.amount}`} bold />
            <Row label="Plan" value={viewModal.payment.plan} />
            <Row label="Type" value={viewModal.payment.type} />
            <Row label="Method" value={viewModal.payment.methodType} />
            <Row label="Reference" value={viewModal.payment.reference} />
            <Row label="Status">
              <Badge variant={paymentStatusVariant[viewModal.payment.status] || 'default'}>{viewModal.payment.status}</Badge>
            </Row>
            <Row label="Date" value={formatDate(viewModal.payment.createdAt, 'full')} />
            {viewModal.payment.verifiedAt && <Row label="Verified At" value={formatDate(viewModal.payment.verifiedAt, 'full')} />}
            {viewModal.payment.verifiedBy && <Row label="Verified By" value={viewModal.payment.verifiedBy?.name} />}
          </div>
        )}
      </Modal>

      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }} title={`Reject Payment — ${rejectModal.name}`}>
        <Input label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" required />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleRejectPayment} loading={actionLoading} disabled={!rejectReason.trim()}>Reject</Button>
        </div>
      </Modal>

      <Modal open={methodModal.open} onClose={() => setMethodModal({ open: false, mode: 'create', data: null })} title={methodModal.mode === 'create' ? 'Add Method' : 'Edit Method'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={methodForm.name} onChange={e => setMethodForm({ ...methodForm, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={methodForm.type} onChange={e => setMethodForm({ ...methodForm, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {METHOD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Configuration</h3>
            {renderMethodConfig()}
          </div>
          <div className="flex gap-4">
            <Toggle label="Enabled" checked={methodForm.enabled} onChange={v => setMethodForm({ ...methodForm, enabled: v })} />
            <Toggle label="Default" checked={methodForm.isDefault} onChange={v => setMethodForm({ ...methodForm, isDefault: v })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setMethodModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleMethodSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modelModal.open} onClose={() => setModelModal({ open: false, mode: 'create', data: null })} title={modelModal.mode === 'create' ? 'Add Plan' : 'Edit Plan'} size="lg">
        <div className="space-y-4">
          <Input label="Name" value={modelForm.name} onChange={e => setModelForm({ ...modelForm, name: e.target.value })} required />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price" type="number" value={modelForm.price} onChange={e => setModelForm({ ...modelForm, price: +e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Currency</label>
              <select value={modelForm.currency} onChange={e => setModelForm({ ...modelForm, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['KES', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Interval</label>
              <select value={modelForm.interval} onChange={e => setModelForm({ ...modelForm, interval: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {INTERVALS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Max Farms" type="number" value={modelForm.maxFarms} onChange={e => setModelForm({ ...modelForm, maxFarms: +e.target.value })} />
            <Input label="Max Devices" type="number" value={modelForm.maxDevices} onChange={e => setModelForm({ ...modelForm, maxDevices: +e.target.value })} />
            <Input label="AI Requests/Day" type="number" value={modelForm.aiRequestsPerDay} onChange={e => setModelForm({ ...modelForm, aiRequestsPerDay: +e.target.value })} />
          </div>
          <Input label="Features (comma separated)" value={modelForm.features} onChange={e => setModelForm({ ...modelForm, features: e.target.value })} placeholder="Unlimited AI, 10 Farms..." />
          <div className="flex gap-4">
            <Toggle label="Enabled" checked={modelForm.enabled} onChange={v => setModelForm({ ...modelForm, enabled: v })} />
            <Toggle label="Default" checked={modelForm.isDefault} onChange={v => setModelForm({ ...modelForm, isDefault: v })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModelModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleModelSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={methodDelete.open} onClose={() => setMethodDelete({ open: false, id: null, name: '' })} onConfirm={handleMethodDelete}
        title="Delete Method" message={`Delete ${methodDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
      <ConfirmDialog open={modelDelete.open} onClose={() => setModelDelete({ open: false, id: null, name: '' })} onConfirm={handleModelDelete}
        title="Delete Plan" message={`Delete ${modelDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
      <p className="text-xl font-bold text-[var(--text-primary)]">{value ?? '—'}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-muted)] text-xs">{label}</span>
      <span className={`text-[var(--text-primary)] text-xs font-medium ${bold ? 'font-bold' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}
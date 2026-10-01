import { useState, useEffect } from 'react';
import { getPayments, verifyPayment, rejectPayment } from '../../services/farmvexa/payments';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod,
} from '../../services/farmvexa/paymentMethods';
import {
  getPaymentModels,
  createPaymentModel,
  updatePaymentModel,
  togglePaymentModel,
  deletePaymentModel,
} from '../../services/farmvexa/paymentModels';
import { getInvoices } from '../../services/farmvexa/invoices';
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
import {
  methodLabel,
  purposeLabel,
  statusLabel,
  statusVariant,
  deriveMode,
  buildEmptyMethodForm,
  METHOD_CODE_OPTIONS,
  INVOICE_STATUS_VARIANTS,
} from '../../utils/farmvexa/paymentLabels';
import { HiPlus, HiPencil, HiTrash, HiEye, HiCheck, HiX } from 'react-icons/hi';

const TABS = [
  { key: 'payments', label: 'Payments' },
  { key: 'methods', label: 'Payment Methods' },
  { key: 'models', label: 'Subscription Plans' },
];

const PAYMENT_SUB_TABS = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'attempts', label: 'STK Attempts' },
];

const INTERVALS = ['one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

const unwrap = (res) => res?.data?.data || res?.data || {};

export default function Payments() {
  const [activeTab, setActiveTab] = useState('payments');
  const [subTab, setSubTab] = useState('invoices');

  const [invoices, setInvoices] = useState([]);
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
  const [methodForm, setMethodForm] = useState(buildEmptyMethodForm());
  const [methodDelete, setMethodDelete] = useState({ open: false, id: null, name: '' });

  const [modelModal, setModelModal] = useState({ open: false, mode: 'create', data: null });
  const [modelForm, setModelForm] = useState({
    name: '', price: 0, currency: 'KES', interval: 'monthly', features: '',
    maxFarms: 1, maxDevices: 1, aiRequestsPerDay: 50, enabled: true, isDefault: false,
  });
  const [modelDelete, setModelDelete] = useState({ open: false, id: null, name: '' });

  const fetchData = () => {
    setLoading(true);

    if (activeTab === 'payments') {
      const loadInvoices = getInvoices({ page, limit: 20 })
        .then((res) => {
          const payload = unwrap(res);
          setInvoices(payload?.invoices || []);
          if (subTab === 'invoices') {
            setPagination(payload?.pagination || { page: 1, pages: 1 });
          }
        });

      const loadAttempts = getPayments({ page, limit: 20 })
        .then((res) => {
          const payload = unwrap(res);
          setPayments(payload?.payments || []);
          const s = payload?.stats || {};
          setPaymentStats({
            totalPayments: s.totalCount,
            pending: s.pendingCount,
            verified: s.completedCount,
            totalRevenue: s.totalAmount,
          });
          if (subTab === 'attempts') {
            setPagination(payload?.pagination || { page: 1, pages: 1 });
          }
        });

      Promise.all([loadInvoices, loadAttempts]).finally(() => setLoading(false));
      return;
    }

    if (activeTab === 'methods') {
      getPaymentMethods()
        .then((res) => {
          const payload = unwrap(res);
          const data = payload?.methods || [];
          setMethods(Array.isArray(data) ? data : []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
      return;
    }

    getPaymentModels()
      .then((res) => {
        const payload = unwrap(res);
        const data = payload?.models || [];
        setModels(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, subTab, page]);

  const handleVerify = async (id) => {
    if (!window.confirm('Verify this payment?')) return;
    setActionLoading(true);
    try {
      await verifyPayment(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleRejectPayment = async () => {
    setActionLoading(true);
    try {
      await rejectPayment(rejectModal.id, { reason: rejectReason });
      setRejectModal({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const openMethodCreate = () => {
    setMethodForm(buildEmptyMethodForm());
    setMethodModal({ open: true, mode: 'create', data: null });
  };

  const openMethodEdit = (m) => {
    setMethodForm({
      code: m.code || 'mpesa_stk',
      label: m.label || '',
      mode: m.mode || deriveMode(m.code),
      order: m.order || 0,
      enabled: m.enabled ?? true,
      config: { ...(m.config || {}) },
    });
    setMethodModal({ open: true, mode: 'edit', data: m });
  };

  const handleMethodSave = async () => {
    setActionLoading(true);
    try {
      const payload = { ...methodForm, mode: deriveMode(methodForm.code) };
      if (methodModal.mode === 'create') await createPaymentMethod(payload);
      else await updatePaymentMethod(methodModal.data._id || methodModal.data.id, payload);
      setMethodModal({ open: false, mode: 'create', data: null });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleMethodToggle = async (id) => {
    try {
      await togglePaymentMethod(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleMethodDelete = async () => {
    setActionLoading(true);
    try {
      await deletePaymentMethod(methodDelete.id);
      setMethodDelete({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const openModelCreate = () => {
    setModelForm({
      name: '', price: 0, currency: 'KES', interval: 'monthly', features: '',
      maxFarms: 1, maxDevices: 1, aiRequestsPerDay: 50, enabled: true, isDefault: false,
    });
    setModelModal({ open: true, mode: 'create', data: null });
  };

  const openModelEdit = (m) => {
    setModelForm({ ...m, features: m.features?.join(', ') || '' });
    setModelModal({ open: true, mode: 'edit', data: m });
  };

  const handleModelSave = async () => {
    setActionLoading(true);
    try {
      const data = {
        ...modelForm,
        features: modelForm.features.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (modelModal.mode === 'create') await createPaymentModel(data);
      else await updatePaymentModel(modelModal.data._id || modelModal.data.id, data);
      setModelModal({ open: false, mode: 'create', data: null });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleModelToggle = async (id) => {
    try {
      await togglePaymentModel(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleModelDelete = async () => {
    setActionLoading(true);
    try {
      await deletePaymentModel(modelDelete.id);
      setModelDelete({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const setConfigField = (key, value) =>
    setMethodForm((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }));

  const renderMethodConfig = () => {
    switch (methodForm.code) {
      case 'mpesa_stk':
        return (
          <p className="text-xs text-[var(--text-muted)]">
            STK Push credentials are configured server-side (environment variables).
          </p>
        );
      case 'mpesa_till':
        return (
          <Input
            label="Till Number"
            value={methodForm.config?.tillNumber || ''}
            onChange={(e) => setConfigField('tillNumber', e.target.value)}
          />
        );
      case 'mpesa_paybill':
        return (
          <div className="space-y-3">
            <Input
              label="Paybill Number"
              value={methodForm.config?.paybillNumber || ''}
              onChange={(e) => setConfigField('paybillNumber', e.target.value)}
            />
            <Input
              label="Account Number"
              hint="Use {invoice_number} to substitute the invoice number"
              value={methodForm.config?.accountNumber || ''}
              onChange={(e) => setConfigField('accountNumber', e.target.value)}
            />
          </div>
        );
      case 'mpesa_send_money':
      case 'mpesa_send':
        return (
          <Input
            label="Phone Number"
            value={methodForm.config?.phone || ''}
            onChange={(e) => setConfigField('phone', e.target.value)}
          />
        );
      case 'bank':
        return (
          <div className="space-y-3">
            <Input
              label="Account Name"
              value={methodForm.config?.accountName || ''}
              onChange={(e) => setConfigField('accountName', e.target.value)}
            />
            <Input
              label="Account Number"
              value={methodForm.config?.accountNumber || ''}
              onChange={(e) => setConfigField('accountNumber', e.target.value)}
            />
            <Input
              label="Bank Name"
              value={methodForm.config?.bankName || ''}
              onChange={(e) => setConfigField('bankName', e.target.value)}
            />
            <Input
              label="Branch"
              value={methodForm.config?.branch || ''}
              onChange={(e) => setConfigField('branch', e.target.value)}
            />
            <Input
              label="SWIFT"
              value={methodForm.config?.swift || ''}
              onChange={(e) => setConfigField('swift', e.target.value)}
            />
          </div>
        );
      case 'stripe':
        return (
          <Input
            label="Publishable Key"
            value={methodForm.config?.publishableKey || ''}
            onChange={(e) => setConfigField('publishableKey', e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (row) => <span className="font-mono text-xs">{row.invoiceNumber}</span>,
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium text-[var(--text-primary)]">{row.customerSnapshot?.name || '—'}</p>
          <p className="text-xs text-[var(--text-muted)]">{row.customerSnapshot?.email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => <Badge variant="info">{row.plan || '—'}</Badge>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => <span className="font-medium">KES {row.amountDue ?? row.total}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <span className="text-xs">{purposeLabel(row.type)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={INVOICE_STATUS_VARIANTS[row.status] || 'default'}>{row.status}</Badge>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due',
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setViewModal({ open: true, payment: row })}
        >
          <HiEye className="w-3 h-3" />
        </Button>
      ),
    },
  ];

  const paymentColumns = [
    {
      key: 'farmer',
      label: 'Farmer',
      render: (row) => (
        <button
          onClick={() => setViewModal({ open: true, payment: row })}
          className="text-emerald-600 hover:underline font-medium text-sm"
        >
          {row.user?.name || '—'}
        </button>
      ),
    },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium">KES {row.amount}</span> },
    { key: 'purpose', label: 'Purpose', render: (row) => <Badge variant="info">{purposeLabel(row.purpose)}</Badge> },
    { key: 'method', label: 'Method', render: (row) => <span className="text-sm">{methodLabel(row.method)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, payment: row })}>
            <HiEye className="w-3 h-3" />
          </Button>
          {row.status === 'pending' && (
            <>
              <Button size="sm" variant="success" onClick={() => handleVerify(row._id)}>
                <HiCheck className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setRejectReason('');
                  setRejectModal({ open: true, id: row._id, name: row.user?.name });
                }}
              >
                <HiX className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const methodColumns = [
    { key: 'label', label: 'Name' },
    { key: 'code', label: 'Code', render: (row) => <Badge variant="info">{row.code}</Badge> },
    {
      key: 'mode',
      label: 'Mode',
      render: (row) => (
        <Badge variant={row.mode === 'auto' ? 'success' : 'default'}>{row.mode || '—'}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <button onClick={() => handleMethodToggle(row._id || row.id)}>
          <Badge variant={row.enabled ? 'success' : 'danger'}>
            {row.enabled ? 'Active' : 'Inactive'}
          </Badge>
        </button>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => openMethodEdit(row)}>
            <HiPencil className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setMethodDelete({ open: true, id: row._id || row.id, name: row.label })}
          >
            <HiTrash className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payments</h1>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'payments' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatBadge label="Total Payments" value={paymentStats.totalPayments ?? 0} />
            <StatBadge label="Pending" value={paymentStats.pending ?? 0} />
            <StatBadge label="Verified" value={paymentStats.verified ?? 0} />
            <StatBadge label="Total Revenue" value={`KES ${paymentStats.totalRevenue || 0}`} />
          </div>

          <div className="flex gap-2 mb-4">
            {PAYMENT_SUB_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setSubTab(t.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  subTab === t.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Card>
            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : subTab === 'invoices' ? (
              <>
                <Table
                  columns={invoiceColumns}
                  data={invoices}
                  loading={false}
                  emptyMessage="No invoices yet."
                />
                <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
              </>
            ) : (
              <>
                <Table
                  columns={paymentColumns}
                  data={payments}
                  loading={false}
                  emptyMessage="No STK attempts yet."
                />
                <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
              </>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'methods' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={openMethodCreate}>
              <HiPlus className="w-4 h-4 mr-1" /> Add Method
            </Button>
          </div>
          <Card>
            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <Table
                columns={methodColumns}
                data={methods}
                loading={false}
                emptyMessage="No payment methods configured."
              />
            )}
          </Card>
        </div>
      )}

      {activeTab === 'models' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={openModelCreate}>
              <HiPlus className="w-4 h-4 mr-1" /> Add Plan
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((plan) => (
                <Card key={plan._id || plan.id} className="relative overflow-hidden">
                  {plan.isDefault && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="success">Default</Badge>
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
                    <p className="text-3xl font-bold text-emerald-500 mt-2">
                      {plan.currency} {plan.price}
                      <span className="text-sm text-[var(--text-muted)]">/{plan.interval}</span>
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
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => openModelEdit(plan)}
                    >
                      <HiPencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleModelToggle(plan._id || plan.id)}>
                      {plan.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setModelDelete({ open: true, id: plan._id || plan.id, name: plan.name })}
                    >
                      <HiTrash className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
              {models.length === 0 && (
                <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
                  No plans created yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Modal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, payment: null })}
        title="Details"
        size="md"
      >
        {viewModal.payment && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
            {viewModal.payment.invoiceNumber ? (
              <>
                <Row label="Invoice #" value={viewModal.payment.invoiceNumber} mono />
                <Row label="Customer" value={viewModal.payment.customerSnapshot?.name} />
                <Row label="Email" value={viewModal.payment.customerSnapshot?.email} />
                <Row label="Plan" value={viewModal.payment.plan} />
                <Row label="Total" value={`KES ${viewModal.payment.total}`} />
                <Row label="Amount Due" value={`KES ${viewModal.payment.amountDue}`} bold />
                <Row label="Type" value={purposeLabel(viewModal.payment.type)} />
                <Row label="Issued" value={formatDate(viewModal.payment.issuedAt, 'full')} />
                <Row label="Due" value={formatDate(viewModal.payment.dueDate, 'full')} />
                {viewModal.payment.paidAt && (
                  <>
                    <Row label="Paid At" value={formatDate(viewModal.payment.paidAt, 'full')} />
                    <Row label="Method" value={methodLabel(viewModal.payment.paymentMethod)} />
                    {viewModal.payment.paymentRef && <Row label="Reference" value={viewModal.payment.paymentRef} mono />}
                  </>
                )}
              </>
            ) : (
              <>
                <Row label="Farmer" value={viewModal.payment.user?.name} />
                <Row label="Email" value={viewModal.payment.user?.email} />
                <Row label="Phone" value={viewModal.payment.user?.phone} />
                <Row label="Amount" value={`KES ${viewModal.payment.amount}`} bold />
                <Row label="Purpose" value={purposeLabel(viewModal.payment.purpose)} />
                <Row label="Method" value={methodLabel(viewModal.payment.method)} />
                <Row label="Reference" value={viewModal.payment.providerRef || viewModal.payment.mpesaReceipt} />
                <Row label="Status">
                  <Badge variant={statusVariant(viewModal.payment.status)}>
                    {statusLabel(viewModal.payment.status)}
                  </Badge>
                </Row>
                <Row label="Date" value={formatDate(viewModal.payment.createdAt, 'full')} />
                {viewModal.payment.verifiedAt && (
                  <Row label="Verified At" value={formatDate(viewModal.payment.verifiedAt, 'full')} />
                )}
                {viewModal.payment.verifiedBy && (
                  <Row label="Verified By" value={viewModal.payment.verifiedBy?.name} />
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, id: null, name: '' });
          setRejectReason('');
        }}
        title={`Reject Payment — ${rejectModal.name}`}
      >
        <Input
          label="Reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection"
          required
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setRejectModal({ open: false, id: null, name: '' });
              setRejectReason('');
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRejectPayment} loading={actionLoading} disabled={!rejectReason.trim()}>
            Reject
          </Button>
        </div>
      </Modal>

      <Modal
        open={methodModal.open}
        onClose={() => setMethodModal({ open: false, mode: 'create', data: null })}
        title={methodModal.mode === 'create' ? 'Add Method' : 'Edit Method'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Label"
            value={methodForm.label}
            onChange={(e) => setMethodForm({ ...methodForm, label: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Code</label>
            <select
              value={methodForm.code}
              onChange={(e) => setMethodForm({ ...methodForm, code: e.target.value })}
              disabled={methodModal.mode === 'edit'}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm disabled:opacity-60"
            >
              {METHOD_CODE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
            <p className="text-sm text-[var(--text-primary)] font-medium">{deriveMode(methodForm.code)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Auto methods (STK, Stripe) trigger an in-app flow. Manual methods show step-by-step instructions.
            </p>
          </div>

          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Configuration</h3>
            {renderMethodConfig()}
          </div>

          <Toggle
            label="Enabled"
            checked={methodForm.enabled}
            onChange={(v) => setMethodForm({ ...methodForm, enabled: v })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setMethodModal({ open: false, mode: 'create', data: null })}>
              Cancel
            </Button>
            <Button onClick={handleMethodSave} loading={actionLoading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={modelModal.open}
        onClose={() => setModelModal({ open: false, mode: 'create', data: null })}
        title={modelModal.mode === 'create' ? 'Add Plan' : 'Edit Plan'}
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Name" value={modelForm.name} onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })} required />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price" type="number" value={modelForm.price} onChange={(e) => setModelForm({ ...modelForm, price: +e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Currency</label>
              <select
                value={modelForm.currency}
                onChange={(e) => setModelForm({ ...modelForm, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
              >
                {['KES', 'USD', 'EUR', 'GBP'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Interval</label>
              <select
                value={modelForm.interval}
                onChange={(e) => setModelForm({ ...modelForm, interval: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
              >
                {INTERVALS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Max Farms" type="number" value={modelForm.maxFarms} onChange={(e) => setModelForm({ ...modelForm, maxFarms: +e.target.value })} />
            <Input label="Max Devices" type="number" value={modelForm.maxDevices} onChange={(e) => setModelForm({ ...modelForm, maxDevices: +e.target.value })} />
            <Input label="AI Requests/Day" type="number" value={modelForm.aiRequestsPerDay} onChange={(e) => setModelForm({ ...modelForm, aiRequestsPerDay: +e.target.value })} />
          </div>
          <Input
            label="Features (comma separated)"
            value={modelForm.features}
            onChange={(e) => setModelForm({ ...modelForm, features: e.target.value })}
            placeholder="crop_scan, field_scan, iot_field_sensors"
          />
          <p className="text-xs text-[var(--text-muted)] -mt-2">
            Use feature keys exactly as the server expects: <code>crop_scan, field_scan, field_scan_manual, livestock, health, production, inventory, finance, weather, ai_chat, team, market, reports, alerts, iot_field_sensors, field_scan_gps, storage_monitoring, co2_detection, pir_detection</code>
          </p>
          <div className="flex gap-4">
            <Toggle label="Enabled" checked={modelForm.enabled} onChange={(v) => setModelForm({ ...modelForm, enabled: v })} />
            <Toggle label="Default" checked={modelForm.isDefault} onChange={(v) => setModelForm({ ...modelForm, isDefault: v })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModelModal({ open: false, mode: 'create', data: null })}>
              Cancel
            </Button>
            <Button onClick={handleModelSave} loading={actionLoading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={methodDelete.open}
        onClose={() => setMethodDelete({ open: false, id: null, name: '' })}
        onConfirm={handleMethodDelete}
        title="Delete Method"
        message={`Delete ${methodDelete.name}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={modelDelete.open}
        onClose={() => setModelDelete({ open: false, id: null, name: '' })}
        onConfirm={handleModelDelete}
        title="Delete Plan"
        message={`Delete ${modelDelete.name}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
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

function Row({ label, value, children }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-muted)] text-xs">{label}</span>
      {children || <span className="text-[var(--text-primary)] text-xs font-medium">{value ?? '—'}</span>}
    </div>
  );
}
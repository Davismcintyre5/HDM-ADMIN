import { useState, useEffect } from 'react';
import {
  getApprovals,
  getApprovalHistory,
  approveUser,
  rejectUser,
  confirmPayment,
} from '../../services/farmvexa/approvals';
import { getRenewals, approveRenewal, rejectRenewal } from '../../services/farmvexa/renewals';
import { getUpgrades, approveUpgrade, rejectUpgrade } from '../../services/farmvexa/upgrades';
import { getInvoiceByUser } from '../../services/farmvexa/invoices';
import Card from '../../components/farmvexa/ui/Card';
import Table from '../../components/farmvexa/ui/Table';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Input from '../../components/farmvexa/ui/Input';
import Select from '../../components/farmvexa/ui/Select';
import Modal from '../../components/farmvexa/ui/Modal';
import Pagination from '../../components/farmvexa/ui/Pagination';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { formatDate } from '../../utils/farmvexa/formatDate';
import {
  methodLabel,
  APPROVAL_STATUS_VARIANTS,
  INVOICE_STATUS_VARIANTS,
} from '../../utils/farmvexa/paymentLabels';
import { HiEye, HiCheck, HiX, HiCreditCard } from 'react-icons/hi';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'renewals', label: 'Renewals' },
  { key: 'upgrades', label: 'Upgrades' },
  { key: 'history', label: 'History' },
];

const PAY_METHODS = [
  { value: 'mpesa_stk', label: 'M-Pesa STK Push' },
  { value: 'mpesa_send_money', label: 'M-Pesa Send Money' },
  { value: 'mpesa_till', label: 'M-Pesa Till' },
  { value: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'manual', label: 'Manual' },
];

const unwrap = (res) => res?.data?.data || res?.data || {};

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('pending');
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, approval: null });
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, approval: null });
  const [rejectReason, setRejectReason] = useState('');
  const [payModal, setPayModal] = useState({ open: false, userId: null, name: '' });
  const [payMethod, setPayMethod] = useState('mpesa_stk');
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');

  const fetchData = () => {
    setLoading(true);
    setApprovals([]);
    const params = { page, limit: 20 };

    const onSuccess = (res, key) => {
      const payload = unwrap(res);
      const list = payload?.[key] || payload?.approvals || [];
      setApprovals(Array.isArray(list) ? list : []);
      setPagination(payload?.pagination || { page: 1, pages: 1 });
    };

    const onError = (err) => {
      console.error(`[Approvals fetch — ${activeTab}]`, err?.response?.data || err.message);
      setApprovals([]);
    };

    const onFinally = () => setLoading(false);

    if (activeTab === 'pending') {
      getApprovals({ ...params, status: 'pending' })
        .then((res) => onSuccess(res, 'approvals'))
        .catch(onError)
        .finally(onFinally);
    } else if (activeTab === 'renewals') {
      getRenewals({ ...params, status: 'pending' })
        .then((res) => onSuccess(res, 'renewals'))
        .catch(onError)
        .finally(onFinally);
    } else if (activeTab === 'upgrades') {
      getUpgrades({ ...params, status: 'pending' })
        .then((res) => onSuccess(res, 'upgrades'))
        .catch(onError)
        .finally(onFinally);
    } else {
      getApprovalHistory(params)
        .then((res) => onSuccess(res, 'approvals'))
        .catch(onError)
        .finally(onFinally);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  useEffect(() => {
    if (!viewModal.open || !viewModal.approval) {
      setInvoice(null);
      return;
    }
    const row = viewModal.approval;
    const userId = row.user?._id || row.user?.id;
    if (!userId) {
      setInvoice(null);
      return;
    }
    setInvoiceLoading(true);
    getInvoiceByUser(userId)
      .then((res) => {
        const payload = unwrap(res);
        setInvoice(payload?.invoice || null);
      })
      .catch(() => setInvoice(null))
      .finally(() => setInvoiceLoading(false));
  }, [viewModal.open, viewModal.approval]);

  const currentType =
    viewModal.approval?.type ||
    (activeTab === 'upgrades' ? 'upgrade' : activeTab === 'renewals' ? 'renewal' : 'registration');
  const isPending = viewModal.approval?.status === 'pending';

  const handleApprove = async () => {
    const row = viewModal.approval;
    if (!row) return;

    if (!isPending) {
      alert(`Already ${row.status}`);
      setViewModal({ open: false, approval: null });
      fetchData();
      return;
    }

    setActionLoading(true);
    try {
      if (row.type === 'renewal') {
        await approveRenewal(row._id);
      } else if (row.type === 'upgrade') {
        await approveUpgrade(row._id, { notes });
      } else {
        const userId = row.user?._id || row._id;
        await approveUser(userId, { notes });
      }
      setViewModal({ open: false, approval: null });
      setNotes('');
      setTimeout(() => fetchData(), 400);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const openReject = () => {
    setRejectModal({ open: true, approval: viewModal.approval });
    setRejectReason('');
  };

  const handleReject = async () => {
    const row = rejectModal.approval;
    if (!row) return;

    if (!rejectReason.trim()) {
      alert('Reason is required');
      return;
    }

    setActionLoading(true);
    try {
      if (row.type === 'renewal') {
        await rejectRenewal(row._id, { reason: rejectReason, notes });
      } else if (row.type === 'upgrade') {
        await rejectUpgrade(row._id, { reason: rejectReason, notes });
      } else {
        const userId = row.user?._id || row._id;
        await rejectUser(userId, { reason: rejectReason, notes });
      }
      setRejectModal({ open: false, approval: null });
      setNotes('');
      setViewModal({ open: false, approval: null });
      setTimeout(() => fetchData(), 400);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const openPayModal = () => {
    const row = viewModal.approval;
    const userId = row?.user?._id || row?._id;
    const name = row?.user?.name || row?.farmer?.name || '';
    setPayModal({ open: true, userId, name });
    setPayMethod('mpesa_stk');
    setPayReference('');
    setPayNote('');
  };

  const handleConfirmPayment = async () => {
    if (!payModal.userId) return alert('User not found');
    setActionLoading(true);
    try {
      await confirmPayment(payModal.userId, {
        method: payMethod,
        reference: payReference || undefined,
        note: payNote || undefined,
      });
      setPayModal({ open: false, userId: null, name: '' });
      const userId = viewModal.approval?.user?._id;
      if (userId) {
        const res = await getInvoiceByUser(userId);
        const payload = unwrap(res);
        setInvoice(payload?.invoice || null);
      }
      setTimeout(() => fetchData(), 400);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <button
          onClick={() => {
            setViewModal({ open: true, approval: row });
            setNotes('');
          }}
          className="text-emerald-600 hover:underline font-medium"
        >
          {row.user?.name || row.farmer?.name || row.name || '—'}
        </button>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.user?.email || row.farmer?.email || row.email || '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className="text-sm">{row.user?.phone || row.farmer?.phone || row.phone || '—'}</span>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => {
        if (row.type === 'upgrade') {
          return (
            <div className="text-xs">
              <Badge variant="default">{row.oldPlan || '—'}</Badge>
              <span className="mx-1 text-[var(--text-muted)]">→</span>
              <Badge variant="info">{row.newPlan || row.plan || '—'}</Badge>
            </div>
          );
        }
        return (
          <Badge variant="info">
            {row.plan || row.selectedPlan || row.planName || row.user?.selectedPlan || '—'}
          </Badge>
        );
      },
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (row) => {
        const amount = row.amount || row.payment?.amount;
        const method = row.paymentMethod || row.payment?.method;
        const reference = row.paymentReference || row.payment?.reference;
        return amount ? (
          <div className="text-xs">
            <span className="text-[var(--text-primary)] font-medium">KES {amount}</span>
            {method && <span className="text-[var(--text-muted)] ml-1">· {methodLabel(method)}</span>}
            {reference && <span className="text-[var(--text-muted)] ml-1">· {reference}</span>}
          </div>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">—</span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        if (activeTab === 'history' || activeTab === 'renewals' || activeTab === 'upgrades') {
          return (
            <Badge variant={APPROVAL_STATUS_VARIANTS[row.status] || 'default'}>
              {row.status || '—'}
            </Badge>
          );
        }
        const payStatus = row.payment?.status || 'pending';
        const label = payStatus === 'success' ? 'Paid' : payStatus === 'failed' ? 'Failed' : 'Pending Payment';
        const variant = payStatus === 'success' ? 'success' : payStatus === 'failed' ? 'danger' : 'warning';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt || row.user?.createdAt || row.renewalDate),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setViewModal({ open: true, approval: row });
            setNotes('');
          }}
        >
          <HiEye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const invoicePaid = invoice?.status === 'paid';

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Approvals</h1>

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

      <Card>
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={approvals}
              loading={false}
              emptyMessage={`No ${activeTab} approvals.`}
            />
            <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={viewModal.open}
        onClose={() => {
          setViewModal({ open: false, approval: null });
          setNotes('');
        }}
        title="Approval Review"
        size="lg"
      >
        {viewModal.approval && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Name" value={viewModal.approval.user?.name || viewModal.approval.farmer?.name} bold />
              <Row label="Email" value={viewModal.approval.user?.email || viewModal.approval.farmer?.email} />
              <Row label="Phone" value={viewModal.approval.user?.phone || viewModal.approval.farmer?.phone} />
              {viewModal.approval.user?.county && <Row label="County" value={viewModal.approval.user?.county} />}
              {viewModal.approval.user?.subCounty && (
                <Row label="Sub-County" value={viewModal.approval.user?.subCounty} />
              )}
              <Row
                label="Registered"
                value={formatDate(
                  viewModal.approval.user?.createdAt || viewModal.approval.createdAt,
                  'full'
                )}
              />
              <Row label="Type" value={currentType} />
              <Row label="Status">
                <Badge variant={APPROVAL_STATUS_VARIANTS[viewModal.approval.status] || 'default'}>
                  {viewModal.approval.status}
                </Badge>
              </Row>
            </div>

            {invoiceLoading ? (
              <div className="text-center text-sm text-[var(--text-muted)] py-4">Loading invoice...</div>
            ) : invoice ? (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Invoice</h3>
                  <Badge variant={INVOICE_STATUS_VARIANTS[invoice.status] || 'default'}>
                    {invoice.status}
                  </Badge>
                </div>
                <Row label="Invoice #" value={invoice.invoiceNumber} mono />
                <Row label="Plan" value={invoice.plan} />
                <Row label="Total" value={`KES ${invoice.total}`} />
                <Row label="Amount Due" value={`KES ${invoice.amountDue}`} bold />
                <Row label="Issued" value={formatDate(invoice.issuedAt, 'full')} />
                <Row label="Due" value={formatDate(invoice.dueDate, 'full')} />
                {invoicePaid && (
                  <>
                    <Row label="Paid At" value={formatDate(invoice.paidAt, 'full')} />
                    <Row label="Method" value={methodLabel(invoice.paymentMethod)} />
                    {invoice.paymentRef && <Row label="Reference" value={invoice.paymentRef} mono />}
                  </>
                )}
              </div>
            ) : null}

            {currentType === 'renewal' && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Renewal Details</h3>
                <Row label="Plan" value={viewModal.approval.plan || viewModal.approval.user?.selectedPlan} />
                <Row label="Amount" value={`KES ${viewModal.approval.amount || 0}`} />
                <Row label="Method" value={methodLabel(viewModal.approval.paymentMethod)} />
                <Row label="Reference" value={viewModal.approval.paymentReference} />
                <Row
                  label="Expiry"
                  value={
                    viewModal.approval.user?.subscriptionExpiry
                      ? formatDate(viewModal.approval.user.subscriptionExpiry)
                      : null
                  }
                />
              </div>
            )}

            {currentType === 'upgrade' && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Upgrade Details</h3>
                <Row label="Current Plan" value={viewModal.approval.oldPlan} />
                <Row label="New Plan" value={viewModal.approval.newPlan || viewModal.approval.plan} />
                <Row label="Amount" value={`KES ${viewModal.approval.amount || 0}`} />
                <Row label="Method" value={methodLabel(viewModal.approval.paymentMethod)} />
                <Row label="Reference" value={viewModal.approval.paymentReference} />
              </div>
            )}

            {isPending && (
              <>
                <Input
                  label="Admin Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes..."
                />
                <div className="flex justify-end gap-2 flex-wrap">
                  {currentType === 'registration' && invoice && !invoicePaid && (
                    <Button variant="outline" onClick={openPayModal}>
                      <HiCreditCard className="w-4 h-4 mr-1" /> Confirm Payment
                    </Button>
                  )}
                  <Button variant="danger" onClick={openReject}>
                    <HiX className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button variant="success" onClick={handleApprove} loading={actionLoading}>
                    <HiCheck className="w-4 h-4 mr-1" /> Approve
                  </Button>
                </div>
              </>
            )}

            {!isPending && (
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-secondary)]">
                This approval is{' '}
                <strong className="text-[var(--text-primary)]">{viewModal.approval.status}</strong>. No
                further action needed.
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, approval: null });
          setRejectReason('');
        }}
        title={`Reject — ${rejectModal.approval?.user?.name || ''}`}
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
              setRejectModal({ open: false, approval: null });
              setRejectReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            loading={actionLoading}
            disabled={!rejectReason.trim()}
          >
            Reject
          </Button>
        </div>
      </Modal>

      <Modal
        open={payModal.open}
        onClose={() => {
          setPayModal({ open: false, userId: null, name: '' });
          setPayReference('');
          setPayNote('');
        }}
        title={`Confirm Payment — ${payModal.name}`}
      >
        <div className="space-y-4">
          {invoice && (
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-secondary)]">Invoice</span>
                <span className="font-mono text-[var(--text-primary)]">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-secondary)]">Amount Due</span>
                <span className="font-semibold text-blue-600">KES {invoice.amountDue}</span>
              </div>
            </div>
          )}

          <Select
            label="Payment Method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={PAY_METHODS}
          />

          <Input
            label="Reference"
            hint="M-Pesa code, bank ref, receipt number"
            value={payReference}
            onChange={(e) => setPayReference(e.target.value)}
            placeholder="QK47ABC123"
          />

          <Input
            label="Internal Note"
            hint="Optional"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            placeholder="Any notes..."
          />

          <p className="text-xs text-[var(--text-muted)]">
            This marks the invoice as paid and notifies the farmer. The account stays pending until you
            approve.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setPayModal({ open: false, userId: null, name: '' });
                setPayReference('');
                setPayNote('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment} loading={actionLoading}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, bold, mono, children }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {children || (
        <span
          className={`text-[var(--text-primary)] text-right ${bold ? 'font-bold' : ''} ${
            mono ? 'font-mono text-xs' : ''
          }`}
        >
          {value || '—'}
        </span>
      )}
    </div>
  );
}
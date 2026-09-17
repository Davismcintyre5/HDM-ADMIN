import { useState, useEffect } from 'react';
import {
  getPayments,
  verifyPayment,
  retryPayment,
  refundPayment,
  deletePayment
} from '../../services/smartpos/payments';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Modal from '../../components/smartpos/ui/Modal';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import Pagination from '../../components/smartpos/ui/Pagination';
import { formatDate } from '../../utils/smartpos/formatDate';
import { formatMoney } from '../../utils/smartpos/formatMoney';
import { HiEye, HiCheck, HiRefresh, HiTrash } from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'succeeded', label: 'Succeeded' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' }
];

const statusVariant = {
  pending: 'warning',
  succeeded: 'success',
  failed: 'danger',
  refunded: 'info'
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [viewModal, setViewModal] = useState({ open: false, payment: null });
  const [refundModal, setRefundModal] = useState({ open: false, id: null });
  const [refundReason, setRefundReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchPayments = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    getPayments(params)
      .then((res) => {
        setPayments(res?.data || []);
        setPagination(res?.meta || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [page, filter]);

  const handleVerify = async (id) => {
    if (!window.confirm('Verify this payment? Client will be activated/renewed.')) return;
    setActionLoading(true);
    try {
      await verifyPayment(id);
      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const handleRetry = async (id) => {
    setActionLoading(true);
    try {
      await retryPayment(id);
      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const handleRefund = async () => {
    setActionLoading(true);
    try {
      await refundPayment(refundModal.id, { reason: refundReason });
      setRefundModal({ open: false, id: null });
      setRefundReason('');
      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deletePayment(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const clientName = (row) => {
    const name = row.tenant?.name || row.clientName || row.client?.name;
    if (!name) return '—';
    return row.tenant?.pending ? `${name} (pending)` : name;
  };

  const columns = [
    {
      key: 'client',
      label: 'Client',
      render: (row) => (
        <button
          onClick={() => setViewModal({ open: true, payment: row })}
          className="text-[var(--accent)] hover:underline font-medium text-sm text-left"
        >
          {clientName(row)}
        </button>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-medium">
          {formatMoney(row.amountMinor, row.currency)}
        </span>
      )
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => <Badge variant="info">{row.method || '—'}</Badge>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt)
    },
    {
      key: 'actions',
      label: '',
      render: (row) => {
        const id = row._id || row.id;
        return (
          <div className="flex gap-1 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setViewModal({ open: true, payment: row })}
              title="View"
            >
              <HiEye className="w-3 h-3" />
            </Button>

            {row.status === 'pending' && (
              <Button
                size="sm"
                variant="success"
                onClick={() => handleVerify(id)}
                title="Verify"
              >
                <HiCheck className="w-3 h-3" />
              </Button>
            )}

            {row.status === 'failed' && (
              <Button
                size="sm"
                variant="warning"
                onClick={() => handleRetry(id)}
                title="Retry"
              >
                <HiRefresh className="w-3 h-3" />
              </Button>
            )}

            {row.status === 'succeeded' && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setRefundReason('');
                  setRefundModal({ open: true, id });
                }}
              >
                Refund
              </Button>
            )}

            {row.status !== 'succeeded' && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirmDelete({ open: true, id })}
                title="Delete"
              >
                <HiTrash className="w-3 h-3" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payments</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-[var(--radius)] text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f.key
                ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table
          columns={columns}
          data={payments}
          loading={loading}
          emptyMessage="No payments found."
        />
        <Pagination
          page={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      </Card>

      {/* View modal */}
      <Modal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, payment: null })}
        title="Payment Details"
        size="md"
      >
        {viewModal.payment && (
          <div className="bg-[var(--bg-secondary)] rounded-[var(--radius)] p-4 space-y-2 text-sm">
            <Row label="Client" value={clientName(viewModal.payment)} />
            <Row
              label="Amount"
              value={formatMoney(viewModal.payment.amountMinor, viewModal.payment.currency)}
              bold
            />
            <Row label="Method" value={viewModal.payment.method} />
            <Row label="Status" value={viewModal.payment.status} />
            <Row label="Purpose" value={viewModal.payment.purpose} />
            <Row label="Reference" value={viewModal.payment.reference} mono />
            {viewModal.payment.mpesaPhone && (
              <Row label="M-Pesa phone" value={viewModal.payment.mpesaPhone} mono />
            )}
            {viewModal.payment.mpesaCode && (
              <Row label="M-Pesa code" value={viewModal.payment.mpesaCode} mono />
            )}
            {viewModal.payment.verifiedAt && (
              <Row
                label="Verified at"
                value={formatDate(viewModal.payment.verifiedAt)}
              />
            )}
            <Row label="Date" value={formatDate(viewModal.payment.createdAt)} />

            {viewModal.payment.tenant?.pending && (
              <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--warning)]">
                  Registration pending — client not yet created.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Refund modal */}
      <Modal
        open={refundModal.open}
        onClose={() => { setRefundModal({ open: false, id: null }); setRefundReason(''); }}
        title="Refund Payment"
        size="sm"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          This will issue a refund and mark the payment as refunded.
        </p>
        <Input
          label="Reason"
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          placeholder="Refund reason"
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => { setRefundModal({ open: false, id: null }); setRefundReason(''); }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRefund}
            loading={actionLoading}
            disabled={!refundReason.trim()}
          >
            Refund
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Payment"
        message="Delete this payment record? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--text-secondary)] shrink-0">{label}</span>
      <span
        className={`text-[var(--text-primary)] text-right break-all ${bold ? 'font-bold' : ''} ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
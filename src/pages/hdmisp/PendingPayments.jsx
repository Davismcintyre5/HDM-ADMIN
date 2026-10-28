import { useEffect, useState, useCallback } from 'react';
import { HiCheck, HiX, HiRefresh, HiCreditCard } from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Table from '../../components/hdmisp/ui/Table';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Modal from '../../components/hdmisp/ui/Modal';
import Pagination from '../../components/hdmisp/ui/Pagination';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import { getPendingPayments, confirmPayment, rejectPayment } from '../../services/hdmisp/billing';
import { formatDateTime } from '../../utils/hdmisp/formatDate';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';
import { PAGE_LIMIT } from '../../utils/hdmisp/constants';

export default function PendingPayments() {
  const toast = useToast();
  const { isSuperadmin } = useAuth();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [receipt, setReceipt] = useState('');
  const [notes, setNotes] = useState('');

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingPayments({ page, limit: PAGE_LIMIT });
      setItems(res.data || []);
      setMeta({
        page: res.meta?.page || 1,
        totalPages: res.meta?.totalPages || 1,
        total: res.meta?.total || 0,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => { load(); }, [load]);

  const doConfirm = async () => {
    if (!confirmTarget) return;
    if (!receipt.trim()) { toast.error('Receipt number is required'); return; }
    const txId = confirmTarget.transaction?.id;
    if (!txId) { toast.error('Missing transaction ID'); return; }
    setActionLoading(txId);
    try {
      await confirmPayment({
        transactionId: txId,
        receiptNumber: receipt.trim(),
        notes: notes.trim() || undefined,
      });
      toast.success('Payment confirmed');
      setConfirmTarget(null);
      setReceipt('');
      setNotes('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to confirm');
    } finally {
      setActionLoading(null);
    }
  };

  const doReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { toast.error('Reason is required'); return; }
    const txId = rejectTarget.transaction?.id;
    if (!txId) { toast.error('Missing transaction ID'); return; }
    setActionLoading(txId);
    try {
      await rejectPayment({ transactionId: txId, reason: rejectReason.trim() });
      toast.success('Payment rejected');
      setRejectTarget(null);
      setRejectReason('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'provider',
      label: 'Provider',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)] text-sm">
            {row.provider?.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{row.provider?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'invoice',
      label: 'Invoice',
      render: (row) => (
        <div>
          <p className="text-sm font-mono text-[var(--text-primary)]">
            {row.invoice?.invoiceNumber || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {row.invoice?.purpose ? row.invoice.purpose : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {formatMoneyMajor(
            row.transaction?.amount ?? 0,
            row.transaction?.currency || 'KES'
          )}
        </span>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (row) => (
        <span className="text-sm font-mono text-[var(--text-muted)]">
          {row.transaction?.reference || '—'}
        </span>
      ),
    },
    {
      key: 'note',
      label: 'Note',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.transaction?.note || '—'}
        </span>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.transaction?.submittedAt
            ? formatDateTime(row.transaction.submittedAt)
            : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => {
        const txId = row.transaction?.id;
        return (
          <div className="flex justify-end gap-1">
            {isSuperadmin && (
              <>
                <Button
                  size="sm"
                  variant="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceipt(row.transaction?.reference || '');
                    setNotes('');
                    setConfirmTarget(row);
                  }}
                  disabled={actionLoading === txId}
                  title="Confirm"
                >
                  <HiCheck className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRejectReason('');
                    setRejectTarget(row);
                  }}
                  disabled={actionLoading === txId}
                  title="Reject"
                >
                  <HiX className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Pending Payments
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} payment{meta.total !== 1 ? 's' : ''} awaiting confirmation
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4">
          {loading && !items.length ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-cyan-600 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <HiCreditCard className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-muted)]">No pending payments</p>
            </div>
          ) : (
            <>
              <Table columns={columns} data={items} rowKey={(r) => r.transaction?.id} />
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </Card>

      <Modal
        open={!!confirmTarget}
        onClose={() => { setConfirmTarget(null); setReceipt(''); setNotes(''); }}
        title="Confirm payment"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => { setConfirmTarget(null); setReceipt(''); setNotes(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={doConfirm}
              loading={actionLoading === confirmTarget?.transaction?.id}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {confirmTarget && (
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Provider:</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {confirmTarget.provider?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Invoice:</span>
                <span className="text-[var(--text-primary)] font-mono text-xs">
                  {confirmTarget.invoice?.invoiceNumber || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Amount:</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {formatMoneyMajor(
                    confirmTarget.transaction?.amount ?? 0,
                    confirmTarget.transaction?.currency || 'KES'
                  )}
                </span>
              </div>
              {confirmTarget.transaction?.reference && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Submitted reference:</span>
                  <span className="text-[var(--text-primary)] font-mono text-xs">
                    {confirmTarget.transaction.reference}
                  </span>
                </div>
              )}
              {confirmTarget.transaction?.note && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Note:</span>
                  <span className="text-[var(--text-primary)] text-xs">
                    {confirmTarget.transaction.note}
                  </span>
                </div>
              )}
            </div>
          )}
          <Input
            label="Receipt number *"
            value={receipt}
            onChange={(e) => setReceipt(e.target.value)}
            placeholder="RKT4X7Y8Z9"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm resize-y"
              placeholder="e.g. Cash payment received at office"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectReason(''); }}
        title="Reject payment"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => { setRejectTarget(null); setRejectReason(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={doReject}
              loading={actionLoading === rejectTarget?.transaction?.id}
            >
              Reject
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            This will mark the transaction as failed and reset the invoice so the provider can resubmit.
          </p>
          <Input
            label="Reason *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Payment not received"
          />
        </div>
      </Modal>
    </div>
  );
}
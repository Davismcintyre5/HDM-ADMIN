import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiRefresh,
} from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Modal from '../../components/pharmasys/ui/Modal';
import Textarea from '../../components/pharmasys/ui/Textarea';
import Input from '../../components/pharmasys/ui/Input';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getPayment,
  getPaymentAttempts,
  markPaymentPaid,
  markPaymentFailed,
  refundPayment,
} from '../../services/pharmasys/payments';
import { formatDateTime, relativeTime } from '../../utils/pharmasys/formatDate';
import { formatMoneyMajor } from '../../utils/pharmasys/formatMoney';
import { statusVariant, statusLabel } from '../../utils/pharmasys/constants';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [payment, setPayment] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [markPaidRef, setMarkPaidRef] = useState('');
  const [markPaidNote, setMarkPaidNote] = useState('');

  const [markFailedOpen, setMarkFailedOpen] = useState(false);
  const [markFailedReason, setMarkFailedReason] = useState('');

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        getPayment(id),
        getPaymentAttempts(id).catch(() => null),
      ]);
      setPayment(p?.data || p);
      const attemptList = a?.data || a || [];
      setAttempts(Array.isArray(attemptList) ? attemptList : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load payment');
      navigate('/pharmasys/payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const doMarkPaid = async () => {
    setBusy(true);
    try {
      await markPaymentPaid(id, {
        reference: markPaidRef || undefined,
        note: markPaidNote || undefined,
      });
      toast.success('Payment marked as paid');
      setMarkPaidOpen(false);
      setMarkPaidRef('');
      setMarkPaidNote('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to mark paid');
    } finally {
      setBusy(false);
    }
  };

  const doMarkFailed = async () => {
    setBusy(true);
    try {
      await markPaymentFailed(id, {
        reason: markFailedReason || undefined,
      });
      toast.success('Payment marked as failed');
      setMarkFailedOpen(false);
      setMarkFailedReason('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to mark failed');
    } finally {
      setBusy(false);
    }
  };

  const doRefund = async () => {
    setBusy(true);
    try {
      await refundPayment(id, { reason: refundReason || undefined });
      toast.success('Payment refunded');
      setRefundOpen(false);
      setRefundReason('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to refund');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!payment) return null;

  const canMarkPaid = payment.status === 'pending';
  const canMarkFailed = payment.status === 'pending';
  const canRefund = payment.status === 'success';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/pharmasys/payments')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Payment
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-mono">
            {payment.reference || payment._id}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant(payment.status)} dot>
            {statusLabel(payment.status)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Summary" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--text-secondary)]">Amount</dt>
              <dd className="text-lg font-bold text-[var(--text-primary)]">
                {formatMoneyMajor(payment.amount, payment.currency || 'KES')}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Method</dt>
              <dd className="text-[var(--text-primary)]">
                {statusLabel(payment.method)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Tenant</dt>
              <dd className="text-[var(--text-primary)]">
                {payment.tenant?.name || payment.tenantName || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Invoice</dt>
              <dd className="font-mono text-[var(--text-primary)]">
                {payment.invoiceNumber || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Created</dt>
              <dd className="text-[var(--text-primary)]">
                {payment.createdAt ? formatDateTime(payment.createdAt) : '—'}
              </dd>
            </div>
            {payment.paidAt && (
              <div>
                <dt className="text-[var(--text-secondary)]">Paid at</dt>
                <dd className="text-[var(--text-primary)]">
                  {formatDateTime(payment.paidAt)}
                </dd>
              </div>
            )}
            {payment.refundedAt && (
              <div>
                <dt className="text-[var(--text-secondary)]">Refunded at</dt>
                <dd className="text-[var(--text-primary)]">
                  {formatDateTime(payment.refundedAt)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex gap-2 flex-wrap">
            {canMarkPaid && (
              <Button
                variant="success"
                size="sm"
                icon={<HiCheckCircle className="w-4 h-4" />}
                onClick={() => setMarkPaidOpen(true)}
                disabled={busy}
              >
                Mark paid
              </Button>
            )}
            {canMarkFailed && (
              <Button
                variant="warning"
                size="sm"
                icon={<HiXCircle className="w-4 h-4" />}
                onClick={() => setMarkFailedOpen(true)}
                disabled={busy}
              >
                Mark failed
              </Button>
            )}
            {canRefund && (
              <Button
                variant="danger"
                size="sm"
                icon={<HiRefresh className="w-4 h-4" />}
                onClick={() => setRefundOpen(true)}
                disabled={busy}
              >
                Refund
              </Button>
            )}
          </div>
        </Card>

        <Card title="Attempts">
          {attempts.length > 0 ? (
            <ul className="divide-y divide-[var(--border-color)]">
              {attempts.map((a) => (
                <li key={a._id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={statusVariant(a.status)} dot>
                      {statusLabel(a.status)}
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      {relativeTime(a.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[var(--text-muted)] mt-1 truncate">
                    {a.reference || a._id}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No other attempts.
            </p>
          )}
        </Card>
      </div>

      <Modal
        open={markPaidOpen}
        onClose={() => setMarkPaidOpen(false)}
        title="Mark payment as paid"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMarkPaidOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={doMarkPaid} loading={busy}>
              Mark paid
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Reference"
            hint="M-Pesa code, bank ref, receipt"
            value={markPaidRef}
            onChange={(e) => setMarkPaidRef(e.target.value)}
          />
          <Textarea
            label="Note"
            hint="Optional"
            value={markPaidNote}
            onChange={(e) => setMarkPaidNote(e.target.value)}
            rows={2}
          />
        </div>
      </Modal>

      <Modal
        open={markFailedOpen}
        onClose={() => setMarkFailedOpen(false)}
        title="Mark payment as failed"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMarkFailedOpen(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={doMarkFailed} loading={busy}>
              Mark failed
            </Button>
          </>
        }
      >
        <Textarea
          label="Reason"
          hint="Optional, shown to admins only"
          value={markFailedReason}
          onChange={(e) => setMarkFailedReason(e.target.value)}
          rows={3}
        />
      </Modal>

      <Modal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Refund payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefundOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doRefund} loading={busy}>
              Refund
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          The tenant owner will be notified by email that the payment has been
          refunded.
        </p>
        <Textarea
          label="Reason"
          hint="Optional"
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
}
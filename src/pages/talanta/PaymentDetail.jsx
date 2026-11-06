// src/pages/talanta/PaymentDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCheckCircle, HiRefresh } from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import Modal from '../../components/talanta/ui/Modal';
import Spinner from '../../components/talanta/ui/Spinner';
import { useToast } from '../../context/talanta/ToastContext';
import { getPayment, confirmPayment } from '../../services/talanta/payments';
import {
  statusVariant,
  formatMethod,
  formatPaymentStatus,
} from '../../utils/talanta/constants';
import { formatDateTime } from '../../utils/talanta/formatDate';
import { formatMoneyMajor } from '../../utils/talanta/formatMoney';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = await getPayment(id);
      setPayment(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load payment');
      navigate('/talanta/payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const doConfirm = async () => {
    setBusy(true);
    try {
      const updated = await confirmPayment(id);
      setPayment(updated || payment);
      toast.success('Payment confirmed · QR sent to buyer');
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to confirm');
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

  const canConfirm = payment.method === 'bank' && payment.status === 'pending';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<HiArrowLeft className="w-4 h-4" />} onClick={() => navigate('/talanta/payments')}>
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment</h1>
          <p className="text-sm font-mono text-[var(--text-muted)] mt-1">
            {payment._id}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="info">{formatMethod(payment.method)}</Badge>
          <Badge variant={statusVariant(payment.status)} dot>
            {formatPaymentStatus(payment.status)}
          </Badge>
        </div>
      </div>

      <Card title="Summary">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Amount</dt>
            <dd className="text-lg font-bold text-[var(--text-primary)]">
              {formatMoneyMajor(payment.amount, payment.currency || 'KES')}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Created</dt>
            <dd className="text-[var(--text-primary)]">
              {formatDateTime(payment.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Tickets</dt>
            <dd className="text-[var(--text-primary)]">
              {payment.ticketIds?.length ?? 0}
            </dd>
          </div>
          {payment.paidAt && (
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Paid at</dt>
              <dd className="text-[var(--text-primary)]">
                {formatDateTime(payment.paidAt)}
              </dd>
            </div>
          )}
        </dl>

        {canConfirm && (
          <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
            <Button variant="success" icon={<HiCheckCircle className="w-4 h-4" />} onClick={() => setConfirmOpen(true)}>
              Confirm bank transfer
            </Button>
          </div>
        )}

        {!canConfirm && payment.method === 'bank' && (
          <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-muted)]">
              Bank transfer already confirmed or not pending.
            </p>
          </div>
        )}
      </Card>

      {payment.bank && (
        <Card title="Bank details">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Reference">{payment.bank.reference || '—'}</Row>
            <Row label="Bank">{payment.bank.instructions?.bankName || '—'}</Row>
            <Row label="Account name">{payment.bank.instructions?.accountName || '—'}</Row>
            <Row label="Account number">{payment.bank.instructions?.accountNumber || '—'}</Row>
            <Row label="Branch">{payment.bank.instructions?.branch || '—'}</Row>
          </dl>
        </Card>
      )}

      {payment.mpesa && (
        <Card title="M-Pesa details">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Checkout ID">{payment.mpesa.checkoutRequestId || '—'}</Row>
            <Row label="Receipt">{payment.mpesa.receipt || '—'}</Row>
            <Row label="Phone">{payment.mpesa.phone || '—'}</Row>
            <Row label="Result">{payment.mpesa.resultDesc || '—'}</Row>
          </dl>
        </Card>
      )}

      {payment.card && (
        <Card title="Card details">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Intent">{payment.card.intentId || '—'}</Row>
            <Row label="Last 4">{payment.card.last4 || '—'}</Row>
            <Row label="Brand">{payment.card.brand || '—'}</Row>
          </dl>
        </Card>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm bank transfer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={doConfirm} loading={busy}>
              Confirm &amp; send QR
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          This marks all tickets in this payment as <strong>paid</strong> and
          emails/SMSes the buyer their QR codes.
        </p>
      </Modal>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs shrink-0">{label}</dt>
      <dd className="text-[var(--text-primary)] text-xs text-right break-all">{children}</dd>
    </div>
  );
}
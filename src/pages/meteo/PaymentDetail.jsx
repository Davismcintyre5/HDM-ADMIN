import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiRefresh } from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Modal from '../../components/meteo/ui/Modal';
import Input from '../../components/meteo/ui/Input';
import Textarea from '../../components/meteo/ui/Textarea';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import { useAuth } from '../../context/meteo/AuthContext';
import {
  getPayment,
  refundPayment,
} from '../../services/meteo/payments';
import { formatDateTime } from '../../utils/meteo/formatDate';
import { formatMoneyMajor } from '../../utils/meteo/formatMoney';
import { statusVariant, statusLabel } from '../../utils/meteo/constants';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isSuperAdmin } = useAuth();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPayment(id);
      setPayment(res?.data || res);
    } catch (err) {
      toast.error(err.message || 'Failed to load payment');
      navigate('/meteo/payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const doRefund = async () => {
    if (!refundReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setBusy(true);
    try {
      const body = { reason: refundReason.trim() };
      if (refundAmount && !isNaN(Number(refundAmount))) {
        body.amount = Number(refundAmount);
      }
      await refundPayment(id, body);
      toast.success('Refund processed');
      setRefundOpen(false);
      setRefundAmount('');
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

  const isRefund = payment.type === 'refund';
  const canRefund = !isRefund && payment.status === 'success';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/meteo/payments')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {isRefund ? 'Refund' : 'Payment'}
          </h1>
          <p className="text-sm font-mono text-[var(--text-muted)] mt-1">
            {payment.reference || payment._id}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={isRefund ? 'info' : 'success'}>
            {statusLabel(payment.type || 'payment')}
          </Badge>
          <Badge variant={statusVariant(payment.status)} dot>
            {statusLabel(payment.status)}
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
            <dt className="text-[var(--text-secondary)] text-xs">Method</dt>
            <dd className="text-sm text-[var(--text-primary)]">
              {statusLabel(payment.method)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Tenant</dt>
            <dd className="text-sm text-[var(--text-primary)]">
              {payment.tenant?.name || payment.tenantName || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Invoice</dt>
            <dd className="text-sm font-mono text-[var(--text-primary)]">
              {payment.invoiceNumber || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Created</dt>
            <dd className="text-sm text-[var(--text-primary)]">
              {payment.createdAt ? formatDateTime(payment.createdAt) : '—'}
            </dd>
          </div>
          {payment.reason && (
            <div className="col-span-2">
              <dt className="text-[var(--text-secondary)] text-xs">Reason</dt>
              <dd className="text-sm text-[var(--text-primary)]">
                {payment.reason}
              </dd>
            </div>
          )}
        </dl>

        {canRefund && (
          <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex gap-2 flex-wrap">
            {isSuperAdmin ? (
              <Button
                variant="danger"
                size="sm"
                icon={<HiRefresh className="w-4 h-4" />}
                onClick={() => setRefundOpen(true)}
                disabled={busy}
              >
                Refund
              </Button>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Refunds require super admin access.
              </p>
            )}
          </div>
        )}
      </Card>

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
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            This will create a refund record for{' '}
            <strong>{payment.tenant?.name || 'this tenant'}</strong> and send a
            refund email.
          </p>
          <Input
            label="Refund amount (optional)"
            type="number"
            hint={`Defaults to ${formatMoneyMajor(payment.amount, payment.currency || 'KES')}`}
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder={String(payment.amount)}
          />
          <Textarea
            label="Reason *"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={3}
            placeholder="Customer requested"
          />
        </div>
      </Modal>
    </div>
  );
}
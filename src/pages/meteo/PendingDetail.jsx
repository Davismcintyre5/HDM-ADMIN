import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiCreditCard,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Modal from '../../components/meteo/ui/Modal';
import Input from '../../components/meteo/ui/Input';
import Select from '../../components/meteo/ui/Select';
import Textarea from '../../components/meteo/ui/Textarea';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import {
  getPending,
  approvePending,
  rejectPending,
  confirmPendingPayment,
} from '../../services/meteo/pending';
import { formatDate, formatDateTime } from '../../utils/meteo/formatDate';
import { formatMoneyMajor } from '../../utils/meteo/formatMoney';
import {
  PAYMENT_METHOD_CODES,
  statusVariant,
  statusLabel,
} from '../../utils/meteo/constants';

const REASONS = [
  'Incomplete business information',
  'Unable to verify business',
  'Duplicate account',
  'Suspected fraud',
  'Outside service area',
  'Other',
];

const METHOD_OPTIONS = PAYMENT_METHOD_CODES.map((m) => ({
  value: m,
  label: statusLabel(m),
}));

export default function PendingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(REASONS[0]);
  const [rejectCustom, setRejectCustom] = useState('');

  const [payOpen, setPayOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('mpesa_stk');
  const [payRef, setPayRef] = useState('');
  const [payNote, setPayNote] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPending(id);
      setData(res?.data || res);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
      navigate('/meteo/pending');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const doApprove = async () => {
    setBusy(true);
    try {
      await approvePending(id, { notes: approveNotes });
      toast.success('Tenant approved');
      setApproveOpen(false);
      navigate('/meteo/pending');
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    const finalReason =
      rejectReason === 'Other' ? rejectCustom.trim() : rejectReason;
    if (!finalReason) {
      toast.error('Reason is required');
      return;
    }
    setBusy(true);
    try {
      await rejectPending(id, { reason: finalReason });
      toast.success('Tenant rejected');
      setRejectOpen(false);
      navigate('/meteo/pending');
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setBusy(false);
    }
  };

  const doConfirmPayment = async () => {
    if (!payMethod) {
      toast.error('Payment method is required');
      return;
    }
    setBusy(true);
    try {
      await confirmPendingPayment(id, {
        method: payMethod,
        reference: payRef || undefined,
        note: payNote || undefined,
      });
      toast.success('Payment confirmed');
      setPayOpen(false);
      setPayRef('');
      setPayNote('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to confirm payment');
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

  if (!data) return null;

  const { tenant, owner, invoice } = data;
  const invoicePaid = invoice?.status === 'paid';

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/meteo/pending')}
        >
          Back to queue
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {tenant?.name || '—'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {tenant?.slug || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tenant?.status && (
            <Badge variant={statusVariant(tenant.status)} dot>
              {statusLabel(tenant.status)}
            </Badge>
          )}
          {invoice && (
            <Badge variant={invoicePaid ? 'success' : 'warning'} dot>
              {invoicePaid ? 'Payment confirmed' : 'Payment pending'}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tenant">
          <dl className="space-y-3 text-sm">
            <Row label="Name">
              <span className="font-medium">{tenant?.name || '—'}</span>
            </Row>
            <Row label="Slug">
              <span className="font-mono text-xs">
                {tenant?.slug || '—'}
              </span>
            </Row>
            <Row label="Plan">
              <span className="capitalize">
                {tenant?.planCode || '—'}
              </span>
            </Row>
            <Row label="Status">
              <Badge variant={statusVariant(tenant?.status)}>
                {statusLabel(tenant?.status)}
              </Badge>
            </Row>
            <Row label="Created">
              {tenant?.createdAt
                ? formatDate(tenant.createdAt, 'full')
                : '—'}
            </Row>
          </dl>
        </Card>

        <Card title="Owner">
          {owner ? (
            <dl className="space-y-3 text-sm">
              <Row label="Name">{owner.fullName || '—'}</Row>
              <Row label="Email">
                <span className="text-xs">{owner.email}</span>
              </Row>
              {owner.phone && <Row label="Phone">{owner.phone}</Row>}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No owner on record.
            </p>
          )}
        </Card>

        <Card title="Invoice">
          {invoice ? (
            <dl className="space-y-3 text-sm">
              <Row label="Invoice #">
                <span className="font-mono text-xs">
                  {invoice.invoiceNumber}
                </span>
              </Row>
              <Row label="Total">
                {formatMoneyMajor(invoice.total, invoice.currency || 'KES')}
              </Row>
              <Row label="Amount due">
                {formatMoneyMajor(invoice.amountDue, invoice.currency || 'KES')}
              </Row>
              <Row label="Status">
                <Badge variant={statusVariant(invoice.status)} dot>
                  {statusLabel(invoice.status)}
                </Badge>
              </Row>
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No invoice on record.
            </p>
          )}
        </Card>
      </div>

      {invoice?.paymentInstructions?.length > 0 && !invoicePaid && (
        <Card title="Payment instructions (shown to customer)">
          <div className="flex flex-wrap gap-2">
            {invoice.paymentInstructions.map((m, i) => (
              <Badge key={i} variant="info">
                {m.title || m.code}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-[var(--card-bg)] border-t border-[var(--border-color)] px-6 py-4 flex items-center justify-end gap-2 z-30">
        {invoice && !invoicePaid && (
          <Button
            variant="outline"
            icon={<HiCreditCard className="w-4 h-4" />}
            onClick={() => setPayOpen(true)}
            disabled={busy}
          >
            Confirm payment
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setRejectOpen(true)}
          icon={<HiXCircle className="w-4 h-4" />}
          disabled={busy}
        >
          Reject
        </Button>
        <Button
          onClick={() => setApproveOpen(true)}
          icon={<HiCheckCircle className="w-4 h-4" />}
          disabled={busy}
        >
          Approve
        </Button>
      </div>

      {/* Approve modal */}
      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve tenant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doApprove} loading={busy}>
              Approve
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          <strong>{tenant?.name}</strong> will be activated and the owner
          notified.
        </p>
        <Textarea
          label="Internal notes"
          hint="Optional"
          value={approveNotes}
          onChange={(e) => setApproveNotes(e.target.value)}
          rows={3}
        />
      </Modal>

      {/* Reject modal */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject tenant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doReject} loading={busy}>
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          The owner of <strong>{tenant?.name}</strong> will be emailed the
          reason.
        </p>
        <Select
          label="Reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          options={REASONS.map((r) => ({ value: r, label: r }))}
        />
        {rejectReason === 'Other' && (
          <div className="mt-4">
            <Textarea
              label="Details"
              value={rejectCustom}
              onChange={(e) => setRejectCustom(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>

      {/* Confirm payment modal */}
      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Confirm payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doConfirmPayment} loading={busy}>
              Confirm payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {invoice && (
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-secondary)]">Invoice</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-secondary)]">Amount due</span>
                <span className="font-semibold text-violet-600">
                  {formatMoneyMajor(invoice.amountDue, invoice.currency || 'KES')}
                </span>
              </div>
            </div>
          )}
          <Select
            label="Payment method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={METHOD_OPTIONS}
          />
          <Input
            label="Reference"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            placeholder="QK47ABC123"
          />
          <Textarea
            label="Internal note"
            hint="Optional"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            rows={2}
          />
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs shrink-0">{label}</dt>
      <dd className="text-[var(--text-primary)] text-right text-xs break-all">
        {children}
      </dd>
    </div>
  );
}
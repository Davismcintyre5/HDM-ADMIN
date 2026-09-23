import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiCreditCard,
} from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Modal from '../../components/smartpos/ui/Modal';
import Textarea from '../../components/smartpos/ui/Textarea';
import Select from '../../components/smartpos/ui/Select';
import Input from '../../components/smartpos/ui/Input';
import Spinner from '../../components/smartpos/ui/Spinner';
import { useToast } from '../../context/smartpos/ToastContext';
import {
  getPending,
  approvePending,
  rejectPending,
  confirmPayment,
} from '../../services/smartpos/pending';
import { formatDate, formatDateTime, relativeTime } from '../../utils/smartpos/formatDate';
import { formatMoneyMajor } from '../../utils/smartpos/formatMoney';

const REASONS = [
  'Incomplete business information',
  'Unable to verify business',
  'Duplicate account',
  'Suspected fraud',
  'Outside service area',
  'Other',
];

const PAY_METHODS = [
  { value: 'mpesa_send', label: 'M-Pesa Send Money' },
  { value: 'mpesa_till', label: 'M-Pesa Till' },
  { value: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { value: 'mpesa_stk', label: 'M-Pesa STK' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'stripe', label: 'Card (Stripe)' },
];

function methodLabel(code) {
  if (!code) return '—';
  return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PendingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const [payMethod, setPayMethod] = useState('mpesa_send');
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payBusy, setPayBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPending(id);
      const payload = res?.data || res;
      setData(payload);
      setNotes(payload?.pending?.notes || '');
    } catch (err) {
      toast.error(err.message || 'Failed to load');
      navigate('/smartpos/pending');
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
      await approvePending(id, { notes });
      toast.success('Client approved');
      setApproveOpen(false);
      navigate('/smartpos/pending');
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      toast.error('Reason is required');
      return;
    }
    setBusy(true);
    try {
      await rejectPending(id, { reason: finalReason });
      toast.success('Client rejected');
      setRejectOpen(false);
      navigate('/smartpos/pending');
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
    setPayBusy(true);
    try {
      const res = await confirmPayment(id, {
        method: payMethod,
        reference: payReference || undefined,
        note: payNote || undefined,
      });
      const payload = res?.data || res;
      toast.success(
        payload?.emailSent ? 'Payment confirmed, email sent' : 'Payment confirmed'
      );
      setPayOpen(false);
      setPayReference('');
      setPayNote('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to confirm payment');
    } finally {
      setPayBusy(false);
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

  const { pending, tenant, owner, invoice, actions = [], staff = [] } = data;
  const invoicePaid = invoice?.status === 'paid';

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/smartpos/pending')}
        >
          Back to queue
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {tenant.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {tenant.slug} · {tenant.country} · {tenant.businessType}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="warning" dot>
            {pending.status}
          </Badge>
          {invoice &&
            (invoicePaid ? (
              <Badge variant="success" dot>Payment confirmed</Badge>
            ) : (
              <Badge variant="warning" dot>Payment pending</Badge>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Business">
          <dl className="space-y-3 text-sm">
            <Row label="Name">
              <span className="font-medium">{tenant.name}</span>
            </Row>
            <Row label="Slug">
              <span className="font-mono text-xs">{tenant.slug}</span>
            </Row>
            <Row label="Country">{tenant.country}</Row>
            <Row label="Type">
              <span className="capitalize">{tenant.businessType}</span>
            </Row>
            <Row label="Plan">
              <span className="capitalize font-medium">{tenant.planId}</span>
            </Row>
            <Row label="Registered">
              {tenant.registeredAt ? formatDate(tenant.registeredAt) : '—'}
            </Row>
          </dl>
        </Card>

        <Card title="Owner">
          {owner ? (
            <dl className="space-y-3 text-sm">
              <Row label="Name">
                <span className="font-medium">{owner.fullName}</span>
              </Row>
              <Row label="Email">
                <span className="text-xs">{owner.email}</span>
              </Row>
              {owner.phone && <Row label="Phone">{owner.phone}</Row>}
              <Row label="Status">
                <Badge variant="default">{owner.status}</Badge>
              </Row>
              {owner.createdAt && (
                <Row label="Account age">{relativeTime(owner.createdAt)}</Row>
              )}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No owner on record.</p>
          )}
        </Card>

        <Card title="Approval queue">
          <dl className="space-y-3 text-sm">
            <Row label="Status">
              <Badge variant="warning">{pending.status}</Badge>
            </Row>
            <Row label="Priority">
              <span className="capitalize">{pending.priority}</span>
            </Row>
            <Row label="Registered">{formatDateTime(pending.registeredAt)}</Row>
            {pending.slaDeadline && (
              <Row label="SLA">
                <span
                  className={
                    new Date(pending.slaDeadline) < new Date() ? 'text-red-500' : ''
                  }
                >
                  {formatDateTime(pending.slaDeadline)}
                </span>
              </Row>
            )}
          </dl>
        </Card>
      </div>

      {invoice && (
        <Card title="Invoice">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                Invoice
              </p>
              <p className="text-sm font-mono font-medium text-[var(--text-primary)]">
                {invoice.invoiceNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                Total
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {formatMoneyMajor(invoice.total, invoice.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                Amount due
              </p>
              <p className="text-sm font-semibold text-blue-600">
                {formatMoneyMajor(invoice.amountDue, invoice.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                Status
              </p>
              <Badge
                variant={
                  invoice.status === 'paid'
                    ? 'success'
                    : invoice.status === 'sent'
                    ? 'info'
                    : invoice.status === 'overdue'
                    ? 'danger'
                    : 'default'
                }
              >
                {invoice.status}
              </Badge>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm border-t border-[var(--border-color)] pt-4 mt-4">
            <div>
              <dt className="text-[var(--text-secondary)]">Issued</dt>
              <dd className="text-[var(--text-primary)]">
                {formatDateTime(invoice.issuedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Due</dt>
              <dd
                className={
                  new Date(invoice.dueDate) < new Date() && !invoicePaid
                    ? 'text-red-500'
                    : 'text-[var(--text-primary)]'
                }
              >
                {formatDateTime(invoice.dueDate)}
              </dd>
            </div>
          </dl>

          {invoicePaid && (
            <dl className="grid grid-cols-2 gap-3 text-sm border-t border-[var(--border-color)] pt-4 mt-4">
              <div>
                <dt className="text-[var(--text-secondary)]">Paid at</dt>
                <dd className="text-[var(--text-primary)]">
                  {invoice.paidAt ? formatDateTime(invoice.paidAt) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Method</dt>
                <dd className="text-[var(--text-primary)]">
                  {methodLabel(invoice.paymentMethod)}
                </dd>
              </div>
              {invoice.paymentRef && (
                <div className="col-span-2">
                  <dt className="text-[var(--text-secondary)]">Reference</dt>
                  <dd className="font-mono text-[var(--text-primary)]">
                    {invoice.paymentRef}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </Card>
      )}

      {staff.length > 0 && (
        <Card title={`Staff (${staff.length})`}>
          <ul className="divide-y divide-[var(--border-color)]">
            {staff.map((s) => (
              <li key={s._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {s.fullName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{s.role}</Badge>
                  <Badge variant={s.status === 'active' ? 'success' : 'warning'} dot>
                    {s.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {actions.length > 0 && (
        <Card title={`Admin activity (${actions.length})`}>
          <ul className="divide-y divide-[var(--border-color)]">
            {actions.map((a) => (
              <li key={a._id} className="py-3 flex items-start justify-between gap-4">
                <p className="text-sm font-mono text-[var(--text-primary)]">{a.action}</p>
                <span className="text-xs text-[var(--text-muted)] shrink-0">
                  {relativeTime(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

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

      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve client"
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
          <strong>{tenant.name}</strong> will be activated and the owner notified.
        </p>
        <Textarea
          label="Internal notes"
          hint="Optional, admins only"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject client"
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
          The owner of <strong>{tenant.name}</strong> will be emailed the reason.
        </p>
        <Select
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={REASONS.map((r) => ({ value: r, label: r }))}
        />
        {reason === 'Other' && (
          <div className="mt-4">
            <Textarea
              label="Details"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Confirm payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doConfirmPayment} loading={payBusy}>
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
                <span className="font-semibold text-blue-600">
                  {formatMoneyMajor(invoice.amountDue, invoice.currency)}
                </span>
              </div>
            </div>
          )}

          <Select
            label="Payment method"
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

          <Textarea
            label="Internal note"
            hint="Optional"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            rows={2}
          />

          <p className="text-xs text-[var(--text-muted)]">
            This marks the invoice as paid and notifies the owner. The client stays
            pending until you approve.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-[var(--text-primary)] text-right">{children}</dd>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiMail,
} from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Modal from '../../components/pharmasys/ui/Modal';
import Select from '../../components/pharmasys/ui/Select';
import Input from '../../components/pharmasys/ui/Input';
import Textarea from '../../components/pharmasys/ui/Textarea';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getInvoice,
  markInvoicePaid,
  cancelInvoice,
  resendInvoice,
} from '../../services/pharmasys/invoices';
import { formatDate, formatDateTime } from '../../utils/pharmasys/formatDate';
import { formatMoneyMajor } from '../../utils/pharmasys/formatMoney';
import {
  PAYMENT_METHODS,
  statusVariant,
  statusLabel,
} from '../../utils/pharmasys/constants';

const METHOD_OPTIONS = PAYMENT_METHODS.map((m) => ({
  value: m,
  label: statusLabel(m),
}));

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('mpesa_stk');
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getInvoice(id);
      setInvoice(res?.data || res);
    } catch (err) {
      toast.error(err.message || 'Failed to load invoice');
      navigate('/pharmasys/invoices');
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
      await markInvoicePaid(id, {
        method: payMethod,
        reference: payReference || undefined,
        note: payNote || undefined,
      });
      toast.success('Invoice marked paid');
      setMarkPaidOpen(false);
      setPayReference('');
      setPayNote('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to mark paid');
    } finally {
      setBusy(false);
    }
  };

  const doCancel = async () => {
    setBusy(true);
    try {
      await cancelInvoice(id, { reason: cancelReason || undefined });
      toast.success('Invoice cancelled');
      setCancelOpen(false);
      setCancelReason('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel');
    } finally {
      setBusy(false);
    }
  };

  const doResend = async () => {
    setBusy(true);
    try {
      await resendInvoice(id);
      toast.success('Invoice email re-sent');
    } catch (err) {
      toast.error(err.message || 'Failed to resend');
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

  if (!invoice) return null;

  const canMarkPaid = invoice.status !== 'paid' && invoice.status !== 'cancelled';
  const canCancel = invoice.status !== 'paid' && invoice.status !== 'cancelled';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/pharmasys/invoices')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {invoice.invoiceNumber || 'Invoice'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {invoice.tenant?.name || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant(invoice.status)} dot>
            {statusLabel(invoice.status)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Summary" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--text-secondary)]">Total</dt>
              <dd className="text-lg font-bold text-[var(--text-primary)]">
                {formatMoneyMajor(invoice.total, invoice.currency || 'KES')}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Amount due</dt>
              <dd className="text-lg font-bold text-rose-600">
                {formatMoneyMajor(invoice.amountDue || 0, invoice.currency || 'KES')}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Issued</dt>
              <dd className="text-[var(--text-primary)]">
                {invoice.issuedAt ? formatDateTime(invoice.issuedAt) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Due</dt>
              <dd className="text-[var(--text-primary)]">
                {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
              </dd>
            </div>
            {invoice.paidAt && (
              <div>
                <dt className="text-[var(--text-secondary)]">Paid at</dt>
                <dd className="text-[var(--text-primary)]">
                  {formatDateTime(invoice.paidAt)}
                </dd>
              </div>
            )}
            {invoice.paymentMethod && (
              <div>
                <dt className="text-[var(--text-secondary)]">Method</dt>
                <dd className="text-[var(--text-primary)]">
                  {statusLabel(invoice.paymentMethod)}
                </dd>
              </div>
            )}
            {invoice.paymentRef && (
              <div className="col-span-2">
                <dt className="text-[var(--text-secondary)]">Reference</dt>
                <dd className="font-mono text-[var(--text-primary)]">
                  {invoice.paymentRef}
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
            <Button
              variant="outline"
              size="sm"
              icon={<HiMail className="w-4 h-4" />}
              onClick={doResend}
              disabled={busy}
              loading={busy}
            >
              Resend email
            </Button>
            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                icon={<HiXCircle className="w-4 h-4" />}
                onClick={() => setCancelOpen(true)}
                disabled={busy}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>

        <Card title="Tenant">
          <dl className="space-y-3 text-sm">
            <Row label="Business">{invoice.tenant?.name || '—'}</Row>
            <Row label="Owner">
              {invoice.tenant?.ownerName || invoice.owner?.fullName || '—'}
            </Row>
            <Row label="Email">
              <span className="text-xs">
                {invoice.tenant?.ownerEmail || invoice.owner?.email || '—'}
              </span>
            </Row>
          </dl>
        </Card>
      </div>

      {Array.isArray(invoice.lines) && invoice.lines.length > 0 && (
        <Card title="Line items" padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Unit</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {invoice.lines.map((line, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {line.description}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                      {line.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                      {formatMoneyMajor(line.unitPrice, invoice.currency || 'KES')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                      {formatMoneyMajor(line.total, invoice.currency || 'KES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={markPaidOpen}
        onClose={() => setMarkPaidOpen(false)}
        title="Mark invoice paid"
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
          <Select
            label="Payment method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={METHOD_OPTIONS}
          />
          <Input
            label="Reference"
            hint="M-Pesa code, bank ref, receipt number"
            value={payReference}
            onChange={(e) => setPayReference(e.target.value)}
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

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel invoice"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doCancel} loading={busy}>
              Cancel invoice
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          This will cancel the invoice. The tenant will not be able to pay it.
        </p>
        <Textarea
          label="Reason"
          hint="Optional"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={3}
        />
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
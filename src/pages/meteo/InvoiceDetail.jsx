import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiMail,
  HiRefresh,
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
  getInvoice,
  approveInvoice,
  cancelInvoice,
  markInvoicePaid,
  resendInvoice,
} from '../../services/meteo/invoices';
import { formatDate, formatDateTime } from '../../utils/meteo/formatDate';
import { formatMoneyMajor } from '../../utils/meteo/formatMoney';
import {
  PAYMENT_METHOD_CODES,
  statusVariant,
  statusLabel,
} from '../../utils/meteo/constants';

const METHOD_OPTIONS = PAYMENT_METHOD_CODES.map((m) => ({
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

  const [approveOpen, setApproveOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('bank');
  const [payRef, setPayRef] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getInvoice(id);
      setInvoice(res?.data || res);
    } catch (err) {
      toast.error(err.message || 'Failed to load invoice');
      navigate('/meteo/invoices');
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
      await approveInvoice(id);
      toast.success('Invoice approved');
      setApproveOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const doMarkPaid = async () => {
    if (!payMethod) {
      toast.error('Payment method required');
      return;
    }
    setBusy(true);
    try {
      const body = { method: payMethod, reference: payRef || undefined };
      if (payAmount && !isNaN(Number(payAmount))) {
        body.amountPaid = Number(payAmount);
      }
      await markInvoicePaid(id, body);
      toast.success('Invoice marked paid');
      setMarkPaidOpen(false);
      setPayRef('');
      setPayAmount('');
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
      toast.success('Invoice email sent');
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

  const isPaid = invoice.status === 'paid';
  const isCancelled = invoice.status === 'cancelled';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/meteo/invoices')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {invoice.tenant?.name || invoice.tenantName || '—'}
          </p>
        </div>
        <Badge variant={statusVariant(invoice.status)} dot>
          {statusLabel(invoice.status)}
        </Badge>
      </div>

      <Card title="Summary">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Total</dt>
            <dd className="text-lg font-bold text-[var(--text-primary)]">
              {formatMoneyMajor(invoice.total, invoice.currency || 'KES')}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Amount due</dt>
            <dd
              className={`text-lg font-bold ${
                (invoice.amountDue || 0) > 0
                  ? 'text-red-600'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {formatMoneyMajor(invoice.amountDue || 0, invoice.currency || 'KES')}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Issued</dt>
            <dd className="text-sm text-[var(--text-primary)]">
              {invoice.issuedAt ? formatDate(invoice.issuedAt) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)] text-xs">Due</dt>
            <dd className="text-sm text-[var(--text-primary)]">
              {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
            </dd>
          </div>
        </dl>

        <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex flex-wrap gap-2">
          {isPaid && (
            <Button
              variant="success"
              size="sm"
              icon={<HiCheckCircle className="w-4 h-4" />}
              onClick={() => setApproveOpen(true)}
              disabled={busy}
            >
              Approve & activate
            </Button>
          )}
          {!isPaid && !isCancelled && (
            <Button
              variant="outline"
              size="sm"
              icon={<HiRefresh className="w-4 h-4" />}
              onClick={() => setMarkPaidOpen(true)}
              disabled={busy}
            >
              Mark paid
            </Button>
          )}
          {!isPaid && !isCancelled && (
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
        </div>
      </Card>

      {Array.isArray(invoice.items) && invoice.items.length > 0 && (
        <Card title="Items" padding={false}>
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
                {invoice.items.map((line, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {line.name || line.description}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                      {line.qty ?? line.quantity ?? 1}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                      {formatMoneyMajor(line.unitPrice || 0, invoice.currency || 'KES')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                      {formatMoneyMajor(line.subtotal || line.total || 0, invoice.currency || 'KES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {invoice.paymentInstructions?.length > 0 && (
        <Card title="Payment instructions">
          <div className="flex flex-wrap gap-2">
            {invoice.paymentInstructions.map((m, i) => (
              <Badge key={i} variant="info">{m.title || m.code}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Approve modal */}
      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve invoice"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={doApprove} loading={busy}>
              Approve
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          This will mark the invoice <strong>paid</strong>, activate the tenant
          subscription, and send a <em>payment received</em> email.
        </p>
      </Modal>

      {/* Mark paid modal */}
      <Modal
        open={markPaidOpen}
        onClose={() => setMarkPaidOpen(false)}
        title="Mark invoice paid"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMarkPaidOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doMarkPaid} loading={busy}>
              Mark paid
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Payment method *"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={METHOD_OPTIONS}
          />
          <Input
            label="Reference"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            placeholder="REF-2026-001"
          />
          <Input
            label="Amount paid (optional)"
            type="number"
            hint={`Defaults to amount due: ${formatMoneyMajor(
              invoice.amountDue || invoice.total,
              invoice.currency || 'KES'
            )}`}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder={String(invoice.amountDue || invoice.total)}
          />
        </div>
      </Modal>

      {/* Cancel modal */}
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
          The invoice will be cancelled. The tenant won't be able to pay it.
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
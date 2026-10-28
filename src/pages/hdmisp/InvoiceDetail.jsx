import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiExternalLink } from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { getInvoice } from '../../services/hdmisp/invoices';
import { formatDate, formatDateTime } from '../../utils/hdmisp/formatDate';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';
import { statusVariant, statusLabel } from '../../utils/hdmisp/constants';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const inv = await getInvoice(id);
      setInvoice(inv);
    } catch (err) {
      toast.error(err.message || 'Failed to load invoice');
      navigate('/hdmisp/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!invoice) return null;

  const inv = invoice;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<HiArrowLeft className="w-4 h-4" />} onClick={() => navigate('/hdmisp/invoices')}>
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-mono">{inv.invoiceNumber}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Issued {inv.issuedAt ? formatDateTime(inv.issuedAt) : '—'}
          </p>
        </div>
        <Badge variant={statusVariant(inv.status)} dot>{statusLabel(inv.status)}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Summary" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Total</dt>
              <dd className="text-2xl font-bold text-[var(--text-primary)] mt-1">{formatMoneyMajor(inv.total, inv.currency || 'KES')}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Amount due</dt>
              <dd className={`text-2xl font-bold mt-1 ${(inv.amountDue || 0) > 0 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                {formatMoneyMajor(inv.amountDue ?? 0, inv.currency || 'KES')}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Due date</dt>
              <dd className="text-[var(--text-primary)] mt-1">{inv.dueDate ? formatDate(inv.dueDate) : '—'}</dd>
            </div>
            {inv.paidAt && (
              <div>
                <dt className="text-[var(--text-secondary)] text-xs">Paid at</dt>
                <dd className="text-[var(--text-primary)] mt-1">{formatDateTime(inv.paidAt)}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Customer">
          {inv.customerSnapshot ? (
            <dl className="space-y-2 text-sm">
              <Row label="Name">{inv.customerSnapshot.name}</Row>
              <Row label="Email">{inv.customerSnapshot.email}</Row>
              {inv.customerSnapshot.phone && <Row label="Phone">{inv.customerSnapshot.phone}</Row>}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No snapshot</p>
          )}
        </Card>
      </div>

      {Array.isArray(inv.items) && inv.items.length > 0 && (
        <Card title="Items" padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Unit</th>
                  <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {inv.items.map((it, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-[var(--text-primary)]">{it.name || it.description || '—'}</td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)]">{it.qty ?? it.quantity ?? 1}</td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)]">{formatMoneyMajor(it.unitPrice ?? 0, inv.currency || 'KES')}</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">{formatMoneyMajor(it.subtotal ?? it.total ?? 0, inv.currency || 'KES')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {Array.isArray(inv.paymentInstructions) && inv.paymentInstructions.length > 0 && (
        <Card title="Payment instructions">
          <div className="space-y-3">
            {inv.paymentInstructions.map((m, i) => (
              <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-3">
                <p className="font-medium text-sm text-[var(--text-primary)]">{m.title || m.code}</p>
                {m.description && <p className="text-xs text-[var(--text-muted)] mt-1">{m.description}</p>}
                {m.recipient && (
                  <div className="mt-2 space-y-0.5 text-xs">
                    {Object.entries(m.recipient).filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-[var(--text-muted)] capitalize">{k}:</span>
                        <span className="text-[var(--text-primary)] font-mono">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {inv.invoiceUrl && (
        <div className="flex justify-end">
          <a href={inv.invoiceUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" icon={<HiExternalLink className="w-4 h-4" />}>View full invoice</Button>
          </a>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs shrink-0">{label}</dt>
      <dd className="text-[var(--text-primary)] text-right text-xs break-all">{children}</dd>
    </div>
  );
}
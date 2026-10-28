import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiClipboardCopy, HiCheck } from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { getTransaction } from '../../services/hdmisp/billing';
import { formatDateTime } from '../../utils/hdmisp/formatDate';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';
import { statusVariant, statusLabel } from '../../utils/hdmisp/constants';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const t = await getTransaction(id);
      setTxn(t);
    } catch (err) {
      toast.error(err.message || 'Failed to load transaction');
      navigate('/hdmisp/transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copy = async (field, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!txn) return null;

  const t = txn;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<HiArrowLeft className="w-4 h-4" />} onClick={() => navigate('/hdmisp/transactions')}>
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-mono">
            {t.checkoutRequestId || t._id?.slice(-8)}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.phone}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant(t.status)} dot>{statusLabel(t.status)}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Summary" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Amount</dt>
              <dd className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {formatMoneyMajor(t.amount, t.currency || 'KES')}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Status</dt>
              <dd className="mt-1"><Badge variant={statusVariant(t.status)} dot>{statusLabel(t.status)}</Badge></dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Phone</dt>
              <dd className="text-[var(--text-primary)] font-mono mt-1">{t.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">M-Pesa receipt</dt>
              <dd className="text-[var(--text-primary)] font-mono mt-1 flex items-center gap-2">
                {t.mpesaReceiptNumber || '—'}
                {t.mpesaReceiptNumber && (
                  <button onClick={() => copy('receipt', t.mpesaReceiptNumber)} className="text-[var(--text-muted)] hover:text-cyan-600">
                    {copiedField === 'receipt' ? <HiCheck className="w-3.5 h-3.5" /> : <HiClipboardCopy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[var(--text-secondary)] text-xs">Checkout request ID</dt>
              <dd className="text-[var(--text-primary)] font-mono text-xs break-all mt-1 flex items-center gap-2">
                {t.checkoutRequestId || '—'}
                {t.checkoutRequestId && (
                  <button onClick={() => copy('checkout', t.checkoutRequestId)} className="text-[var(--text-muted)] hover:text-cyan-600">
                    {copiedField === 'checkout' ? <HiCheck className="w-3.5 h-3.5" /> : <HiClipboardCopy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Created</dt>
              <dd className="text-[var(--text-primary)] mt-1">{t.createdAt ? formatDateTime(t.createdAt) : '—'}</dd>
            </div>
            {t.providerId && (
              <div>
                <dt className="text-[var(--text-secondary)] text-xs">Provider</dt>
                <dd className="text-[var(--text-primary)] font-mono text-xs mt-1">
                  {typeof t.providerId === 'object' ? (t.providerId.name || t.providerId._id) : t.providerId}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Raw callback">
          {t.rawCallback ? (
            <pre className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap break-all">
              {JSON.stringify(t.rawCallback, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No callback data on record.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
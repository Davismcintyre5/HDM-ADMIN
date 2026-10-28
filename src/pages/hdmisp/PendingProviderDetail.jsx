import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft, HiCheck, HiX, HiTrash, HiClock,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Modal from '../../components/hdmisp/ui/Modal';
import ConfirmDialog from '../../components/hdmisp/ui/ConfirmDialog';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import {
  getPendingProvider,
  approvePendingProvider,
  rejectPendingProvider,
  deletePendingProvider,
} from '../../services/hdmisp/providers';
import { formatDate, formatDateTime, relativeTime } from '../../utils/hdmisp/formatDate';
import { statusVariant, statusLabel } from '../../utils/hdmisp/constants';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';

const REASONS = [
  'Incomplete business documentation',
  'Unable to verify business',
  'Duplicate application',
  'Suspected fraud',
  'Policy violation',
  'Other',
];

export default function PendingProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isSuperadmin } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(REASONS[0]);
  const [rejectCustom, setRejectCustom] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = await getPendingProvider(id);
      setData(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load pending provider');
      navigate('/hdmisp/pending');
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
      await approvePendingProvider(id);
      toast.success('Provider approved');
      setApproveOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    const finalReason = rejectReason === 'Other' ? rejectCustom.trim() : rejectReason;
    if (!finalReason) {
      toast.error('Reason is required');
      return;
    }
    setBusy(true);
    try {
      await rejectPendingProvider(id, finalReason);
      toast.success('Provider rejected');
      setRejectOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deletePendingProvider(id);
      toast.success('Pending record deleted');
      navigate('/hdmisp/pending');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
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

  const p = data;
  const canAct = isSuperadmin && p.status !== 'approved';

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/hdmisp/pending')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {p.name || 'Pending Provider'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{p.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant(p.status)} dot>
            {statusLabel(p.status)}
          </Badge>
          {p.expiresAt && (
            <Badge variant={new Date(p.expiresAt) < new Date() ? 'danger' : 'default'}>
              Expires {relativeTime(p.expiresAt)}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Applicant">
          <dl className="space-y-3 text-sm">
            <Row label="Name">
              <span className="font-medium">{p.name || '—'}</span>
            </Row>
            <Row label="Email">{p.email || '—'}</Row>
            <Row label="Phone">{p.phone || '—'}</Row>
            <Row label="Status">
              <Badge variant={statusVariant(p.status)} dot>
                {statusLabel(p.status)}
              </Badge>
            </Row>
            <Row label="Registered">
              {p.createdAt ? formatDateTime(p.createdAt) : '—'}
            </Row>
            <Row label="Expires">
              {p.expiresAt ? formatDate(p.expiresAt) : '—'}
            </Row>
            {p.rejectionReason && (
              <Row label="Rejection reason">
                <span className="text-red-600 dark:text-red-400">
                  {p.rejectionReason}
                </span>
              </Row>
            )}
          </dl>
        </Card>

        <Card title="Billing plan">
          {p.billingPlanId && typeof p.billingPlanId === 'object' ? (
            <dl className="space-y-3 text-sm">
              <Row label="Plan">
                <span className="font-medium">{p.billingPlanId.name || '—'}</span>
              </Row>
              <Row label="Price">
                {formatMoneyMajor(p.billingPlanId.price ?? 0, p.billingPlanId.currency || 'KES')}
              </Row>
              <Row label="Cycle">{p.billingPlanId.billingCycle || '—'}</Row>
              <Row label="Max routers">{p.billingPlanId.maxRouters ?? '—'}</Row>
              <Row label="Max customers">{p.billingPlanId.maxCustomers ?? '—'}</Row>
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No plan selected</p>
          )}
        </Card>

        <Card title="Invoice / payment">
          {p.invoiceId || p.transactionId ? (
            <dl className="space-y-3 text-sm">
              {p.invoiceId && (
                <>
                  <Row label="Invoice #">
                    <span className="font-mono text-xs">
                      {p.invoiceId.invoiceNumber || p.invoiceId}
                    </span>
                  </Row>
                  <Row label="Amount due">
                    {formatMoneyMajor(p.invoiceId.amountDue ?? 0, p.invoiceId.currency || 'KES')}
                  </Row>
                  <Row label="Status">
                    <Badge variant={p.invoiceId.status === 'paid' ? 'success' : 'warning'}>
                      {p.invoiceId.status || '—'}
                    </Badge>
                  </Row>
                </>
              )}
              {p.transactionId && (
                <Row label="Txn status">
                  <Badge variant={p.transactionId.status === 'completed' ? 'success' : 'warning'}>
                    {p.transactionId.status || '—'}
                  </Badge>
                </Row>
              )}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No invoice on file</p>
          )}
        </Card>
      </div>

      {canAct && (
        <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-[var(--card-bg)] border-t border-[var(--border-color)] px-6 py-4 flex items-center justify-end gap-2 z-30">
          {isSuperadmin && (
            <Button
              variant="danger"
              icon={<HiTrash className="w-4 h-4" />}
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
            >
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            icon={<HiX className="w-4 h-4" />}
            onClick={() => setRejectOpen(true)}
            disabled={busy}
          >
            Reject
          </Button>
          <Button
            icon={<HiCheck className="w-4 h-4" />}
            onClick={() => setApproveOpen(true)}
            disabled={busy}
          >
            Approve
          </Button>
        </div>
      )}

      {!canAct && p.status === 'approved' && (
        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
          <HiCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Already approved</p>
            <p className="text-xs mt-1 opacity-90">
              This provider has an active account. Manage them from the Providers page.
            </p>
          </div>
        </div>
      )}

      {/* Approve */}
      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve provider"
        size="sm"
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
          This will create a provider account for <strong>{p.name}</strong> and
          send the welcome email + SMS to <strong>{p.email}</strong>.
        </p>
      </Modal>

      {/* Reject */}
      <Modal
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectReason(REASONS[0]);
          setRejectCustom('');
        }}
        title="Reject provider"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectOpen(false);
                setRejectReason(REASONS[0]);
                setRejectCustom('');
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={doReject} loading={busy}>
              Reject
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            The applicant will be emailed the reason.
          </p>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Reason
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {rejectReason === 'Other' && (
            <textarea
              value={rejectCustom}
              onChange={(e) => setRejectCustom(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm resize-y"
              placeholder="Explain the rejection…"
            />
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        title="Delete pending record"
        message={`Permanently delete the pending application for "${p.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busy}
      />
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
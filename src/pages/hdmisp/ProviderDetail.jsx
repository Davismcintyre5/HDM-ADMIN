import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft, HiBan, HiCheck, HiTrash, HiRefresh, HiUser, HiPencil,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Select from '../../components/hdmisp/ui/Select';
import Modal from '../../components/hdmisp/ui/Modal';
import ConfirmDialog from '../../components/hdmisp/ui/ConfirmDialog';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import {
  getProvider,
  updateProvider,
  suspendProvider,
  activateProvider,
  approveProviderSubscription,
  deleteProvider,
} from '../../services/hdmisp/providers';
import { getBillingPlans } from '../../services/hdmisp/billingPlans';
import { formatDate, formatDateTime } from '../../utils/hdmisp/formatDate';
import { statusVariant, statusLabel, PROVIDER_STATUS_LIST } from '../../utils/hdmisp/constants';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isSuperadmin } = useAuth();

  const [provider, setProvider] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', billingPlanId: '', status: '' });

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = await getProvider(id);
      setProvider(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load provider');
      navigate('/hdmisp/providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    getBillingPlans().then(setPlans).catch(() => {});
  }, []);

  const openEdit = () => {
    setEditForm({
      name: provider.name || '',
      phone: provider.phone || '',
      billingPlanId:
        typeof provider.billingPlanId === 'object' && provider.billingPlanId
          ? provider.billingPlanId._id
          : provider.billingPlanId || '',
      status: provider.status || 'active',
    });
    setEditOpen(true);
  };

  const doUpdate = async () => {
    setBusy(true);
    try {
      await updateProvider(id, editForm);
      toast.success('Provider updated');
      setEditOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  };

  const doSuspend = async () => {
    setBusy(true);
    try {
      await suspendProvider(id, suspendReason);
      toast.success('Provider suspended');
      setSuspendOpen(false);
      setSuspendReason('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to suspend');
    } finally {
      setBusy(false);
    }
  };

  const doActivate = async () => {
    setBusy(true);
    try {
      await activateProvider(id);
      toast.success('Provider activated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to activate');
    } finally {
      setBusy(false);
    }
  };

  const doApproveSub = async () => {
    setBusy(true);
    try {
      await approveProviderSubscription(id);
      toast.success('Subscription approved');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteProvider(id);
      toast.success('Provider deleted');
      navigate('/hdmisp/providers');
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

  if (!provider) return null;

  const p = provider;
  const plan = typeof p.billingPlanId === 'object' && p.billingPlanId ? p.billingPlanId : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/hdmisp/providers')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {p.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{p.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant(p.status)} dot>
            {statusLabel(p.status)}
          </Badge>
          <Button size="sm" variant="secondary" onClick={openEdit} icon={<HiPencil className="w-4 h-4" />}>
            Edit
          </Button>
          {p.status === 'active' && (
            <Button
              size="sm"
              variant="warning"
              onClick={() => setSuspendOpen(true)}
              icon={<HiBan className="w-4 h-4" />}
            >
              Suspend
            </Button>
          )}
          {p.status !== 'active' && (
            <Button
              size="sm"
              variant="success"
              onClick={doActivate}
              loading={busy}
              icon={<HiCheck className="w-4 h-4" />}
            >
              Activate
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={doApproveSub}
            loading={busy}
            icon={<HiRefresh className="w-4 h-4" />}
          >
            Approve subscription
          </Button>
          {isSuperadmin && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setConfirmDelete(true)}
              icon={<HiTrash className="w-4 h-4" />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Provider">
          <dl className="space-y-3 text-sm">
            <Row label="Name">{p.name || '—'}</Row>
            <Row label="Email">{p.email || '—'}</Row>
            <Row label="Phone">{p.phone || '—'}</Row>
            <Row label="Status">
              <Badge variant={statusVariant(p.status)} dot>
                {statusLabel(p.status)}
              </Badge>
            </Row>
            <Row label="Billing status">{statusLabel(p.billingStatus) || '—'}</Row>
            <Row label="Created">
              {p.createdAt ? formatDateTime(p.createdAt) : '—'}
            </Row>
            {p.logoUrl && (
              <Row label="Logo">
                <a href={p.logoUrl} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline text-xs">
                  View
                </a>
              </Row>
            )}
          </dl>
        </Card>

        <Card title="Subscription">
          <dl className="space-y-3 text-sm">
            <Row label="Plan">
              <span className="font-medium">{plan?.name || '—'}</span>
            </Row>
            {plan && (
              <>
                <Row label="Price">
                  {formatMoneyMajor(plan.price ?? 0, plan.currency || 'KES')}
                </Row>
                <Row label="Cycle">{plan.billingCycle || '—'}</Row>
                <Row label="Max routers">{plan.maxRouters ?? '—'}</Row>
                <Row label="Max customers">{plan.maxCustomers ?? '—'}</Row>
              </>
            )}
            <Row label="Ends">
              {p.subscriptionEndsAt ? formatDate(p.subscriptionEndsAt) : '—'}
            </Row>
          </dl>
        </Card>

        <Card title="Login account">
          {p.userId && typeof p.userId === 'object' ? (
            <dl className="space-y-3 text-sm">
              <Row label="Name">{p.userId.name || '—'}</Row>
              <Row label="Email">{p.userId.email || '—'}</Row>
              <Row label="Status">
                <Badge variant={statusVariant(p.userId.status)} dot>
                  {statusLabel(p.userId.status)}
                </Badge>
              </Row>
              {p.userId.lastLoginAt && (
                <Row label="Last login">{formatDateTime(p.userId.lastLoginAt)}</Row>
              )}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              <HiUser className="w-4 h-4 inline mr-1" />
              No login account attached
            </p>
          )}
        </Card>
      </div>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit provider"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doUpdate} loading={busy}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Phone"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <Select
            label="Billing plan"
            value={editForm.billingPlanId}
            onChange={(e) => setEditForm({ ...editForm, billingPlanId: e.target.value })}
            options={[
              { value: '', label: 'No plan' },
              ...plans.map((pl) => ({ value: pl._id, label: pl.name })),
            ]}
          />
          <Select
            label="Status"
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            options={PROVIDER_STATUS_LIST.map((s) => ({ value: s, label: statusLabel(s) }))}
          />
        </div>
      </Modal>

      {/* Suspend modal */}
      <Modal
        open={suspendOpen}
        onClose={() => {
          setSuspendOpen(false);
          setSuspendReason('');
        }}
        title={`Suspend ${p.name}`}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setSuspendOpen(false);
                setSuspendReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={doSuspend} loading={busy}>
              Suspend
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            The provider loses portal access immediately.
          </p>
          <Input
            label="Reason"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="e.g. Non-payment"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        title="Delete provider"
        message={`Permanently delete "${p.name}" and their login account? This cannot be undone.`}
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
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiBan, HiCheckCircle, HiTrash, HiUser } from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';
import Modal from '../../components/smartpos/ui/Modal';
import Input from '../../components/smartpos/ui/Input';
import Textarea from '../../components/smartpos/ui/Textarea';
import StatCard from '../../components/smartpos/ui/StatCard';
import { useToast } from '../../context/smartpos/ToastContext';
import {
  getClient,
  suspendClient,
  reactivateClient,
  deleteClient,
  impersonateClient,
} from '../../services/smartpos/clients';
import { formatDate, formatDateTime, relativeTime } from '../../utils/smartpos/formatDate';
import { formatMoneyMajor } from '../../utils/smartpos/formatMoney';
import { statusVariant } from '../../utils/smartpos/constants';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getClient(id);
      setData(res?.data || res);
    } catch (err) {
      toast.error(err.message || 'Failed to load client');
      navigate('/smartpos/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const doSuspend = async () => {
    setBusy(true);
    try {
      await suspendClient(id, { reason: suspendReason });
      toast.success('Client suspended');
      setSuspendOpen(false);
      setSuspendReason('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to suspend');
    } finally {
      setBusy(false);
    }
  };

  const doReactivate = async () => {
    setBusy(true);
    try {
      await reactivateClient(id);
      toast.success('Client reactivated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to reactivate');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteClient(id);
      toast.success('Client deleted');
      navigate('/smartpos/clients');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const doImpersonate = async () => {
    setBusy(true);
    try {
      const res = await impersonateClient(id);
      const payload = res?.data || res;
      if (payload?.accessToken) {
        localStorage.setItem('smartpos_impersonate_token', payload.accessToken);
      }
      toast.info('Impersonation token ready');
    } catch (err) {
      toast.error(err.message || 'Failed to impersonate');
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

  if (!data?.tenant) return null;

  const { tenant, owner, pending, counts, staffByRole, salesSummary, lastSale, invoices } =
    data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/smartpos/clients')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {tenant.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {tenant.slug} · {tenant.country}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<HiUser className="w-4 h-4" />}
            onClick={doImpersonate}
            disabled={busy}
          >
            Impersonate
          </Button>
          {tenant.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              icon={<HiBan className="w-4 h-4" />}
              onClick={() => setSuspendOpen(true)}
              disabled={busy}
            >
              Suspend
            </Button>
          )}
          {(tenant.status === 'suspended' || tenant.status === 'rejected') && (
            <Button
              variant="outline"
              size="sm"
              icon={<HiCheckCircle className="w-4 h-4" />}
              onClick={doReactivate}
              disabled={busy}
            >
              Reactivate
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            icon={<HiTrash className="w-4 h-4" />}
            onClick={() => {
              setConfirmName('');
              setDeleteOpen(true);
            }}
            disabled={busy}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Products" value={(counts?.products ?? 0).toLocaleString()} />
        <StatCard label="Customers" value={(counts?.customers ?? 0).toLocaleString()} />
        <StatCard
          label="Sales"
          value={(counts?.sales ?? 0).toLocaleString()}
          hint={lastSale ? `Last: ${relativeTime(lastSale.createdAt)}` : 'No sales yet'}
        />
        <StatCard
          label="Staff"
          value={(counts?.staff ?? 0).toLocaleString()}
          hint={
            staffByRole
              ? `${staffByRole.owners}o · ${staffByRole.managers}m · ${staffByRole.cashiers}c`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Sales total"
          value={
            salesSummary
              ? formatMoneyMajor(salesSummary.total, salesSummary.currency)
              : '—'
          }
          hint={`${salesSummary?.count ?? 0} transactions`}
        />
        <StatCard
          label="Invoices"
          value={(invoices?.total ?? 0).toLocaleString()}
          hint={`${invoices?.paid ?? 0} paid`}
        />
        <StatCard
          label="Last sale"
          value={
            lastSale ? formatMoneyMajor(lastSale.total, lastSale.currency) : '—'
          }
          hint={lastSale?.saleNumber || 'No sales yet'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Business">
          <dl className="space-y-3 text-sm">
            <Row label="Status">
              <Badge variant={statusVariant(tenant.status)} dot>
                {(tenant.status || '').replace(/_/g, ' ')}
              </Badge>
            </Row>
            <Row label="Type">
              <span className="capitalize">{tenant.businessType}</span>
            </Row>
            <Row label="Country">{tenant.country}</Row>
            <Row label="Plan">
              <span className="capitalize">{tenant.planId}</span>
            </Row>
            <Row label="Registered">
              {tenant.registeredAt ? formatDate(tenant.registeredAt) : '—'}
            </Row>
            {tenant.approvedAt && (
              <Row label="Approved">{formatDate(tenant.approvedAt)}</Row>
            )}
            {tenant.rejectionReason && (
              <Row label="Rejection reason">{tenant.rejectionReason}</Row>
            )}
            {tenant.suspendedReason && (
              <Row label="Suspension reason">{tenant.suspendedReason}</Row>
            )}
          </dl>
        </Card>

        <Card title="Owner">
          {owner ? (
            <dl className="space-y-3 text-sm">
              <Row label="Name">{owner.fullName}</Row>
              <Row label="Email">{owner.email}</Row>
              {owner.phone && <Row label="Phone">{owner.phone}</Row>}
              <Row label="Status">
                <Badge variant="default">{owner.status}</Badge>
              </Row>
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No owner on record.</p>
          )}
        </Card>

        <Card title="Pending activation">
          {pending ? (
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                <Badge variant="warning">{pending.status}</Badge>
              </Row>
              <Row label="Priority">{pending.priority}</Row>
              <Row label="Registered">{formatDateTime(pending.registeredAt)}</Row>
              {pending.slaDeadline && (
                <Row label="SLA">{formatDateTime(pending.slaDeadline)}</Row>
              )}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No pending record.</p>
          )}
        </Card>
      </div>

      <Modal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title="Suspend client"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doSuspend} loading={busy}>
              Suspend
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          The client will lose access until reactivated.
        </p>
        <Textarea
          label="Reason"
          hint="Optional, shown to admins only"
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          rows={3}
        />
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete client permanently"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={doDelete}
              disabled={confirmName !== tenant.name}
              loading={busy}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="font-medium mb-1">This cannot be undone.</p>
            <p>
              Permanently deletes <strong>{tenant.name}</strong> and all related data:
              users, products, sales, payments, customers, invoices, and audit logs.
            </p>
          </div>
          <Input
            label="Type the business name to confirm"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={tenant.name}
          />
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
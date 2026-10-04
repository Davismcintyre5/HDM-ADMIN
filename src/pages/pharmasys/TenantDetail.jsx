import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiBan,
  HiCheckCircle,
  HiTrash,
  HiUser,
  HiUserGroup,
} from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Modal from '../../components/pharmasys/ui/Modal';
import Input from '../../components/pharmasys/ui/Input';
import Textarea from '../../components/pharmasys/ui/Textarea';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getTenant,
  getTenantStats,
  suspendTenant,
  reactivateTenant,
  impersonateTenant,
  deleteTenant,
} from '../../services/pharmasys/tenants';
import {
  formatDate,
  formatDateTime,
  relativeTime,
} from '../../utils/pharmasys/formatDate';
import { formatMoneyMajor } from '../../utils/pharmasys/formatMoney';
import { statusVariant, statusLabel } from '../../utils/pharmasys/constants';

export default function TenantDetail() {
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
  const [deleteHard, setDeleteHard] = useState(false);
  const [deleteStats, setDeleteStats] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTenant(id);
      setData(res?.data || res);
    } catch (err) {
      toast.error(err.message || 'Failed to load tenant');
      navigate('/pharmasys/tenants');
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
      await suspendTenant(id, { reason: suspendReason });
      toast.success('Tenant suspended');
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
      await reactivateTenant(id);
      toast.success('Tenant reactivated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to reactivate');
    } finally {
      setBusy(false);
    }
  };

  const doImpersonate = async () => {
    setBusy(true);
    try {
      const res = await impersonateTenant(id);
      const payload = res?.data || res;
      const token = payload?.accessToken;
      if (!token) {
        toast.error('No impersonation token returned');
        return;
      }
      const baseUrl =
        import.meta.env.VITE_PHARMASYS_APP_URL || 'http://localhost:3000';
      const url = `${baseUrl}/?imp=${encodeURIComponent(token)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success('Impersonation link opened');
    } catch (err) {
      toast.error(err.message || 'Failed to impersonate');
    } finally {
      setBusy(false);
    }
  };

  const openDeleteModal = async () => {
    setConfirmName('');
    setDeleteHard(false);
    setDeleteOpen(true);
    setDeleteStats(null);
    try {
      const res = await getTenantStats(id);
      setDeleteStats(res?.data?.stats || res?.stats || null);
    } catch {
      /* stats are optional */
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteTenant(id, { hard: deleteHard });
      toast.success(deleteHard ? 'Tenant permanently deleted' : 'Tenant deleted');
      navigate('/pharmasys/tenants');
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
          onClick={() => navigate('/pharmasys/tenants')}
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
            {tenant.slug || tenant._id?.slice(-8)} · {tenant.country}
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
          {tenant.status === 'suspended' && (
            <Button
              variant="success"
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
            onClick={openDeleteModal}
            disabled={busy}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          label="Drugs"
          value={(counts?.drugs ?? 0).toLocaleString()}
        />
        <MiniStat
          label="Customers"
          value={(counts?.customers ?? 0).toLocaleString()}
        />
        <MiniStat
          label="Sales"
          value={(counts?.sales ?? 0).toLocaleString()}
          hint={
            lastSale ? `Last: ${relativeTime(lastSale.createdAt)}` : 'No sales yet'
          }
        />
        <MiniStat
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
        <MiniStat
          label="Sales total"
          value={
            salesSummary
              ? formatMoneyMajor(salesSummary.total, salesSummary.currency)
              : '—'
          }
          hint={`${salesSummary?.count ?? 0} transactions`}
        />
        <MiniStat
          label="Invoices"
          value={(invoices?.total ?? 0).toLocaleString()}
          hint={`${invoices?.paid ?? 0} paid`}
        />
        <MiniStat
          label="Last sale"
          value={
            lastSale
              ? formatMoneyMajor(lastSale.grandTotal, lastSale.currency)
              : '—'
          }
          hint={lastSale?.invoiceNo || 'No sales yet'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Business">
          <dl className="space-y-3 text-sm">
            <Row label="Status">
              <Badge variant={statusVariant(tenant.status)} dot>
                {statusLabel(tenant.status)}
              </Badge>
            </Row>
            <Row label="Country">{tenant.country || '—'}</Row>
            <Row label="Plan">
              <span className="capitalize">
                {tenant.planCode || tenant.planId || '—'}
              </span>
            </Row>
            <Row label="Registered">
              {tenant.registeredAt ? formatDate(tenant.registeredAt) : '—'}
            </Row>
            {tenant.approvedAt && (
              <Row label="Approved">{formatDate(tenant.approvedAt)}</Row>
            )}
            {tenant.suspendedReason && (
              <Row label="Suspension reason">{tenant.suspendedReason}</Row>
            )}
            {tenant.rejectionReason && (
              <Row label="Rejection reason">{tenant.rejectionReason}</Row>
            )}
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
              {owner.status && (
                <Row label="Status">
                  <Badge variant="default">{owner.status}</Badge>
                </Row>
              )}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No owner on record.
            </p>
          )}
        </Card>

        <Card title="Pending activation">
          {pending ? (
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                <Badge variant="warning">{pending.status}</Badge>
              </Row>
              {pending.priority && (
                <Row label="Priority">
                  <span className="capitalize">{pending.priority}</span>
                </Row>
              )}
              {pending.registeredAt && (
                <Row label="Registered">
                  {formatDateTime(pending.registeredAt)}
                </Row>
              )}
              {pending.slaDeadline && (
                <Row label="SLA">{formatDateTime(pending.slaDeadline)}</Row>
              )}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No pending record.
            </p>
          )}
        </Card>
      </div>

      <Modal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title="Suspend tenant"
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
          All users under <strong>{tenant.name}</strong> will be suspended and
          the owner will be notified.
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
        title={deleteHard ? 'Permanently delete tenant' : 'Delete tenant'}
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
              {deleteHard ? 'Delete permanently' : 'Delete'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            {deleteHard ? (
              <>
                <p className="font-medium mb-1">This cannot be undone.</p>
                <p>
                  Permanently deletes <strong>{tenant.name}</strong> and all
                  related data.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium mb-1">Soft delete</p>
                <p>
                  The tenant is marked as deleted and all users are suspended.
                  Data is preserved.
                </p>
              </>
            )}
          </div>

          {deleteHard && deleteStats && (
            <div className="text-xs bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="font-medium text-[var(--text-primary)] mb-2">
                Will destroy:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(deleteStats)
                  .filter(([, v]) => typeof v === 'number' && v > 0)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[var(--text-muted)] capitalize">
                        {k}
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {v.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteHard}
              onChange={(e) => setDeleteHard(e.target.checked)}
              className="w-4 h-4 accent-red-600"
            />
            <span className="text-sm text-[var(--text-primary)]">
              Permanently delete (cannot be undone)
            </span>
          </label>

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

function MiniStat({ label, value, hint }) {
  return (
    <Card>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-lg font-semibold text-[var(--text-primary)] mt-1 truncate">
        {value}
      </p>
      {hint && <p className="text-xs text-[var(--text-muted)] mt-0.5">{hint}</p>}
    </Card>
  );
}
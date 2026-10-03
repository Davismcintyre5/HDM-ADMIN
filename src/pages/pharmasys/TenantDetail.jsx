import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiBan,
  HiCheckCircle,
  HiUser,
  HiOfficeBuilding,
  HiUserGroup,
} from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Modal from '../../components/pharmasys/ui/Modal';
import Textarea from '../../components/pharmasys/ui/Textarea';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getTenant,
  suspendTenant,
  reactivateTenant,
  impersonateTenant,
} from '../../services/pharmasys/tenants';
import {
  formatDate,
  formatDateTime,
  relativeTime,
} from '../../utils/pharmasys/formatDate';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data?.tenant) return null;

  const { tenant, owner, branches = [], counts } = data;

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
          {(tenant.status === 'suspended' || tenant.status === 'rejected') && (
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
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          icon={HiOfficeBuilding}
          label="Branches"
          value={counts?.branches ?? branches.length ?? 0}
        />
        <MiniStat
          icon={HiUserGroup}
          label="Staff"
          value={counts?.staff ?? 0}
        />
        <MiniStat
          icon={HiOfficeBuilding}
          label="Plan"
          value={tenant.planCode || tenant.planId || '—'}
        />
        <MiniStat
          icon={HiCheckCircle}
          label="Status"
          value={statusLabel(tenant.status)}
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
              {owner.lastLoginAt && (
                <Row label="Last login">{relativeTime(owner.lastLoginAt)}</Row>
              )}
            </dl>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No owner on record.
            </p>
          )}
        </Card>

        <Card title="Branches">
          {branches.length > 0 ? (
            <ul className="divide-y divide-[var(--border-color)]">
              {branches.map((b, i) => (
                <li
                  key={b._id || b.code || i}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {b.name}
                    </p>
                    {b.code && (
                      <p className="text-xs text-[var(--text-muted)] font-mono">
                        {b.code}
                      </p>
                    )}
                  </div>
                  <Badge variant={b.isActive ? 'success' : 'default'} dot>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No branches yet.</p>
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

function MiniStat({ icon: Icon, label, value }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center">
          <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
          <p className="text-lg font-semibold text-[var(--text-primary)] capitalize truncate">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
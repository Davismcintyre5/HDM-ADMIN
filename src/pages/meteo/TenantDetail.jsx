import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiBan,
  HiCheckCircle,
  HiTrash,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Spinner from '../../components/meteo/ui/Spinner';
import Modal from '../../components/meteo/ui/Modal';
import Input from '../../components/meteo/ui/Input';
import { useToast } from '../../context/meteo/ToastContext';
import {
  getTenant,
  suspendTenant,
  reactivateTenant,
  deleteTenant,
} from '../../services/meteo/tenants';
import { formatDate } from '../../utils/meteo/formatDate';
import { statusVariant, statusLabel } from '../../utils/meteo/constants';

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTenant(id);
      setData(res?.data || res);
    } catch (err) {
      toast.error(err.message || 'Failed to load tenant');
      navigate('/meteo/tenants');
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
      await suspendTenant(id);
      toast.success('Tenant suspended');
      setConfirmSuspend(false);
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

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteTenant(id);
      toast.success('Tenant deleted');
      navigate('/meteo/tenants');
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

  const { tenant, users = [] } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/meteo/tenants')}
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
            {tenant.slug || tenant._id?.slice(-8)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tenant.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              icon={<HiBan className="w-4 h-4" />}
              onClick={() => setConfirmSuspend(true)}
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
            onClick={() => {
              setConfirmName('');
              setConfirmDelete(true);
            }}
            disabled={busy}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tenant">
          <dl className="space-y-3 text-sm">
            <Row label="Status">
              <Badge variant={statusVariant(tenant.status)} dot>
                {statusLabel(tenant.status)}
              </Badge>
            </Row>
            <Row label="Plan">
              <span className="capitalize">{tenant.planCode || '—'}</span>
            </Row>
            <Row label="Billing interval">
              <span className="capitalize">
                {tenant.billingInterval || '—'}
              </span>
            </Row>
            <Row label="Subscription">
              <span className="capitalize">
                {tenant.subscriptionStatus || '—'}
              </span>
            </Row>
            <Row label="Period start">
              {tenant.currentPeriodStart
                ? formatDate(tenant.currentPeriodStart)
                : '—'}
            </Row>
            <Row label="Period end">
              {tenant.currentPeriodEnd
                ? formatDate(tenant.currentPeriodEnd)
                : '—'}
            </Row>
            <Row label="Created">
              {tenant.createdAt ? formatDate(tenant.createdAt, 'full') : '—'}
            </Row>
          </dl>
        </Card>

        <Card title={`Users (${users.length})`} className="lg:col-span-2">
          {users.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-6 text-center">
              No users on this tenant.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {users.map((u) => (
                <li
                  key={u._id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {u.fullName || u.email}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {u.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="default">{u.role}</Badge>
                    <Badge variant={statusVariant(u.status)} dot>
                      {statusLabel(u.status)}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal
        open={confirmSuspend}
        onClose={() => setConfirmSuspend(false)}
        title="Suspend tenant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSuspend(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doSuspend} loading={busy}>
              Suspend
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Suspend <strong>{tenant.name}</strong>? Users will lose access until
          reactivated.
        </p>
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete tenant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
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
        <div className="space-y-3">
          <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="font-medium mb-1">This cannot be undone.</p>
            <p>
              Deletes <strong>{tenant.name}</strong> and{' '}
              {users.length} user(s).
            </p>
          </div>
          <Input
            label="Type the tenant name to confirm"
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
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs shrink-0">{label}</dt>
      <dd className="text-[var(--text-primary)] text-right text-xs break-all">
        {children}
      </dd>
    </div>
  );
}
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiEye, HiBan, HiCheck, HiPlus, HiRefresh, HiSearch, HiUsers,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Table from '../../components/hdmisp/ui/Table';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Modal from '../../components/hdmisp/ui/Modal';
import Select from '../../components/hdmisp/ui/Select';
import Pagination from '../../components/hdmisp/ui/Pagination';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import {
  getProviders,
  createProvider,
  suspendProvider,
  activateProvider,
} from '../../services/hdmisp/providers';
import { getBillingPlans } from '../../services/hdmisp/billingPlans';
import { formatDate } from '../../utils/hdmisp/formatDate';
import {
  PROVIDER_STATUS_LIST,
  statusVariant,
  statusLabel,
  PAGE_LIMIT,
} from '../../utils/hdmisp/constants';

export default function Providers() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isSuperadmin } = useAuth();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [plans, setPlans] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    billingPlanId: '',
  });
  const [creating, setCreating] = useState(false);

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProviders({
        page,
        limit: PAGE_LIMIT,
        status: status || undefined,
        search: search || undefined,
      });
      setItems(res.data || []);
      setMeta({
        page: res.meta?.page || 1,
        totalPages: res.meta?.totalPages || 1,
        total: res.meta?.total || 0,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [page, status, search, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getBillingPlans().then(setPlans).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    setCreating(true);
    try {
      await createProvider({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim() || undefined,
        password: createForm.password,
        billingPlanId: createForm.billingPlanId || undefined,
      });
      toast.success('Provider created');
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', phone: '', password: '', billingPlanId: '' });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to create provider');
    } finally {
      setCreating(false);
    }
  };

  const doSuspend = async () => {
    if (!suspendTarget) return;
    setActionLoading(suspendTarget._id);
    try {
      await suspendProvider(suspendTarget._id, suspendReason);
      toast.success('Provider suspended');
      setSuspendTarget(null);
      setSuspendReason('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to suspend');
    } finally {
      setActionLoading(null);
    }
  };

  const doActivate = async (row) => {
    setActionLoading(row._id);
    try {
      await activateProvider(row._id);
      toast.success('Provider activated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to activate');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Provider',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-[var(--text-primary)] truncate">{row.name}</p>
          <p className="text-xs text-[var(--text-muted)] truncate">{row.email}</p>
          {row.phone && <p className="text-xs text-[var(--text-muted)]">{row.phone}</p>}
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {typeof row.billingPlanId === 'object' && row.billingPlanId
            ? row.billingPlanId.name
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'subscriptionEndsAt',
      label: 'Subscription',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.subscriptionEndsAt ? formatDate(row.subscriptionEndsAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => {
        const busy = actionLoading === row._id;
        return (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/hdmisp/providers/${row._id}`);
              }}
              title="View"
            >
              <HiEye className="w-4 h-4" />
            </Button>
            {row.status === 'active' && (
              <Button
                size="sm"
                variant="warning"
                onClick={(e) => {
                  e.stopPropagation();
                  setSuspendReason('');
                  setSuspendTarget(row);
                }}
                disabled={busy}
                title="Suspend"
              >
                <HiBan className="w-4 h-4" />
              </Button>
            )}
            {row.status !== 'active' && (
              <Button
                size="sm"
                variant="success"
                onClick={(e) => {
                  e.stopPropagation();
                  doActivate(row);
                }}
                disabled={busy}
                title="Activate"
              >
                <HiCheck className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Providers</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} active provider{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {isSuperadmin && (
            <Button
              icon={<HiPlus className="w-4 h-4" />}
              onClick={() => setCreateOpen(true)}
            >
              New provider
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<HiRefresh className="w-4 h-4" />}
            onClick={load}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => { setStatus(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                !status
                  ? 'bg-cyan-600 text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
              }`}
              type="button"
            >
              All
            </button>
            {PROVIDER_STATUS_LIST.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  status === s
                    ? 'bg-cyan-600 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}
                type="button"
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {loading && !items.length ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-cyan-600 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <HiUsers className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-muted)]">No providers match your filters</p>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={items}
                rowKey={(r) => r._id}
                onRowClick={(r) => navigate(`/hdmisp/providers/${r._id}`)}
              />
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </Card>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create provider"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Business name *"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Acme ISP"
          />
          <Input
            label="Admin email *"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            placeholder="admin@acmeisp.co.ke"
          />
          <Input
            label="Phone"
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            placeholder="254712345678"
          />
          <Input
            label="Temp password *"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            placeholder="Min 8 characters"
          />
          <Select
            label="Billing plan"
            value={createForm.billingPlanId}
            onChange={(e) => setCreateForm({ ...createForm, billingPlanId: e.target.value })}
            options={[
              { value: '', label: 'No plan' },
              ...plans.map((p) => ({ value: p._id, label: p.name })),
            ]}
          />
          <p className="text-xs text-[var(--text-muted)]">
            A welcome email will be sent to the provider with their login credentials.
          </p>
        </div>
      </Modal>

      {/* Suspend modal */}
      <Modal
        open={!!suspendTarget}
        onClose={() => {
          setSuspendTarget(null);
          setSuspendReason('');
        }}
        title={`Suspend ${suspendTarget?.name || 'provider'}`}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setSuspendTarget(null);
                setSuspendReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={doSuspend}
              loading={actionLoading === suspendTarget?._id}
            >
              Suspend
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            The provider will lose access to their portal immediately and receive an
            email notification.
          </p>
          <Input
            label="Reason"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="e.g. Non-payment"
          />
        </div>
      </Modal>
    </div>
  );
}
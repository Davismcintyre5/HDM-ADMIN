import { useState, useEffect, useCallback } from 'react';
import {
  getTenants,
  getTenant,
  suspendTenant,
  activateTenant,
  deleteTenant,
} from '../../services/bizhub/tenants';
import Card from '../../components/bizhub/ui/Card';
import Table from '../../components/bizhub/ui/Table';
import SearchBar from '../../components/bizhub/ui/SearchBar';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Modal from '../../components/bizhub/ui/Modal';
import Pagination from '../../components/bizhub/ui/Pagination';
import ConfirmDialog from '../../components/bizhub/ui/ConfirmDialog';
import Spinner from '../../components/bizhub/ui/Spinner';
import { formatDate } from '../../utils/bizhub/formatDate';
import { HiEye, HiBan, HiCheck, HiTrash, HiClock } from 'react-icons/hi';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusVariant = {
  active: 'success',
  pending: 'warning',
  paid_wait: 'info',
  suspended: 'danger',
  rejected: 'danger',
  cancelled: 'danger',
  trial: 'info',
  trial_ended: 'default',
  auto_rejected: 'default',
};

const CYCLE_COLORS = {
  trial: 'info',
  monthly: 'success',
  yearly: 'info',
  permanent: 'warning',
};

const MODULE_NAMES = {
  pharmacy: 'PharmaSys',
  restaurant: 'RestoManagerKE',
  apartment: 'MyApartment',
  electronics: 'ElectroStore',
  cyber: 'DigitalManager',
};

const unwrapList = (res) => {
  const payload = res?.data?.data || res?.data || res;
  return {
    list: Array.isArray(payload) ? payload : payload?.tenants || [],
    pagination: res?.pagination || res?.data?.pagination || { page: 1, pages: 1 },
  };
};

const unwrapData = (res) => res?.data?.data || res?.data || res;

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '', name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, tenant: null, loading: false });

  const fetchTenants = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;

    getTenants(params)
      .then((res) => {
        const { list, pagination: pg } = unwrapList(res);
        const seen = new Set();
        const unique = list.filter((t) => {
          const id = t._id || t.id;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setTenants(unique);
        setPagination(pg);
      })
      .catch((err) => console.error('Tenants fetch:', err))
      .finally(() => setLoading(false));
  }, [page, filter, search]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const openView = async (tenant) => {
    setViewModal({ open: true, tenant: null, loading: true });
    try {
      const res = await getTenant(tenant._id);
      setViewModal({ open: true, tenant: unwrapData(res), loading: false });
    } catch {
      setViewModal({ open: true, tenant, loading: false });
    }
  };

  const handleAction = async () => {
    setActionLoading(true);
    const { id, type } = confirm;
    setConfirm({ open: false, id: null, type: '', name: '' });

    try {
      if (type === 'suspend') await suspendTenant(id, '');
      else if (type === 'activate') await activateTenant(id);
      else if (type === 'delete') await deleteTenant(id);
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getModuleLabel = (row) => {
    if (row.moduleName) return row.moduleName;
    if (row.businessType) return MODULE_NAMES[row.businessType] || row.businessType;
    return null;
  };

  const columns = [
    {
      key: 'businessName',
      label: 'Business',
      render: (row) => (
        <button
          onClick={() => openView(row)}
          className="text-teal-600 hover:underline font-medium"
        >
          {row.businessName || 'N/A'}
        </button>
      ),
    },
    { key: 'owner', label: 'Owner', render: (row) => row.owner?.name || '—' },
    {
      key: 'contact',
      label: 'Email',
      render: (row) => row.contact?.email || row.owner?.email || '—',
    },
    {
      key: 'planInfo',
      label: 'Plan',
      render: (row) => {
        const planName = row.planInfo?.name || row.planName || row.subscription?.plan;
        const planAmount = row.planInfo?.amount || row.planAmount || row.subscription?.amount;
        const planCycle = row.planInfo?.cycle || row.planCycle || row.subscription?.cycle;
        const trialEnd = row.trialEndsAt || row.subscription?.endDate;
        const daysLeft = getDaysRemaining(trialEnd);
        const showCountdown = planCycle === 'trial' || planCycle === 'monthly';

        if (!planName || planName === 'N/A') {
          return <span className="text-[var(--text-muted)] text-xs">No plan</span>;
        }

        return (
          <div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-[var(--text-primary)]">{planName}</span>
              {planAmount > 0 && (
                <span className="text-xs text-[var(--text-muted)]">
                  KES {Number(planAmount).toLocaleString()}
                </span>
              )}
            </div>
            {showCountdown && daysLeft !== null && (
              <div className="flex items-center gap-1 mt-0.5">
                <HiClock className="w-3 h-3 text-amber-500" />
                <span
                  className={`text-xs font-medium ${
                    daysLeft <= 3
                      ? 'text-red-500'
                      : daysLeft <= 7
                      ? 'text-amber-500'
                      : 'text-blue-500'
                  }`}
                >
                  {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'modules',
      label: 'Module',
      render: (row) => {
        const label = getModuleLabel(row);
        return label ? (
          <Badge variant="teal">{label}</Badge>
        ) : (
          <span className="text-[var(--text-muted)] text-xs">—</span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant[row.status] || 'default'}>
          {row.status?.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => openView(row)}>
            <HiEye className="w-4 h-4" />
          </Button>
          {row.status === 'active' && (
            <Button
              size="sm"
              variant="warning"
              onClick={() =>
                setConfirm({ open: true, id: row._id, type: 'suspend', name: row.businessName })
              }
            >
              <HiBan className="w-4 h-4" />
            </Button>
          )}
          {row.status === 'suspended' && (
            <Button
              size="sm"
              variant="success"
              onClick={() =>
                setConfirm({ open: true, id: row._id, type: 'activate', name: row.businessName })
              }
            >
              <HiCheck className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              setConfirm({ open: true, id: row._id, type: 'delete', name: row.businessName })
            }
          >
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tenants</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search tenants..." />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f.key
                ? 'bg-teal-600 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table
          columns={columns}
          data={tenants}
          loading={loading}
          emptyMessage="No tenants found."
        />
        <Pagination
          page={pagination.page}
          totalPages={pagination.pages || pagination.totalPages || 1}
          onPageChange={setPage}
        />
      </Card>

      <Modal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, tenant: null, loading: false })}
        title="Tenant Details"
        size="xl"
      >
        {viewModal.loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" />
          </div>
        ) : viewModal.tenant ? (
          <div className="space-y-6 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Business Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Name:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {viewModal.tenant.businessName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Slug:</span>
                  <span className="text-[var(--text-primary)] text-xs">
                    {viewModal.tenant.slug || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Type:</span>
                  <Badge variant="teal">{viewModal.tenant.businessType || '—'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Status:</span>
                  <Badge variant={statusVariant[viewModal.tenant.status] || 'default'}>
                    {viewModal.tenant.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Created:</span>
                  <span className="text-[var(--text-primary)]">
                    {formatDate(viewModal.tenant.createdAt, 'full')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Payment received:</span>
                  <Badge variant={viewModal.tenant.paymentReceived ? 'success' : 'warning'}>
                    {viewModal.tenant.paymentReceived ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Owner</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Name:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {viewModal.tenant.owner?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Email:</span>
                  <span className="text-[var(--text-primary)]">
                    {viewModal.tenant.owner?.email || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Phone:</span>
                  <span className="text-[var(--text-primary)]">
                    {viewModal.tenant.owner?.phone || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">ID Number:</span>
                  <span className="text-[var(--text-primary)]">
                    {viewModal.tenant.owner?.idNumber || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Plan & Subscription</h3>
              {viewModal.tenant.subscription ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Plan:</span>
                    <Badge variant="teal">
                      {viewModal.tenant.subscription.plan || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Status:</span>
                    <Badge
                      variant={
                        viewModal.tenant.subscription.status === 'active' ? 'success' : 'default'
                      }
                    >
                      {viewModal.tenant.subscription.status || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Amount:</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      KES {Number(viewModal.tenant.subscription.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  {viewModal.tenant.subscription.endDate && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Expires:</span>
                      <span className="text-[var(--text-primary)]">
                        {formatDate(viewModal.tenant.subscription.endDate, 'full')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-xs">No subscription yet</p>
              )}
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-3">Modules</h3>
              {viewModal.tenant.modules?.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {viewModal.tenant.modules.map((m, i) => (
                    <Badge key={i} variant="info">
                      {typeof m === 'string' ? m : m.moduleName || m.name || 'Module'}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-xs">No modules assigned</p>
              )}
            </div>

            {viewModal.tenant.rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Rejected</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  {viewModal.tenant.rejectionReason}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Tenant not found</p>
        )}
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })}
        onConfirm={handleAction}
        title={
          confirm.type === 'suspend'
            ? 'Suspend Tenant'
            : confirm.type === 'activate'
            ? 'Activate Tenant'
            : 'Delete Tenant'
        }
        message={
          confirm.type === 'delete'
            ? `Permanently delete "${confirm.name}" and everything tied to it — owner, users, invoices, payments, subscriptions, modules, and all module business data (medicines, orders, leases, products, etc.)? This cannot be undone.`
            : `${confirm.type === 'suspend' ? 'Suspend' : 'Activate'} ${confirm.name}?`
        }
        confirmLabel={
          confirm.type === 'suspend' ? 'Suspend' : confirm.type === 'activate' ? 'Activate' : 'Delete'
        }
        variant={
          confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'
        }
        loading={actionLoading}
      />
    </div>
  );
}
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiEye, HiCheck, HiX, HiTrash, HiRefresh, HiClock, HiSearch,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Table from '../../components/hdmisp/ui/Table';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Modal from '../../components/hdmisp/ui/Modal';
import ConfirmDialog from '../../components/hdmisp/ui/ConfirmDialog';
import Pagination from '../../components/hdmisp/ui/Pagination';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import {
  getPendingProviders,
  approvePendingProvider,
  rejectPendingProvider,
  deletePendingProvider,
  expireStalePendingProviders,
} from '../../services/hdmisp/providers';
import { formatDate, relativeTime } from '../../utils/hdmisp/formatDate';
import {
  PENDING_STATUS_LIST,
  statusVariant,
  statusLabel,
  PAGE_LIMIT,
} from '../../utils/hdmisp/constants';

const REASONS = [
  'Incomplete business documentation',
  'Unable to verify business',
  'Duplicate application',
  'Suspected fraud',
  'Policy violation',
  'Other',
];

export default function PendingProviders() {
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

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState(REASONS[0]);
  const [rejectCustom, setRejectCustom] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingProviders({
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
      toast.error(err.message || 'Failed to load pending providers');
    } finally {
      setLoading(false);
    }
  }, [page, status, search, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const doApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(approveTarget._id);
    try {
      await approvePendingProvider(approveTarget._id);
      toast.success('Provider approved');
      setApproveTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const doReject = async () => {
    if (!rejectTarget) return;
    const finalReason =
      rejectReason === 'Other' ? rejectCustom.trim() : rejectReason;
    if (!finalReason) {
      toast.error('Reason is required');
      return;
    }
    setActionLoading(rejectTarget._id);
    try {
      await rejectPendingProvider(rejectTarget._id, finalReason);
      toast.success('Provider rejected');
      setRejectTarget(null);
      setRejectReason(REASONS[0]);
      setRejectCustom('');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(confirmDelete._id);
    try {
      await deletePendingProvider(confirmDelete._id);
      toast.success('Pending record deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const doExpire = async () => {
    setActionLoading('expire');
    try {
      const res = await expireStalePendingProviders();
      toast.success(`Expired ${res?.expired ?? 0} stale records`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to expire');
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
          <p className="font-medium text-[var(--text-primary)] truncate">
            {row.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)] truncate">{row.email}</p>
          {row.phone && (
            <p className="text-xs text-[var(--text-muted)]">{row.phone}</p>
          )}
        </div>
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
      key: 'expiresAt',
      label: 'Expires',
      render: (row) => {
        if (!row.expiresAt) return <span className="text-xs text-[var(--text-muted)]">—</span>;
        const expired = new Date(row.expiresAt) < new Date();
        return (
          <span className={`text-xs ${expired ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
            {formatDate(row.expiresAt)}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {relativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => {
        const busy = actionLoading === row._id;
        const canAct = isSuperadmin && row.status !== 'approved';
        return (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/hdmisp/pending/${row._id}`);
              }}
              title="View"
            >
              <HiEye className="w-4 h-4" />
            </Button>
            {canAct && (
              <>
                <Button
                  size="sm"
                  variant="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    setApproveTarget(row);
                  }}
                  disabled={busy}
                  title="Approve"
                >
                  <HiCheck className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRejectTarget(row);
                  }}
                  disabled={busy}
                  title="Reject"
                >
                  <HiX className="w-4 h-4" />
                </Button>
              </>
            )}
            {isSuperadmin && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(row);
                }}
                disabled={busy}
                title="Delete"
              >
                <HiTrash className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Pending Providers
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} application{meta.total !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        <div className="flex gap-2">
          {isSuperadmin && (
            <Button
              variant="outline"
              size="sm"
              icon={<HiRefresh className={`w-4 h-4 ${actionLoading === 'expire' ? 'animate-spin' : ''}`} />}
              onClick={doExpire}
              loading={actionLoading === 'expire'}
            >
              Expire stale
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
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => { setStatus(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                !status
                  ? 'bg-cyan-600 text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
              }`}
              type="button"
            >
              All
            </button>
            {PENDING_STATUS_LIST.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  status === s
                    ? 'bg-cyan-600 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
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
              <HiClock className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-muted)]">
                No pending providers match your filters
              </p>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={items}
                rowKey={(r) => r._id}
                onRowClick={(r) => navigate(`/hdmisp/pending/${r._id}`)}
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

      {/* Approve modal */}
      <Modal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title={`Approve ${approveTarget?.name || 'provider'}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={doApprove}
              loading={actionLoading === approveTarget?._id}
            >
              Approve
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Approving will create a provider account, seed settings, and send the
          welcome email + SMS to <strong>{approveTarget?.email}</strong>.
        </p>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason(REASONS[0]);
          setRejectCustom('');
        }}
        title={`Reject ${rejectTarget?.name || 'provider'}`}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason(REASONS[0]);
                setRejectCustom('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={doReject}
              loading={actionLoading === rejectTarget?._id}
            >
              Reject
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            The applicant will be emailed the rejection reason.
          </p>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Reason
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-cyan-500"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {rejectReason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Details
              </label>
              <textarea
                value={rejectCustom}
                onChange={(e) => setRejectCustom(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm resize-y focus:ring-2 focus:ring-cyan-500"
                placeholder="Explain the rejection…"
              />
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={doDelete}
        title="Delete pending provider"
        message={`Permanently delete the pending application for "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading === confirmDelete?._id}
      />
    </div>
  );
}
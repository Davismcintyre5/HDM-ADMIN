import { useEffect, useState, useMemo } from 'react';
import {
  getSmartGenUsers,
  suspendSmartGenUser,
  activateSmartGenUser,
  deleteSmartGenUser,
} from '../../services/portfolio/smartgenUsers';
import Card from '../../components/portfolio/ui/Card';
import Table from '../../components/portfolio/ui/Table';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import SearchBar from '../../components/portfolio/ui/SearchBar';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import { useToast } from '../../context/portfolio/ToastContext';
import { formatDate, relativeTime } from '../../utils/portfolio/formatDate';
import {
  HiUser,
  HiCheckCircle,
  HiXCircle,
  HiBadgeCheck,
  HiLockClosed,
  HiLockOpen,
  HiTrash,
} from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

export default function SmartGenUsers() {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    verified: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    user: null,
  });

  const fetchUsers = (statusFilter = filter) => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : undefined;
    getSmartGenUsers(params)
      .then((res) => {
        const data = res?.data || res || {};
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
      })
      .catch((err) =>
        toast.error(err.message || 'Failed to load SmartGen users')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleSuspend = async (user) => {
    setActionLoading(user.id);
    try {
      await suspendSmartGenUser(user.id);
      toast.success(`${user.name} suspended`);
      fetchUsers(filter);
    } catch (err) {
      toast.error(err.message || 'Failed to suspend');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (user) => {
    setActionLoading(user.id);
    try {
      await activateSmartGenUser(user.id);
      toast.success(`${user.name} activated`);
      fetchUsers(filter);
    } catch (err) {
      toast.error(err.message || 'Failed to activate');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.user) return;
    const user = confirmDelete.user;
    setActionLoading(user.id);
    try {
      const res = await deleteSmartGenUser(user.id);
      const data = res?.data || res || {};
      const deletedDocs = data.deletedDocuments ?? 0;
      toast.success(
        `Deleted ${user.name}${
          deletedDocs > 0 ? ` and ${deletedDocs} document(s)` : ''
        }`
      );
      setConfirmDelete({ open: false, user: null });
      fetchUsers(filter);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-semibold shrink-0">
            {(row.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {row.name || '—'}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {row.email || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'emailVerified',
      label: 'Verified',
      render: (row) =>
        row.emailVerified ? (
          <Badge variant="success" dot>
            Verified
          </Badge>
        ) : (
          <Badge variant="warning" dot>
            Unverified
          </Badge>
        ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)] capitalize">
          {row.role || 'user'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) =>
        row.isActive ? (
          <Badge variant="success" dot>
            Active
          </Badge>
        ) : (
          <Badge variant="danger" dot>
            Suspended
          </Badge>
        ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (row) => (
        <div>
          <p className="text-xs text-[var(--text-primary)]">
            {row.lastLogin ? relativeTime(row.lastLogin) : '—'}
          </p>
          {row.lastLogin && (
            <p className="text-[10px] text-[var(--text-muted)]">
              {formatDate(row.lastLogin, 'full')}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.createdAt ? formatDate(row.createdAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.isActive ? (
            <Button
              size="sm"
              variant="warning"
              onClick={(e) => {
                e.stopPropagation();
                handleSuspend(row);
              }}
              loading={actionLoading === row.id}
              title="Suspend"
            >
              <HiLockClosed className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="success"
              onClick={(e) => {
                e.stopPropagation();
                handleActivate(row);
              }}
              loading={actionLoading === row.id}
              title="Activate"
            >
              <HiLockOpen className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete({ open: true, user: row });
            }}
            disabled={actionLoading === row.id}
            title="Delete"
          >
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            SmartGen Users
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage users of the SmartGen app
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <HiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.total.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Active</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.active.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <HiXCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Suspended</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.suspended.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <HiBadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Verified</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.verified.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name or email..."
            />
          </div>
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === f.key
                    ? 'bg-green-600 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                }`}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={filtered}
            loading={loading}
            emptyMessage={
              search.trim()
                ? 'No users match your search'
                : filter
                ? `No ${filter} users`
                : 'No SmartGen users yet'
            }
          />
        </div>
      </Card>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, user: null })}
        onConfirm={handleDelete}
        title="Delete SmartGen User"
        message={`Permanently delete ${confirmDelete.user?.name} and all their documents? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading === confirmDelete.user?.id}
      />
    </div>
  );
}
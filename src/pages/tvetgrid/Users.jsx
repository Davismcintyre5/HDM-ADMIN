import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/tvetgrid/ui/Card';
import Table from '../../components/tvetgrid/ui/Table';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import SearchBar from '../../components/tvetgrid/ui/SearchBar';
import Select from '../../components/tvetgrid/ui/Select';
import Pagination from '../../components/tvetgrid/ui/Pagination';
import { useToast } from '../../context/tvetgrid/ToastContext';
import { getUsers } from '../../services/tvetgrid/users';
import { formatDate } from '../../utils/tvetgrid/formatDate';
import { USER_ROLE_LIST, statusLabel } from '../../utils/tvetgrid/constants';

const ROLE_OPTIONS = [{ value: '', label: 'All roles' }, ...USER_ROLE_LIST];

export default function Users() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUsers({
      page,
      limit: 20,
      q: search || undefined,
      role: role || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res?.data || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Failed to load users');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, role]);

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {row.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {row.phone || '—'}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <Badge
          variant={
            row.role === 'admin'
              ? 'warning'
              : row.role === 'teacher'
              ? 'info'
              : 'default'
          }
        >
          {statusLabel(row.role)}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'} dot>
          {row.isActive ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'emailVerified',
      label: 'Verified',
      render: (row) =>
        row.emailVerified ? (
          <Badge variant="success">Yes</Badge>
        ) : (
          <Badge variant="warning">No</Badge>
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
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/tvetgrid/users/${row._id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Users
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} registered users
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name or email..."
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              options={ROLE_OPTIONS}
            />
          </div>
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            onRowClick={(row) => navigate(`/tvetgrid/users/${row._id}`)}
            emptyMessage="No users found"
          />
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}
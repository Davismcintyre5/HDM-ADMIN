import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, suspendUser, activateUser, resetUserPin, deleteUser } from '../../services/flax/users';
import Card from '../../components/flax/ui/Card';
import Table from '../../components/flax/ui/Table';
import SearchBar from '../../components/flax/ui/SearchBar';
import Badge from '../../components/flax/ui/Badge';
import Button from '../../components/flax/ui/Button';
import Pagination from '../../components/flax/ui/Pagination';
import ConfirmDialog from '../../components/flax/ui/ConfirmDialog';
import { formatDate } from '../../utils/flax/formatDate';
import { HiEye, HiLockClosed, HiBan, HiCheck, HiTrash } from 'react-icons/hi';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '', name: '' });

  const fetchUsers = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    getUsers(params)
      .then((res) => {
        const d = res?.data || res;
        setUsers(d.users || []);
        setPagination(d.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, filter, search]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendUser(confirm.id);
      else if (confirm.type === 'activate') await activateUser(confirm.id);
      else if (confirm.type === 'resetPin') await resetUserPin(confirm.id);
      else if (confirm.type === 'delete') await deleteUser(confirm.id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '', name: '' });
  };

  const columns = [
    {
      key: 'firstName',
      label: 'Name',
      render: (row) => (
        <button onClick={() => navigate(`/flax/users/${row._id}`)} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          {row.firstName} {row.lastName}
        </button>
      ),
    },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'nationalId', label: 'National ID', render: (row) => row.nationalId || '—' },
    {
      key: 'balance',
      label: 'Balance',
      render: (row) => <span className="font-medium">KES {(row.balance || 0).toLocaleString()}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Suspended'}</Badge>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/flax/users/${row._id}`)}>
            <HiEye className="w-4 h-4 mr-1" /> View
          </Button>
          {row.isActive ? (
            <Button
              size="sm" variant="warning"
              onClick={() => setConfirm({ open: true, id: row._id, type: 'suspend', name: `${row.firstName} ${row.lastName}` })}
            >
              <HiBan className="w-4 h-4" /> Suspend
            </Button>
          ) : (
            <Button
              size="sm" variant="success"
              onClick={() => setConfirm({ open: true, id: row._id, type: 'activate', name: `${row.firstName} ${row.lastName}` })}
            >
              <HiCheck className="w-4 h-4" /> Activate
            </Button>
          )}
          <Button
            size="sm" variant="outline"
            onClick={() => setConfirm({ open: true, id: row._id, type: 'resetPin', name: `${row.firstName} ${row.lastName}` })}
          >
            <HiLockClosed className="w-4 h-4" /> Reset PIN
          </Button>
          <Button
            size="sm" variant="danger"
            onClick={() => setConfirm({ open: true, id: row._id, type: 'delete', name: `${row.firstName} ${row.lastName}` })}
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, phone, ID..." />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* Confirm Modals */}
      <ConfirmDialog
        open={confirm.open && confirm.type === 'suspend'}
        onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })}
        onConfirm={handleAction}
        title="Suspend User"
        message={`Suspend ${confirm.name}? They will not be able to send money or login via USSD.`}
        confirmLabel="Suspend"
        variant="warning"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={confirm.open && confirm.type === 'resetPin'}
        onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })}
        onConfirm={handleAction}
        title="Reset PIN"
        message={`Reset ${confirm.name}'s PIN to 1234?`}
        confirmLabel="Reset PIN"
        variant="warning"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={confirm.open && confirm.type === 'delete'}
        onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })}
        onConfirm={handleAction}
        title="Delete User"
        message={`Permanently delete ${confirm.name} and ALL their transactions? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
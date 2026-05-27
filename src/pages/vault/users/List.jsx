import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, suspendUser, reactivateUser, deleteUser } from '../../../services/vault/users';
import Table from '../../../components/vault/ui/Table';
import SearchBar from '../../../components/vault/ui/SearchBar';
import Badge from '../../../components/vault/ui/Badge';
import Button from '../../../components/vault/ui/Button';
import ConfirmDialog from '../../../components/vault/ui/ConfirmDialog';
import Pagination from '../../../components/vault/ui/Pagination';
import { formatDate } from '../../../utils/vault/formatDate';

export default function UsersList() {
  const navigate = useNavigate();
  const [data, setData] = useState({ users: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ page, limit: 20, search })
      .then(res => setData({ users: res.users || [], total: res.total || 0 }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendUser(confirm.id);
      else if (confirm.type === 'reactivate') await reactivateUser(confirm.id);
      else if (confirm.type === 'delete') await deleteUser(confirm.id);
      setConfirm({ open: false, id: null, type: '' });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const isSuspended = (row) => row.status === 'suspended' || row.isSuspended || row.orgId?.status === 'suspended';

  const columns = [
    { key: 'fullName', label: 'Name', render: (row) => (
      <button onClick={() => navigate(`/hdmvault/users/detail/${row._id}`)} className="text-orange-600 hover:underline font-medium">
        {row.fullName || 'N/A'}
      </button>
    )},
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge variant={row.role === 'orgOwner' ? 'orange' : 'default'}>{row.role || 'user'}</Badge> },
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={isSuspended(row) ? 'danger' : 'success'}>{isSuspended(row) ? 'Suspended' : 'Active'}</Badge>
    )},
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/hdmvault/users/detail/${row._id}`)}>View</Button>
        {isSuspended(row) ? (
          <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'reactivate' })}>Reactivate</Button>
        ) : (
          <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'suspend' })}>Suspend</Button>
        )}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete' })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>
      <Table columns={columns} data={data.users} loading={loading} emptyMessage="No users found." />
      <Pagination page={page} totalPages={Math.ceil(data.total / 20) || 1} onPageChange={setPage} />
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'delete' ? 'Delete User' : confirm.type === 'suspend' ? 'Suspend User' : 'Reactivate User'}
        message={confirm.type === 'delete' ? 'Permanently delete this user and ALL their data (vault, devices, logs)? This cannot be undone.' : `${confirm.type === 'suspend' ? 'Suspend' : 'Reactivate'} this user?`}
        confirmLabel={confirm.type === 'delete' ? 'Delete' : confirm.type === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}
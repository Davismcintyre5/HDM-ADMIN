import { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser } from '../../services/hdmai/users';
import Card from '../../components/hdmai/ui/Card';
import Table from '../../components/hdmai/ui/Table';
import SearchBar from '../../components/hdmai/ui/SearchBar';
import Badge from '../../components/hdmai/ui/Badge';
import Button from '../../components/hdmai/ui/Button';
import Pagination from '../../components/hdmai/ui/Pagination';
import ConfirmDialog from '../../components/hdmai/ui/ConfirmDialog';
import { formatDate } from '../../utils/hdmai/formatDate';
import { HiBan, HiCheck, HiTrash } from 'react-icons/hi';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '', name: '' });

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ page, limit: 20, search: search || undefined })
      .then(res => {
        const d = res?.data || res;
        setUsers(d.users || []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'toggle') await updateUser(confirm.id, { isActive: !confirm.current });
      else if (confirm.type === 'delete') await deleteUser(confirm.id);
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '', name: '' });
  };

  const columns = [
    { key: 'email', label: 'Email', render: row => <span className="font-medium text-[var(--text-primary)]">{row.email}</span> },
    { key: 'username', label: 'Username', render: row => row.username || '—' },
    { key: 'isActive', label: 'Status', render: row => <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'createdAt', label: 'Joined', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-2">
        {row.isActive ? (
          <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'toggle', current: true, name: row.email })}><HiBan className="w-4 h-4" /> Deactivate</Button>
        ) : (
          <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'toggle', current: false, name: row.email })}><HiCheck className="w-4 h-4" /> Activate</Button>
        )}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete', name: row.email })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
      <ConfirmDialog
        open={confirm.open && confirm.type === 'toggle'}
        onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })} onConfirm={handleAction}
        title={confirm.current ? 'Deactivate User' : 'Activate User'}
        message={`${confirm.current ? 'Deactivate' : 'Activate'} ${confirm.name}?`}
        confirmLabel={confirm.current ? 'Deactivate' : 'Activate'}
        variant={confirm.current ? 'warning' : 'success'} loading={actionLoading} />
      <ConfirmDialog
        open={confirm.open && confirm.type === 'delete'}
        onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })} onConfirm={handleAction}
        title="Delete User" message={`Permanently delete ${confirm.name}? An email will be sent.`}
        confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
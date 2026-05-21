import { useEffect, useState } from 'react';
import { getUsers, getUser, updateUser, deleteUser } from '../../services/hdmai/users';
import Card from '../../components/hdmai/ui/Card';
import Table from '../../components/hdmai/ui/Table';
import Badge from '../../components/hdmai/ui/Badge';
import Button from '../../components/hdmai/ui/Button';
import Modal from '../../components/hdmai/ui/Modal';
import Input from '../../components/hdmai/ui/Input';
import Toggle from '../../components/hdmai/ui/Toggle';
import SearchBar from '../../components/hdmai/ui/SearchBar';
import Pagination from '../../components/hdmai/ui/Pagination';
import ConfirmDialog from '../../components/hdmai/ui/ConfirmDialog';
import { formatDate } from '../../utils/hdmai/formatDate';
import { HiEye, HiTrash } from 'react-icons/hi';

export default function Users() {
  const [data, setData] = useState({ users: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ page, limit: 20 })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const openView = async (userId) => {
    try {
      const user = await getUser(userId);
      setEditForm({ role: user.role, is_active: user.is_active });
      setViewModal({ open: true, user });
    } catch (err) { alert(err.message); }
  };

  const handleUpdate = async () => {
    setActionLoading(true);
    try {
      await updateUser(viewModal.user.id, editForm);
      setViewModal({ open: false, user: null });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'username', label: 'Username', render: (row) => <span className="font-medium text-[var(--text-primary)]">{row.username || 'N/A'}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge variant={row.role === 'admin' ? 'purple' : 'info'}>{row.role}</Badge> },
    { key: 'is_active', label: 'Status', render: (row) => row.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge> },
    { key: 'api_keys_count', label: 'Keys', render: (row) => row.api_keys_count || 0 },
    { key: 'last_login', label: 'Last Login', render: (row) => row.last_login ? formatDate(row.last_login) : 'Never' },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openView(row.id)}><HiEye className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row.id })}><HiTrash className="w-4 h-4" /></Button>
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
        <Table columns={columns} data={data.users} loading={loading} emptyMessage="No users found." />
        <Pagination page={page} totalPages={data.pagination?.pages || 1} onPageChange={setPage} />
      </Card>

      {/* View/Edit Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, user: null })} title="User Details" size="md">
        {viewModal.user && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">ID:</span><span className="text-[var(--text-primary)] font-mono text-xs">{viewModal.user.id}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.user.email}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Username:</span><span className="text-[var(--text-primary)]">{viewModal.user.username || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Created:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.user.created_at, 'full')}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">API Keys:</span><span className="text-[var(--text-primary)]">{viewModal.user.api_keys_count || 0}</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
              <select value={editForm.role || 'user'} onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)]">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Toggle label="Active" checked={editForm.is_active ?? true} onChange={(v) => setEditForm(prev => ({ ...prev, is_active: v }))} />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setViewModal({ open: false, user: null })}>Close</Button>
              <Button onClick={handleUpdate} loading={actionLoading}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete User" message="Permanently delete this user and ALL their data (keys, conversations, everything)? This cannot be undone." confirmLabel="Delete User" variant="danger" onConfirm={handleDelete} loading={actionLoading} />
    </div>
  );
}
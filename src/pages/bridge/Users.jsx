import { useState, useEffect } from 'react';
import { getUsers, getUser, suspendUser, activateUser, deleteUser } from '../../services/bridge/users';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import SearchBar from '../../components/bridge/ui/SearchBar';
import Pagination from '../../components/bridge/ui/Pagination';
import ConfirmDialog from '../../components/bridge/ui/ConfirmDialog';
import { formatDate } from '../../utils/bridge/formatDate';
import { HiBan, HiCheck, HiTrash, HiEye } from 'react-icons/hi';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState({ open: false, user: null });
  const [viewLoading, setViewLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ page, limit: 20, search })
      .then(res => {
        setUsers(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleView = async (userId) => {
    setViewLoading(true);
    setViewModal({ open: true, user: null });
    try {
      const res = await getUser(userId);
      setViewModal({ open: true, user: res.user || res.data || res });
    } catch (err) { alert(err.message); }
    setViewLoading(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendUser(confirm.id);
      else if (confirm.type === 'activate') await activateUser(confirm.id);
      else if (confirm.type === 'delete') await deleteUser(confirm.id);
      setConfirm({ open: false, id: null, type: '' });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => (
      <button onClick={() => handleView(row._id || row.id)} className="text-indigo-600 hover:underline font-medium text-left">
        {row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'N/A'}
      </button>
    )},
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge variant="indigo">{row.role || 'user'}</Badge> },
    { key: 'isActive', label: 'Status', render: (row) => (
      <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Suspended'}</Badge>
    )},
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleView(row._id || row.id)}><HiEye className="w-4 h-4" /></Button>
        {row.isActive ? (
          <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'suspend' })}><HiBan className="w-4 h-4" /></Button>
        ) : (
          <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'activate' })}><HiCheck className="w-4 h-4" /></Button>
        )}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'delete' })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
          <p className="text-xs text-[var(--text-muted)]">{pagination.total || users.length} users</p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, user: null })} title="User Details" size="lg">
        {viewLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : viewModal.user ? (
          <div className="space-y-4">
            {/* Profile */}
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Profile</h3>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.user.fullName || `${viewModal.user.firstName} ${viewModal.user.lastName}`}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.user.email}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{viewModal.user.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Role:</span><Badge variant="indigo">{viewModal.user.role || 'user'}</Badge></div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Status:</span>
                <Badge variant={viewModal.user.isActive ? 'success' : 'danger'}>{viewModal.user.isActive ? 'Active' : 'Suspended'}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Currency:</span><span className="text-[var(--text-primary)]">{viewModal.user.preferredCurrency || 'USD'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">2FA:</span><span className="text-[var(--text-primary)]">{viewModal.user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email Verified:</span><Badge variant={viewModal.user.isEmailVerified ? 'success' : 'warning'}>{viewModal.user.isEmailVerified ? 'Yes' : 'No'}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Timezone:</span><span className="text-[var(--text-primary)]">{viewModal.user.timezone || 'UTC'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Last Login:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.user.lastLogin, 'full')}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Joined:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.user.createdAt, 'full')}</span></div>
            </div>

            {/* Organization */}
            {viewModal.user.organizationId && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Organization</h3>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)]">{viewModal.user.organizationId.name}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.user.organizationId.email}</span></div>
              </div>
            )}

            {/* Notification Preferences */}
            {viewModal.user.notificationPreferences && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Notifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(viewModal.user.notificationPreferences).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Badge variant={val ? 'success' : 'default'}>{val ? 'ON' : 'OFF'}</Badge>
                      <span className="text-xs text-[var(--text-secondary)]">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">User not found.</p>
        )}
      </Modal>

      <ConfirmDialog
        open={confirm.open} onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'suspend' ? 'Suspend User' : confirm.type === 'activate' ? 'Activate User' : 'Delete User'}
        message={confirm.type === 'delete' ? 'Permanently delete this user?' : `${confirm.type} this user?`}
        confirmLabel={confirm.type === 'delete' ? 'Delete' : 'Confirm'}
        variant={confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'}
        onConfirm={handleAction} loading={actionLoading}
      />
    </div>
  );
}
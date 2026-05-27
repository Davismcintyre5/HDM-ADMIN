import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, banUser, unbanUser, forceLogout } from '../../services/spark/users';
import Card from '../../components/spark/ui/Card';
import Table from '../../components/spark/ui/Table';
import SearchBar from '../../components/spark/ui/SearchBar';
import Badge from '../../components/spark/ui/Badge';
import Button from '../../components/spark/ui/Button';
import Modal from '../../components/spark/ui/Modal';
import Input from '../../components/spark/ui/Input';
import Pagination from '../../components/spark/ui/Pagination';
import ConfirmDialog from '../../components/spark/ui/ConfirmDialog';
import { formatDate } from '../../utils/spark/formatDate';
import { HiEye, HiBan, HiLogout } from 'react-icons/hi';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [banModal, setBanModal] = useState({ open: false, user: null });
  const [banForm, setBanForm] = useState({ type: 'temporary', reason: 'Violation of terms', durationDays: 7 });
  const [confirmAction, setConfirmAction] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ page, limit: 20, search })
      .then(res => {
        setUsers(res.users || []);
        setMeta({ total: res.total || 0, page: res.page || 1, totalPages: res.totalPages || 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleBan = async () => {
    if (!banForm.reason?.trim()) {
      alert('Please enter a reason for the ban');
      return;
    }
    setActionLoading(true);
    try {
      await banUser(banModal.user._id, banForm);
      setBanModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      if (err.message?.includes('already banned')) {
        alert('User is already banned. Refreshing list...');
        setBanModal({ open: false, user: null });
        fetchUsers();
      } else {
        alert(err.message);
      }
    }
    setActionLoading(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirmAction.type === 'unban') await unbanUser(confirmAction.id, { reason: 'Admin action' });
      else if (confirmAction.type === 'logout') await forceLogout(confirmAction.id);
      setConfirmAction({ open: false, id: null, type: '' });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const isUserBanned = (row) => row.bans?.some(b => b.isActive) || row.status === 'banned' || row.isBanned;
  const statusVariant = (row) => {
    if (isUserBanned(row)) return 'danger';
    if (row.status === 'online') return 'success';
    return 'default';
  };
  const statusLabel = (row) => isUserBanned(row) ? 'banned' : (row.status || 'offline');

  const columns = [
    { key: 'displayName', label: 'User', render: (row) => (
      <button onClick={() => navigate(`/spark/users/${row._id}`)} className="text-sky-600 hover:underline font-medium">
        {row.displayName || row.phone || 'N/A'}
      </button>
    )},
    { key: 'phone', label: 'Phone' },
    { key: 'isHdmVerified', label: 'Verified', render: (row) => row.isHdmVerified ? <Badge variant="sky">HDM ✓</Badge> : <Badge>No</Badge> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant(row)}>{statusLabel(row)}</Badge> },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/spark/users/${row._id}`)}><HiEye className="w-4 h-4" /></Button>
        {!isUserBanned(row) && (
          <Button size="sm" variant="danger" onClick={() => setBanModal({ open: true, user: row })}><HiBan className="w-4 h-4" /></Button>
        )}
        {isUserBanned(row) && (
          <Button size="sm" variant="success" onClick={() => setConfirmAction({ open: true, id: row._id, type: 'unban' })}>Unban</Button>
        )}
        <Button size="sm" variant="warning" onClick={() => setConfirmAction({ open: true, id: row._id, type: 'logout' })}><HiLogout className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
          <p className="text-xs text-[var(--text-muted)]">{meta.total} user{meta.total !== 1 ? 's' : ''}</p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />
      </Card>

      <Modal open={banModal.open} onClose={() => setBanModal({ open: false, user: null })} title={`Ban ${banModal.user?.displayName || banModal.user?.phone || 'User'}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={banForm.type} onChange={(e) => setBanForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              <option value="temporary">Temporary</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          {banForm.type === 'temporary' && (
            <Input label="Duration (Days)" type="number" value={banForm.durationDays} onChange={(e) => setBanForm(p => ({ ...p, durationDays: Number(e.target.value) }))} />
          )}
          <Input label="Reason *" value={banForm.reason} onChange={(e) => setBanForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for ban (required)" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setBanModal({ open: false, user: null })}>Cancel</Button>
            <Button variant="danger" onClick={handleBan} loading={actionLoading}>Ban User</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmAction.open}
        onClose={() => setConfirmAction({ open: false, id: null, type: '' })}
        title={confirmAction.type === 'unban' ? 'Unban User' : 'Force Logout'}
        message={confirmAction.type === 'unban' ? 'Remove ban from this user?' : 'Force this user to log out of all sessions?'}
        confirmLabel={confirmAction.type === 'unban' ? 'Unban' : 'Logout'}
        variant={confirmAction.type === 'unban' ? 'success' : 'warning'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}
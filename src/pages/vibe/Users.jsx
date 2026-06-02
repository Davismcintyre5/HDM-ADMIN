import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, banUser, unbanUser, verifyUser, unverifyUser, deleteUser } from '../../services/vibe/users';
import Card from '../../components/vibe/ui/Card';
import Table from '../../components/vibe/ui/Table';
import SearchBar from '../../components/vibe/ui/SearchBar';
import Badge from '../../components/vibe/ui/Badge';
import Button from '../../components/vibe/ui/Button';
import Modal from '../../components/vibe/ui/Modal';
import Input from '../../components/vibe/ui/Input';
import Pagination from '../../components/vibe/ui/Pagination';
import ConfirmDialog from '../../components/vibe/ui/ConfirmDialog';
import { formatDate } from '../../utils/vibe/formatDate';
import { HiEye, HiBan, HiCheck, HiX, HiShieldCheck, HiTrash } from 'react-icons/hi';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [banModal, setBanModal] = useState({ open: false, user: null });
  const [banReason, setBanReason] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ page, limit: 20, search })
      .then(res => {
        setUsers(res.data || []);
        setMeta({ total: res.total || 0, page: res.page || 1, pages: res.pages || 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleBan = async () => {
    setActionLoading(true);
    try { await banUser(banModal.user._id, banReason); setBanModal({ open: false, user: null }); setBanReason(''); fetchUsers(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'unban') await unbanUser(confirm.id);
      else if (confirm.type === 'verify') await verifyUser(confirm.id);
      else if (confirm.type === 'unverify') await unverifyUser(confirm.id);
      else if (confirm.type === 'delete') await deleteUser(confirm.id);
      setConfirm({ open: false, id: null, type: '' });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'username', label: 'User', render: (row) => (
      <div>
        <span className="font-medium text-[var(--text-primary)]">{row.username || row.email || 'N/A'}</span>
        <div className="text-xs text-[var(--text-muted)]">{row.email}</div>
      </div>
    )},
    { key: 'isBanned', label: 'Status', render: (row) => row.isBanned ? <Badge variant="danger">Banned</Badge> : <Badge variant="success">Active</Badge> },
    { key: 'isVerified', label: 'Verified', render: (row) => row.isVerified ? <Badge variant="gradient">✓ Verified</Badge> : <Badge>No</Badge> },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/vibe/users/${row._id}`)}><HiEye className="w-4 h-4" /></Button>
        {row.isBanned ? (
          <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'unban' })}>Unban</Button>
        ) : (
          <Button size="sm" variant="danger" onClick={() => setBanModal({ open: true, user: row })}><HiBan className="w-4 h-4" /></Button>
        )}
        {row.isVerified ? (
          <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'unverify' })}><HiX className="w-4 h-4" /></Button>
        ) : (
          <Button size="sm" variant="gradient" onClick={() => setConfirm({ open: true, id: row._id, type: 'verify' })}><HiShieldCheck className="w-4 h-4" /></Button>
        )}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete' })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
          <p className="text-xs text-[var(--text-muted)]">{meta.total} users</p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={page} totalPages={meta.pages || 1} onPageChange={setPage} />
      </Card>

      <Modal open={banModal.open} onClose={() => { setBanModal({ open: false, user: null }); setBanReason(''); }} title={`Ban ${banModal.user?.username || 'User'}`} size="sm">
        <div className="space-y-4">
          <Input label="Reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Reason for ban" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setBanModal({ open: false, user: null }); setBanReason(''); }}>Cancel</Button>
            <Button variant="danger" onClick={handleBan} loading={actionLoading}>Ban</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'unban' ? 'Unban User' : confirm.type === 'verify' ? 'Verify User' : confirm.type === 'unverify' ? 'Unverify User' : 'Delete User'}
        message={confirm.type === 'delete' ? 'Permanently delete this user?' : `${confirm.type} this user?`}
        confirmLabel={confirm.type === 'delete' ? 'Delete' : 'Confirm'}
        variant={confirm.type === 'delete' ? 'danger' : 'primary'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}
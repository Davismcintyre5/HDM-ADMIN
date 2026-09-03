import { useState, useEffect } from 'react';
import { getUsers, suspendUser, reactivateUser, deleteUser, changeUserRole, verifyUser, toggleHdmVerified } from '../../services/rvnp/users';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import SearchBar from '../../components/rvnp/ui/SearchBar';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Modal from '../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../components/rvnp/ui/ConfirmDialog';
import Pagination from '../../components/rvnp/ui/Pagination';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiEye, HiTrash, HiShieldCheck, HiBadgeCheck } from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'SUSPENDED', label: 'Suspended' },
  { key: 'DELETED', label: 'Deleted' },
];

const ROLE_FILTERS = [
  { key: '', label: 'All Roles' },
  { key: 'STUDENT', label: 'Student' },
  { key: 'STAFF', label: 'Staff' },
  { key: 'ALUMNI', label: 'Alumni' },
];

const statusVariant = { ACTIVE: 'success', SUSPENDED: 'danger', DELETED: 'default' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, user: null });
  const [suspendModal, setSuspendModal] = useState({ open: false, id: null, name: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [roleModal, setRoleModal] = useState({ open: false, id: null, name: '' });
  const [newRole, setNewRole] = useState('STUDENT');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchUsers = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    if (roleFilter) params.role = roleFilter;
    if (search) params.search = search;
    getUsers(params)
      .then(res => {
        setUsers(res?.data?.users || res?.data || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, filter, roleFilter, search]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try { await suspendUser(suspendModal.id, { reason: suspendReason }); setSuspendModal({ open: false, id: null, name: '' }); fetchUsers(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReactivate = async (id) => { try { await reactivateUser(id); fetchUsers(); } catch (err) { alert(err.message); } };
  const handleVerify = async (id) => { try { await verifyUser(id); fetchUsers(); } catch (err) { alert(err.message); } };
  const handleToggleHdm = async (id) => { try { await toggleHdmVerified(id); fetchUsers(); } catch (err) { alert(err.message); } };
  const handleDelete = async () => { setActionLoading(true); try { await deleteUser(confirmDelete.id); setUsers(prev => prev.filter(u => u.id !== confirmDelete.id)); setConfirmDelete({ open: false, id: null, name: '' }); fetchUsers(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleRoleChange = async () => { setActionLoading(true); try { await changeUserRole(roleModal.id, { role: newRole }); setRoleModal({ open: false, id: null, name: '' }); fetchUsers(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const columns = [
    { key: 'name', label: 'Name', render: row => (
      <button onClick={() => setViewModal({ open: true, user: row })} className="text-emerald-600 hover:underline font-medium">
        {row.fullName || '—'}
      </button>
    )},
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email}</span> },
    { key: 'phone', label: 'Phone', render: row => <span className="text-sm">{row.phoneNumber || '—'}</span> },
    { key: 'role', label: 'Role', render: row => <Badge variant="info">{row.role?.replace(/_/g, ' ')}</Badge> },
    { key: 'hdmVerified', label: 'HDM', render: row => row.hdmVerified ? <Badge variant="success">✓ HDM</Badge> : <span className="text-sm text-[var(--text-muted)]">—</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.accountStatus] || 'default'}>{(row.accountStatus)?.replace(/_/g, ' ')}</Badge> },
    { key: 'createdAt', label: 'Joined', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, user: row })}><HiEye className="w-3 h-3" /></Button>
        {!row.hdmVerified && (
          <Button size="sm" variant="success" onClick={() => handleToggleHdm(row.id)} title="HDM Verify"><HiBadgeCheck className="w-3 h-3" /></Button>
        )}
        {row.hdmVerified && (
          <Button size="sm" variant="warning" onClick={() => handleToggleHdm(row.id)} title="Unverify HDM"><HiBadgeCheck className="w-3 h-3" /></Button>
        )}
        {row.accountStatus === 'ACTIVE' ? (
          <Button size="sm" variant="warning" onClick={() => { setSuspendReason(''); setSuspendModal({ open: true, id: row.id, name: row.fullName }); }}>Suspend</Button>
        ) : (
          <Button size="sm" variant="success" onClick={() => handleReactivate(row.id)}>Reactivate</Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => { setNewRole(row.role || 'STUDENT'); setRoleModal({ open: true, id: row.id, name: row.fullName }); }}><HiShieldCheck className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row.id, name: row.fullName })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
        <div className="w-px h-8 bg-[var(--border-color)] mx-1" />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
          {ROLE_FILTERS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
      </div>

      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* View User Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, user: null })} title="User Details" size="lg">
        {viewModal.user && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Name" value={viewModal.user.fullName} bold />
              <Row label="Email" value={viewModal.user.email} />
              <Row label="Phone" value={viewModal.user.phoneNumber} />
              <Row label="Role" value={viewModal.user.role?.replace(/_/g, ' ')} />
              <Row label="Status" value={viewModal.user.accountStatus?.replace(/_/g, ' ')} />
              <Row label="Verification" value={viewModal.user.verificationStatus?.replace(/_/g, ' ')} />
              <Row label="HDM Verified">
                {viewModal.user.hdmVerified ? <Badge variant="success">Yes</Badge> : <Badge variant="default">No</Badge>}
              </Row>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Academic</h3>
              <Row label="Campus" value={viewModal.user.campus?.name} />
              <Row label="Department" value={viewModal.user.department?.name} />
              <Row label="Course" value={viewModal.user.course} />
              <Row label="Year of Study" value={viewModal.user.yearOfStudy} />
              <Row label="Staff ID" value={viewModal.user.staffId} />
              <Row label="Graduation Year" value={viewModal.user.graduationYear} />
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Activity</h3>
              <Row label="Posts" value={viewModal.user._count?.posts} />
              <Row label="Reels" value={viewModal.user._count?.reels} />
              <Row label="Followers" value={viewModal.user._count?.followers} />
              <Row label="Following" value={viewModal.user._count?.following} />
              <Row label="Last Seen" value={viewModal.user.lastSeen ? formatDate(viewModal.user.lastSeen, 'full') : '—'} />
              <Row label="Joined" value={formatDate(viewModal.user.createdAt, 'full')} />
            </div>
          </div>
        )}
      </Modal>

      {/* Suspend Modal */}
      <Modal open={suspendModal.open} onClose={() => setSuspendModal({ open: false, id: null, name: '' })} title={`Suspend ${suspendModal.name}`}>
        <Input label="Reason" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setSuspendModal({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button variant="warning" onClick={handleSuspend} loading={actionLoading}>Suspend</Button>
        </div>
      </Modal>

      {/* Role Modal */}
      <Modal open={roleModal.open} onClose={() => setRoleModal({ open: false, id: null, name: '' })} title={`Change Role - ${roleModal.name}`} size="sm">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
          <select value={newRole} onChange={e => setNewRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
            {['STUDENT', 'STAFF', 'ALUMNI'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setRoleModal({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button onClick={handleRoleChange} loading={actionLoading}>Update</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete User" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value, bold, children }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {children || <span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value ?? '—'}</span>}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { getUsers, createUser, toggleUserStatus, deleteUser } from '../../services/farmvexa/users';
import Card from '../../components/farmvexa/ui/Card';
import Table from '../../components/farmvexa/ui/Table';
import SearchBar from '../../components/farmvexa/ui/SearchBar';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Input from '../../components/farmvexa/ui/Input';
import Toggle from '../../components/farmvexa/ui/Toggle';
import Modal from '../../components/farmvexa/ui/Modal';
import ConfirmDialog from '../../components/farmvexa/ui/ConfirmDialog';
import Pagination from '../../components/farmvexa/ui/Pagination';
import { formatDate } from '../../utils/farmvexa/formatDate';
import { HiPlus, HiEye, HiTrash, HiKey } from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'inactive', label: 'Inactive' },
];

const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger', inactive: 'default' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, user: null });
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', county: '', subCounty: '', password: '', autoApprove: true, sendWelcome: true });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchUsers = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    if (search) params.search = search;
    getUsers(params)
      .then(res => {
        setUsers(res?.data?.users || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
        setCounts(res?.data?.counts || {});
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, filter, search]);

  const handleToggle = async (id) => {
    try { await toggleUserStatus(id); fetchUsers(); } catch (err) { alert(err.message); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return alert('Name, email, and password are required');
    setActionLoading(true);
    try { await createUser(form); setCreateModal(false); fetchUsers(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteUser(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchUsers(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm({ ...form, password: pwd });
  };

  const columns = [
    { key: 'name', label: 'Name', render: row => (
      <button onClick={() => setViewModal({ open: true, user: row })} className="text-emerald-600 hover:underline font-medium">{row.name}</button>
    )},
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email}</span> },
    { key: 'phone', label: 'Phone', render: row => <span className="text-sm">{row.phone || '—'}</span> },
    { key: 'approvalStatus', label: 'Status', render: row => <Badge variant={statusVariant[row.approvalStatus] || 'default'}>{row.approvalStatus}</Badge> },
    { key: 'farms', label: 'Farms', render: row => <span className="text-sm">{row.farmCount || '—'}</span> },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, user: row })}><HiEye className="w-3 h-3" /></Button>
        <Button size="sm" variant="secondary" onClick={() => handleToggle(row.id || row._id)}>
          {row.isActive ? 'Deactivate' : 'Activate'}
        </Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row.id || row._id, name: row.name })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
        <div className="flex gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
          <Button onClick={() => { setForm({ name: '', email: '', phone: '', county: '', subCounty: '', password: '', autoApprove: true, sendWelcome: true }); setCreateModal(true); }}>
            <HiPlus className="w-4 h-4 mr-1" /> Add User
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label} {counts[f.key] != null && `(${counts[f.key]})`}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* View User Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, user: null })} title="User Details" size="md">
        {viewModal.user && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="Name" value={viewModal.user.name} bold />
              <Row label="Email" value={viewModal.user.email} />
              <Row label="Phone" value={viewModal.user.phone} />
              <Row label="County" value={viewModal.user.county} />
              <Row label="Sub-County" value={viewModal.user.subCounty} />
              <Row label="Status">
                <Badge variant={statusVariant[viewModal.user.approvalStatus] || 'default'}>{viewModal.user.approvalStatus}</Badge>
              </Row>
              <Row label="Joined" value={formatDate(viewModal.user.createdAt, 'full')} />
              <Row label="Farms" value={viewModal.user.farmCount || 0} />
            </div>
          </div>
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add New User" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+254..." />
            <Input label="County" value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} />
          </div>
          <Input label="Sub-County" value={form.subCounty} onChange={e => setForm({ ...form, subCounty: e.target.value })} />

          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Account Security</h3>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <Button variant="secondary" size="sm" onClick={generatePassword}><HiKey className="w-4 h-4 mr-1" /> Generate</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Toggle label="Auto-approve account" checked={form.autoApprove} onChange={v => setForm({ ...form, autoApprove: v })} />
            <Toggle label="Send welcome email with credentials" checked={form.sendWelcome} onChange={v => setForm({ ...form, sendWelcome: v })} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={actionLoading}>Create User</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete User" message={`Delete ${confirmDelete.name}? This will also delete all associated farms.`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value, bold, children }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {children || <span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span>}
    </div>
  );
}
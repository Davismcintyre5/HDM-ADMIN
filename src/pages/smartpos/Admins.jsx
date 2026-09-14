import { useState, useEffect } from 'react';
import { getAdmins, inviteAdmin, updateAdmin, changeAdminRole, deactivateAdmin, activateAdmin, resetAdminPassword } from '../../services/smartpos/admins';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Modal from '../../components/smartpos/ui/Modal';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import Pagination from '../../components/smartpos/ui/Pagination';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiPlus, HiPencil, HiKey, HiLockClosed, HiLockOpen } from 'react-icons/hi';

const ROLE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'super_admin', label: 'Super Admin' },
  { key: 'admin', label: 'Admin' },
  { key: 'support', label: 'Support' },
  { key: 'read_only', label: 'Read Only' },
];

const roleVariant = { super_admin: 'danger', admin: 'info', support: 'warning', read_only: 'default' };

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'admin' });
  const [editModal, setEditModal] = useState({ open: false, admin: null });
  const [editForm, setEditForm] = useState({ name: '', role: 'admin' });
  const [confirmDeactivate, setConfirmDeactivate] = useState({ open: false, id: null, name: '' });

  const fetchAdmins = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.role = filter;
    getAdmins(params)
      .then(res => { setAdmins(res?.data || []); setPagination(res?.meta || { page: 1, pages: 1 }); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, [page, filter]);

  const handleInvite = async () => {
    setActionLoading(true);
    try { await inviteAdmin(inviteForm); setInviteModal(false); fetchAdmins(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const openEdit = (admin) => { setEditForm({ name: admin.name, role: admin.role }); setEditModal({ open: true, admin }); };

  const handleEdit = async () => {
    setActionLoading(true);
    try {
      await updateAdmin(editModal.admin._id || editModal.admin.id, { name: editForm.name });
      await changeAdminRole(editModal.admin._id || editModal.admin.id, { role: editForm.role });
      setEditModal({ open: false, admin: null }); fetchAdmins();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDeactivate = async () => {
    setActionLoading(true);
    try { await deactivateAdmin(confirmDeactivate.id); setConfirmDeactivate({ open: false, id: null, name: '' }); fetchAdmins(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleActivate = async (id) => { setActionLoading(true); try { await activateAdmin(id); fetchAdmins(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset password? A temp password will be generated.')) return;
    setActionLoading(true);
    try {
      const res = await resetAdminPassword(id);
      const temp = res?.data?.tempPassword || res?.tempPassword;
      alert(`Temp Password: ${temp}`);
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: row => <span className="font-medium text-[var(--text-primary)]">{row.name}</span> },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email}</span> },
    { key: 'role', label: 'Role', render: row => <Badge variant={roleVariant[row.role] || 'default'}>{row.role?.replace('_', ' ')}</Badge> },
    { key: 'active', label: 'Status', render: row => <Badge variant={row.active ? 'success' : 'danger'}>{row.active ? 'Active' : 'Inactive'}</Badge> },
    { key: 'lastLogin', label: 'Last Login', render: row => row.lastLogin ? formatDate(row.lastLogin) : '—' },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-3 h-3" /></Button>
        <Button size="sm" variant="info" onClick={() => handleResetPassword(row._id || row.id)} title="Reset password"><HiKey className="w-3 h-3" /></Button>
        {row.active ? (
          <Button size="sm" variant="warning" onClick={() => setConfirmDeactivate({ open: true, id: row._id || row.id, name: row.name })}><HiLockClosed className="w-3 h-3" /></Button>
        ) : (
          <Button size="sm" variant="success" onClick={() => handleActivate(row._id || row.id)}><HiLockOpen className="w-3 h-3" /></Button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admins</h1>
        <Button onClick={() => { setInviteForm({ name: '', email: '', role: 'admin' }); setInviteModal(true); }}>
          <HiPlus className="w-4 h-4 mr-1" /> Invite Admin
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {ROLE_FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={admins} loading={loading} emptyMessage="No admins found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title="Invite Admin" size="md">
        <div className="space-y-4">
          <Input label="Name" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} required />
          <Input label="Email" type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
            <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['admin', 'support', 'read_only'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button onClick={handleInvite} loading={actionLoading}>Send Invite</Button>
          </div>
        </div>
      </Modal>

      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, admin: null })} title={`Edit ${editModal.admin?.name}`} size="md">
        <div className="space-y-4">
          <Input label="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
            <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['super_admin', 'admin', 'support', 'read_only'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditModal({ open: false, admin: null })}>Cancel</Button>
            <Button onClick={handleEdit} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDeactivate.open} onClose={() => setConfirmDeactivate({ open: false, id: null, name: '' })} onConfirm={handleDeactivate}
        title="Deactivate Admin" message={`Deactivate ${confirmDeactivate.name}?`} confirmLabel="Deactivate" variant="warning" loading={actionLoading} />
    </div>
  );
}
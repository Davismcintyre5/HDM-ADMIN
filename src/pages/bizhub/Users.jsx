import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, toggleUserStatus, deleteUser } from '../../services/bizhub/users';
import Card from '../../components/bizhub/ui/Card';
import Table from '../../components/bizhub/ui/Table';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Modal from '../../components/bizhub/ui/Modal';
import Input from '../../components/bizhub/ui/Input';
import ConfirmDialog from '../../components/bizhub/ui/ConfirmDialog';
import { formatDate } from '../../utils/bizhub/formatDate';
import { HiPencil, HiTrash, HiBan, HiCheck, HiPlus, HiEye, HiKey } from 'react-icons/hi';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, user: null });
  const [viewModal, setViewModal] = useState({ open: false, user: null });
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then(res => setUsers(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', phone: '', role: 'user' });
    setModal({ open: true, user: null });
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, password: '' });
    setModal({ open: true, user });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.user) await updateUser(modal.user.id || modal.user._id, form);
      else await createUser(form);
      setModal({ open: false, user: null });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'toggle') await toggleUserStatus(confirm.id);
      else if (confirm.type === 'delete') await deleteUser(confirm.id);
      setConfirm({ open: false, id: null, type: '' });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => (
      <button onClick={() => setViewModal({ open: true, user: row })} className="text-teal-600 hover:underline font-medium">
        {row.name}
      </button>
    )},
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge variant={row.role === 'admin' ? 'teal' : 'default'}>{row.role}</Badge> },
    { key: 'systems', label: 'Modules', render: (row) => (
      <div className="flex gap-1 flex-wrap">{(row.systems || []).map(s => <Badge key={s} variant="gradient">{s}</Badge>)}</div>
    )},
    { key: 'isActive', label: 'Status', render: (row) => (
      row.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, user: row })}><HiEye className="w-4 h-4" /></Button>
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row.id || row._id, type: 'toggle' })}>
          {row.isActive ? <HiBan className="w-4 h-4" /> : <HiCheck className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row.id || row._id, type: 'delete' })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add User</Button>
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, user: null })} title={modal.user ? 'Edit User' : 'Add User'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
          {!modal.user && <Input label="Password" type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} />}
          <Input label="Phone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, user: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, user: null })} title="User Details" size="md">
        {viewModal.user && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.user.name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.user.email}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{viewModal.user.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Role:</span><Badge variant="teal">{viewModal.user.role}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span>{viewModal.user.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>}</div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Joined:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.user.createdAt, 'full')}</span></div>
            </div>

            {/* Licenses */}
            {viewModal.user.licenses?.length > 0 && (
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2"><HiKey className="w-4 h-4 text-teal-500" /> Licenses</h3>
                <div className="space-y-2">
                  {viewModal.user.licenses.map((lic, i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-3 text-sm">
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Key:</span><code className="text-[var(--text-primary)] font-mono text-xs">{lic.key}</code></div>
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Plan:</span><Badge variant="gradient">{lic.plan}</Badge></div>
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Valid Until:</span><span className="text-[var(--text-primary)]">{formatDate(lic.validUntil)}</span></div>
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span>{lic.active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Expired</Badge>}</div>
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Modules:</span><div className="flex gap-1">{(lic.modules || []).map(m => <Badge key={m} variant="teal">{m}</Badge>)}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscriptions */}
            {viewModal.user.subscriptions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Subscriptions</h3>
                <div className="space-y-2">
                  {viewModal.user.subscriptions.map((sub, i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-3 text-sm">
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Plan:</span><Badge variant="gradient">{sub.plan}</Badge></div>
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={sub.status === 'active' ? 'success' : 'danger'}>{sub.status}</Badge></div>
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Period:</span><span className="text-[var(--text-primary)]">{formatDate(sub.startDate)} — {formatDate(sub.endDate)}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'toggle' ? 'Toggle Status' : 'Delete User'}
        message={confirm.type === 'delete' ? 'Permanently delete this user?' : 'Change user status?'}
        confirmLabel={confirm.type === 'delete' ? 'Delete' : 'Toggle'}
        variant={confirm.type === 'delete' ? 'danger' : 'warning'}
        onConfirm={handleAction} loading={actionLoading}
      />
    </div>
  );
}
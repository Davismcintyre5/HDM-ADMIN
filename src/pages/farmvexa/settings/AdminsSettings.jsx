import { useState, useEffect } from 'react';
import { getAdmins, createAdmin, toggleAdminStatus, deleteAdmin } from '../../../services/farmvexa/auth';
import Card from '../../../components/farmvexa/ui/Card';
import Table from '../../../components/farmvexa/ui/Table';
import Badge from '../../../components/farmvexa/ui/Badge';
import Button from '../../../components/farmvexa/ui/Button';
import Input from '../../../components/farmvexa/ui/Input';
import Modal from '../../../components/farmvexa/ui/Modal';
import ConfirmDialog from '../../../components/farmvexa/ui/ConfirmDialog';
import Spinner from '../../../components/farmvexa/ui/Spinner';
import { HiPlus, HiTrash } from 'react-icons/hi';

const roleVariant = { super_admin: 'danger', admin: 'info' };

export default function AdminsSettings() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', phone: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchAdmins = () => {
    setLoading(true);
    getAdmins().then(res => setAdmins(res?.data?.admins || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async () => {
    setActionLoading(true);
    try { await createAdmin(form); setModal(false); fetchAdmins(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleToggle = async (id) => { try { await toggleAdminStatus(id); fetchAdmins(); } catch (err) { alert(err.message); } };
  const handleDelete = async () => { setActionLoading(true); try { await deleteAdmin(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchAdmins(); } catch (err) { alert(err.message); } setActionLoading(false); };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const columns = [
    { key: 'name', label: 'Name', render: row => <span className="font-medium">{row.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: row => <Badge variant={roleVariant[row.role] || 'default'}>{row.role?.replace('_', ' ')}</Badge> },
    { key: 'status', label: 'Status', render: row => (
      <button onClick={() => handleToggle(row.id || row._id)}>
        <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>
      </button>
    )},
    { key: 'actions', label: '', render: row => (
      <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row.id || row._id, name: row.name })}><HiTrash className="w-3 h-3" /></Button>
    )},
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Admin Users</h2>
        <Button onClick={() => { setForm({ name: '', email: '', password: '', role: 'admin', phone: '' }); setModal(true); }}><HiPlus className="w-4 h-4 mr-1" /> Add Admin</Button>
      </div>
      <Card><Table columns={columns} data={admins} loading={loading} emptyMessage="No admins found." /></Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Admin" size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['admin', 'super_admin'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={actionLoading}>Create</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Admin" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
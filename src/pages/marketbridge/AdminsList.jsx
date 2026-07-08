import { useState, useEffect } from 'react';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../services/marketbridge/admins';
import Card from '../../components/marketbridge/ui/Card';
import Table from '../../components/marketbridge/ui/Table';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Input from '../../components/marketbridge/ui/Input';
import Modal from '../../components/marketbridge/ui/Modal';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import { formatDate } from '../../utils/marketbridge/formatDate';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const ROLES = ['super_admin', 'support', 'finance', 'content'];

export default function AdminsList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'support' });

  const fetchAdmins = () => {
    setLoading(true);
    getAdmins()
      .then(res => setAdmins(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const openCreate = () => { setForm({ name: '', email: '', phone: '', role: 'support' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (admin) => { setForm({ name: admin.name || '', email: admin.email || '', phone: admin.phone || '', role: admin.role || 'support' }); setModal({ open: true, mode: 'edit', data: admin }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createAdmin(form);
      else await updateAdmin(modal.data._id || modal.data.id, form);
      setModal({ open: false, mode: 'create', data: null });
      fetchAdmins();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteAdmin(confirm.id); fetchAdmins(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, name: '' });
  };

  const columns = [
    { key: 'name', label: 'Name', render: row => <span className="font-medium text-[var(--text-primary)]">{row.name || 'N/A'}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: row => <Badge variant={row.role === 'super_admin' ? 'danger' : 'info'}>{row.role}</Badge> },
    { key: 'createdAt', label: 'Added', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id || row.id, name: row.name })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admins</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Admin</Button>
      </div>
      <Card>
        <Table columns={columns} data={admins} loading={loading} emptyMessage="No admins found." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Admin' : 'Edit Admin'} size="lg">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Admin" message={`Permanently delete ${confirm.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
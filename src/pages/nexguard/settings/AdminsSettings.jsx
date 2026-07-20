import { useState, useEffect } from 'react';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../../services/nexguard/admins';
import Card from '../../../components/nexguard/ui/Card';
import Table from '../../../components/nexguard/ui/Table';
import Badge from '../../../components/nexguard/ui/Badge';
import Button from '../../../components/nexguard/ui/Button';
import Input from '../../../components/nexguard/ui/Input';
import Modal from '../../../components/nexguard/ui/Modal';
import ConfirmDialog from '../../../components/nexguard/ui/ConfirmDialog';
import Spinner from '../../../components/nexguard/ui/Spinner';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const ROLES = ['super_admin', 'moderator', 'billing_admin'];

export default function AdminsSettings() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'moderator' });

  const fetchAdmins = () => {
    setLoading(true);
    getAdmins()
      .then(res => setAdmins(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', role: 'moderator' });
    setModal({ open: true, mode: 'create', data: null });
  };

  const openEdit = (admin) => {
    setForm({
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      role: admin.role || 'moderator',
    });
    setModal({ open: true, mode: 'edit', data: admin });
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const data = { ...form };
      if (modal.mode === 'edit' && !data.password) delete data.password;
      if (modal.mode === 'create') await createAdmin(data);
      else await updateAdmin(modal.data._id || modal.data.id, data);
      setModal({ open: false, mode: 'create', data: null });
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteAdmin(confirm.id);
      fetchAdmins();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
    setConfirm({ open: false, id: null, name: '' });
  };

  const roleVariant = {
    super_admin: 'danger',
    moderator: 'info',
    billing_admin: 'warning',
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: row => (
        <span className="font-medium text-[var(--text-primary)]">{row.name || 'N/A'}</span>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: row => (
        <Badge variant={roleVariant[row.role] || 'default'}>
          {row.role?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
            <HiPencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirm({ open: true, id: row._id || row.id, name: row.name })}
          >
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Admin Users</h2>
        <Button onClick={openCreate}>
          <HiPlus className="w-4 h-4 mr-1" /> Add Admin
        </Button>
      </div>
      <Card>
        <Table columns={columns} data={admins} loading={loading} emptyMessage="No admins found." />
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', data: null })}
        title={modal.mode === 'create' ? 'Create Admin' : 'Edit Admin'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <Input
            label={modal.mode === 'create' ? 'Password' : 'Password (leave empty)'}
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required={modal.mode === 'create'}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]"
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Delete ${confirm.name}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
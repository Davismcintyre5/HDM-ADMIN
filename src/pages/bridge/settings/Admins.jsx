import { useEffect, useState } from 'react';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, getRoles, createRole, updateRole } from '../../../services/bridge/admins';
import Card from '../../../components/bridge/ui/Card';
import Table from '../../../components/bridge/ui/Table';
import Badge from '../../../components/bridge/ui/Badge';
import Button from '../../../components/bridge/ui/Button';
import Modal from '../../../components/bridge/ui/Modal';
import Input from '../../../components/bridge/ui/Input';
import ConfirmDialog from '../../../components/bridge/ui/ConfirmDialog';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const PERMISSIONS = ['users.view', 'users.edit', 'users.delete', 'payments.view', 'payments.refund', 'plans.view', 'plans.edit', 'system.view', 'system.edit', 'analytics.view', 'legal.view', 'legal.edit', 'backup.view', 'backup.create', 'backup.restore', 'admins.view', 'admins.edit', 'audit.view'];

export default function AdminsSettings() {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminModal, setAdminModal] = useState({ open: false, admin: null });
  const [roleModal, setRoleModal] = useState({ open: false, role: null });
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: '' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, type: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getAdmins(), getRoles()])
      .then(([a, r]) => { setAdmins(a.admins || a.data || []); setRoles(r.roles || r.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreateAdmin = () => { setForm({ firstName: '', lastName: '', email: '', password: '', role: roles[0]?._id || '' }); setAdminModal({ open: true, admin: null }); };
  const openEditAdmin = (a) => { setForm({ firstName: a.firstName, lastName: a.lastName, email: a.email, role: a.role?._id || a.role }); setAdminModal({ open: true, admin: a }); };
  const handleSaveAdmin = async () => {
    setSaving(true);
    try {
      if (adminModal.admin) await updateAdmin(adminModal.admin._id || adminModal.admin.id, form);
      else await createAdmin(form);
      setAdminModal({ open: false, admin: null }); fetchData();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };
  const handleDeleteAdmin = async () => {
    try { await deleteAdmin(confirmDelete.id); setConfirmDelete({ open: false, id: null, type: '' }); fetchData(); } catch (err) { alert(err.message); }
  };

  const openCreateRole = () => { setRoleForm({ name: '', description: '', permissions: [] }); setRoleModal({ open: true, role: null }); };
  const openEditRole = (r) => { setRoleForm({ name: r.name, description: r.description, permissions: r.permissions || [] }); setRoleModal({ open: true, role: r }); };
  const handleSaveRole = async () => {
    setSaving(true);
    try {
      if (roleModal.role) await updateRole(roleModal.role._id || roleModal.role.id, roleForm);
      else await createRole(roleForm);
      setRoleModal({ open: false, role: null }); fetchData();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const togglePermission = (perm) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
    }));
  };

  const adminColumns = [
    { key: 'firstName', label: 'Name', render: (row) => <span className="font-medium">{row.firstName} {row.lastName}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge variant="indigo">{row.role?.name || row.role}</Badge> },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEditAdmin(row)}><HiPencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id || row.id, type: 'admin' })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Admins</h2>
        <Button size="sm" onClick={openCreateAdmin}><HiPlus className="w-4 h-4 mr-1" /> Add Admin</Button>
      </div>
      <Card><Table columns={adminColumns} data={admins} loading={loading} emptyMessage="No admins." /></Card>

      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-semibold">Roles</h2>
        <Button size="sm" variant="outline" onClick={openCreateRole}><HiPlus className="w-4 h-4 mr-1" /> Add Role</Button>
      </div>
      <Card>
        <div className="space-y-3">
          {roles.map(r => (
            <div key={r._id || r.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div><p className="font-medium">{r.name}</p><p className="text-xs text-[var(--text-muted)]">{r.permissions?.length || 0} permissions</p></div>
              <Button size="sm" variant="secondary" onClick={() => openEditRole(r)}><HiPencil className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={adminModal.open} onClose={() => setAdminModal({ open: false, admin: null })} title={adminModal.admin ? 'Edit Admin' : 'Add Admin'} size="md">
        <div className="space-y-4">
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
          {!adminModal.admin && <Input label="Password" type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} />}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="">Select Role</option>
              {roles.map(r => <option key={r._id || r.id} value={r._id || r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setAdminModal({ open: false, admin: null })}>Cancel</Button><Button onClick={handleSaveAdmin} loading={saving}>Save</Button></div>
        </div>
      </Modal>

      <Modal open={roleModal.open} onClose={() => setRoleModal({ open: false, role: null })} title={roleModal.role ? 'Edit Role' : 'Add Role'} size="lg">
        <div className="space-y-4">
          <Input label="Name" value={roleForm.name} onChange={(e) => setRoleForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Description" value={roleForm.description} onChange={(e) => setRoleForm(p => ({ ...p, description: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {PERMISSIONS.map(perm => (
                <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={roleForm.permissions.includes(perm)} onChange={() => togglePermission(perm)} className="text-indigo-600 rounded" />
                  {perm}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setRoleModal({ open: false, role: null })}>Cancel</Button><Button onClick={handleSaveRole} loading={saving}>Save</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, type: '' })} title="Delete Admin" message="Permanently delete this admin?" confirmLabel="Delete" variant="danger" onConfirm={handleDeleteAdmin} />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { getDepartments, getCampuses, createDepartment, updateDepartment, deleteDepartment } from '../../../services/rvnp/settings';
import Card from '../../../components/rvnp/ui/Card';
import Table from '../../../components/rvnp/ui/Table';
import Badge from '../../../components/rvnp/ui/Badge';
import Button from '../../../components/rvnp/ui/Button';
import Input from '../../../components/rvnp/ui/Input';
import Modal from '../../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../../components/rvnp/ui/ConfirmDialog';
import Spinner from '../../../components/rvnp/ui/Spinner';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

export default function DepartmentsSettings() {
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ name: '', campusId: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getDepartments(), getCampuses()])
      .then(([d, c]) => {
        setDepartments(d?.data || []);
        setCampuses(c?.data || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm({ name: '', campusId: campuses[0]?.id || '' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (dept) => { setForm({ name: dept.name, campusId: dept.campusId }); setModal({ open: true, mode: 'edit', data: dept }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createDepartment(form);
      else await updateDepartment(modal.data.id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteDepartment(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const columns = [
    { key: 'name', label: 'Name', render: row => <span className="font-medium text-[var(--text-primary)]">{row.name}</span> },
    { key: 'campus', label: 'Campus', render: row => <Badge variant="info">{row.campus?.name || '—'}</Badge> },
    { key: 'users', label: 'Users', render: row => <span className="text-sm">{row._count?.users || 0}</span> },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row.id, name: row.name })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Departments</h2>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Department</Button>
      </div>
      <Card>
        <Table columns={columns} data={departments} loading={loading} emptyMessage="No departments." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Department' : 'Edit Department'} size="sm">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Campus</label>
            <select value={form.campusId} onChange={e => setForm({ ...form, campusId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Department" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
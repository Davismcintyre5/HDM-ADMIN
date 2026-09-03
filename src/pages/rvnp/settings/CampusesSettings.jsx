import { useState, useEffect } from 'react';
import { getCampuses, createCampus, updateCampus, deleteCampus } from '../../../services/rvnp/settings';
import Card from '../../../components/rvnp/ui/Card';
import Table from '../../../components/rvnp/ui/Table';
import Badge from '../../../components/rvnp/ui/Badge';
import Button from '../../../components/rvnp/ui/Button';
import Input from '../../../components/rvnp/ui/Input';
import Modal from '../../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../../components/rvnp/ui/ConfirmDialog';
import Spinner from '../../../components/rvnp/ui/Spinner';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const CAMPUS_TYPES = ['MAIN', 'SATELLITE'];

export default function CampusesSettings() {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ name: '', location: '', type: 'SATELLITE' });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchCampuses = () => {
    setLoading(true);
    getCampuses().then(res => setCampuses(res?.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampuses(); }, []);

  const openCreate = () => { setForm({ name: '', location: '', type: 'SATELLITE' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (campus) => { setForm({ name: campus.name, location: campus.location, type: campus.type }); setModal({ open: true, mode: 'edit', data: campus }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createCampus(form);
      else await updateCampus(modal.data.id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchCampuses();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteCampus(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchCampuses(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const columns = [
    { key: 'name', label: 'Name', render: row => <span className="font-medium text-[var(--text-primary)]">{row.name}</span> },
    { key: 'location', label: 'Location', render: row => <span className="text-sm">{row.location || '—'}</span> },
    { key: 'type', label: 'Type', render: row => <Badge variant={row.type === 'MAIN' ? 'success' : 'info'}>{row.type}</Badge> },
    { key: 'departments', label: 'Departments', render: row => <span className="text-sm">{row.departments?.length || row._count?.departments || 0}</span> },
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
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Campuses</h2>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Campus</Button>
      </div>
      <Card>
        <Table columns={columns} data={campuses} loading={loading} emptyMessage="No campuses." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Campus' : 'Edit Campus'} size="sm">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {CAMPUS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Campus" message={`Delete ${confirmDelete.name}? This will also delete all associated departments.`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
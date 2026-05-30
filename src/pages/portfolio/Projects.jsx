import { useEffect, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../services/portfolio/projects';
import Card from '../../components/portfolio/ui/Card';
import Table from '../../components/portfolio/ui/Table';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import Modal from '../../components/portfolio/ui/Modal';
import Input from '../../components/portfolio/ui/Input';
import Toggle from '../../components/portfolio/ui/Toggle';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import { HiPencil, HiTrash, HiStar } from 'react-icons/hi';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, project: null });
  const [form, setForm] = useState({ name: '', description: '', image: '', link: '', technologies: [], featured: false, isActive: true, order: 0 });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchProjects = () => {
    setLoading(true);
    getProjects()
      .then(res => setProjects(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreate = () => { setForm({ name: '', description: '', image: '', link: '', technologies: [], featured: false, isActive: true, order: 0 }); setModal({ open: true, project: null }); };
  const openEdit = (p) => { setForm({ ...p }); setModal({ open: true, project: p }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.project) await updateProject(modal.project._id, form);
      else await createProject(form);
      setModal({ open: false, project: null });
      fetchProjects();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await deleteProject(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchProjects(); }
    catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.name}</span>
        {row.featured && <HiStar className="w-4 h-4 text-yellow-500" />}
      </div>
    )},
    { key: 'isActive', label: 'Status', render: (row) => row.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge> },
    { key: 'order', label: 'Order', render: (row) => <span className="text-sm">{row.order}</span> },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Projects</h1>
        <Button onClick={openCreate}>Add Project</Button>
      </div>
      <Card>
        <Table columns={columns} data={projects} loading={loading} emptyMessage="No projects." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, project: null })} title={modal.project ? 'Edit Project' : 'New Project'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-green-500 resize-y text-sm" />
          </div>
          <Input label="Image URL" value={form.image} onChange={(e) => setForm(p => ({ ...p, image: e.target.value }))} />
          <Input label="Link" value={form.link} onChange={(e) => setForm(p => ({ ...p, link: e.target.value }))} />
          <Input label="Technologies (comma separated)" value={(form.technologies || []).join(', ')} onChange={(e) => setForm(p => ({ ...p, technologies: e.target.value.split(',').map(s => s.trim()) }))} />
          <div className="grid grid-cols-3 gap-4">
            <Toggle label="Featured" checked={form.featured || false} onChange={(v) => setForm(p => ({ ...p, featured: v }))} />
            <Toggle label="Active" checked={form.isActive} onChange={(v) => setForm(p => ({ ...p, isActive: v }))} />
            <Input label="Order" type="number" value={form.order} onChange={(e) => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, project: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Project" message="Delete this project?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}
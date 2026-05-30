import { useEffect, useState } from 'react';
import { getApps, createApp, updateApp, deleteApp } from '../../services/portfolio/apps';
import Card from '../../components/portfolio/ui/Card';
import Table from '../../components/portfolio/ui/Table';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import Modal from '../../components/portfolio/ui/Modal';
import Input from '../../components/portfolio/ui/Input';
import Toggle from '../../components/portfolio/ui/Toggle';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import { HiPencil, HiTrash, HiStar } from 'react-icons/hi';

export default function Apps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, app: null });
  const [form, setForm] = useState({ name: '', category: '', description: '', technologies: [], urls: { live: '', github: '' }, featured: false, rating: 0 });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchApps = () => {
    setLoading(true);
    getApps()
      .then(res => setApps(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const openCreate = () => { setForm({ name: '', category: '', description: '', technologies: [], urls: { live: '', github: '' }, featured: false, rating: 0 }); setModal({ open: true, app: null }); };
  const openEdit = (app) => { setForm({ ...app }); setModal({ open: true, app }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.app) await updateApp(modal.app._id, form);
      else await createApp(form);
      setModal({ open: false, app: null });
      fetchApps();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await deleteApp(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchApps(); }
    catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.name}</span>
        {row.featured && <HiStar className="w-4 h-4 text-yellow-500" />}
      </div>
    )},
    { key: 'category', label: 'Category', render: (row) => <Badge variant="green">{row.category}</Badge> },
    { key: 'rating', label: 'Rating', render: (row) => <span className="text-sm">{row.rating || 0} ⭐</span> },
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Apps</h1>
        <Button onClick={openCreate}>Add App</Button>
      </div>
      <Card>
        <Table columns={columns} data={apps} loading={loading} emptyMessage="No apps." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, app: null })} title={modal.app ? 'Edit App' : 'New App'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            <Input label="Category" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-green-500 resize-y text-sm" />
          </div>
          <Input label="Technologies (comma separated)" value={(form.technologies || []).join(', ')} onChange={(e) => setForm(p => ({ ...p, technologies: e.target.value.split(',').map(s => s.trim()) }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Live URL" value={form.urls?.live || ''} onChange={(e) => setForm(p => ({ ...p, urls: { ...p.urls, live: e.target.value } }))} />
            <Input label="GitHub URL" value={form.urls?.github || ''} onChange={(e) => setForm(p => ({ ...p, urls: { ...p.urls, github: e.target.value } }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Toggle label="Featured" checked={form.featured || false} onChange={(v) => setForm(p => ({ ...p, featured: v }))} />
            <Input label="Rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm(p => ({ ...p, rating: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, app: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete App" message="Delete this app?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}
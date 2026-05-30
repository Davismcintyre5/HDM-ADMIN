import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/docusoft/categories';
import Card from '../../components/docusoft/ui/Card';
import Table from '../../components/docusoft/ui/Table';
import Button from '../../components/docusoft/ui/Button';
import Modal from '../../components/docusoft/ui/Modal';
import Input from '../../components/docusoft/ui/Input';
import ConfirmDialog from '../../components/docusoft/ui/ConfirmDialog';
import { HiPencil, HiTrash } from 'react-icons/hi';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, category: null });
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchCategories = () => {
    setLoading(true);
    getCategories()
      .then(res => setCategories(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setForm({ name: '', description: '' }); setModal({ open: true, category: null }); };
  const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description }); setModal({ open: true, category: cat }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.category) await updateCategory(modal.category._id, form);
      else await createCategory(form);
      setModal({ open: false, category: null });
      fetchCategories();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await deleteCategory(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchCategories(); }
    catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'description', label: 'Description', render: (row) => <span className="text-xs truncate max-w-xs block">{row.description || '—'}</span> },
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1>
        <Button onClick={openCreate}>Add Category</Button>
      </div>
      <Card>
        <Table columns={columns} data={categories} loading={loading} emptyMessage="No categories." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, category: null })} title={modal.category ? 'Edit Category' : 'New Category'} size="sm">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, category: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Category" message="Delete this category?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}
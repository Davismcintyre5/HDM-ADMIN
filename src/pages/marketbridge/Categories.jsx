import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/marketbridge/categories';
import Card from '../../components/marketbridge/ui/Card';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Input from '../../components/marketbridge/ui/Input';
import Modal from '../../components/marketbridge/ui/Modal';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', image: '', parentId: '', order: 0 });

  const fetchCategories = () => {
    setLoading(true);
    getCategories()
      .then(res => setCategories(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setForm({ name: '', slug: '', image: '', parentId: '', order: 0 }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (cat) => { setForm({ name: cat.name || '', slug: cat.slug || '', image: cat.image || '', parentId: cat.parentId || '', order: cat.order || 0 }); setModal({ open: true, mode: 'edit', data: cat }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const data = { ...form };
      if (!data.parentId) delete data.parentId;
      if (modal.mode === 'create') await createCategory(data);
      else await updateCategory(modal.data._id || modal.data.id, data);
      setModal({ open: false, mode: 'create', data: null });
      fetchCategories();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteCategory(confirm.id); fetchCategories(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, name: '' });
  };

  const parentCategories = categories.filter(c => !c.parentId);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">📂 Categories</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Category</Button>
      </div>

      <Card>
        {categories.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-3 py-2 text-left w-8">#</th>
                  <th className="px-3 py-2 text-left">Image</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Slug</th>
                  <th className="px-3 py-2 text-left">Parent</th>
                  <th className="px-3 py-2 text-left">Products</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {categories.map((cat, i) => (
                  <tr key={cat._id || cat.id} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-3 py-2 text-[var(--text-muted)] text-xs">{i + 1}</td>
                    <td className="px-3 py-2 text-lg">{cat.image || '📁'}</td>
                    <td className="px-3 py-2 font-medium text-[var(--text-primary)]">{cat.name}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{cat.slug}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">
                      {cat.parentId ? categories.find(c => (c._id || c.id) === cat.parentId)?.name || cat.parentId : '—'}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-primary)]">{cat.productCount || cat.products || 0}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(cat)}><HiPencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: cat._id || cat.id, name: cat.name })}><HiTrash className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Add Category' : 'Edit Category'} size="lg">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
          <Input label="Image / Emoji" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="📱" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Parent Category</label>
            <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              <option value="">None (Top Level)</option>
              {parentCategories.filter(c => (c._id || c.id) !== (modal.data?._id || modal.data?.id)).map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input label="Order" type="number" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Category" message={`Delete "${confirm.name}"?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
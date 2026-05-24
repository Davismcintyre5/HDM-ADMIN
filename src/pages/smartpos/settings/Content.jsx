import { useEffect, useState } from 'react';
import { getAllContent, saveContent, deleteContent } from '../../../services/smartpos/content';
import Button from '../../../components/smartpos/ui/Button';
import Modal from '../../../components/smartpos/ui/Modal';
import Input from '../../../components/smartpos/ui/Input';
import Toggle from '../../../components/smartpos/ui/Toggle';
import Spinner from '../../../components/smartpos/ui/Spinner';
import Card from '../../../components/smartpos/ui/Card';
import { HiPencil, HiTrash } from 'react-icons/hi';

export default function ContentSettings() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, section: null });
  const [form, setForm] = useState({ title: '', body: '', mediaUrl: '', active: true });
  const [saving, setSaving] = useState(false);

  const fetchContent = () => {
    setLoading(true);
    getAllContent()
      .then(res => setContent(res.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContent(); }, []);

  const openEdit = (item) => {
    setForm({ title: item.title || '', body: item.body || '', mediaUrl: item.mediaUrl || '', active: item.active ?? true });
    setModal({ open: true, section: item.section });
  };

  const openCreate = () => {
    setForm({ title: '', body: '', mediaUrl: '', active: true });
    setModal({ open: true, section: null });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const section = modal.section || form.title.toLowerCase().replace(/\s+/g, '-');
      await saveContent(section, form);
      setModal({ open: false, section: null });
      fetchContent();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleDelete = async (section) => {
    if (!window.confirm('Delete this content?')) return;
    try { await deleteContent(section); fetchContent(); } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Content Sections</h2>
        <Button size="sm" onClick={openCreate}>Add Content</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map(item => (
          <Card key={item._id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[var(--text-primary)] capitalize">{item.section}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>{item.active ? 'Active' : 'Inactive'}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] truncate">{item.title}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="secondary" onClick={() => openEdit(item)}><HiPencil className="w-3.5 h-3.5 mr-1" /> Edit</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(item.section)}><HiTrash className="w-3.5 h-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, section: null })} title={modal.section ? `Edit: ${modal.section}` : 'New Content'} size="lg">
        <div className="space-y-4">
          {!modal.section && <Input label="Section Key" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="hero" />}
          <Input label="Title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Body (HTML)</label>
            <textarea value={form.body} onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))} rows={8} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm" />
          </div>
          <Input label="Media URL" value={form.mediaUrl} onChange={(e) => setForm(p => ({ ...p, mediaUrl: e.target.value }))} placeholder="https://..." />
          <Toggle label="Active" checked={form.active} onChange={(v) => setForm(p => ({ ...p, active: v }))} />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal({ open: false, section: null })}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></div>
        </div>
      </Modal>
    </div>
  );
}
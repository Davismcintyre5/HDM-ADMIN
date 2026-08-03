import { useState, useEffect } from 'react';
import { getLegals, createLegal, updateLegal, togglePublishLegal, deleteLegal } from '../../services/eduprime/legals';
import Card from '../../components/eduprime/ui/Card';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Input from '../../components/eduprime/ui/Input';
import Modal from '../../components/eduprime/ui/Modal';
import ConfirmDialog from '../../components/eduprime/ui/ConfirmDialog';
import Spinner from '../../components/eduprime/ui/Spinner';
import { formatDate } from '../../utils/eduprime/formatDate';
import { HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi';

const TYPES = [
  { value: 'privacy_policy', label: 'Privacy Policy' },
  { value: 'terms_of_service', label: 'Terms of Service' },
  { value: 'community_guidelines', label: 'Community Guidelines' },
];

export default function Legals() {
  const [legals, setLegals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ type: 'privacy_policy', title: '', content: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });

  const fetchLegals = () => {
    setLoading(true);
    getLegals().then(res => setLegals(Array.isArray(res.data) ? res.data : [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLegals(); }, []);

  const openCreate = () => { setForm({ type: 'privacy_policy', title: '', content: '' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (legal) => { setForm({ type: legal.type, title: legal.title, content: legal.content }); setModal({ open: true, mode: 'edit', data: legal }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createLegal(form);
      else await updateLegal(modal.data._id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchLegals();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleToggle = async (id) => { try { await togglePublishLegal(id); fetchLegals(); } catch (err) { alert(err.message); } };
  const handleDelete = async () => { setActionLoading(true); try { await deleteLegal(confirmDelete.id); setConfirmDelete({ open: false, id: null, title: '' }); fetchLegals(); } catch (err) { alert(err.message); } setActionLoading(false); };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Legal Documents</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Document</Button>
      </div>

      <div className="space-y-3">
        {legals.map(legal => (
          <Card key={legal._id} className="!p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">{legal.title}</h3>
                  <Badge variant="info">{legal.type?.replace(/_/g, ' ')}</Badge>
                  <Badge variant={legal.isPublished ? 'success' : 'warning'}>{legal.isPublished ? 'Published' : 'Draft'}</Badge>
                </div>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{legal.content}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">v{legal.version} · {formatDate(legal.updatedAt || legal.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => openEdit(legal)}><HiPencil className="w-4 h-4" /></Button>
                <Button size="sm" variant={legal.isPublished ? 'warning' : 'success'} onClick={() => handleToggle(legal._id)}>
                  {legal.isPublished ? 'Unpublish' : 'Publish'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: legal._id, title: legal.title })}><HiTrash className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {legals.length === 0 && <Card><p className="text-sm text-[var(--text-muted)] text-center py-8">No legal documents.</p></Card>}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Document' : 'Edit Document'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, title: '' })} onConfirm={handleDelete}
        title="Delete Document" message={`Delete ${confirmDelete.title}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
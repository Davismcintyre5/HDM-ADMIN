import { useState, useEffect } from 'react';
import { getLegals, createLegal, updateLegal, deleteLegal, publishLegal, archiveLegal } from '../../services/hdmai2/legals';
import Card from '../../components/hdmai2/ui/Card';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Input from '../../components/hdmai2/ui/Input';
import Modal from '../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../components/hdmai2/ui/ConfirmDialog';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { formatDate } from '../../utils/hdmai2/formatDate';
import { HiPlus, HiPencil, HiTrash, HiEye, HiUpload, HiArchive } from 'react-icons/hi';

const TYPES = [
  { value: 'terms', label: 'Terms of Service' },
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'refund', label: 'Refund Policy' },
  { value: 'acceptable_use', label: 'Acceptable Use' },
  { value: 'gdpr', label: 'GDPR Compliance' },
  { value: 'cookies', label: 'Cookie Policy' },
];

const statusVariant = { draft: 'warning', published: 'success', archived: 'default' };

export default function Legals() {
  const [legals, setLegals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ type: 'terms', title: '', content: '', version: '1.0.0', status: 'draft' });
  const [previewModal, setPreviewModal] = useState({ open: false, legal: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });

const fetchLegals = () => {
  setLoading(true);
  getLegals().then(res => {
    const legalData = res?.data?.docs || res?.data || res || [];
    setLegals(Array.isArray(legalData) ? legalData : []);
  }).catch(console.error).finally(() => setLoading(false));
};

  useEffect(() => { fetchLegals(); }, []);

  const openCreate = () => { setForm({ type: 'terms', title: '', content: '', version: '1.0.0', status: 'draft' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (legal) => { setForm(legal); setModal({ open: true, mode: 'edit', data: legal }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createLegal(form);
      else await updateLegal(modal.data._id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchLegals();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handlePublish = async (id) => { try { await publishLegal(id); fetchLegals(); } catch (err) { alert(err.message); } };
  const handleArchive = async (id) => { try { await archiveLegal(id); fetchLegals(); } catch (err) { alert(err.message); } };
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
                  <h3 className="font-semibold text-[var(--text-primary)]">{legal.title || TYPES.find(t => t.value === legal.type)?.label}</h3>
                  <Badge variant="info">{TYPES.find(t => t.value === legal.type)?.label || legal.type}</Badge>
                  <Badge variant={statusVariant[legal.status] || 'default'}>{legal.status}</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)]">v{legal.version} · Updated: {formatDate(legal.updatedAt || legal.createdAt)}</p>
                {legal.publicUrl && <p className="text-xs text-blue-500 mt-1">Public: {legal.publicUrl}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => setPreviewModal({ open: true, legal })}><HiEye className="w-3 h-3" /></Button>
                <Button size="sm" variant="secondary" onClick={() => openEdit(legal)}><HiPencil className="w-3 h-3" /></Button>
                {legal.status === 'draft' && <Button size="sm" variant="success" onClick={() => handlePublish(legal._id)}><HiUpload className="w-3 h-3" /></Button>}
                {legal.status === 'published' && <Button size="sm" variant="warning" onClick={() => handleArchive(legal._id)}><HiArchive className="w-3 h-3" /></Button>}
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: legal._id, title: legal.title })}><HiTrash className="w-3 h-3" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {legals.length === 0 && <Card><p className="text-sm text-[var(--text-muted)] text-center py-8">No legal documents yet.</p></Card>}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Document' : 'Edit Document'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Input label="Version" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="1.0.0" />
          </div>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Terms of Service" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (Markdown)</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={12}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm font-mono resize-y" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={previewModal.open} onClose={() => setPreviewModal({ open: false, legal: null })} title={previewModal.legal?.title || 'Preview'} size="lg">
        {previewModal.legal && (
          <div className="prose dark:prose-invert max-w-none text-sm">
            <div className="whitespace-pre-wrap text-[var(--text-primary)]">{previewModal.legal.content}</div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, title: '' })} onConfirm={handleDelete}
        title="Delete Document" message={`Delete ${confirmDelete.title}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
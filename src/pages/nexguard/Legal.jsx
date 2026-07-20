import { useState, useEffect } from 'react';
import { getLegalDocs, createLegalDoc, updateLegalDoc, publishLegalDoc, deleteLegalDoc } from '../../services/nexguard/legal';
import Card from '../../components/nexguard/ui/Card';
import Badge from '../../components/nexguard/ui/Badge';
import Button from '../../components/nexguard/ui/Button';
import Input from '../../components/nexguard/ui/Input';
import Modal from '../../components/nexguard/ui/Modal';
import ConfirmDialog from '../../components/nexguard/ui/ConfirmDialog';
import Spinner from '../../components/nexguard/ui/Spinner';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const TYPES = ['tos', 'privacy', 'gdpr', 'refund', 'acceptable_use'];
const statusVariant = { published: 'success', draft: 'warning' };

export default function Legal() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, title: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ type: 'tos', title: '', content: '', version: '1.0.0' });

  const fetchDocs = () => { setLoading(true); getLegalDocs().then(res => setDocs(res?.data || res || [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchDocs(); }, []);

  const openCreate = () => { setForm({ type: 'tos', title: '', content: '', version: '1.0.0' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (doc) => { setForm({ type: doc.type || 'tos', title: doc.title || '', content: doc.content || '', version: doc.version || '1.0.0' }); setModal({ open: true, mode: 'edit', data: doc }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createLegalDoc(form);
      else await updateLegalDoc(modal.data._id || modal.data.id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchDocs();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handlePublish = async (id) => { try { await publishLegalDoc(id); fetchDocs(); } catch (err) { alert(err.message); } };
  const handleDelete = async () => { setActionLoading(true); try { await deleteLegalDoc(confirm.id); fetchDocs(); } catch (err) { alert(err.message); } setActionLoading(false); setConfirm({ open: false, id: null, title: '' }); };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-[var(--text-primary)]">Legal Documents</h1><Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Document</Button></div>
      <div className="space-y-4">
        {docs.length === 0 ? <Card><p className="text-sm text-[var(--text-muted)] py-8 text-center">No legal documents yet.</p></Card> : docs.map(doc => (
          <Card key={doc._id || doc.id}>
            <div className="flex items-center justify-between mb-2">
              <div><h3 className="font-semibold text-[var(--text-primary)] text-sm">{doc.title}</h3>
                <div className="flex items-center gap-2 mt-1"><Badge variant="info">{doc.type}</Badge><Badge variant={statusVariant[doc.status] || 'default'}>{doc.status}</Badge><span className="text-xs text-[var(--text-muted)]">v{doc.version}</span></div></div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => openEdit(doc)}><HiPencil className="w-4 h-4" /></Button>
                {doc.status !== 'published' && <Button size="sm" variant="success" onClick={() => handlePublish(doc._id || doc.id)}>Publish</Button>}
                <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: doc._id || doc.id, title: doc.title })}><HiTrash className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'Create Document' : 'Edit Document'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <Input label="Version" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} />
          </div>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-cyan-500 resize-y text-sm" /></div>
          <div className="flex justify-end gap-3 pt-2"><Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button><Button onClick={handleSave} loading={actionLoading}>Save</Button></div>
        </div>
      </Modal>
      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, title: '' })} onConfirm={handleDelete} title="Delete Document" message={`Delete "${confirm.title}"?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
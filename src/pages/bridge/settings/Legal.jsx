import { useEffect, useState } from 'react';
import { getDocuments, createDocument, updateDocument, publishDocument, deleteDocument } from '../../../services/bridge/legal';
import Card from '../../../components/bridge/ui/Card';
import Table from '../../../components/bridge/ui/Table';
import Badge from '../../../components/bridge/ui/Badge';
import Button from '../../../components/bridge/ui/Button';
import Modal from '../../../components/bridge/ui/Modal';
import Input from '../../../components/bridge/ui/Input';
import Toggle from '../../../components/bridge/ui/Toggle';
import ConfirmDialog from '../../../components/bridge/ui/ConfirmDialog';
import Spinner from '../../../components/bridge/ui/Spinner';
import { formatDate } from '../../../utils/bridge/formatDate';
import { HiPlus, HiPencil, HiTrash, HiCheck } from 'react-icons/hi';

export default function LegalSettings() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, doc: null });
  const [form, setForm] = useState({ type: 'terms_of_service', title: '', content: '', requiresAcceptance: true });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchDocs = () => {
    setLoading(true);
    getDocuments()
      .then(res => setDocuments(res.documents || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const openCreate = () => { setForm({ type: 'terms_of_service', title: '', content: '', requiresAcceptance: true }); setModal({ open: true, doc: null }); };
  const openEdit = (d) => { setForm({ type: d.type, title: d.title, content: d.content, requiresAcceptance: d.requiresAcceptance }); setModal({ open: true, doc: d }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.doc) await updateDocument(modal.doc._id || modal.doc.id, { content: form.content, changeLog: 'Updated' });
      else await createDocument(form);
      setModal({ open: false, doc: null });
      fetchDocs();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handlePublish = async (id) => {
    try { await publishDocument(id); fetchDocs(); } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    try { await deleteDocument(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchDocs(); }
    catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  const columns = [
    { key: 'title', label: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
    { key: 'type', label: 'Type', render: (row) => <Badge variant="indigo">{row.type?.replace(/_/g, ' ')}</Badge> },
    { key: 'isPublished', label: 'Status', render: (row) => row.isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="warning">Draft</Badge> },
    { key: 'updatedAt', label: 'Updated', render: (row) => formatDate(row.updatedAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
        {!row.isPublished && <Button size="sm" variant="success" onClick={() => handlePublish(row._id || row.id)}><HiCheck className="w-4 h-4" /></Button>}
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id || row.id })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Legal Documents</h2>
        <Button size="sm" onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Document</Button>
      </div>
      <Card>
        <Table columns={columns} data={documents} emptyMessage="No documents." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, doc: null })} title={modal.doc ? 'Edit Document' : 'New Document'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="terms_of_service">Terms of Service</option>
              <option value="privacy_policy">Privacy Policy</option>
              <option value="cookie_policy">Cookie Policy</option>
              <option value="acceptable_use">Acceptable Use</option>
              <option value="gdpr">GDPR</option>
            </select>
          </div>
          <Input label="Title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (Markdown)</label>
            <textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} rows={15}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm focus:ring-2 focus:ring-indigo-500 resize-y font-mono" />
          </div>
          <Toggle label="Requires Acceptance" checked={form.requiresAcceptance} onChange={(v) => setForm(p => ({ ...p, requiresAcceptance: v }))} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, doc: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Document" message="Permanently delete this document?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}
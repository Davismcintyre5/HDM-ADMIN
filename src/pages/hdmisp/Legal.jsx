import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiScale, HiEye } from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Input from '../../components/hdmisp/ui/Input';
import Select from '../../components/hdmisp/ui/Select';
import Toggle from '../../components/hdmisp/ui/Toggle';
import Modal from '../../components/hdmisp/ui/Modal';
import ConfirmDialog from '../../components/hdmisp/ui/ConfirmDialog';
import Spinner from '../../components/hdmisp/ui/Spinner';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import { getLegalDocs, createLegalDoc, updateLegalDoc, deleteLegalDoc } from '../../services/hdmisp/legal';
import { formatDateTime } from '../../utils/hdmisp/formatDate';
import { LEGAL_TYPES, statusLabel } from '../../utils/hdmisp/constants';

const EMPTY = { type: 'terms', title: '', content: '', version: '1.0', isActive: true };

export default function Legal() {
  const toast = useToast();
  const { isSuperadmin } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', doc: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLegalDocs();
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load legal docs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY });
    setModal({ open: true, mode: 'create', doc: null });
  };

  const openEdit = (d) => {
    setForm({ type: d.type || 'terms', title: d.title || '', content: d.content || '', version: d.version || '1.0', isActive: d.isActive !== false });
    setModal({ open: true, mode: 'edit', doc: d });
  };

  const patch = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content required'); return; }
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await createLegalDoc(form);
        toast.success('Document created');
      } else {
        await updateLegalDoc(modal.doc._id, { title: form.title, content: form.content, version: form.version, isActive: form.isActive });
        toast.success('Document updated');
      }
      setModal({ open: false, mode: 'create', doc: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteLegalDoc(confirmDelete._id);
      toast.success('Document deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Legal Documents</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
        </div>
        {isSuperadmin && <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>New document</Button>}
      </div>

      {docs.length === 0 ? (
        <Card><div className="text-center py-12"><HiScale className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" /><p className="text-sm text-[var(--text-muted)]">No legal documents yet</p></div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((d) => (
            <Card key={d._id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[var(--text-primary)] truncate">{d.title}</h3>
                      <Badge variant="info">{statusLabel(d.type)}</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] font-mono">v{d.version}</p>
                    {d.updatedAt && <p className="text-xs text-[var(--text-muted)] mt-1">Updated {formatDateTime(d.updatedAt)}</p>}
                  </div>
                  <Badge variant={d.isActive ? 'success' : 'default'} dot>{d.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="flex gap-1 pt-2 border-t border-[var(--border-color)]">
                  <Button size="sm" variant="ghost" onClick={() => setViewTarget(d)} icon={<HiEye className="w-3.5 h-3.5" />}>View</Button>
                  {isSuperadmin && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(d)} icon={<HiPencil className="w-3.5 h-3.5" />}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirmDelete(d)} icon={<HiTrash className="w-3.5 h-3.5" />}>Delete</Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/edit modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', doc: null })} title={modal.mode === 'create' ? 'Create document' : 'Edit document'} size="lg" footer={
        <>
          <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', doc: null })}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </>
      }>
        <div className="space-y-4">
          {modal.mode === 'create' && (
            <Select label="Type" value={form.type} onChange={(e) => patch('type', e.target.value)} options={LEGAL_TYPES.map((t) => ({ value: t, label: statusLabel(t) }))} />
          )}
          <Input label="Title *" value={form.title} onChange={(e) => patch('title', e.target.value)} />
          <Input label="Version" value={form.version} onChange={(e) => patch('version', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (Markdown) *</label>
            <textarea value={form.content} onChange={(e) => patch('content', e.target.value)} rows={14} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm resize-y font-mono" />
          </div>
          <Toggle label="Active" checked={form.isActive} onChange={(v) => patch('isActive', v)} />
        </div>
      </Modal>

      {/* View modal */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget?.title} size="lg">
        {viewTarget && (
          <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-mono bg-[var(--bg-secondary)] p-4 rounded-lg max-h-96 overflow-y-auto">
            {viewTarget.content}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={doDelete} title="Delete document" message={`Permanently delete "${confirmDelete?.title}"?`} confirmLabel="Delete" variant="danger" loading={busy} />
    </div>
  );
}
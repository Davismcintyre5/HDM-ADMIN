import { useState, useEffect } from 'react';
import { getDocuments, uploadDocument, updateDocument, deleteDocument } from '../../services/farmvexa/documents';
import Card from '../../components/farmvexa/ui/Card';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Input from '../../components/farmvexa/ui/Input';
import Toggle from '../../components/farmvexa/ui/Toggle';
import Modal from '../../components/farmvexa/ui/Modal';
import ConfirmDialog from '../../components/farmvexa/ui/ConfirmDialog';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { formatDate } from '../../utils/farmvexa/formatDate';
import { HiPlus, HiPencil, HiTrash, HiEye, HiDownload } from 'react-icons/hi';

const DOC_TYPES = ['user_guide', 'copyright', 'pricing', 'terms', 'privacy', 'cookies', 'other'];
const VISIBILITIES = ['public', 'farmer', 'admin'];
const PLATFORMS = ['web', 'desktop', 'mobile', 'all'];

const typeLabels = { user_guide: 'User Guide', copyright: 'Copyright', pricing: 'Pricing', terms: 'Terms', privacy: 'Privacy', cookies: 'Cookies', other: 'Other' };
const visibilityVariant = { public: 'info', farmer: 'success', admin: 'warning' };

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', type: 'user_guide', visibility: 'farmer', version: '1.0.0', platform: 'all' });
  const [uploadFile, setUploadFile] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, doc: null });
  const [editForm, setEditForm] = useState({ name: '', version: '', platform: 'all', visibility: 'farmer', enabled: true });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const token = localStorage.getItem('farmvexa_token');

  const fetchDocuments = () => {
    setLoading(true);
    getDocuments().then(res => setDocuments(res?.data?.documents || res?.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleUpload = async () => {
    if (!uploadFile) return alert('Please select a file');
    if (uploadFile.size > 10 * 1024 * 1024) return alert('File too large. Max 10MB.');
    setActionLoading(true);
    const formData = new FormData();
    formData.append('document', uploadFile);
    formData.append('name', uploadForm.name);
    formData.append('type', uploadForm.type);
    formData.append('visibility', uploadForm.visibility);
    formData.append('version', uploadForm.version);
    formData.append('platform', uploadForm.platform);
    try { await uploadDocument(formData, token); setUploadModal(false); setUploadFile(null); fetchDocuments(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const openEdit = (doc) => {
    setEditForm({ name: doc.name, version: doc.version, platform: doc.platform, visibility: doc.visibility, enabled: doc.enabled });
    setEditModal({ open: true, doc });
  };

  const handleEdit = async () => {
    setActionLoading(true);
    try { await updateDocument(editModal.doc._id || editModal.doc.id, editForm); setEditModal({ open: false, doc: null }); fetchDocuments(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteDocument(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchDocuments(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDownload = (doc) => {
  fetch(doc.cloudinaryUrl)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}.${doc.fileType || 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(err => alert('Download failed'));
};

  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const groupByType = () => {
    const groups = {};
    documents.forEach(doc => {
      const type = typeLabels[doc.type] || doc.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(doc);
    });
    return groups;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const grouped = groupByType();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Documents</h1>
        <Button onClick={() => { setUploadForm({ name: '', type: 'user_guide', visibility: 'farmer', version: '1.0.0', platform: 'all' }); setUploadFile(null); setUploadModal(true); }}>
          <HiPlus className="w-4 h-4 mr-1" /> Upload Document
        </Button>
      </div>

      {Object.entries(grouped).map(([type, docs]) => (
        <div key={type} className="mb-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-3 capitalize">{type}</h2>
          <div className="space-y-3">
            {docs.map(doc => (
              <Card key={doc._id || doc.id} className="!p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">{doc.name}</h3>
                        <Badge variant="info">v{doc.version}</Badge>
                        <Badge variant={visibilityVariant[doc.visibility] || 'default'}>{doc.visibility}</Badge>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {doc.fileType || doc.format || 'PDF'} · {formatSize(doc.fileSize)} · {doc.platform || 'all'} · {formatDate(doc.createdAt)}
                      </p>
                      {doc.enabled === false && <Badge variant="danger">Disabled</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => window.open(doc.cloudinaryUrl, '_blank')}><HiEye className="w-3 h-3" /></Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDownload(doc)}><HiDownload className="w-3 h-3" /></Button>
                    <Button size="sm" variant="secondary" onClick={() => openEdit(doc)}><HiPencil className="w-3 h-3" /></Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: doc._id || doc.id, name: doc.name })}><HiTrash className="w-3 h-3" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {documents.length === 0 && <Card><p className="text-sm text-[var(--text-muted)] text-center py-8">No documents uploaded.</p></Card>}

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Document" size="md">
        <div className="space-y-4">
          <Input label="Name" value={uploadForm.name} onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select value={uploadForm.type} onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {DOC_TYPES.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Visibility</label>
              <select value={uploadForm.visibility} onChange={e => setUploadForm({ ...uploadForm, visibility: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm capitalize">
                {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Version" value={uploadForm.version} onChange={e => setUploadForm({ ...uploadForm, version: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Platform</label>
              <select value={uploadForm.platform} onChange={e => setUploadForm({ ...uploadForm, platform: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm capitalize">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">File</label>
            <input type="file" accept=".pdf,.html,.docx,.doc" onChange={e => setUploadFile(e.target.files[0])}
              className="w-full text-sm text-[var(--text-secondary)]" />
            <p className="text-xs text-[var(--text-muted)] mt-1">PDF, HTML, DOCX — max 10MB</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setUploadModal(false)}>Cancel</Button>
            <Button onClick={handleUpload} loading={actionLoading} disabled={!uploadFile}>Upload</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, doc: null })} title="Edit Document" size="sm">
        <div className="space-y-4">
          <Input label="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Version" value={editForm.version} onChange={e => setEditForm({ ...editForm, version: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Platform</label>
              <select value={editForm.platform} onChange={e => setEditForm({ ...editForm, platform: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm capitalize">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Visibility</label>
            <select value={editForm.visibility} onChange={e => setEditForm({ ...editForm, visibility: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm capitalize">
              {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <Toggle label="Enabled" checked={editForm.enabled} onChange={v => setEditForm({ ...editForm, enabled: v })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditModal({ open: false, doc: null })}>Cancel</Button>
            <Button onClick={handleEdit} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Document" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
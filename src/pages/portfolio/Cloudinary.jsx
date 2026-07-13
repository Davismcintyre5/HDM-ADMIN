import { useState, useEffect, useRef } from 'react';
import { getCloudinaryStats, getCloudinaryFolders, getCloudinaryFolder, deleteCloudinaryFiles, uploadCloudinaryFile, createCloudinaryFolder, deleteCloudinaryFolder } from '../../services/portfolio/cloudinary';
import Card from '../../components/portfolio/ui/Card';
import Button from '../../components/portfolio/ui/Button';
import Badge from '../../components/portfolio/ui/Badge';
import Modal from '../../components/portfolio/ui/Modal';
import Input from '../../components/portfolio/ui/Input';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import Spinner from '../../components/portfolio/ui/Spinner';
import { HiFolder, HiFolderOpen, HiUpload, HiTrash, HiPlus, HiPhotograph, HiDocument } from 'react-icons/hi';

export default function Cloudinary() {
  const [stats, setStats] = useState(null);
  const [folders, setFolders] = useState([]);
  const [rootFiles, setRootFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderContents, setFolderContents] = useState({ resources: [], subFolders: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [previewModal, setPreviewModal] = useState({ open: false, url: '' });
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderPath, setNewFolderPath] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', target: '' });
  const fileInputRef = useRef(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getCloudinaryStats().catch(() => ({})),
      currentFolder
        ? getCloudinaryFolder(currentFolder).catch(() => ({ resources: [], subFolders: [] }))
        : getCloudinaryFolders().catch(() => ({ folders: [], rootFiles: [] })),
    ]).then(([s, f]) => {
      setStats(s?.data || s || {});
      if (currentFolder) {
        const d = f?.data || f || {};
        setFolderContents({ resources: d.resources || [], subFolders: d.subFolders || [] });
      } else {
        const d = f?.data || f || {};
        setFolders(d.folders || []);
        setRootFiles(d.rootFiles || []);
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [currentFolder]);

  const navigateToFolder = (folder) => { setCurrentFolder(folder); setSelected([]); };

  const goBack = () => {
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
    setSelected([]);
  };

  const toggleSelect = (publicId) => {
    setSelected(prev => prev.includes(publicId) ? prev.filter(i => i !== publicId) : [...prev, publicId]);
  };

  const selectAll = () => {
    const files = currentFolder ? (folderContents.resources || []) : (rootFiles || []);
    if (selected.length === files.length) setSelected([]);
    else setSelected(files.map(f => f.public_id));
  };

  const handleDeleteFiles = async () => {
    if (selected.length === 0) return;
    setActionLoading(true);
    try { await deleteCloudinaryFiles(selected); setSelected([]); fetchData(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
    setDeleteConfirm({ open: false, type: '', target: '' });
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolder) formData.append('folder', currentFolder);
    try { await uploadCloudinaryFile(formData); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderPath.trim()) return alert('Enter folder name');
    const path = currentFolder ? `${currentFolder}/${newFolderPath}` : newFolderPath;
    setActionLoading(true);
    try { await createCloudinaryFolder(path); setNewFolderModal(false); setNewFolderPath(''); fetchData(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };

  const handleDeleteFolder = async () => {
    setActionLoading(true);
    try { await deleteCloudinaryFolder(deleteConfirm.target); setDeleteConfirm({ open: false, type: '', target: '' }); fetchData(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / 1024 / 1024;
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const files = currentFolder ? (folderContents.resources || []) : (rootFiles || []);
  const subFolders = currentFolder ? (folderContents.subFolders || []) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">☁️ Cloudinary Management</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-sm text-[var(--text-secondary)]">Storage</p>
            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5 mt-2 mb-1">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(stats.credits?.used_percent || 0, 100)}%` }} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">{formatBytes(stats.storage?.usage)} / ∞ (Free plan)</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--text-secondary)]">Credits</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.credits?.usage || 0} / {stats.credits?.limit || 25}</p>
            <p className="text-xs text-[var(--text-muted)]">({stats.credits?.used_percent || 0}%)</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--text-secondary)]">Resources</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.resources || 0} files</p>
          </Card>
          <Card>
            <p className="text-sm text-[var(--text-secondary)]">Bandwidth</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatBytes(stats.bandwidth?.usage)}</p>
          </Card>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {currentFolder && (
            <Button size="sm" variant="secondary" onClick={goBack}>← Back</Button>
          )}
          <span className="text-sm text-[var(--text-secondary)]">
            {currentFolder ? (
              <span className="flex items-center gap-1"><HiFolderOpen className="w-4 h-4 text-yellow-500" /> {currentFolder}/</span>
            ) : (
              <span className="flex items-center gap-1"><HiFolder className="w-4 h-4 text-yellow-500" /> Root</span>
            )}
            <span className="text-xs text-[var(--text-muted)] ml-2">({files.length} files)</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setNewFolderModal(true)}><HiPlus className="w-4 h-4 mr-1" /> New Folder</Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}><HiUpload className="w-4 h-4 mr-1" /> Upload</Button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          {selected.length > 0 && (
            <Button size="sm" variant="danger" onClick={() => setDeleteConfirm({ open: true, type: 'files', target: '' })}>
              <HiTrash className="w-4 h-4 mr-1" /> Delete ({selected.length})
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folders Panel */}
        <Card>
          <h3 className="font-medium text-[var(--text-primary)] mb-3">Folders</h3>
          {currentFolder ? (
            subFolders.length > 0 ? (
              <div className="space-y-1">
                {subFolders.map(f => (
                  <button key={f.path || f.name} onClick={() => navigateToFolder(f.path || f.name)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-left">
                    <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                      <HiFolder className="w-5 h-5 text-yellow-500" /> {f.name || f.path?.split('/').pop()}
                    </span>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, type: 'folder', target: f.path || f.name }); }}>
                      <HiTrash className="w-4 h-4 text-red-500" />
                    </Button>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HiFolder className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No subfolders</p>
              </div>
            )
          ) : (
            folders.length > 0 ? (
              <div className="space-y-1">
                {folders.map(f => (
                  <button key={f.path || f.name} onClick={() => navigateToFolder(f.path || f.name)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-left">
                    <HiFolder className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm text-[var(--text-primary)]">{f.name || f.path}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HiFolder className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No folders</p>
              </div>
            )
          )}
        </Card>

        {/* Files Panel */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[var(--text-primary)]">Files</h3>
            {files.length > 0 && (
              <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer">
                <input type="checkbox" checked={selected.length === files.length && files.length > 0} onChange={selectAll} className="w-4 h-4 text-green-600 rounded" />
                Select All
              </label>
            )}
          </div>
          {files.length > 0 ? (
            <div className="space-y-1">
              {files.map(file => (
                <div key={file.public_id || file.asset_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-secondary)] group">
                  <div className="flex items-center gap-3 min-w-0">
                    <input type="checkbox" checked={selected.includes(file.public_id)} onChange={() => toggleSelect(file.public_id)} className="w-4 h-4 text-green-600 rounded flex-shrink-0" />
                    <button onClick={() => {
                      if (file.format === 'pdf') window.open(file.secure_url || file.url, '_blank');
                      else setPreviewModal({ open: true, url: file.secure_url || file.url });
                    }} className="flex items-center gap-2 min-w-0">
                      {file.format === 'pdf' ? <HiDocument className="w-5 h-5 text-red-500 flex-shrink-0" /> : <HiPhotograph className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                      <span className="text-sm text-[var(--text-primary)] truncate">{file.public_id?.split('/').pop() || file.display_name || 'Unknown'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-[var(--text-muted)] hidden sm:block">{formatFileSize(file.bytes)}</span>
                    <span className="text-xs text-[var(--text-muted)] hidden md:block">{file.format?.toUpperCase()}</span>
                    <span className="text-xs text-[var(--text-muted)] hidden lg:block">{file.width}×{file.height}</span>
                    <button onClick={() => window.open(file.secure_url || file.url, '_blank')} className="text-xs text-green-600 hover:underline hidden group-hover:inline">View</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HiPhotograph className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-muted)]">No files in this folder</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Upload files or select a different folder</p>
            </div>
          )}
        </Card>
      </div>

      {/* Preview Modal */}
      <Modal open={previewModal.open} onClose={() => setPreviewModal({ open: false, url: '' })} title="Preview" size="xl">
        {previewModal.url && (
          <img src={previewModal.url} alt="Preview" className="max-w-full max-h-[75vh] rounded-lg object-contain mx-auto" />
        )}
      </Modal>

      {/* New Folder Modal */}
      <Modal open={newFolderModal} onClose={() => setNewFolderModal(false)} title="Create Folder" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            {currentFolder ? `Creating folder in: ${currentFolder}/` : 'Creating folder in root'}
          </p>
          <Input label="Folder Name" value={newFolderPath} onChange={e => setNewFolderPath(e.target.value)} placeholder="new-folder" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setNewFolderModal(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} loading={actionLoading}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, type: '', target: '' })}
        onConfirm={deleteConfirm.type === 'folder' ? handleDeleteFolder : handleDeleteFiles}
        title={`Delete ${deleteConfirm.type === 'folder' ? 'Folder' : `${selected.length} File(s)`}`}
        message={deleteConfirm.type === 'folder'
          ? `Delete folder "${deleteConfirm.target}" and all its contents? This cannot be undone.`
          : `Delete ${selected.length} selected file(s)? This cannot be undone.`}
        confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
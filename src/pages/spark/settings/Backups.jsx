import { useEffect, useState } from 'react';
import { getBackups, createBackup, deleteBackup, restoreBackup } from '../../../services/spark/backups';
import Card from '../../../components/spark/ui/Card';
import Table from '../../../components/spark/ui/Table';
import Button from '../../../components/spark/ui/Button';
import Badge from '../../../components/spark/ui/Badge';
import Modal from '../../../components/spark/ui/Modal';
import ConfirmDialog from '../../../components/spark/ui/ConfirmDialog';
import { formatDate } from '../../../utils/spark/formatDate';
import { HiDownload, HiTrash, HiRefresh, HiCloud, HiServer } from 'react-icons/hi';

export default function BackupsSettings() {
  const [backups, setBackups] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [backupForm, setBackupForm] = useState({ backupType: 'full', compressionType: 'gzip', includesMedia: false });
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [restoreModal, setRestoreModal] = useState({ open: false, backup: null, dryRun: true });
  const [restoring, setRestoring] = useState(false);

  const fetchBackups = () => {
    setLoading(true);
    getBackups({ page, limit: 20 })
      .then(res => {
        setBackups(res.backups || []);
        setMeta({ total: res.total || 0, page: res.page || 1, totalPages: res.totalPages || 1 });
      })
      .catch(err => console.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, [page]);

  const handleCreate = async () => {
    setCreating(true);
    try { await createBackup(backupForm); setCreateModal(false); fetchBackups(); }
    catch (err) { alert(err.message); }
    setCreating(false);
  };

  const handleDelete = async () => {
    try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchBackups(); }
    catch (err) { alert(err.message); }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restoreBackup(restoreModal.backup._id, { dryRun: restoreModal.dryRun });
      setRestoreModal({ open: false, backup: null, dryRun: true });
      alert(restoreModal.dryRun ? 'Dry run complete — preview only' : 'Restore completed');
    } catch (err) { alert(err.message); }
    setRestoring(false);
  };

  const handleDownload = (backup) => {
    if (backup.fileUrl) {
      window.open(backup.fileUrl, '_blank');
    } else {
      alert('Local backup — access via server filesystem at: server/backups/');
    }
  };

  const getStorageType = (backup) => backup.fileUrl ? 'cloudinary' : 'local';

  const columns = [
    { key: 'backupType', label: 'Type', render: (row) => <Badge variant="sky">{row.backupType}</Badge> },
    { key: 'storage', label: 'Storage', render: (row) => (
      <div className="flex items-center gap-1">
        {getStorageType(row) === 'cloudinary' ? (
          <><HiCloud className="w-4 h-4 text-blue-500" /><span className="text-xs text-[var(--text-secondary)]">Cloud</span></>
        ) : (
          <><HiServer className="w-4 h-4 text-yellow-500" /><span className="text-xs text-[var(--text-secondary)]">Local</span></>
        )}
      </div>
    )},
    { key: 'fileName', label: 'File', render: (row) => (
      <span className="text-xs font-mono text-[var(--text-primary)] truncate max-w-[180px] block">{row.fileName || '—'}</span>
    )},
    { key: 'fileSize', label: 'Size', render: (row) => {
      if (!row.fileSize) return '—';
      const kb = row.fileSize / 1024;
      const mb = kb / 1024;
      return mb >= 1 ? `${mb.toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
    }},
    { key: 'metadata', label: 'Contents', render: (row) => (
      <div className="text-xs text-[var(--text-muted)]">
        {row.metadata ? `${row.metadata.databaseSize || ''}` : '—'}
      </div>
    )},
    { key: 'createdBy', label: 'Created By', render: (row) => (
      <span className="text-xs">{row.createdBy?.displayName || row.createdBy?.email || '—'}</span>
    )},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'DD/MM/YYYY HH:mm') },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row)} title="Download"><HiDownload className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" onClick={() => setRestoreModal({ open: true, backup: row, dryRun: true })} title="Restore"><HiRefresh className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })} title="Delete"><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">System Backups</h2>
          <p className="text-xs text-[var(--text-muted)]">{meta.total} backup{meta.total !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setCreateModal(true)}>Create Backup</Button>
      </div>
      <Card>
        <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
      </Card>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Backup" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Backup Type</label>
            <select value={backupForm.backupType} onChange={(e) => setBackupForm(p => ({ ...p, backupType: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              <option value="full">Full System</option>
              <option value="incremental">Incremental</option>
              <option value="chats_only">Chats Only</option>
              <option value="media_only">Media Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Compression</label>
            <select value={backupForm.compressionType} onChange={(e) => setBackupForm(p => ({ ...p, compressionType: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              <option value="gzip">gzip (Recommended)</option>
              <option value="zlib">zlib</option>
              <option value="none">None</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input type="checkbox" checked={backupForm.includesMedia} onChange={(e) => setBackupForm(p => ({ ...p, includesMedia: e.target.checked }))}
              className="rounded border-[var(--border-color)] text-sky-600 focus:ring-sky-500" />
            Include Media Files
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create Backup</Button>
          </div>
        </div>
      </Modal>

      <Modal open={restoreModal.open} onClose={() => setRestoreModal({ open: false, backup: null, dryRun: true })} title="Restore Backup" size="md">
        {restoreModal.backup && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Type:</span><span className="text-[var(--text-primary)]">{restoreModal.backup.backupType}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">File:</span><span className="text-[var(--text-primary)] font-mono text-xs">{restoreModal.backup.fileName}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Date:</span><span className="text-[var(--text-primary)]">{formatDate(restoreModal.backup.createdAt, 'full')}</span></div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
              ⚠ Restoring will overwrite current data with backup data.
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" checked={restoreModal.dryRun} onChange={(e) => setRestoreModal(p => ({ ...p, dryRun: e.target.checked }))}
                className="rounded border-[var(--border-color)] text-sky-600 focus:ring-sky-500" />
              Dry Run (preview only — no data changed)
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setRestoreModal({ open: false, backup: null, dryRun: true })}>Cancel</Button>
              <Button onClick={handleRestore} loading={restoring}>{restoreModal.dryRun ? 'Run Dry Run' : 'Restore Backup'}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Backup" message="Permanently delete this backup? This also removes the file from storage." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}
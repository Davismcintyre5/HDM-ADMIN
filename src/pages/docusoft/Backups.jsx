import { useEffect, useState } from 'react';
import { getBackups, getBackupSettings, updateBackupSettings, createBackup, deleteBackup, restoreBackup } from '../../services/docusoft/backups';
import Card from '../../components/docusoft/ui/Card';
import Table from '../../components/docusoft/ui/Table';
import Button from '../../components/docusoft/ui/Button';
import Badge from '../../components/docusoft/ui/Badge';
import Toggle from '../../components/docusoft/ui/Toggle';
import Input from '../../components/docusoft/ui/Input';
import Modal from '../../components/docusoft/ui/Modal';
import ConfirmDialog from '../../components/docusoft/ui/ConfirmDialog';
import { formatDate } from '../../utils/docusoft/formatDate';
import { HiDownload, HiTrash, HiRefresh, HiCloud, HiServer, HiPlus, HiClock, HiCog } from 'react-icons/hi';

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoSettings, setAutoSettings] = useState({ enabled: false, frequency: 'daily', time: '02:00', retentionDays: 30, maxBackups: 10 });
  const [savingSettings, setSavingSettings] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [backupForm, setBackupForm] = useState({ type: 'manual', compressionType: 'gzip', includesMedia: false });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmRestore, setConfirmRestore] = useState({ open: false, backup: null });

  useEffect(() => {
    fetchBackups();
    getBackupSettings()
      .then(res => { if (res.data) setAutoSettings(res.data); })
      .catch(() => {});
  }, []);

  const fetchBackups = () => {
    setLoading(true);
    getBackups()
      .then(res => setBackups(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createBackup(backupForm);
      setCreateModal(false);
      fetchBackups();
      alert('Backup created successfully!');
    } catch (err) { alert(err.message); }
    setCreating(false);
  };

  const handleDelete = async () => {
    try {
      await deleteBackup(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchBackups();
    } catch (err) { alert(err.message); }
  };

  const handleRestore = async () => {
    try {
      await restoreBackup(confirmRestore.backup._id);
      setConfirmRestore({ open: false, backup: null });
      alert('Restore completed!');
      fetchBackups();
    } catch (err) { alert(err.message); }
  };

  const handleDownload = async (backup) => {
    try {
      const baseUrl = import.meta.env.VITE_DOCUSOFT_API || 'http://localhost:5000';
      const token = localStorage.getItem('docusoft_token');
      const res = await fetch(`${baseUrl}/admin/backups/${backup._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.fileName || `backup-${backup._id}.gz`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (backup.fileUrl) window.open(backup.fileUrl, '_blank');
      else alert('Local backup — access via server filesystem');
    }
  };

  const handleSaveAutoSettings = async () => {
    setSavingSettings(true);
    try {
      await updateBackupSettings(autoSettings);
      alert('Auto-backup settings saved!');
    } catch (err) { alert(err.message); }
    setSavingSettings(false);
  };

  const getStorageType = (backup) => backup.fileUrl ? 'cloudinary' : 'local';

  const columns = [
    { key: 'type', label: 'Type', render: (row) => <Badge variant="purple">{row.type || row.backupType || 'manual'}</Badge> },
    { key: 'storage', label: 'Storage', render: (row) => (
      <div className="flex items-center gap-1">
        {getStorageType(row) === 'cloudinary' ? (
          <><HiCloud className="w-4 h-4 text-blue-500" /><span className="text-xs text-[var(--text-muted)]">Cloud</span></>
        ) : (
          <><HiServer className="w-4 h-4 text-yellow-500" /><span className="text-xs text-[var(--text-muted)]">Local</span></>
        )}
      </div>
    )},
    { key: 'includesMedia', label: 'Media', render: (row) => row.includesMedia ? <Badge variant="success">Yes</Badge> : <Badge>No</Badge> },
    { key: 'fileName', label: 'File', render: (row) => (
      <span className="text-xs font-mono text-[var(--text-primary)] truncate max-w-[200px] block">{row.fileName || '—'}</span>
    )},
    { key: 'fileSize', label: 'Size', render: (row) => {
      if (!row.fileSize) return '—';
      const kb = row.fileSize / 1024;
      const mb = kb / 1024;
      return mb >= 1 ? `${mb.toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
    }},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'DD/MM/YYYY HH:mm') },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row)} title="Download"><HiDownload className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" onClick={() => setConfirmRestore({ open: true, backup: row })} title="Restore"><HiRefresh className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })} title="Delete"><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">System Backups</h1>

      {/* Auto-Backup Settings */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HiClock className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-[var(--text-primary)]">Auto-Backup</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Toggle
              label="Enable Auto-Backup"
              description="Automatically create backups on schedule"
              checked={autoSettings.enabled}
              onChange={(v) => setAutoSettings(p => ({ ...p, enabled: v }))}
            />
            {autoSettings.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
                  <select value={autoSettings.frequency} onChange={(e) => setAutoSettings(p => ({ ...p, frequency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-purple-500">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <Input label="Time (HH:mm)" value={autoSettings.time} onChange={(e) => setAutoSettings(p => ({ ...p, time: e.target.value }))} placeholder="02:00" />
              </>
            )}
          </div>
          {autoSettings.enabled && (
            <div className="space-y-3">
              <Input label="Retention (Days)" type="number" value={autoSettings.retentionDays} onChange={(e) => setAutoSettings(p => ({ ...p, retentionDays: Number(e.target.value) }))} />
              <Input label="Max Backups" type="number" value={autoSettings.maxBackups} onChange={(e) => setAutoSettings(p => ({ ...p, maxBackups: Number(e.target.value) }))} />
            </div>
          )}
        </div>
        {autoSettings.lastAutoBackup && (
          <div className="mt-3 flex gap-4 text-xs text-[var(--text-muted)]">
            <span>Last auto: {formatDate(autoSettings.lastAutoBackup, 'full')}</span>
            {autoSettings.nextAutoBackup && <span>Next: {formatDate(autoSettings.nextAutoBackup, 'full')}</span>}
          </div>
        )}
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={handleSaveAutoSettings} loading={savingSettings}>
            <HiCog className="w-4 h-4 mr-1" /> Save Auto-Backup Settings
          </Button>
        </div>
      </Card>

      {/* Manual Backup Actions */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[var(--text-muted)]">{backups.length} backup{backups.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setCreateModal(true)}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
      </div>

      {/* Backup History */}
      <Card>
        <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
      </Card>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Backup" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Backup Type</label>
            <select value={backupForm.type} onChange={(e) => setBackupForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-purple-500">
              <option value="manual">Manual</option>
              <option value="full">Full System</option>
              <option value="incremental">Incremental</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Compression</label>
            <select value={backupForm.compressionType} onChange={(e) => setBackupForm(p => ({ ...p, compressionType: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-purple-500">
              <option value="gzip">gzip (Recommended)</option>
              <option value="zlib">zlib</option>
              <option value="none">None</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input type="checkbox" checked={backupForm.includesMedia} onChange={(e) => setBackupForm(p => ({ ...p, includesMedia: e.target.checked }))}
              className="rounded border-[var(--border-color)] text-purple-600 focus:ring-purple-500" />
            Include Media Files
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create Backup</Button>
          </div>
        </div>
      </Modal>

      {/* Restore Confirm */}
      <ConfirmDialog
        open={confirmRestore.open}
        onClose={() => setConfirmRestore({ open: false, backup: null })}
        title="Restore Backup"
        message={`Restore system from "${confirmRestore.backup?.fileName}"? Current data will be overwritten.`}
        confirmLabel="Restore"
        variant="warning"
        onConfirm={handleRestore}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Backup"
        message="Permanently delete this backup? This also removes the file from storage."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
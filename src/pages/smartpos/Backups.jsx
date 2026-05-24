import { useEffect, useState } from 'react';
import { getBackups, createBackup, deleteBackup } from '../../services/smartpos/backups';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Button from '../../components/smartpos/ui/Button';
import Badge from '../../components/smartpos/ui/Badge';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiDownload, HiShare, HiTrash } from 'react-icons/hi';

export default function Backups() {
  const [data, setData] = useState({ backups: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [scope, setScope] = useState('full');
  const [compress, setCompress] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBackups = () => {
    setLoading(true);
    getBackups()
      .then(res => setData({ backups: res.backups || [], count: res.count || 0 }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createBackup({ scope, compress });
      alert('Backup created successfully');
      fetchBackups();
    } catch (err) {
      alert(err.message);
    }
    setCreating(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteBackup(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchBackups();
    } catch (err) {
      alert(err.message);
    }
    setDeleteLoading(false);
  };

const handleDownload = async (backup) => {
    try {
      const filename = backup.filePath?.split('/').pop() || `backup_${backup._id}.json`;
      const baseUrl = import.meta.env.VITE_SMARTPOS_API || 'http://localhost:5000/api/admin';
      const token = localStorage.getItem('smartpos_token');
      
      const res = await fetch(`${baseUrl}/system-backups/${backup._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Download failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Download failed: ' + e.message);
    }
  };

  const handleShare = (backup) => {
    const filename = backup.filePath?.split('/').pop() || 'backup.json';
    const shareUrl = `${window.location.origin}/smartpos/backups`;
    const shareData = {
      title: `SmartPOS Backup - ${filename}`,
      text: `Backup file: ${filename} | Scope: ${backup.scope} | Created: ${formatDate(backup.createdAt)}`,
      url: shareUrl,
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`).then(() => {
        alert('Backup info copied to clipboard!');
      });
    }
  };

  const scopeVariant = {
    full: 'blue',
    clients: 'purple',
    admin: 'info',
    public: 'default',
  };

  const columns = [
    { key: 'scope', label: 'Scope', render: (row) => <Badge variant={scopeVariant[row.scope] || 'default'}>{row.scope}</Badge> },
    { key: 'filePath', label: 'File', render: (row) => (
      <span className="text-xs font-mono text-[var(--text-primary)]">{row.filePath?.split('/').pop() || 'Unknown'}</span>
    )},
    { key: 'compressed', label: 'Compressed', render: (row) => (
      row.compressed ? <Badge variant="success">Yes</Badge> : <Badge>No</Badge>
    )},
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt, 'full') },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row)} title="Download">
          <HiDownload className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleShare(row)} title="Share">
          <HiShare className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })} title="Delete">
          <HiTrash className="w-4 h-4" />
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">System Backups</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Backup */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Create Backup</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Scope</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">Full System</option>
                <option value="clients">Clients Only</option>
                <option value="admin">Admin Only</option>
                <option value="public">Public Only</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compress"
                checked={compress}
                onChange={(e) => setCompress(e.target.checked)}
                className="rounded border-[var(--border-color)] text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="compress" className="text-sm text-[var(--text-secondary)]">Compress backup file</label>
            </div>
            <Button onClick={handleCreate} loading={creating} className="w-full">
              Create Backup
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.count}</p>
              <p className="text-xs text-[var(--text-muted)]">Total Backups</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.backups.filter(b => b.compressed).length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Compressed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* History */}
      <Card className="mt-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup History</h2>
        <Table columns={columns} data={data.backups} loading={loading} emptyMessage="No backups created yet." />
      </Card>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Backup"
        message="Permanently delete this backup? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
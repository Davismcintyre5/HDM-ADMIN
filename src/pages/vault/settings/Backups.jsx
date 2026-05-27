import { useEffect, useState } from 'react';
import { getBackups, createBackup, downloadBackup, restoreBackup, deleteBackup } from '../../../services/vault/backups';
import Card from '../../../components/vault/ui/Card';
import Table from '../../../components/vault/ui/Table';
import Button from '../../../components/vault/ui/Button';
import Badge from '../../../components/vault/ui/Badge';
import ConfirmDialog from '../../../components/vault/ui/ConfirmDialog';
import { formatDate } from '../../../utils/vault/formatDate';
import { HiDownload, HiRefresh, HiTrash, HiPlus } from 'react-icons/hi';

export default function BackupsSettings() {
  const [data, setData] = useState({ backups: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmRestore, setConfirmRestore] = useState({ open: false, id: null });

  const fetchBackups = () => {
    setLoading(true);
    getBackups({ page, limit: 20 })
      .then(res => setData({ backups: res.backups || [], total: res.total || 0 }))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, [page]);

  const handleCreate = async () => { setCreating(true); try { await createBackup(); fetchBackups(); } catch (err) { alert(err.message); } setCreating(false); };

  const handleDownload = async (id) => {
    try {
      const blob = await downloadBackup(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `backup-${id}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch (err) { alert('Download failed'); }
  };

  const handleRestore = async () => {
    try { await restoreBackup(confirmRestore.id); setConfirmRestore({ open: false, id: null }); alert('Restore completed'); } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchBackups(); } catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'type', label: 'Type', render: (row) => <Badge variant="orange">{row.type || 'manual'}</Badge> },
    { key: 'fileName', label: 'File', render: (row) => <span className="text-xs font-mono">{row.fileName || `backup-${row._id?.slice(-8)}`}</span> },
    { key: 'size', label: 'Size', render: (row) => row.size ? `${(row.size / 1024).toFixed(1)} KB` : '—' },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'full') },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row._id)}><HiDownload className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" onClick={() => setConfirmRestore({ open: true, id: row._id })}><HiRefresh className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">System Backups</h2>
        <Button size="sm" onClick={handleCreate} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
      </div>
      <Card>
        <Table columns={columns} data={data.backups} loading={loading} emptyMessage="No backups." />
      </Card>
      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Backup" message="Permanently delete this backup?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
      <ConfirmDialog open={confirmRestore.open} onClose={() => setConfirmRestore({ open: false, id: null })} title="Restore Backup" message="Restore system from this backup? Current data will be overwritten." confirmLabel="Restore" variant="warning" onConfirm={handleRestore} />
    </div>
  );
}
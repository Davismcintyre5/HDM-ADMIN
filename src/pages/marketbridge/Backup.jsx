import { useEffect, useState } from 'react';
import { getBackups, createBackup, restoreBackup } from '../../services/marketbridge/backup';
import Card from '../../components/marketbridge/ui/Card';
import Button from '../../components/marketbridge/ui/Button';
import Badge from '../../components/marketbridge/ui/Badge';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../utils/marketbridge/formatDate';
import { HiPlus, HiRefresh } from 'react-icons/hi';

export default function Backup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, filename: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBackups = () => {
    setLoading(true);
    getBackups()
      .then(res => setBackups(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try { await createBackup(); fetchBackups(); alert('Backup created!'); }
    catch (e) { alert(e.message); }
    setCreating(false);
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try { await restoreBackup(confirm.filename); setConfirm({ open: false, filename: '' }); alert('Database restored!'); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backup</h1>
        <Button onClick={handleCreate} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
      </div>
      <Card>
        {backups.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No backups found.</p>
        ) : (
          <div className="space-y-3">
            {backups.map((b, i) => (
              <div key={b.filename || i} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">📄 {b.filename}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatSize(b.size)} · {formatDate(b.createdAt, 'full')}</p>
                  </div>
                  <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, filename: b.filename })}>
                    <HiRefresh className="w-4 h-4 mr-1" /> Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, filename: '' })} onConfirm={handleRestore}
        title="⚠️ Restore Database?" message={`Restore from ${confirm.filename}? This will overwrite all current data.`}
        confirmLabel="Restore" variant="warning" loading={actionLoading} />
    </div>
  );
}
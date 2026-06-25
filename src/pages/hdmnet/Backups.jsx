import { useEffect, useState } from 'react';
import { getBackups, createBackup, deleteBackup } from '../../services/hdmnet/backups';
import Card from '../../components/hdmnet/ui/Card';
import Table from '../../components/hdmnet/ui/Table';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import ConfirmDialog from '../../components/hdmnet/ui/ConfirmDialog';
import Spinner from '../../components/hdmnet/ui/Spinner';
import { formatDate } from '../../utils/hdmnet/formatDate';
import { HiPlus, HiDownload, HiTrash } from 'react-icons/hi';

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const fetchBackups = () => {
    setLoading(true);
    getBackups()
      .then((res) => {
        const data = res?.data || res || [];
        setBackups(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createBackup();
      fetchBackups();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setCreating(false);
  };

  const handleDownload = (backup) => {
    const url = backup.cloudinary_url;
    if (url) window.open(url, '_blank');
    else alert('No download URL available');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBackup(confirm.id);
      fetchBackups();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setDeleting(false);
    setConfirm({ open: false, id: null });
  };

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const columns = [
    {
      key: 'filename',
      label: 'Filename',
      render: (row) => <span className="font-medium text-[var(--text-primary)]">{row.filename || 'backup.sql'}</span>,
    },
    {
      key: 'size_bytes',
      label: 'Size',
      render: (row) => <span className="text-[var(--text-secondary)]">{formatSize(row.size_bytes)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'success' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'}>
          {row.status || 'pending'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => <span className="text-[var(--text-secondary)]">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleDownload(row)} title="Download">
            <HiDownload className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirm({ open: true, id: row.id })}
            title="Delete"
          >
            <HiTrash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
        <Button onClick={handleCreate} loading={creating}>
          <HiPlus className="w-4 h-4 mr-1" /> Create Backup
        </Button>
      </div>
      <Card>
        <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups found." />
      </Card>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Backup"
        message="Are you sure you want to delete this backup?"
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
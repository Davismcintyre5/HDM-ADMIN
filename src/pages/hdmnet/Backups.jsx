import { useState, useEffect } from 'react';
import { getBackups, createBackup, downloadBackup, sendBackupEmail, restoreBackup, deleteBackup } from '../../services/hdmnet/backups';
import Card from '../../components/hdmnet/ui/Card';
import Table from '../../components/hdmnet/ui/Table';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import Input from '../../components/hdmnet/ui/Input';
import Modal from '../../components/hdmnet/ui/Modal';
import ConfirmDialog from '../../components/hdmnet/ui/ConfirmDialog';
import Pagination from '../../components/hdmnet/ui/Pagination';
import { formatDate } from '../../utils/hdmnet/formatDate';
import { HiPlus, HiTrash, HiDownload, HiMail, HiRefresh } from 'react-icons/hi';

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const [emailModal, setEmailModal] = useState({ open: false, id: null });
  const [email, setEmail] = useState('');
  const token = localStorage.getItem('hdmnet_token');

  const fetchBackups = () => {
    setLoading(true);
    getBackups({ page, limit: 10 })
      .then(res => {
        setBackups(res?.data?.backups || []);
        setPagination(res?.data?.pagination || { page: 1, totalPages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, [page]);

  const handleCreate = async () => {
    setActionLoading(true);
    try { await createBackup(); fetchBackups(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDownload = (id, fileName) => {
    downloadBackup(id, fileName, token).catch(err => alert(err.message));
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this backup? This will overwrite current data.')) return;
    setActionLoading(true);
    try { await restoreBackup(id); fetchBackups(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleEmail = async () => {
    setActionLoading(true);
    try { await sendBackupEmail(emailModal.id, { to: email }); setEmailModal({ open: false, id: null }); setEmail(''); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchBackups(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns = [
    { key: 'fileName', label: 'File', render: row => <span className="text-sm font-mono text-[var(--text-primary)]">{row.fileName || 'backup.json'}</span> },
    { key: 'fileSize', label: 'Size', render: row => <span className="text-sm">{formatSize(row.fileSize)}</span> },
    { key: 'collections', label: 'Collections', render: row => <span className="text-sm">{row.collections?.length || 0}</span> },
    { key: 'type', label: 'Type', render: row => <Badge variant="info">{row.type || 'manual'}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row._id, row.fileName)}><HiDownload className="w-3 h-3" /></Button>
        <Button size="sm" variant="info" onClick={() => { setEmail(''); setEmailModal({ open: true, id: row._id }); }}><HiMail className="w-3 h-3" /></Button>
        <Button size="sm" variant="success" onClick={() => handleRestore(row._id)}><HiRefresh className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id, name: row.fileName })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
        <Button onClick={handleCreate} loading={actionLoading}><HiPlus className="w-4 h-4 mr-1" /> Create Backup Now</Button>
      </div>
      <Card>
        <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </Card>

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, id: null })} title="Send Backup to Email">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@hdmnet.com" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setEmailModal({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleEmail} loading={actionLoading} disabled={!email.trim()}>Send</Button>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Backup" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
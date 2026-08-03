import { useState, useEffect } from 'react';
import { getBackups, getBackupSettings, updateBackupSettings, createBackup, uploadBackup, restoreBackup, emailBackup, deleteBackup } from '../../services/eduprime/backups';
import Card from '../../components/eduprime/ui/Card';
import Table from '../../components/eduprime/ui/Table';
import Badge from '../../components/eduprime/ui/Badge';
import Button from '../../components/eduprime/ui/Button';
import Input from '../../components/eduprime/ui/Input';
import Toggle from '../../components/eduprime/ui/Toggle';
import Modal from '../../components/eduprime/ui/Modal';
import ConfirmDialog from '../../components/eduprime/ui/ConfirmDialog';
import Pagination from '../../components/eduprime/ui/Pagination';
import { formatDate } from '../../utils/eduprime/formatDate';
import { HiPlus, HiTrash, HiDownload, HiMail, HiCog, HiUpload, HiRefresh } from 'react-icons/hi';

const TABS = [
  { key: 'list', label: 'Backups' },
  { key: 'settings', label: 'Settings' },
];

const BASE_URL = import.meta.env.VITE_EDUPRIME_API || 'http://localhost:5000/api/admin';

export default function Backups() {
  const [activeTab, setActiveTab] = useState('list');
  const [backups, setBackups] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [backupSettings, setBackupSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [emailModal, setEmailModal] = useState({ open: false, id: null });
  const [email, setEmail] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchData = () => {
    setLoading(true);
    const promises = activeTab === 'list'
      ? [getBackups({ page, limit: 20 })]
      : [getBackupSettings()];
    Promise.all(promises)
      .then(([b]) => {
        if (activeTab === 'list') {
          setBackups(Array.isArray(b.data) ? b.data : []);
          setPagination(b.pagination || { page: 1, totalPages: 1 });
        } else {
          setBackupSettings(b.data || b);
        }
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, activeTab]);

  const handleCreate = async () => { setActionLoading(true); try { await createBackup(); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActionLoading(true);
    const formData = new FormData();
    formData.append('backup', file);
    try { await uploadBackup(formData); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
    e.target.value = '';
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this backup? This will overwrite current data.')) return;
    setActionLoading(true);
    try { await restoreBackup(id); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDownload = (id, filename) => {
    const token = localStorage.getItem('eduprime_token');
    fetch(`${BASE_URL}/backups/${id}/download`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename || 'backup.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      }).catch(err => alert(err.message));
  };

  const handleEmail = async () => { setActionLoading(true); try { await emailBackup(emailModal.id, email); setEmailModal({ open: false, id: null }); setEmail(''); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleDelete = async () => { setActionLoading(true); try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const handleSettingsSave = async () => { setActionLoading(true); try { await updateBackupSettings(backupSettings); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns = [
    { key: 'fileName', label: 'File', render: row => <span className="text-sm font-mono text-[var(--text-primary)]">{row.fileName || 'backup.json'}</span> },
    { key: 'size', label: 'Size', render: row => <span className="text-sm">{formatSize(row.size)}</span> },
    { key: 'type', label: 'Type', render: row => <Badge variant={row.type === 'auto' ? 'info' : 'default'}>{row.type || 'manual'}</Badge> },
    { key: 'createdBy', label: 'Created By', render: row => <span className="text-sm">{row.createdBy?.name || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row._id, row.fileName)} title="Download"><HiDownload className="w-4 h-4" /></Button>
        <Button size="sm" variant="info" onClick={() => { setEmail(''); setEmailModal({ open: true, id: row._id }); }} title="Send to email"><HiMail className="w-4 h-4" /></Button>
        <Button size="sm" variant="success" onClick={() => handleRestore(row._id)} title="Restore"><HiRefresh className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id, name: row.fileName })} title="Delete"><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Backups</h1>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-amber-600 text-amber-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div>
          <div className="flex gap-2 mb-4">
            <Button onClick={handleCreate} loading={actionLoading}><HiPlus className="w-4 h-4 mr-1" /> Backup Now</Button>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
              <HiUpload className="w-4 h-4" /> Upload Backup
              <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
            </label>
          </div>
          <Card>
            <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <div className="space-y-4 max-w-xl">
            <Toggle label="Auto Backup" checked={backupSettings.backup_auto_enabled || false} onChange={v => setBackupSettings({ ...backupSettings, backup_auto_enabled: v })} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
              <select value={backupSettings.backup_frequency || 'daily'} onChange={e => setBackupSettings({ ...backupSettings, backup_frequency: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['daily', 'weekly', 'monthly'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <Input label="Time (24h)" value={backupSettings.backup_time || '02:00'} onChange={e => setBackupSettings({ ...backupSettings, backup_time: e.target.value })} />
            <Input label="Retention Count" type="number" value={backupSettings.backup_retention || 7} onChange={e => setBackupSettings({ ...backupSettings, backup_retention: +e.target.value })} />
            <Toggle label="Email on Auto Backup" checked={backupSettings.backup_email_on_auto || false} onChange={v => setBackupSettings({ ...backupSettings, backup_email_on_auto: v })} />
            <Input label="Email Recipient" type="email" value={backupSettings.backup_email_recipient || ''} onChange={e => setBackupSettings({ ...backupSettings, backup_email_recipient: e.target.value })} />
            <Button onClick={handleSettingsSave} loading={actionLoading}>Save Settings</Button>
          </div>
        </Card>
      )}

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, id: null })} title="Send Backup to Email">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@eduprime.com" />
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
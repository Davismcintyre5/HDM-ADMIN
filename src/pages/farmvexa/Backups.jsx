import { useState, useEffect } from 'react';
import { getBackups, createBackup, uploadBackup, restoreBackup, downloadBackup, emailBackup, deleteBackup, getBackupSettings, updateBackupSettings } from '../../services/farmvexa/backups';
import Card from '../../components/farmvexa/ui/Card';
import Table from '../../components/farmvexa/ui/Table';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Input from '../../components/farmvexa/ui/Input';
import Toggle from '../../components/farmvexa/ui/Toggle';
import Modal from '../../components/farmvexa/ui/Modal';
import ConfirmDialog from '../../components/farmvexa/ui/ConfirmDialog';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { formatDate } from '../../utils/farmvexa/formatDate';
import { HiPlus, HiTrash, HiDownload, HiMail, HiUpload, HiRefresh, HiCog } from 'react-icons/hi';

const TABS = [
  { key: 'list', label: 'Backups' },
  { key: 'settings', label: 'Settings' },
];

export default function Backups() {
  const [activeTab, setActiveTab] = useState('list');
  const [backups, setBackups] = useState([]);
  const [backupSettings, setBackupSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const [emailModal, setEmailModal] = useState({ open: false, id: null });
  const [email, setEmail] = useState('');
  const token = localStorage.getItem('farmvexa_token');

  const fetchData = () => {
    setLoading(true);
    const fetcher = activeTab === 'list' ? getBackups : getBackupSettings;
    fetcher().then(res => {
      if (activeTab === 'list') {
        const data = res?.data?.backups || res?.data || [];
        setBackups(Array.isArray(data) ? data : []);
      } else {
        setBackupSettings(res?.data || res || {});
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleCreate = async () => { setActionLoading(true); try { await createBackup(); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActionLoading(true);
    const formData = new FormData();
    formData.append('backup', file);
    try { await uploadBackup(formData, token); fetchData(); } catch (err) { alert(err.message); }
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
    downloadBackup(id, filename, token).catch(err => alert(err.message));
  };

  const handleEmail = async () => {
    setActionLoading(true);
    try { await emailBackup(emailModal.id, email); setEmailModal({ open: false, id: null }); setEmail(''); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleSettingsSave = async () => {
    setActionLoading(true);
    try { await updateBackupSettings(backupSettings); fetchData(); }
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
    { key: 'filename', label: 'File', render: row => <span className="text-sm font-mono text-[var(--text-primary)]">{row.filename || 'backup.json'}</span> },
    { key: 'size', label: 'Size', render: row => <span className="text-sm">{formatSize(row.size)}</span> },
    { key: 'collections', label: 'Collections', render: row => <span className="text-sm">{row.collections ?? '—'}</span> },
    { key: 'documents', label: 'Documents', render: row => <span className="text-sm">{row.documents ?? '—'}</span> },
    { key: 'createdBy', label: 'Created By', render: row => <span className="text-sm">{row.createdBy?.name || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row._id, row.filename)}><HiDownload className="w-3 h-3" /></Button>
        <Button size="sm" variant="info" onClick={() => { setEmail(''); setEmailModal({ open: true, id: row._id }); }}><HiMail className="w-3 h-3" /></Button>
        <Button size="sm" variant="success" onClick={() => handleRestore(row._id)}><HiRefresh className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id, name: row.filename })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Backups</h1>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div>
          <div className="flex gap-2 mb-4">
            <Button onClick={handleCreate} loading={actionLoading}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
              <HiUpload className="w-4 h-4" /> Upload Backup
              <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
            </label>
          </div>
          <Card>
            <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup Settings</h2>
          <div className="space-y-4 max-w-xl">
            <Toggle label="Auto Backup" checked={backupSettings.autoBackup || false} onChange={v => setBackupSettings({ ...backupSettings, autoBackup: v })} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
              <select value={backupSettings.backupFrequency || 'daily'} onChange={e => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['daily', 'weekly', 'monthly'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <Toggle label="Email on Auto Backup" checked={backupSettings.sendBackupEmail || false} onChange={v => setBackupSettings({ ...backupSettings, sendBackupEmail: v })} />
            <Input label="Email Recipient" type="email" value={backupSettings.backupEmail || ''} onChange={e => setBackupSettings({ ...backupSettings, backupEmail: e.target.value })} />
            <Button onClick={handleSettingsSave} loading={actionLoading}>Save Settings</Button>
          </div>
        </Card>
      )}

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, id: null })} title="Send Backup to Email">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@farmvexa.com" />
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
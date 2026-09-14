import { useState, useEffect } from 'react';
import { getBackups, getBackupStats, createBackup, uploadBackup, downloadBackup, emailBackup, restoreBackup, deleteBackup, cleanupBackups, getBackupSettings, updateBackupSettings } from '../../services/smartpos/backups';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Modal from '../../components/smartpos/ui/Modal';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import Pagination from '../../components/smartpos/ui/Pagination';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiPlus, HiTrash, HiDownload, HiMail, HiUpload, HiRefresh } from 'react-icons/hi';

const statusVariant = { success: 'success', running: 'info', failed: 'danger' };

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [emailModal, setEmailModal] = useState({ open: false, id: null });
  const [email, setEmail] = useState('');
  const [restoreModal, setRestoreModal] = useState({ open: false, id: null });
  const [restoreMode, setRestoreMode] = useState('merge');
  const [restoreConfirm, setRestoreConfirm] = useState('');

  const [settings, setSettings] = useState({
    enabled: true,
    frequency: 'daily',
    retentionDays: 30,
    emailOnCompletion: false,
    emailRecipients: []
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const token = localStorage.getItem('smartpos_token');

  const fetchData = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    Promise.all([getBackups(params), getBackupStats(), getBackupSettings()])
      .then(([b, s, cfg]) => {
        setBackups(b?.data || []);
        setPagination(b?.meta || { page: 1, pages: 1 });
        setStats(s?.data || s || {});
        setSettings(cfg?.data || cfg || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, filter]);

  const handleCreate = async () => {
    setActionLoading(true);
    try { await createBackup(); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDownload = (id) => {
    downloadBackup(id, token).catch(err => alert(err.message));
  };

  const handleEmail = async () => {
    setActionLoading(true);
    try {
      await emailBackup(emailModal.id, { recipients: [email] });
      setEmailModal({ open: false, id: null });
      setEmail('');
      fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await restoreBackup(restoreModal.id, {
        mode: restoreMode,
        confirm: restoreMode === 'replace' ? restoreConfirm : undefined
      });
      setRestoreModal({ open: false, id: null });
      setRestoreConfirm('');
      fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteBackup(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleCleanup = async () => {
    setActionLoading(true);
    try { await cleanupBackups(); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return alert('Max 50 MB');
    setActionLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadBackup(formData, 'merge', token);
      alert(`Restored: ${JSON.stringify(res.data || res)}`);
      fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
    e.target.value = '';
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await updateBackupSettings(settings);
      alert('Backup settings saved');
      fetchData();
    } catch (err) { alert(err.message); }
    setSettingsLoading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns = [
    { key: 'fileName', label: 'File', render: row => <span className="text-sm font-mono text-[var(--text-primary)]">{row.fileName || 'backup.json'}</span> },
    { key: 'sizeBytes', label: 'Size', render: row => <span className="text-sm">{formatSize(row.sizeBytes)}</span> },
    { key: 'type', label: 'Type', render: row => <Badge variant="info">{row.type || 'database'}</Badge> },
    { key: 'documentCount', label: 'Docs', render: row => <span className="text-sm">{row.documentCount ?? '—'}</span> },
    { key: 'destination', label: 'Destination', render: row => <span className="text-xs capitalize">{row.destination || '—'}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleDownload(row._id || row.id)}><HiDownload className="w-3 h-3" /></Button>
        <Button size="sm" variant="info" onClick={() => { setEmail(''); setEmailModal({ open: true, id: row._id || row.id }); }}><HiMail className="w-3 h-3" /></Button>
        <Button size="sm" variant="success" onClick={() => { setRestoreMode('merge'); setRestoreConfirm(''); setRestoreModal({ open: true, id: row._id || row.id }); }}><HiRefresh className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id || row.id })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleCleanup} loading={actionLoading}>Cleanup</Button>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
            <HiUpload className="w-4 h-4" /> Upload & Restore
            <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
          </label>
          <Button onClick={handleCreate} loading={actionLoading}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
        </div>
      </div>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Backup Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Backup Frequency</label>
            <select
              value={settings.frequency || 'daily'}
              onChange={e => setSettings({ ...settings, frequency: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]"
            >
              <option value="daily">Daily at 2:00 AM</option>
              <option value="weekly">Weekly — Sunday 2:00 AM</option>
              <option value="monthly">Monthly — 1st at 2:00 AM</option>
            </select>
          </div>
          <Input
            label="Retention (days)"
            type="number"
            value={settings.retentionDays || 0}
            onChange={e => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
          />
          <Input
            label="Email recipients (comma-separated)"
            value={(settings.emailRecipients || []).join(', ')}
            onChange={e => setSettings({
              ...settings,
              emailRecipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
            placeholder="ops@smartpos.com, admin@smartpos.com"
          />
          <div className="flex flex-col gap-3 pt-6">
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={!!settings.enabled}
                onChange={e => setSettings({ ...settings, enabled: e.target.checked })}
              />
              Auto backup enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={!!settings.emailOnCompletion}
                onChange={e => setSettings({ ...settings, emailOnCompletion: e.target.checked })}
              />
              Email on completion
            </label>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSaveSettings} loading={settingsLoading}>Save Settings</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Total Backups</p><p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats.total || 0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Last Backup</p><p className="text-sm font-medium text-[var(--text-primary)] mt-1">{stats.lastBackup ? formatDate(stats.lastBackup.createdAt) : '—'}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Last Size</p><p className="text-sm font-medium text-[var(--text-primary)] mt-1">{stats.lastBackup ? formatSize(stats.lastBackup.sizeBytes) : '—'}</p></Card>
      </div>

      <div className="flex gap-2 mb-4">
        {[{ key: '', label: 'All' }, { key: 'success', label: 'Success' }, { key: 'running', label: 'Running' }, { key: 'failed', label: 'Failed' }].map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={backups} loading={loading} emptyMessage="No backups yet." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, id: null })} title="Email Backup">
        <Input label="Recipient Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ops@smartpos.com" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setEmailModal({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleEmail} loading={actionLoading} disabled={!email.trim()}>Send</Button>
        </div>
      </Modal>

      <Modal open={restoreModal.open} onClose={() => { setRestoreModal({ open: false, id: null }); setRestoreConfirm(''); }} title="Restore Backup">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mode</label>
            <select value={restoreMode} onChange={e => setRestoreMode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="merge">Merge (upsert)</option>
              <option value="replace">Replace (wipe + insert)</option>
            </select>
          </div>
          {restoreMode === 'replace' && (
            <div>
              <p className="text-sm text-red-500 mb-2">Type RESTORE to confirm destructive replace</p>
              <Input value={restoreConfirm} onChange={e => setRestoreConfirm(e.target.value)} placeholder="RESTORE" />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setRestoreModal({ open: false, id: null }); setRestoreConfirm(''); }}>Cancel</Button>
            <Button variant="warning" onClick={handleRestore} loading={actionLoading} disabled={restoreMode === 'replace' && restoreConfirm !== 'RESTORE'}>Restore</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} onConfirm={handleDelete}
        title="Delete Backup" message="Delete this backup permanently?" confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}
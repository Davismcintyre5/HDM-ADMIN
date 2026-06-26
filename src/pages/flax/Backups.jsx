import { useEffect, useState } from 'react';
import { getBackups, getBackupStatus, createBackup, updateBackupSettings, downloadBackup, emailBackup, restoreBackup, deleteBackup } from '../../services/flax/backups';
import Card from '../../components/flax/ui/Card';
import Badge from '../../components/flax/ui/Badge';
import Button from '../../components/flax/ui/Button';
import Input from '../../components/flax/ui/Input';
import Toggle from '../../components/flax/ui/Toggle';
import Modal from '../../components/flax/ui/Modal';
import ConfirmDialog from '../../components/flax/ui/ConfirmDialog';
import Spinner from '../../components/flax/ui/Spinner';
import Pagination from '../../components/flax/ui/Pagination';
import { formatDate } from '../../utils/flax/formatDate';
import { HiPlus, HiDownload, HiMail, HiRefresh, HiTrash } from 'react-icons/hi';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'manual', label: 'Manual' },
];

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [cloudBackups, setCloudBackups] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    frequency: 'daily',
    autoBackup: false,
    autoSendEmail: false,
    retentionDays: 30,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [emailModal, setEmailModal] = useState({ open: false, id: null, filename: '' });
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState({ open: false, id: null, filename: '', date: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, filename: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getBackups({ page, limit: 20 }).catch(() => ({ data: { local: [], cloud: [], pagination: { page: 1, pages: 1 } } })),
      getBackupStatus().catch(() => null),
    ])
      .then(([b, s]) => {
        const d = b?.data || b;
        setBackups(d.local || []);
        setCloudBackups(d.cloud || []);
        setTotalPages(d.pagination?.pages || 1);

        const statusData = s?.data || s;
        if (statusData) {
          setStatus(statusData);
          if (statusData.settings) {
            setSettings({
              frequency: statusData.settings.frequency || 'daily',
              autoBackup: statusData.settings.autoBackup || false,
              autoSendEmail: statusData.settings.autoSendEmail || false,
              retentionDays: statusData.settings.retentionDays || 30,
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateBackupSettings(settings);
      alert('Settings saved!');
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setSavingSettings(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createBackup();
      alert('Backup created successfully!');
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setCreating(false);
  };

  const handleEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await emailBackup(emailModal.id, emailAddress || undefined);
      alert(`Backup sent to ${res?.data?.emailedTo || res?.emailedTo || emailAddress || 'default email'}!`);
      setEmailModal({ open: false, id: null, filename: '' });
      setEmailAddress('');
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setSendingEmail(false);
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await restoreBackup(restoreConfirm.id);
      alert('Database restored successfully!');
      setRestoreConfirm({ open: false, id: null, filename: '', date: '' });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteBackup(deleteConfirm.id);
      setDeleteConfirm({ open: false, id: null, filename: '' });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
    setActionLoading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Backups</h1>

      {/* Settings */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
            <select
              value={settings.frequency}
              onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Retention (Days)</label>
            <Input
              type="number"
              min="7"
              max="90"
              value={settings.retentionDays}
              onChange={(e) => setSettings({ ...settings, retentionDays: +e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Toggle
            label="Auto Backup"
            checked={settings.autoBackup}
            onChange={(v) => setSettings({ ...settings, autoBackup: v })}
          />
          <Toggle
            label="Auto Send Email"
            checked={settings.autoSendEmail}
            onChange={(v) => setSettings({ ...settings, autoSendEmail: v })}
          />
        </div>
        <Button onClick={handleSaveSettings} loading={savingSettings} className="mt-4">Save Settings</Button>
      </Card>

      {/* Actions + Last Backup */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)] mb-1">Actions</h2>
            {status?.lastBackup ? (
              <p className="text-sm text-[var(--text-secondary)]">
                Last Backup: {formatDate(status.lastBackup.createdAt, 'full')}
                {' '}(<Badge variant={status.lastBackup.status === 'completed' ? 'success' : 'warning'}>{status.lastBackup.status}</Badge>, {formatSize(status.lastBackup.size)})
                {status.lastBackup.emailedTo && <span className="text-[var(--text-muted)]"> • Emailed: {status.lastBackup.emailedTo}</span>}
              </p>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No backups yet. Create your first backup to get started.</p>
            )}
          </div>
          <Button onClick={handleCreate} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup Now</Button>
        </div>
      </Card>

      {/* Backup List */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Backup List</h2>

        {backups.length === 0 && cloudBackups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[var(--text-muted)] mb-2">No backups yet</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">Create your first backup to get started.</p>
            <Button onClick={handleCreate} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup Now</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((b) => (
              <div key={b._id} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{b.filename}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                      <span>{formatSize(b.size)}</span>
                      <Badge variant={b.type === 'manual' ? 'info' : 'blue'}>{b.type || 'manual'}</Badge>
                      <Badge variant={b.status === 'completed' ? 'success' : 'warning'}>{b.status}</Badge>
                      <span>Created: {formatDate(b.createdAt, 'full')}</span>
                      {b.emailedTo && <span>Emailed: {b.emailedTo} ({formatDate(b.emailedAt)})</span>}
                      {b.createdBy && <span>By: {b.createdBy.firstName} {b.createdBy.lastName}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => downloadBackup(b._id)}><HiDownload className="w-4 h-4 mr-1" /> Download</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEmailModal({ open: true, id: b._id, filename: b.filename }); setEmailAddress(''); }}><HiMail className="w-4 h-4 mr-1" /> Send to Email</Button>
                  <Button size="sm" variant="warning" onClick={() => setRestoreConfirm({ open: true, id: b._id, filename: b.filename, date: formatDate(b.createdAt, 'full') })}><HiRefresh className="w-4 h-4 mr-1" /> Restore</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteConfirm({ open: true, id: b._id, filename: b.filename })}><HiTrash className="w-4 h-4 mr-1" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Email Modal */}
      <Modal open={emailModal.open} onClose={() => setEmailModal({ open: false, id: null, filename: '' })} title="Send Backup to Email" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Send <span className="font-medium text-[var(--text-primary)]">{emailModal.filename}</span> to an email address.
          </p>
          <Input
            label="Email Address (leave empty for default)"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="admin@flax.co.ke"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEmailModal({ open: false, id: null, filename: '' })}>Cancel</Button>
            <Button onClick={handleEmail} loading={sendingEmail}>Send</Button>
          </div>
        </div>
      </Modal>

      {/* Restore Confirm */}
      <ConfirmDialog
        open={restoreConfirm.open}
        onClose={() => setRestoreConfirm({ open: false, id: null, filename: '', date: '' })}
        onConfirm={handleRestore}
        title="⚠️ Restore Database?"
        message={`This will replace ALL current data with the backup from:\n\n${restoreConfirm.date}\n\n${restoreConfirm.filename}\n\nThis action cannot be undone.`}
        confirmLabel="Restore"
        variant="warning"
        loading={actionLoading}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, filename: '' })}
        onConfirm={handleDelete}
        title="🗑️ Delete Backup?"
        message={`Are you sure you want to delete:\n\n${deleteConfirm.filename}\n\nThis cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
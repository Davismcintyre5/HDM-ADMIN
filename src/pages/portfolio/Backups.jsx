import { useEffect, useState, useRef } from 'react';
import {
  getBackups,
  getBackupSettings,
  updateBackupSettings,
  createBackup,
  uploadBackup,
  sendBackupEmail,
  cleanupBackups,
  downloadBackup,
  deleteBackup,
  restoreBackup,
} from '../../services/portfolio/backups';
import Card from '../../components/portfolio/ui/Card';
import Table from '../../components/portfolio/ui/Table';
import Button from '../../components/portfolio/ui/Button';
import Badge from '../../components/portfolio/ui/Badge';
import Toggle from '../../components/portfolio/ui/Toggle';
import Input from '../../components/portfolio/ui/Input';
import Modal from '../../components/portfolio/ui/Modal';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import Spinner from '../../components/portfolio/ui/Spinner';
import { useToast } from '../../context/portfolio/ToastContext';
import { formatDate } from '../../utils/portfolio/formatDate';
import {
  HiDownload,
  HiTrash,
  HiRefresh,
  HiCloud,
  HiServer,
  HiPlus,
  HiClock,
  HiCog,
  HiMail,
  HiUpload,
  HiPlay,
} from 'react-icons/hi';

const DEFAULT_SETTINGS = {
  enabled: false,
  frequency: 'daily',
  time: '02:00',
  retentionDays: 30,
  maxBackups: 10,
  emailOnCompletion: false,
  emailRecipient: '',
};

export default function Backups() {
  const toast = useToast();
  const uploadRef = useRef(null);

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [backupForm, setBackupForm] = useState({
    type: 'manual',
    compressionType: 'gzip',
    includesMedia: false,
  });
  const [emailModal, setEmailModal] = useState({ open: false, id: null });
  const [emailTo, setEmailTo] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmRestore, setConfirmRestore] = useState({
    open: false,
    backup: null,
  });
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);

  const fetchBackups = () => {
    setLoading(true);
    getBackups()
      .then((res) => setBackups(res.data || res || []))
      .catch((err) => toast.error(err.message || 'Failed to load backups'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBackups();
    getBackupSettings()
      .then((res) => {
        const data = res.data || res;
        if (data) setSettings({ ...DEFAULT_SETTINGS, ...data });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createBackup(backupForm);
      toast.success('Backup created');
      setCreateModal(false);
      fetchBackups();
    } catch (err) {
      toast.error(err.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBackup(confirmDelete.id);
      toast.success('Backup deleted');
      setConfirmDelete({ open: false, id: null });
      fetchBackups();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleRestore = async () => {
    if (restoreConfirmText !== 'RESTORE') return;
    setRestoreBusy(true);
    try {
      await restoreBackup(confirmRestore.backup._id);
      toast.success('Restore completed');
      setConfirmRestore({ open: false, backup: null });
      setRestoreConfirmText('');
      fetchBackups();
    } catch (err) {
      toast.error(err.message || 'Failed to restore');
    } finally {
      setRestoreBusy(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      await downloadBackup(backup._id);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) return;
    setEmailSending(true);
    try {
      await sendBackupEmail(emailModal.id, emailTo.trim());
      toast.success(`Backup sent to ${emailTo}`);
      setEmailModal({ open: false, id: null });
      setEmailTo('');
      fetchBackups();
    } catch (err) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setEmailSending(false);
    }
  };

  const handleCleanup = async () => {
    setCleanupBusy(true);
    try {
      await cleanupBackups();
      toast.success('Cleanup completed');
      fetchBackups();
    } catch (err) {
      toast.error(err.message || 'Cleanup failed');
    } finally {
      setCleanupBusy(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      toast.error('Only .json backup files are allowed');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Max file size is 100 MB');
      return;
    }
    setUploadBusy(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadBackup(formData);
      toast.success('Backup uploaded');
      fetchBackups();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadBusy(false);
      e.target.value = '';
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateBackupSettings(settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <Badge variant={row.type === 'auto' ? 'info' : 'green'}>
          {row.type || 'manual'}
        </Badge>
      ),
    },
    {
      key: 'storage',
      label: 'Storage',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.fileUrl ? (
            <>
              <HiCloud className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-[var(--text-muted)]">Cloud</span>
            </>
          ) : (
            <>
              <HiServer className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-[var(--text-muted)]">Local</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'fileName',
      label: 'File',
      render: (row) => (
        <span className="text-xs font-mono text-[var(--text-primary)] truncate max-w-[240px] block">
          {row.fileName || '—'}
        </span>
      ),
    },
    {
      key: 'fileSize',
      label: 'Size',
      render: (row) => (
        <span className="text-xs">{formatFileSize(row.fileSize)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'completed'
              ? 'success'
              : row.status === 'failed'
              ? 'danger'
              : 'warning'
          }
        >
          {row.status || 'completed'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {formatDate(row.createdAt, 'full')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleDownload(row)}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Download"
          >
            <HiDownload className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEmailTo('');
              setEmailModal({ open: true, id: row._id });
            }}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Send by email"
          >
            <HiMail className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setRestoreConfirmText('');
              setConfirmRestore({ open: true, backup: row });
            }}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Restore"
          >
            <HiRefresh className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete({ open: true, id: row._id })}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-red-600"
            type="button"
            title="Delete"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            System Backups
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {backups.length} backup{backups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            icon={<HiPlay className="w-4 h-4" />}
            onClick={handleCleanup}
            loading={cleanupBusy}
          >
            Run Cleanup
          </Button>
          <Button
            variant="secondary"
            icon={<HiUpload className="w-4 h-4" />}
            onClick={() => uploadRef.current?.click()}
            loading={uploadBusy}
          >
            Upload Backup
          </Button>
          <input
            ref={uploadRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            icon={<HiPlus className="w-4 h-4" />}
            onClick={() => setCreateModal(true)}
          >
            Create Backup
          </Button>
        </div>
      </div>

      {/* Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <HiClock className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-[var(--text-primary)]">
            Auto-Backup
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Toggle
              label="Enable Auto-Backup"
              description="Automatically create backups on schedule"
              checked={settings.enabled}
              onChange={(v) => setSettings((p) => ({ ...p, enabled: v }))}
            />
            {settings.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Frequency
                  </label>
                  <select
                    value={settings.frequency}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, frequency: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-green-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <Input
                  label="Time (HH:mm)"
                  value={settings.time}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, time: e.target.value }))
                  }
                  placeholder="02:00"
                />
              </>
            )}
          </div>
          {settings.enabled && (
            <div className="space-y-3">
              <Input
                label="Retention (Days)"
                type="number"
                value={settings.retentionDays}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    retentionDays: Number(e.target.value),
                  }))
                }
              />
              <Input
                label="Max Backups"
                type="number"
                value={settings.maxBackups}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    maxBackups: Number(e.target.value),
                  }))
                }
              />
              <Toggle
                label="Email on completion"
                checked={settings.emailOnCompletion}
                onChange={(v) =>
                  setSettings((p) => ({ ...p, emailOnCompletion: v }))
                }
              />
              {settings.emailOnCompletion && (
                <Input
                  label="Email recipient"
                  type="email"
                  value={settings.emailRecipient}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      emailRecipient: e.target.value,
                    }))
                  }
                  placeholder="admin@hdm.co.ke"
                />
              )}
            </div>
          )}
        </div>
        {settings.lastAutoBackup && (
          <div className="mt-3 flex gap-4 text-xs text-[var(--text-muted)]">
            <span>
              Last auto: {formatDate(settings.lastAutoBackup, 'full')}
            </span>
          </div>
        )}
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSettings}
            loading={savingSettings}
          >
            <HiCog className="w-4 h-4 mr-1" /> Save Settings
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className="p-4">
          <Table
            columns={columns}
            data={backups}
            loading={loading}
            emptyMessage="No backups yet."
          />
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Backup"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Backup Type
            </label>
            <select
              value={backupForm.type}
              onChange={(e) =>
                setBackupForm((p) => ({ ...p, type: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="manual">Manual</option>
              <option value="full">Full System</option>
              <option value="incremental">Incremental</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Compression
            </label>
            <select
              value={backupForm.compressionType}
              onChange={(e) =>
                setBackupForm((p) => ({
                  ...p,
                  compressionType: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="gzip">gzip (Recommended)</option>
              <option value="zlib">zlib</option>
              <option value="none">None</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={backupForm.includesMedia}
              onChange={(e) =>
                setBackupForm((p) => ({
                  ...p,
                  includesMedia: e.target.checked,
                }))
              }
              className="rounded border-[var(--border-color)] text-green-600 focus:ring-green-500"
            />
            Include Media Files
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating}>
              Create Backup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email Modal */}
      <Modal
        open={emailModal.open}
        onClose={() => setEmailModal({ open: false, id: null })}
        title="Send Backup by Email"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEmailModal({ open: false, id: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSendEmail} loading={emailSending}>
              Send
            </Button>
          </>
        }
      >
        <Input
          label="Recipient email"
          type="email"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          placeholder="admin@hdm.co.ke"
        />
      </Modal>

      {/* Restore Confirm */}
      <Modal
        open={confirmRestore.open}
        onClose={() => {
          setConfirmRestore({ open: false, backup: null });
          setRestoreConfirmText('');
        }}
        title="Restore Backup"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmRestore({ open: false, backup: null });
                setRestoreConfirmText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRestore}
              disabled={restoreConfirmText !== 'RESTORE'}
              loading={restoreBusy}
            >
              Restore
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="font-medium mb-1">This is destructive.</p>
            <p>
              Restoring will <strong>wipe all current data</strong> and replace
              it with the contents of{' '}
              <strong className="font-mono">
                {confirmRestore.backup?.fileName}
              </strong>
              .
            </p>
          </div>
          <Input
            label='Type "RESTORE" to confirm'
            value={restoreConfirmText}
            onChange={(e) => setRestoreConfirmText(e.target.value)}
            placeholder="RESTORE"
            className="font-mono"
          />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Backup"
        message="Permanently delete this backup? The file is also removed from storage."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}